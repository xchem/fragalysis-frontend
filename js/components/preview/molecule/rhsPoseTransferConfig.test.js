import { captureControlSnapshots } from './poseTransfer';
import {
  createRhsPoseTransferConfig,
  getPostTransferCenterLigandIds
} from './rhsPoseTransferConfig';
import { POSE_TRANSFER_CENTERING_MODES } from '../../../constants/poseNavigation';
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
            withQuality: true,
            representations: firstRepresentations
          },
          { id: first.id, type: 'ARTEFACTS', display: true, withQuality: false }
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
