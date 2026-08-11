import { cloneDeep, isEqual } from 'lodash';
import {
  addArtefactChain,
  addComplex,
  addDensity,
  addHitProtein,
  addLigand,
  addSurface,
  addVector,
  removeArtefactChain,
  removeComplex,
  removeDensity,
  removeHitProtein,
  removeLigand,
  removeSurface,
  removeVector
} from './redux/dispatchActions';
import { appendProteinSettings, appendToBeDisplayedList } from '../../../reducers/selection/actions';
import { colourList } from './utils/color';
import { getRepresentationsByType, getRepresentationsForDensities } from '../../nglView/generatingObjects';
import { OBJECT_TYPE } from '../../nglView/constants';
import { NGL_OBJECTS } from '../../../reducers/ngl/constants';
import { VIEWS } from '../../../constants/constants';
import {
  centerOnLigandByMoleculeID,
  centerOnLigandsByMoleculeIDs
} from '../../../reducers/ngl/dispatchActions';
import { POSE_TRANSFER_CENTERING_MODES } from '../../../constants/poseNavigation';

const getMainObservation = pose =>
  pose?.associatedObs?.find(observation => observation.id === pose?.main_site_observation) ||
  pose?.associatedObs?.[0] ||
  null;

export const getPostTransferCenterLigandIds = ({
  state,
  postTransferCenteringMode,
  destinationPoseItems,
  destinationInspirationItems
}) => {
  const displayedLigandIds = new Set(state.selectionReducers.fragmentDisplayList || []);
  const designLigand = destinationPoseItems[0] || null;

  if (postTransferCenteringMode === POSE_TRANSFER_CENTERING_MODES.DESIGN_LIGAND) {
    return designLigand && displayedLigandIds.has(designLigand.id) ? [designLigand.id] : [];
  }
  if (postTransferCenteringMode !== POSE_TRANSFER_CENTERING_MODES.VISIBLE_LIGAND_CENTROID) {
    return [];
  }

  return [
    ...new Set(
      [designLigand, ...(destinationInspirationItems || [])]
        .filter(item => item && displayedLigandIds.has(item.id))
        .map(item => item.id)
    )
  ];
};

const getLatestQueueItem = (state, id, type) =>
  [...(state.selectionReducers.toBeDisplayedList || [])]
    .reverse()
    .find(item => item.id === id && item.type === type && item.display !== false);

const isQueueItemRendered = (state, id, type) => getLatestQueueItem(state, id, type)?.rendered === true;

const hasRenderedNglObject = (state, id, objectTypes) =>
  Object.values(state.nglReducers.objectsInView || {}).some(
    object => object.moleculeId === id && objectTypes.includes(object.OBJECT_TYPE)
  );

const areNglLoadsComplete = state =>
  (state.nglReducers.countOfPendingNglObjects?.[VIEWS.MAJOR_VIEW] ?? 0) === 0;

const isStructureRendered = (state, id, queueType, objectTypes) =>
  isQueueItemRendered(state, id, queueType) &&
  areNglLoadsComplete(state) &&
  hasRenderedNglObject(state, id, objectTypes);

const omitId = value => {
  const copy = cloneDeep(value);

  if (copy && typeof copy === 'object') {
    delete copy.id;
  }

  return copy;
};

const getRepresentations = (state, item, objectType, queueType) => {
  const renderedRepresentations = getRepresentationsByType(
    state.nglReducers.objectsInView || {},
    item,
    objectType
  );
  const queuedRepresentations = getLatestQueueItem(state, item.id, queueType)?.representations;

  return cloneDeep(renderedRepresentations || queuedRepresentations);
};

const idsToSelectedItems = ids => (ids || []).map(id => ({ id }));

const ensureRemovalQueued = ({ dispatch, state, id, type, extra = {} }) => {
  const hasQueueItem = (state.selectionReducers.toBeDisplayedList || []).some(
    item => item.id === id && item.type === type
  );

  if (!hasQueueItem) {
    dispatch(
      appendToBeDisplayedList({
        ...extra,
        id,
        type,
        display: false
      })
    );
  }
};

const ligandControl = fallbackRepresentations => ({
  key: 'ligand',
  getActiveState: (state, item) => state.selectionReducers.fragmentDisplayList.includes(item.id),
  getSelectedItems: state => idsToSelectedItems(state.selectionReducers.fragmentDisplayList),
  captureCustomization: ({ state, item }) => {
    const queueItem = getLatestQueueItem(state, item.id, NGL_OBJECTS.LIGAND);

    return {
      representations: getRepresentations(state, item, OBJECT_TYPE.LIGAND, NGL_OBJECTS.LIGAND),
      withQuality: queueItem?.withQuality ?? state.selectionReducers.qualityList.includes(item.id)
    };
  },
  remove: ({ dispatch, stage, selectedItem, state }) => {
    ensureRemovalQueued({ dispatch, state, id: selectedItem.id, type: NGL_OBJECTS.LIGAND, extra: { withVector: false } });
    return dispatch(removeLigand(stage, selectedItem, true, false));
  },
  apply: ({ dispatch, stage, target, customization }) =>
    dispatch(
      addLigand(
        stage,
        target,
        colourList[target.id % colourList.length],
        false,
        customization?.withQuality ?? false,
        true,
        cloneDeep(customization?.representations || fallbackRepresentations)
      )
    ),
  isRendered: ({ state, item }) =>
    state.selectionReducers.fragmentDisplayList.includes(item.id) &&
    isStructureRendered(state, item.id, NGL_OBJECTS.LIGAND, [OBJECT_TYPE.LIGAND])
});

const proteinControl = {
  key: 'protein',
  getActiveState: (state, item) => {
    const protein = state.selectionReducers.proteinList.includes(item.id);
    const artefact = state.selectionReducers.artefactsChainList.includes(item.id);
    return protein || artefact ? { protein, artefact } : false;
  },
  getSelectedItems: state => {
    const proteinIds = new Set(state.selectionReducers.proteinList);
    const artefactIds = new Set(state.selectionReducers.artefactsChainList);

    return [...new Set([...proteinIds, ...artefactIds])].map(id => ({
      id,
      activeState: {
        protein: proteinIds.has(id),
        artefact: artefactIds.has(id)
      }
    }));
  },
  isSelectedItemActive: ({ state, selectedItem }) => {
    const activeState = selectedItem.activeState || {};

    return (
      (activeState.protein && state.selectionReducers.proteinList.includes(selectedItem.id)) ||
      (activeState.artefact && state.selectionReducers.artefactsChainList.includes(selectedItem.id))
    );
  },
  captureCustomization: ({ state, item, activeState }) => {
    const proteinQueueItem = getLatestQueueItem(state, item.id, NGL_OBJECTS.PROTEIN);
    const artefactQueueItem = getLatestQueueItem(state, item.id, NGL_OBJECTS.ARTEFACTS);

    return {
      proteinRepresentations: getRepresentations(state, item, OBJECT_TYPE.HIT_PROTEIN, NGL_OBJECTS.PROTEIN),
      artefactRepresentations: getRepresentations(state, item, OBJECT_TYPE.ARTEFACTS, NGL_OBJECTS.ARTEFACTS),
      proteinWithQuality:
        proteinQueueItem?.withQuality ?? state.selectionReducers.qualityList.includes(item.id),
      artefactWithQuality:
        artefactQueueItem?.withQuality ?? state.selectionReducers.qualityList.includes(item.id),
      settings: cloneDeep(
        state.selectionReducers.proteinSettings.find(setting => setting.id === item.id) || activeState
      )
    };
  },
  remove: ({ dispatch, stage, selectedItem, state }) => {
    const activeState = selectedItem.activeState || {};
    const colour = colourList[selectedItem.id % colourList.length];
    const promises = [];

    if (activeState.protein) {
      ensureRemovalQueued({ dispatch, state, id: selectedItem.id, type: NGL_OBJECTS.PROTEIN });
      promises.push(dispatch(removeHitProtein(stage, selectedItem, colour, true)));
    }
    if (activeState.artefact) {
      ensureRemovalQueued({ dispatch, state, id: selectedItem.id, type: NGL_OBJECTS.ARTEFACTS });
      promises.push(dispatch(removeArtefactChain(stage, selectedItem, colour, true)));
    }

    return Promise.all(promises);
  },
  matchesSnapshot: ({ currentSnapshot, snapshot }) =>
    isEqual(currentSnapshot.activeState, snapshot.activeState) &&
    isEqual(
      {
        ...currentSnapshot.customization,
        settings: omitId(currentSnapshot.customization?.settings)
      },
      {
        ...snapshot.customization,
        settings: omitId(snapshot.customization?.settings)
      }
    ),
  isRendered: ({ state, item, activeState }) =>
    (!activeState.protein ||
      (state.selectionReducers.proteinList.includes(item.id) &&
        isStructureRendered(state, item.id, NGL_OBJECTS.PROTEIN, [OBJECT_TYPE.HIT_PROTEIN]))) &&
    (!activeState.artefact ||
      (state.selectionReducers.artefactsChainList.includes(item.id) &&
        isStructureRendered(state, item.id, NGL_OBJECTS.ARTEFACTS, [OBJECT_TYPE.ARTEFACTS]))),
  apply: ({ dispatch, stage, target, activeState, customization }) => {
    const colour = colourList[target.id % colourList.length];
    const promises = [];

    dispatch(
      appendProteinSettings(
        {
          ...(customization?.settings || {}),
          id: target.id,
          protein: activeState.protein,
          artefact: activeState.artefact
        },
        true
      )
    );

    if (activeState.protein) {
      promises.push(
        dispatch(
          addHitProtein(
            stage,
            target,
            colour,
            customization?.proteinWithQuality ?? false,
            true,
            cloneDeep(customization?.proteinRepresentations),
            false
          )
        )
      );
    }
    if (activeState.artefact) {
      promises.push(
        dispatch(
          addArtefactChain(
            stage,
            target,
            colour,
            customization?.artefactWithQuality ?? false,
            true,
            cloneDeep(customization?.artefactRepresentations),
            false
          )
        )
      );
    }

    return Promise.all(promises);
  }
};

const createStructureControl = ({ key, listKey, queueType, objectType, add, remove }) => ({
  key,
  getActiveState: (state, item) => state.selectionReducers[listKey].includes(item.id),
  getSelectedItems: state => idsToSelectedItems(state.selectionReducers[listKey]),
  captureCustomization: ({ state, item }) => ({
    representations: getRepresentations(state, item, objectType, queueType)
  }),
  remove: ({ dispatch, stage, selectedItem, state }) => {
    ensureRemovalQueued({ dispatch, state, id: selectedItem.id, type: queueType });
    return dispatch(remove(stage, selectedItem, colourList[selectedItem.id % colourList.length], true));
  },
  apply: ({ dispatch, stage, target, customization }) =>
    dispatch(
      add(
        stage,
        target,
        colourList[target.id % colourList.length],
        true,
        cloneDeep(customization?.representations),
        false
      )
    ),
  isRendered: ({ state, item }) =>
    state.selectionReducers[listKey].includes(item.id) &&
    isStructureRendered(state, item.id, queueType, [objectType])
});

const complexControl = createStructureControl({
  key: 'complex',
  listKey: 'complexList',
  queueType: NGL_OBJECTS.COMPLEX,
  objectType: OBJECT_TYPE.COMPLEX,
  add: addComplex,
  remove: removeComplex
});

const surfaceControl = createStructureControl({
  key: 'surface',
  listKey: 'surfaceList',
  queueType: NGL_OBJECTS.SURFACE,
  objectType: OBJECT_TYPE.SURFACE,
  add: addSurface,
  remove: removeSurface
});

const hasAvailableDensityMap = (item, densityObject) => {
  if (!item?.proteinData) {
    return true;
  }

  const isAvailable = value => Boolean(value && !value.endsWith('None'));

  return (
    (densityObject?.render_event && isAvailable(item.proteinData.event_info)) ||
    (densityObject?.render_2FoFc && isAvailable(item.proteinData.sigmaa_info)) ||
    (densityObject?.render_FoFc && isAvailable(item.proteinData.diff_info))
  );
};

const densityControl = {
  key: 'density',
  getActiveState: (state, item) => state.selectionReducers.densityList.find(density => density.id === item.id) || false,
  getSelectedItems: state => (state.selectionReducers.densityList || []).map(density => ({ ...density })),
  captureCustomization: ({ state, item, activeState }) => {
    const queueItem = getLatestQueueItem(state, item.id, NGL_OBJECTS.DENSITY);
    let renderedRepresentations;

    try {
      renderedRepresentations = getRepresentationsForDensities(
        state.nglReducers.objectsInView || {},
        item,
        OBJECT_TYPE.DENSITY
      );
    } catch (error) {
      renderedRepresentations = undefined;
    }

    return {
      densityObject: cloneDeep(queueItem?.densityObject || activeState),
      representations: cloneDeep(renderedRepresentations?.length ? renderedRepresentations : queueItem?.representations)
    };
  },
  isAvailable: ({ item, snapshot }) => hasAvailableDensityMap(item, snapshot.customization?.densityObject),
  matchesSnapshot: ({ currentSnapshot, snapshot }) =>
    isEqual(omitId(currentSnapshot.activeState), omitId(snapshot.activeState)) &&
    isEqual(
      {
        ...currentSnapshot.customization,
        densityObject: omitId(currentSnapshot.customization?.densityObject)
      },
      {
        ...snapshot.customization,
        densityObject: omitId(snapshot.customization?.densityObject)
      }
    ),
  remove: ({ dispatch, stage, selectedItem, state }) => {
    ensureRemovalQueued({
      dispatch,
      state,
      id: selectedItem.id,
      type: NGL_OBJECTS.DENSITY,
      extra: { densityObject: selectedItem }
    });
    return dispatch(
      removeDensity(
        stage,
        selectedItem,
        selectedItem.color,
        selectedItem.isWireframeStyle,
        true
      )
    );
  },
  apply: ({ dispatch, target, customization }) => {
    const densityObject = {
      ...(cloneDeep(customization?.densityObject) || {}),
      id: target.id
    };

    return dispatch(addDensity(target, densityObject, cloneDeep(customization?.representations)));
  },
  isRendered: ({ state, item }) =>
    state.selectionReducers.densityList.some(density => density.id === item.id) &&
    isStructureRendered(state, item.id, NGL_OBJECTS.DENSITY, [OBJECT_TYPE.DENSITY])
};

const vectorControl = {
  key: 'vector',
  getActiveState: (state, item) => state.selectionReducers.vectorOnList.includes(item.id),
  getSelectedItems: state => idsToSelectedItems(state.selectionReducers.vectorOnList),
  remove: ({ dispatch, stage, selectedItem, state }) => {
    ensureRemovalQueued({ dispatch, state, id: selectedItem.id, type: NGL_OBJECTS.VECTOR });
    return dispatch(removeVector(stage, selectedItem, true));
  },
  apply: ({ dispatch, stage, target }) => dispatch(addVector(stage, target, true)),
  isRendered: ({ state, item }) =>
    state.selectionReducers.vectorOnList.includes(item.id) &&
    isQueueItemRendered(state, item.id, NGL_OBJECTS.VECTOR) &&
    areNglLoadsComplete(state)
};

export const createRhsPoseTransferConfig = ({
  getComputedInspirations,
  ligandRepresentations,
  dialogs,
  transferOrder,
  transferScheduling,
  postTransferCenteringMode = POSE_TRANSFER_CENTERING_MODES.NONE,
  renderTimeout
}) => {
  const ligand = ligandControl(ligandRepresentations);
  const poseControls = [ligand, proteinControl, complexControl, surfaceControl];
  const inspirationControls = [...poseControls, densityControl, vectorControl];

  const getInspirationIds = ({ pose }) =>
    getComputedInspirations({ data: pose, observations: pose?.associatedObs || [] });

  const getInspirationItems = ({ state, pose }) => {
    const ids = getInspirationIds({ pose });
    const observationsById = new Map((state.apiReducers.all_mol_lists || []).map(item => [item.id, item]));

    return ids.map(id => observationsById.get(id)).filter(Boolean);
  };

  const getInspirationStateItems = ({ pose }) => getInspirationIds({ pose }).map(id => ({ id }));

  return {
    poseControls,
    inspirationControls,
    controlsWidth: 38,
    getPoseItems: ({ pose }) => pose?.associatedObs || [],
    getPoseTargets: ({ pose }) => {
      const mainObservation = getMainObservation(pose);
      return mainObservation ? [mainObservation] : [];
    },
    getInspirationIds,
    getInspirationStateItems,
    getInspirationItems,
    getTransferItem: ({ state, selectedItem }) =>
      (state.apiReducers.all_mol_lists || []).find(item => item.id === selectedItem.id) || selectedItem,
    postTransferFocus: {
      enabled: postTransferCenteringMode !== POSE_TRANSFER_CENTERING_MODES.NONE,
      apply: async ({
        dispatch,
        stage,
        state,
        destinationPoseItems,
        destinationInspirationItems
      }) => {
        const ligandIds = getPostTransferCenterLigandIds({
          state,
          postTransferCenteringMode,
          destinationPoseItems,
          destinationInspirationItems
        });

        if (!ligandIds.length) {
          return;
        }

        const designLigandId = destinationPoseItems[0]?.id;
        const centered =
          ligandIds.length === 1 && ligandIds[0] === designLigandId
            ? await dispatch(centerOnLigandByMoleculeID(stage, designLigandId))
            : await dispatch(centerOnLigandsByMoleculeIDs(stage, ligandIds));

        if (!centered) {
          throw new Error('The destination ligands could not be found in the NGL view.');
        }
      },
      failureMessage: 'Pose settings were transferred, but the destination ligands could not be centered.'
    },
    dialogs,
    transferOrder,
    transferScheduling,
    renderTimeout
  };
};
