import {
  captureControlSnapshots,
  executePoseTransfer,
  hasPoseTransferStateForPose,
  POSE_TRANSFER_ORDERS,
  POSE_TRANSFER_SCHEDULING
} from './poseTransfer';
import {
  createRhsPoseTransferConfig,
  getPostTransferCenterLigandIds
} from './rhsPoseTransferConfig';
import { POSE_TRANSFER_CENTERING_MODES, RHS_INSPIRATION } from '../../../constants/poseNavigation';
import { addLigand } from './redux/dispatchActions';
import ViewerAdapter from '../../../viewer/ViewerAdapter';
import {
  centerOnLigandByMoleculeID,
  centerOnLigandsByMoleculeIDs
} from '../../../reducers/ngl/dispatchActions';

jest.mock('../../../reducers/ngl/dispatchActions', () => ({
  centerOnLigandByMoleculeID: jest.fn((stage, id) => ({ type: 'CENTER_ONE', stage, id })),
  centerOnLigandsByMoleculeIDs: jest.fn((stage, ids) => ({ type: 'CENTER_MANY', stage, ids }))
}));

const createState = overrides => ({
  selectionReducers: {
    artefactsChainList: [],
    complexList: [],
    densityList: [],
    fragmentDisplayList: [],
    proteinList: [],
    proteinSettings: [],
    qualityList: [],
    surfaceList: [],
    toBeDisplayedList: [],
    vectorOnList: [],
    ...overrides?.selectionReducers
  },
  nglReducers: {
    objectsInView: {},
    ...overrides?.nglReducers
  },
  apiReducers: {
    all_mol_lists: [],
    ...overrides?.apiReducers
  }
});

const createConfig = (overrides = {}) =>
  createRhsPoseTransferConfig({
    getComputedInspirations: ({ data }) => data.computed_inspirations || [],
    ligandRepresentations: [{ type: 'licorice' }],
    ...overrides
  });

describe('rhs pose transfer configuration', () => {
  it('tracks only requested destination maps on adapters with native map load milestones', () => {
    expect.hasAssertions();
    const density = createConfig().inspirationControls.find(control => control.key === 'density');
    const viewerAdapter = new ViewerAdapter();
    const context = {
      stage: { viewerAdapter },
      item: { code: 'dest' },
      snapshot: { customization: { densityObject: { render_event: true, render_2FoFc: true } } }
    };
    expect(density.getRenderProgressReader(context)).toBeNull();
    Object.assign(viewerAdapter, { getMapLoadProgress: jest.fn(name => name === 'dest_DENSITY' ? 2 : 1) });
    expect(density.getRenderProgressReader(context)()).toBe(3);
    expect(viewerAdapter.getMapLoadProgress.mock.calls).toStrictEqual([['dest_DENSITY'], ['dest_DENSITY_MAP_sigmaa']]);
  });

  const representationControls = [
    ['ligand', 'LIGAND', 'LIGAND', 'fragmentDisplayList', 'representations'],
    ['protein', 'PROTEIN', 'HIT_PROTEIN', 'proteinList', 'proteinRepresentations'],
    ['protein', 'ARTEFACTS', 'ARTEFACTS', 'artefactsChainList', 'artefactRepresentations'],
    ['complex', 'COMPLEX', 'COMPLEX', 'complexList', 'representations'],
    ['surface', 'SURFACE', 'SURFACE', 'surfaceList', 'representations'],
    ['density', 'DENSITY', 'DENSITY', 'densityList', 'representations']
  ];

  it.each(representationControls.flatMap(fields => ['rendered', 'queued'].map(location => [...fields, location])))(
    'copies %s appearance (%s/%s, %s/%s, %s) without visiting Moorhen runtime data',
    (key, queueType, objectType, listKey, representationKey, location) => {
    const source = { id: 11, virtual_name: 'source' };
    const params = { colorValue: '#123456', opacity: 0.4, visible: false, sele: '/*/A/*/*' };
    const representation = { type: 'licorice', uuid: 'source-rep', lastKnownID: 'old-rep', params };
    const readRuntime = jest.fn(() => { throw new Error('Transfer traversed the Moorhen runtime'); });
    for (const key of ['nativeRepresentation', 'parentObject', 'ready']) {
      Object.defineProperty(representation, key, { enumerable: true, get: readRuntime });
    }
    const state = createState({
      selectionReducers: {
        [listKey]: [key === 'density' ? { id: source.id } : source.id],
        toBeDisplayedList: [{
          id: source.id,
          type: queueType,
          [RHS_INSPIRATION]: true,
          representations: location === 'queued' ? [representation] : undefined
        }]
      },
      nglReducers: { objectsInView: location === 'rendered' ? { [`source_${objectType}`]: { representations: [representation] } } : {} }
    });
    const control = createConfig().inspirationControls.find(control => control.key === key);
    const snapshot = captureControlSnapshots(state, [source], [control])[key];

    expect(snapshot.customization[representationKey]).toStrictEqual([{
      type: 'licorice', params, ...(key === 'density' && location === 'rendered' && { densityMap: '' })
    }]);
    expect(readRuntime).not.toHaveBeenCalled();
    snapshot.customization[representationKey][0].params.opacity = 0.8;
    expect(params.opacity).toBe(0.4);
  });

  it.each([
    [POSE_TRANSFER_SCHEDULING.OVERLAPPED, 0.4],
    [POSE_TRANSFER_SCHEDULING.OVERLAPPED, 0.8],
    [POSE_TRANSFER_SCHEDULING.PHASED, 0.4],
    [POSE_TRANSFER_SCHEDULING.PHASED, 0.8]
  ])('retains shared appearance and refreshes actual changes with %s scheduling (opacity %s)', async (scheduling, opacity) => {
    const source = { id: 1, code: 'source' };
    const shared = { id: 2, code: 'shared' };
    const state = createState({ apiReducers: { all_mol_lists: [source, shared] } });
    const show = (item, params) => {
      state.selectionReducers.fragmentDisplayList.push(item.id);
      state.selectionReducers.toBeDisplayedList.push({ id: item.id, type: 'LIGAND', rendered: true });
      state.nglReducers.objectsInView[`${item.code}_LIGAND`] = {
        moleculeId: item.id, OBJECT_TYPE: 'LIGAND',
        representations: [{ uuid: `rep-${item.id}`, lastKnownID: `old-${item.id}`, type: 'licorice', params }]
      };
    };
    show(source, { opacity: 0.4 });
    show(shared, { opacity });
    const config = createConfig({ transferScheduling: scheduling, transferOrder: POSE_TRANSFER_ORDERS.ADD_FIRST });
    const ligand = config.poseControls.find(control => control.key === 'ligand');
    jest.spyOn(ligand, 'remove').mockImplementation(({ selectedItem }) => {
      state.selectionReducers.fragmentDisplayList = state.selectionReducers.fragmentDisplayList.filter(id => id !== selectedItem.id);
      state.selectionReducers.toBeDisplayedList = state.selectionReducers.toBeDisplayedList.filter(item => item.id !== selectedItem.id);
      delete state.nglReducers.objectsInView[`${selectedItem.id === source.id ? source.code : shared.code}_LIGAND`];
    });
    jest.spyOn(ligand, 'apply').mockImplementation(({ target, customization }) => show(target, customization.representations[0].params));

    await executePoseTransfer({
      config, sourcePose: { associatedObs: [source, shared] }, destinationPose: { associatedObs: [shared] }
    })(jest.fn(), () => state);

    const sharedRemovals = ligand.remove.mock.calls.filter(([args]) => args.selectedItem.id === shared.id);
    expect(sharedRemovals).toHaveLength(opacity === 0.4 ? 0 : 1);
    expect(ligand.apply).toHaveBeenCalledTimes(opacity === 0.4 ? 0 : 1);
    expect(state.selectionReducers.fragmentDisplayList).toStrictEqual([shared.id]);
    expect(state.nglReducers.objectsInView.shared_LIGAND.representations[0].params.opacity).toBe(0.4);
  });

  it('waits for Moorhen object deletion even after the selected checkbox has cleared', () => {
    expect.hasAssertions();
    const ligand = createConfig().poseControls.find(control => control.key === 'ligand');
    const state = createState({ nglReducers: { objectsInView: {
      ligand: { moleculeId: 7, OBJECT_TYPE: 'LIGAND' }
    } } });
    expect(ligand.isSelectedItemActive({ state, selectedItem: { id: 7 } })).toBe(true);
    state.nglReducers.objectsInView = {};
    expect(ligand.isSelectedItemActive({ state, selectedItem: { id: 7 } })).toBe(false);
  });

  it.each(
    Object.values(POSE_TRANSFER_SCHEDULING).flatMap(transferScheduling =>
      Object.values(POSE_TRANSFER_ORDERS).map(transferOrder => [transferScheduling, transferOrder])
    )
  )('clears unrelated Hits and transfers only the open inspirations through %s %s navigation', async (transferScheduling, transferOrder) => {
    expect.hasAssertions();
    const source = { id: 1, code: 'source' };
    const destination = { id: 2, code: 'destination' };
    const hitsLigand = { id: 3, code: 'hits' };
    const sourceInspiration = { id: 4, code: 'source-inspiration' };
    const destinationInspiration = { id: 5, code: 'destination-inspiration' };
    const existingDestinationHit = { id: 6, code: 'existing-destination-hit' };
    let state = createState({
      apiReducers: {
        all_mol_lists: [source, destination, hitsLigand, sourceInspiration, destinationInspiration, existingDestinationHit]
      }
    });
    let openPose;
    const config = createConfig({ transferScheduling, transferOrder, dialogs: {
      hasTransferableState: ({ pose }) => pose === openPose
    } });
    const sourcePose = { associatedObs: [source], computed_inspirations: [hitsLigand.id, sourceInspiration.id] };
    const destinationPose = {
      associatedObs: [destination],
      computed_inspirations: [destinationInspiration.id, existingDestinationHit.id]
    };
    const dispatch = action => {
      if (typeof action === 'function') return action(dispatch, () => state);
      const { item } = action;
      const selection = state.selectionReducers;
      const toBeDisplayedList = selection.toBeDisplayedList.filter(entry => entry.id !== item.id);
      const fragmentDisplayList = selection.fragmentDisplayList.filter(id => id !== item.id);
      const objectsInView = { ...state.nglReducers.objectsInView };
      if (item.display) {
        toBeDisplayedList.push({ ...item, rendered: true });
        fragmentDisplayList.push(item.id);
        objectsInView[item.id] = { moleculeId: item.id, OBJECT_TYPE: 'LIGAND' };
      } else {
        delete objectsInView[item.id];
      }
      state = {
        ...state,
        selectionReducers: { ...selection, toBeDisplayedList, fragmentDisplayList },
        nglReducers: { ...state.nglReducers, objectsInView }
      };
      return action;
    };
    const show = item => dispatch(addLigand(null, item));
    const move = (from, to) => executePoseTransfer({ config, sourcePose: from, destinationPose: to })(dispatch, () => state);
    const displayed = () => new Set(state.selectionReducers.fragmentDisplayList);

    await show(hitsLigand);
    await show(existingDestinationHit);
    expect(hasPoseTransferStateForPose({ state, pose: sourcePose, config })).toBe(false);

    await show(source);
    await show(destination);
    const originalDesignObject = state.nglReducers.objectsInView[destination.id];
    await move(sourcePose, destinationPose);
    expect(displayed()).toStrictEqual(new Set([destination.id]));
    if (transferScheduling !== POSE_TRANSFER_SCHEDULING.PHASED || transferOrder !== POSE_TRANSFER_ORDERS.REMOVE_FIRST) {
      expect(state.nglReducers.objectsInView[destination.id]).toBe(originalDesignObject);
    }

    openPose = destinationPose;
    await show(destinationInspiration); // Works with legacy snapshot entries, without an ownership marker.
    await move(destinationPose, sourcePose);
    expect(displayed()).toStrictEqual(new Set([source.id, hitsLigand.id, sourceInspiration.id]));
    openPose = sourcePose;
    await move(sourcePose, destinationPose);
    expect(displayed()).toStrictEqual(new Set([destination.id, destinationInspiration.id, existingDestinationHit.id]));
  });

  it('keeps post-transfer centering disabled when no mode is injected', () => {
    expect.hasAssertions();
    const defaultConfig = createConfig();
    const enabledConfig = createConfig({
      postTransferCenteringMode: POSE_TRANSFER_CENTERING_MODES.DESIGN_LIGAND
    });

    expect(defaultConfig.postTransferFocus.enabled).toBe(false);
    expect(enabledConfig.postTransferFocus.enabled).toBe(true);
  });

  it('selects active destination ligand ids for each post-transfer centering mode', () => {
    expect.hasAssertions();
    const design = { id: 9 };
    const firstInspiration = { id: 10 };
    const secondInspiration = { id: 11 };
    const state = createState({
      selectionReducers: { fragmentDisplayList: [design.id, firstInspiration.id, secondInspiration.id] }
    });
    const context = {
      state,
      destinationPoseItems: [design],
      destinationInspirationItems: [firstInspiration, firstInspiration, secondInspiration]
    };

    expect(
      getPostTransferCenterLigandIds({
        ...context,
        postTransferCenteringMode: POSE_TRANSFER_CENTERING_MODES.NONE
      })
    ).toStrictEqual([]);
    expect(
      getPostTransferCenterLigandIds({
        ...context,
        postTransferCenteringMode: POSE_TRANSFER_CENTERING_MODES.DESIGN_LIGAND
      })
    ).toStrictEqual([design.id]);
    expect(
      getPostTransferCenterLigandIds({
        ...context,
        postTransferCenteringMode: POSE_TRANSFER_CENTERING_MODES.VISIBLE_LIGAND_CENTROID
      })
    ).toStrictEqual([design.id, firstInspiration.id, secondInspiration.id]);
  });

  it('falls back to whichever destination ligand group is visible in centroid mode', () => {
    expect.hasAssertions();
    const design = { id: 9 };
    const inspirations = [{ id: 10 }, { id: 11 }];
    const getIds = fragmentDisplayList =>
      getPostTransferCenterLigandIds({
        state: createState({ selectionReducers: { fragmentDisplayList } }),
        postTransferCenteringMode: POSE_TRANSFER_CENTERING_MODES.VISIBLE_LIGAND_CENTROID,
        destinationPoseItems: [design],
        destinationInspirationItems: inspirations
      });

    expect(getIds([design.id])).toStrictEqual([design.id]);
    expect(getIds(inspirations.map(item => item.id))).toStrictEqual(inspirations.map(item => item.id));
    expect(getIds([])).toStrictEqual([]);
  });

  it('uses target-icon centering for a lone design ligand and multi-ligand centering otherwise', async () => {
    expect.hasAssertions();
    jest.clearAllMocks();
    const stage = { id: 'stage' };
    const design = { id: 9 };
    const inspirations = [{ id: 10 }, { id: 11 }];
    const dispatch = jest.fn(() => true);
    const designConfig = createConfig({
      postTransferCenteringMode: POSE_TRANSFER_CENTERING_MODES.DESIGN_LIGAND
    });
    const centroidConfig = createConfig({
      postTransferCenteringMode: POSE_TRANSFER_CENTERING_MODES.VISIBLE_LIGAND_CENTROID
    });

    await designConfig.postTransferFocus.apply({
      dispatch,
      stage,
      state: createState({ selectionReducers: { fragmentDisplayList: [design.id] } }),
      destinationPoseItems: [design],
      destinationInspirationItems: inspirations
    });
    expect(centerOnLigandByMoleculeID).toHaveBeenCalledWith(stage, design.id);

    await centroidConfig.postTransferFocus.apply({
      dispatch,
      stage,
      state: createState({
        selectionReducers: { fragmentDisplayList: inspirations.map(item => item.id) }
      }),
      destinationPoseItems: [design],
      destinationInspirationItems: inspirations
    });
    expect(centerOnLigandsByMoleculeIDs).toHaveBeenCalledWith(
      stage,
      inspirations.map(item => item.id)
    );
  });

  it('captures ligand representations and the quality-rendering flag', () => {
    expect.hasAssertions();
    const config = createConfig();
    const ligand = config.inspirationControls.find(control => control.key === 'ligand');
    const source = { id: 11, code: 'source' };
    const representations = [{ type: 'licorice', params: { colorValue: '#123456' } }];
    const state = createState({
      selectionReducers: {
        fragmentDisplayList: [source.id],
        toBeDisplayedList: [
          {
            id: source.id,
            type: 'LIGAND',
            display: true,
            [RHS_INSPIRATION]: true,
            withQuality: true,
            representations
          }
        ]
      }
    });

    const snapshots = captureControlSnapshots(state, [source], [ligand]);

    expect(snapshots.ligand.customization).toStrictEqual({
      representations,
      withQuality: true
    });
  });

  it('copies protein choices, representations, and render flags from the first active inspiration', () => {
    expect.hasAssertions();
    const config = createConfig();
    const protein = config.inspirationControls.find(control => control.key === 'protein');
    const first = { id: 21, code: 'first' };
    const second = { id: 22, code: 'second' };
    const firstRepresentations = [{ type: 'cartoon', params: { opacity: 0.4 } }];
    const state = createState({
      selectionReducers: {
        proteinList: [first.id, second.id],
        artefactsChainList: [first.id],
        proteinSettings: [
          { id: first.id, protein: true, artefact: true },
          { id: second.id, protein: true, artefact: false }
        ],
        toBeDisplayedList: [
          {
            id: first.id,
            type: 'PROTEIN',
            display: true,
            [RHS_INSPIRATION]: true,
            withQuality: true,
            representations: firstRepresentations
          },
          { id: first.id, type: 'ARTEFACTS', display: true, [RHS_INSPIRATION]: true, withQuality: false }
        ]
      }
    });

    const snapshots = captureControlSnapshots(state, [first, second], [protein]);

    expect(snapshots.protein.sourceItem).toBe(first);
    expect(snapshots.protein.customization).toStrictEqual({
      proteinRepresentations: firstRepresentations,
      artefactRepresentations: undefined,
      proteinWithQuality: true,
      artefactWithQuality: false,
      settings: { id: first.id, protein: true, artefact: true }
    });
  });

  it('rewrites density customization for the destination while preserving its appearance', async () => {
    expect.hasAssertions();
    const config = createConfig();
    const density = config.inspirationControls.find(control => control.key === 'density');
    const source = { id: 31, code: 'density-source' };
    const destination = {
      id: 32,
      code: 'density-destination',
      proteinData: { event_info: '/event.ccp4' }
    };
    const densityObject = {
      id: source.id,
      color: '#abcdef',
      contour_event: 1.7,
      isWireframeStyle: false,
      render_event: true
    };
    const representations = [{ type: 'surface', params: { opacity: 0.65 } }];
    const state = createState({
      selectionReducers: {
        densityList: [densityObject],
        toBeDisplayedList: [
          {
            id: source.id,
            type: 'DENSITY',
            display: true,
            [RHS_INSPIRATION]: true,
            densityObject,
            representations
          }
        ]
      }
    });
    const snapshot = captureControlSnapshots(state, [source], [density]).density;
    const actions = [];
    const dispatch = action => {
      if (typeof action === 'function') {
        return action(dispatch, () => state);
      }
      actions.push(action);
      return action;
    };

    await density.apply({ dispatch, target: destination, customization: snapshot.customization });

    expect(actions).toHaveLength(1);
    expect(actions[0].item).toStrictEqual(
      expect.objectContaining({
        id: destination.id,
        type: 'DENSITY',
        representations,
        densityObject: {
          ...densityObject,
          id: destination.id
        }
      })
    );
  });

  it('requires both the rendered queue marker and a matching NGL object for structure readiness', () => {
    expect.hasAssertions();
    const config = createConfig();
    const ligand = config.inspirationControls.find(control => control.key === 'ligand');
    const item = { id: 41, code: 'rendered-ligand' };
    const state = createState({
      selectionReducers: {
        fragmentDisplayList: [item.id],
        toBeDisplayedList: [
          {
            id: item.id,
            type: 'LIGAND',
            display: true,
            rendered: true
          }
        ]
      },
      nglReducers: {
        countOfPendingNglObjects: { major_view: 0 },
        objectsInView: {
          rendered_ligand: {
            moleculeId: item.id,
            OBJECT_TYPE: 'LIGAND',
            representations: []
          }
        }
      }
    });

    expect(ligand.isRendered({ state, item })).toBe(true);

    state.nglReducers.countOfPendingNglObjects.major_view = 1;
    expect(ligand.isRendered({ state, item })).toBe(false);

    state.nglReducers.countOfPendingNglObjects.major_view = 0;
    state.nglReducers.objectsInView = {};
    expect(ligand.isRendered({ state, item })).toBe(false);
  });

  it('treats destination-specific protein and density ids as equal customization', () => {
    expect.hasAssertions();
    const config = createConfig();
    const protein = config.inspirationControls.find(control => control.key === 'protein');
    const density = config.inspirationControls.find(control => control.key === 'density');

    expect(
      protein.matchesSnapshot({
        currentSnapshot: {
          activeState: { protein: true, artefact: false },
          customization: {
            proteinRepresentations: [{ type: 'cartoon' }],
            settings: { id: 51, protein: true, artefact: false, opacity: 0.6 }
          }
        },
        snapshot: {
          activeState: { protein: true, artefact: false },
          customization: {
            proteinRepresentations: [{ type: 'cartoon' }],
            settings: { id: 52, protein: true, artefact: false, opacity: 0.6 }
          }
        }
      })
    ).toBe(true);

    expect(
      density.matchesSnapshot({
        currentSnapshot: {
          activeState: { id: 61, color: '#abcdef', contour_event: 1.5 },
          customization: {
            densityObject: { id: 61, color: '#abcdef', contour_event: 1.5 },
            representations: [{ type: 'surface' }]
          }
        },
        snapshot: {
          activeState: { id: 62, color: '#abcdef', contour_event: 1.5 },
          customization: {
            densityObject: { id: 62, color: '#abcdef', contour_event: 1.5 },
            representations: [{ type: 'surface' }]
          }
        }
      })
    ).toBe(true);
  });

  it('removes a ligand without implicitly removing a separately retained vector', async () => {
    expect.hasAssertions();
    const config = createConfig();
    const ligand = config.inspirationControls.find(control => control.key === 'ligand');
    const state = createState({
      selectionReducers: {
        fragmentDisplayList: [71],
        toBeDisplayedList: [{ id: 71, type: 'LIGAND', display: true }]
      }
    });
    const actions = [];
    const dispatch = action => {
      if (typeof action === 'function') {
        return action(dispatch, () => state);
      }
      actions.push(action);
      return action;
    };

    await ligand.remove({ dispatch, stage: {}, selectedItem: { id: 71 }, state });

    expect(actions).toHaveLength(1);
    expect(actions[0].item).toStrictEqual(
      expect.objectContaining({ id: 71, type: 'LIGAND', display: false, withVector: false })
    );
  });
});
