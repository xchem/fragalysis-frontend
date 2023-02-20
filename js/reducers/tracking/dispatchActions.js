import {
  setCurrentActionsList,
  setIsTrackingMoleculesRestoring,
  setIsTrackingCompoundsRestoring,
  setIsUndoRedoAction,
  setProjectActionListLoaded,
  setIsSnapshotDirty
} from './actions';
import { createInitAction } from './trackingActions';
import { actionType, actionObjectType, NUM_OF_SECONDS_TO_IGNORE_MERGE, mapTypesStrings } from './constants';
import { VIEWS } from '../../../js/constants/constants';
import {
  setHideAll,
  setArrowUpDown,
  appendToMolListToEdit,
  removeFromMolListToEdit,
  setNextXMolecules
} from '../selection/actions';
import {
  resetReducersForRestoringActions,
  shouldLoadProtein,
  loadProteinOfRestoringActions
} from '../../components/preview/redux/dispatchActions';
import { setCurrentProject } from '../../components/projects/redux/actions';
import { setCurrentProject as setProject } from '../../components/target/redux/actions';
import { loadMoleculeGroupsOfTarget } from '../../components/preview/moleculeGroups/redux/dispatchActions';
import { loadTargetList } from '../../components/target/redux/dispatchActions';
import { resetTargetState, setTargetOn } from '../api/actions';
import {
  addComplex,
  addLigand,
  addHitProtein,
  addSurface,
  addQuality,
  addVector,
  removeComplex,
  removeLigand,
  removeHitProtein,
  removeSurface,
  removeQuality,
  removeVector,
  moveSelectedMolSettings,
  removeSelectedMolTypes,
  hideAllSelectedMolecules,
  addDensity,
  addDensityCustomView,
  removeDensity,
  getProteinData,
  selectAllHits
} from '../../components/preview/molecule/redux/dispatchActions';
import { setSortDialogOpen } from '../../components/preview/molecule/redux/actions';
import {
  handleBuyList,
  handleBuyListAll,
  handleShowVectorCompound
} from '../../components/preview/compounds/redux/dispatchActions';
import { setCurrentCompoundClass, setCompoundClasses } from '../../components/preview/compounds/redux/actions';
import { colourList } from '../../components/preview/molecule/utils/color';
import {
  addDatasetComplex,
  addDatasetLigand,
  addDatasetHitProtein,
  addDatasetSurface,
  removeDatasetComplex,
  removeDatasetLigand,
  removeDatasetHitProtein,
  removeDatasetSurface,
  loadDataSets,
  loadDatasetCompoundsWithScores,
  removeSelectedDatasetMolecules,
  moveSelectedMoleculeSettings,
  moveSelectedInspirations,
  moveMoleculeInspirationsSettings,
  getInspirationsForMol,
  selectScoreProperty
} from '../../components/datasets/redux/dispatchActions';
import {
  appendMoleculeToCompoundsOfDatasetToBuy,
  removeMoleculeFromCompoundsOfDatasetToBuy,
  setMoleculeListIsLoading,
  setTabValue,
  setSelectedDatasetIndex,
  setDatasetFilter,
  setFilterProperties,
  setFilterSettings,
  updateFilterShowedScoreProperties,
  setFilterShowedScoreProperties,
  setDragDropState,
  resetDatasetScrolledMap
} from '../../components/datasets/redux/actions';
import {
  removeComponentRepresentation,
  addComponentRepresentation,
  updateComponentRepresentation,
  updateComponentRepresentationVisibility,
  updateComponentRepresentationVisibilityAll,
  changeComponentRepresentation
} from '../../../js/reducers/ngl/actions';
import { NGL_PARAMS, NGL_VIEW_DEFAULT_VALUES, COMMON_PARAMS } from '../../components/nglView/constants';
import { assignRepresentationToComp } from '../../components/nglView/generatingObjects';
import {
  deleteObject,
  setOrientation,
  setNglBckGrndColor,
  setNglClipNear,
  setNglClipFar,
  setNglClipDist,
  setNglFogNear,
  setNglFogFar,
  setIsoLevel,
  setBoxSize,
  setOpacity,
  setContour,
  setWarningIcon,
  setElectronDesityMapColor
} from '../../../js/reducers/ngl/dispatchActions';
import {
  setSendActionsList,
  setIsActionsSending,
  setIsActionsLoading,
  setActionsList,
  setSnapshotImageActionList,
  setUndoRedoActionList
} from './actions';
import { api, METHOD } from '../../../js/utils/api';
import { base_url } from '../../components/routes/constants';
import { CONSTANTS } from '../../../js/constants/constants';
import moment from 'moment';
import {
  appendToSendActionList,
  setProjectActionList,
  setIsActionsSaving,
  setIsActionsRestoring,
  resetTrackingState,
  setIsActionTracking
} from './actions';
import {
  setSelectedAll,
  setDeselectedAll,
  setSelectedAllByType,
  setDeselectedAllByType
} from '../../../js/reducers/selection/actions';
import {
  setSelectedAll as setSelectedAllOfDataset,
  setDeselectedAll as setDeselectedAllOfDataset,
  setSelectedAllByType as setSelectedAllByTypeOfDataset,
  setDeselectedAllByType as setDeselectedAllByTypeOfDataset,
  setArrowUpDown as setArrowUpDownOfDataset,
  setCrossReferenceCompoundName,
  setInspirationMoleculeDataList
} from '../../components/datasets/redux/actions';
import { selectVectorAndResetCompounds } from '../../../js/reducers/selection/dispatchActions';
import { ActionCreators as UndoActionCreators } from '../../undoredo/actions';
import { hideShapeRepresentations } from '../../components/nglView/redux/dispatchActions';
import { MAP_TYPE } from '../ngl/constants';
import {
  removeSelectedTag,
  addSelectedTag,
  loadMoleculesAndTags
} from '../../components/preview/tags/redux/dispatchActions';
import { turnSide } from '../../components/preview/viewerControls/redux/actions';
import { getQualityOffActions } from './utils';

export const addCurrentActionsListToSnapshot = (snapshot, project, nglViewList) => async (dispatch, getState) => {
  let projectID = project && project.projectID;
  let actionList = await dispatch(getTrackingActions(projectID));

  await dispatch(setSnapshotToActions(actionList, snapshot, projectID, project, nglViewList, true));
};

export const saveCurrentActionsList = (snapshot, project, nglViewList, all = false) => async (dispatch, getState) => {
  let projectID = project && project.projectID;
  let actionList = await dispatch(getTrackingActions(projectID));

  if (all === false) {
    dispatch(setSnapshotToActions(actionList, snapshot, projectID, project, nglViewList, false));
  } else {
    dispatch(setSnapshotToAllActions(actionList, snapshot, projectID));
  }
  await dispatch(saveActionsList(project, snapshot, actionList, nglViewList));
};

const saveActionsList = (project, snapshot, actionList, nglViewList) => async (dispatch, getState) => {
  const state = getState();
  const snapshotID = snapshot && snapshot.id;
  if (snapshotID) {
    const currentTargetOn = state.apiReducers.target_on;
    const currentSites = state.selectionReducers.mol_group_selection;
    const currentTags =
      state.selectionReducers.selectedTagList && state.selectionReducers.selectedTagList.map(value => value.id);
    const currentLigands = state.selectionReducers.fragmentDisplayList;
    const currentProteins = state.selectionReducers.proteinList;
    const currentComplexes = state.selectionReducers.complexList;
    const currentSurfaces = state.selectionReducers.surfaceList;
    const currentQualities = state.selectionReducers.qualityList;
    const currentDensities = state.selectionReducers.densityList;
    const currentDensitiesCustom = state.selectionReducers.densityListCustom;
    const currentDensitiesType = state.selectionReducers.densityListType;
    const currentVectors = state.selectionReducers.vectorOnList;
    const currentBuyList = state.selectionReducers.to_buy_list;
    const currentVector = state.selectionReducers.currentVector;
    const currentSelectionAll = state.selectionReducers.moleculeAllSelection;
    const selectedMolecules = state.selectionReducers.moleculesToEdit;

    const currentDatasetLigands = state.datasetsReducers.ligandLists;
    const currentDatasetProteins = state.datasetsReducers.proteinLists;
    const currentDatasetComplexes = state.datasetsReducers.complexLists;
    const currentDatasetSurfaces = state.datasetsReducers.surfaceLists;
    const currentDatasetSelectionAll = state.datasetsReducers.moleculeAllSelection;

    const showedCompoundList = state.previewReducers.compounds.showedCompoundList;
    const currentDatasetBuyList = state.datasetsReducers.compoundsToBuyDatasetMap;
    const currentobjectsInView = state.nglReducers.objectsInView;

    const currentTargets = (currentTargetOn && [currentTargetOn]) || [];
    const currentVectorSmiles = (currentVector && [currentVector]) || [];

    let orderedActionList = actionList.reverse((a, b) => a.timestamp - b.timestamp);

    let currentActions = [];

    getCurrentActionList(orderedActionList, actionType.TARGET_LOADED, getCollection(currentTargets), currentActions);
    getCurrentActionList(orderedActionList, actionType.SITE_TURNED_ON, getCollection(currentSites), currentActions);
    getCurrentActionList(orderedActionList, actionType.TAG_SELECTED, getCollection(currentTags), currentActions);
    getCurrentActionList(orderedActionList, actionType.LIGAND_TURNED_ON, getCollection(currentLigands), currentActions);

    getCurrentActionListOfAllSelection(
      orderedActionList,
      actionType.ALL_TURNED_ON,
      getCollection(currentSelectionAll),
      currentActions,
      getCollection(currentLigands),
      getCollection(currentProteins),
      getCollection(currentComplexes)
    );

    getCurrentActionListOfAllSelectionByType(
      orderedActionList,
      actionType.SELECTED_TURNED_ON_BY_TYPE,
      'ligand',
      getCollection(currentLigands),
      currentActions
    );

    getCurrentActionListOfAllSelectionByType(
      orderedActionList,
      actionType.SELECTED_TURNED_ON_BY_TYPE,
      'protein',
      getCollection(currentProteins),
      currentActions
    );

    getCurrentActionListOfAllSelectionByType(
      orderedActionList,
      actionType.SELECTED_TURNED_ON_BY_TYPE,
      'complex',
      getCollection(currentComplexes),
      currentActions
    );

    getCurrentActionListOfAllSelectionByTypeOfDataset(
      orderedActionList,
      actionType.SELECTED_TURNED_ON_BY_TYPE,
      'ligand',
      getCollectionOfDataset(currentDatasetLigands),
      currentActions
    );

    getCurrentActionListOfAllSelectionByTypeOfDataset(
      orderedActionList,
      actionType.SELECTED_TURNED_ON_BY_TYPE,
      'protein',
      getCollectionOfDataset(currentDatasetProteins),
      currentActions
    );

    getCurrentActionListOfAllSelectionByTypeOfDataset(
      orderedActionList,
      actionType.SELECTED_TURNED_ON_BY_TYPE,
      'complex',
      getCollectionOfDataset(currentDatasetComplexes),
      currentActions
    );

    getCurrentActionListOfAllSelection(
      orderedActionList,
      actionType.ALL_TURNED_ON,
      getCollectionOfDataset(currentDatasetSelectionAll),
      currentActions,
      getCollectionOfDataset(currentDatasetLigands),
      getCollectionOfDataset(currentDatasetProteins),
      getCollectionOfDataset(currentDatasetComplexes)
    );

    getCurrentActionListOfSelectAllMolecules(
      orderedActionList,
      actionType.ALL_MOLECULES_SELECTED,
      getCollection(selectedMolecules),
      currentActions
    );

    getCurrentActionList(
      orderedActionList,
      actionType.SIDECHAINS_TURNED_ON,
      getCollection(currentProteins),
      currentActions
    );

    getCurrentActionList(
      orderedActionList,
      actionType.INTERACTIONS_TURNED_ON,
      getCollection(currentComplexes),
      currentActions
    );
    getCurrentActionList(
      orderedActionList,
      actionType.SURFACE_TURNED_ON,
      getCollection(currentSurfaces),
      currentActions
    );
    dispatch(getQualityOffActions(orderedActionList, currentActions));
    // getCurrentActionList(
    //   orderedActionList,
    //   actionType.QUALITY_TURNED_OFF,
    //   getCollection(currentQualities),
    //   currentActions
    // );
    getCurrentActionList(
      orderedActionList,
      actionType.DENSITY_TURNED_ON,
      getCollection(currentDensities),
      currentActions
    );
    getCurrentActionList(
      orderedActionList,
      actionType.MOLECULE_SELECTED,
      getCollection(selectedMolecules),
      currentActions
    );
    getCurrentActionList(orderedActionList, actionType.DENSITY_TYPE_ON, currentDensitiesType, currentActions);
    getCurrentActionList(
      orderedActionList,
      actionType.DENSITY_CUSTOM_TURNED_ON,
      getCollection(currentDensitiesCustom),
      currentActions
    );
    getCurrentActionList(
      orderedActionList,
      actionType.VECTORS_TURNED_ON,
      getCollection(currentVectors),
      currentActions
    );
    getCurrentActionList(
      orderedActionList,
      actionType.VECTOR_SELECTED,
      getCollection(currentVectorSmiles),
      currentActions
    );

    getCurrentActionList(
      orderedActionList,
      actionType.VECTOR_COUMPOUND_ADDED,
      getCollection(showedCompoundList),
      currentActions
    );

    getCurrentActionListOfShoppingCart(
      orderedActionList,
      actionType.MOLECULE_ADDED_TO_SHOPPING_CART,
      getCollectionOfShoppingCart(currentBuyList),
      currentActions
    );

    getCurrentActionListOfAllShopingCart(
      orderedActionList,
      actionType.MOLECULE_ADDED_TO_SHOPPING_CART_ALL,
      getCollectionOfShoppingCart(currentBuyList),
      currentActions
    );

    getCurrentActionList(
      orderedActionList,
      actionType.LIGAND_TURNED_ON,
      getCollectionOfDataset(currentDatasetLigands),
      currentActions
    );

    getCurrentActionList(
      orderedActionList,
      actionType.SIDECHAINS_TURNED_ON,
      getCollectionOfDataset(currentDatasetProteins),
      currentActions
    );

    getCurrentActionList(
      orderedActionList,
      actionType.INTERACTIONS_TURNED_ON,
      getCollectionOfDataset(currentDatasetComplexes),
      currentActions
    );

    getCurrentActionList(
      orderedActionList,
      actionType.SURFACE_TURNED_ON,
      getCollectionOfDataset(currentDatasetSurfaces),
      currentActions
    );

    getCurrentActionList(
      orderedActionList,
      actionType.COMPOUND_SELECTED,
      getCollectionOfDataset(currentDatasetBuyList),
      currentActions
    );

    getCurrentActionList(
      orderedActionList,
      actionType.REPRESENTATION_ADDED,
      getCollectionOfDatasetOfRepresentation(currentobjectsInView),
      currentActions
    );

    getCurrentActionList(
      orderedActionList,
      actionType.REPRESENTATION_UPDATED,
      getCollectionOfDatasetOfRepresentation(currentobjectsInView),
      currentActions
    );

    getCommonLastActionByType(orderedActionList, actionType.TAB, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.DATASET_INDEX, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.DATASET_FILTER, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.DATASET_FILTER_SCORE, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.CLASS_SELECTED, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.CLASS_UPDATED, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.ISO_LEVEL_EVENT, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.BOX_SIZE_EVENT, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.OPACITY_EVENT, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.CONTOUR_EVENT, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.COLOR_EVENT, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.ISO_LEVEL_SIGMAA, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.BOX_SIZE_SIGMAA, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.OPACITY_SIGMAA, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.CONTOUR_SIGMAA, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.COLOR_SIGMAA, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.ISO_LEVEL_DIFF, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.BOX_SIZE_DIFF, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.OPACITY_DIFF, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.CONTOUR_DIFF, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.COLOR_DIFF, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.WARNING_ICON, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.BACKGROUND_COLOR_CHANGED, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.CLIP_NEAR, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.CLIP_FAR, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.CLIP_DIST, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.FOG_NEAR, currentActions);
    getCommonLastActionByType(orderedActionList, actionType.FOG_FAR, currentActions);

    // Since drag and drop state can be influenced by filter as well, determine its state by the last influential action
    const action = orderedActionList.find(action =>
      [actionType.DRAG_DROP_FINISHED, actionType.DATASET_FILTER].includes(action.type)
    );
    if (action) {
      currentActions.push({ ...action, type: actionType.DRAG_DROP_FINISHED });
    }

    // Sides
    getLastActionByCriteria(orderedActionList, actionType.TURN_SIDE, action => action.side === 'LHS', currentActions);
    getLastActionByCriteria(orderedActionList, actionType.TURN_SIDE, action => action.side === 'RHS', currentActions);

    if (nglViewList) {
      let nglStateList = nglViewList.map(nglView => {
        return { id: nglView.id, orientation: nglView.stage.viewerControls.getOrientation() };
      });

      let trackAction = {
        type: actionType.NGL_STATE,
        timestamp: Date.now(),
        nglStateList: nglStateList
      };

      currentActions.push(Object.assign({ ...trackAction }));
    }

    await dispatch(saveSnapshotAction(snapshot, project, currentActions));
    await dispatch(saveTrackingActions(currentActions, snapshotID));
    dispatch(setCurrentActionsList(currentActions));
  }
};

const saveSnapshotAction = (snapshot, project, currentActions) => async (dispatch, getState) => {
  const state = getState();
  const trackingImageSource = state.trackingReducers.trackingImageSource;

  let sendActions = [];
  let snapshotAction = {
    type: actionType.SNAPSHOT,
    timestamp: Date.now(),
    object_name: snapshot.title,
    object_id: snapshot.id,
    snapshotId: snapshot.id,
    text: `Snapshot: ${snapshot.id} - ${snapshot.title}`,
    image: trackingImageSource
  };
  sendActions.push(snapshotAction);
  currentActions.push(snapshotAction);
  await dispatch(sendTrackingActions(sendActions, project));
};

const setSnapshotToActions = (actionList, snapshot, projectID, project, nglViewList, addToSnapshot) => async (
  dispatch,
  getState
) => {
  if (actionList && snapshot) {
    let actionsWithoutSnapshot = actionList.filter(a => a.snapshotId === null || a.snapshotId === undefined);
    let updatedActions = actionsWithoutSnapshot.map(obj => ({ ...obj, snapshotId: snapshot.id }));
    dispatch(setAndUpdateTrackingActions(updatedActions, projectID));

    if (addToSnapshot === true) {
      await dispatch(saveActionsList(project, snapshot, updatedActions, nglViewList));
    }
  }
};

const setSnapshotToAllActions = (actionList, snapshot, projectID) => async (dispatch, getState) => {
  if (actionList && snapshot) {
    let updatedActions = actionList.map(obj => ({ ...obj, snapshotId: snapshot.id }));
    dispatch(setAndUpdateTrackingActions(updatedActions, projectID));
  }
};

export const saveTrackingActions = (currentActions, snapshotID) => async (dispatch, getState) => {
  const state = getState();
  const project = state.projectReducers.currentProject;
  const projectID = project && project.projectID;

  if (snapshotID) {
    dispatch(setIsActionsSaving(true));

    const dataToSend = {
      session_project: projectID,
      author: project.authorID,
      snapshot: snapshotID,
      last_update_date: moment().format(),
      actions: JSON.stringify(currentActions)
    };
    return api({
      url: `${base_url}/api/snapshot-actions/`,
      method: METHOD.POST,
      data: JSON.stringify(dataToSend)
    })
      .then(response => {
        dispatch(setCurrentActionsList([]));
      })
      .catch(error => {
        throw new Error(error);
      })
      .finally(() => {
        dispatch(setIsActionsSaving(false));
      });
  } else {
    return Promise.resolve();
  }
};

// const getCurrentActionListForTags = (orderedActionList, type, collection, currentActions) => {
//   let actionList = orderedActionList.filter(action => action.type === type);
// };

const getCurrentActionList = (orderedActionList, type, collection, currentActions) => {
  let actionList = orderedActionList.filter(action => action.type === type);

  if (collection) {
    collection.forEach(data => {
      let action = actionList.find(a => a.object_id === data.id && a.dataset_id === data.datasetId);

      if (action) {
        currentActions.push(Object.assign({ ...action }));
      }
    });
  }
};

const getCommonLastActionByType = (orderedActionList, type, currentActions) => {
  let action = orderedActionList.find(action => action.type === type);
  if (action) {
    currentActions.push(Object.assign({ ...action }));
  }
};

const getLastActionByCriteria = (orderedActionList, type, criteriaFunction, currentActions) => {
  const action = orderedActionList.find(action => action.type === type && criteriaFunction(action));
  if (action) {
    currentActions.push({ ...action });
  }
};

const getCurrentActionListOfAllSelection = (
  orderedActionList,
  type,
  collection,
  currentActions,
  ligandList,
  proteinList,
  complexList
) => {
  let actionList = orderedActionList.filter(action => action.type === type);

  if (collection) {
    collection.forEach(data => {
      let action = actionList.find(action => action.object_id === data.id && action.dataset_id === data.datasetId);

      if (action) {
        let ligandAction = ligandList.find(
          data => data.id === action.object_id && action.dataset_id === data.datasetId
        );
        let proteinAction = proteinList.find(
          data => data.id === action.object_id && action.dataset_id === data.datasetId
        );
        let complexAction = complexList.find(
          data => data.id === action.object_id && action.dataset_id === data.datasetId
        );

        let isLigand = ligandAction && ligandAction != null ? true : false;
        let isProtein = proteinAction && proteinAction != null ? true : false;
        let isComplex = complexAction && complexAction != null ? true : false;
        currentActions.push(
          Object.assign({ ...action, isLigand: isLigand, isProtein: isProtein, isComplex: isComplex })
        );
      }
    });
  }
};

const getCurrentActionListOfAllSelectionByType = (orderedActionList, type, controlType, collection, currentActions) => {
  let action = orderedActionList.find(
    action =>
      action.type === type &&
      action.control_type === controlType &&
      (action.object_type === actionObjectType.MOLECULE || action.object_type === actionObjectType.INSPIRATION)
  );
  if (action && collection) {
    let actionItems = action.items;
    let items = [];
    collection.forEach(data => {
      let item = actionItems.find(action => action.id === data.id && action.dataset_id === data.datasetId);
      if (item) {
        items.push(item);
      }
    });

    currentActions.push(Object.assign({ ...action, items: items }));
  }
};

const getCurrentActionListOfAllSelectionByTypeOfDataset = (
  orderedActionList,
  type,
  controlType,
  collection,
  currentActions
) => {
  let action = orderedActionList.find(
    action =>
      action.type === type &&
      action.control_type === controlType &&
      (action.object_type === actionObjectType.COMPOUND || action.object_type === actionObjectType.CROSS_REFERENCE)
  );
  if (action && collection) {
    let actionItems = action.items;
    let items = [];
    collection.forEach(data => {
      let item = actionItems.find(item => item.molecule.id === data.id && item.datasetID === data.datasetId);
      if (item) {
        items.push(item);
      }
    });

    currentActions.push(Object.assign({ ...action, items: items }));
  }
};

const getCurrentActionListOfSelectAllMolecules = (orderedActionList, type, collection, currentActions) => {
  let action = orderedActionList.find(action => action.type === type);
  if (action && collection) {
    let actionItems = action.items;
    let items = [];
    collection.forEach(data => {
      let item = actionItems.find(ai => ai.id === data.id);
      if (item) {
        items.push(item);
      }
    });

    currentActions.push(Object.assign({ ...action, items: items }));
  }
};

const getCurrentActionListOfShoppingCart = (orderedActionList, type, collection, currentActions) => {
  let actionList = orderedActionList.filter(action => action.type === type);

  if (collection) {
    collection.forEach(data => {
      let action = actionList.find(action => action.object_id === data.id && action.compoundId === data.compoundId);

      if (action) {
        currentActions.push(Object.assign({ ...action }));
      }
    });
  }
};

const getCurrentActionListOfAllShopingCart = (orderedActionList, type, collection, currentActions) => {
  let action = orderedActionList.find(action => action.type === type);
  if (action && collection) {
    let actionItems = action.items;
    let items = [];
    collection.forEach(data => {
      let item = actionItems.find(i => i.vector === data.id && i.compoundId === data.compoundId);
      if (item) {
        items.push(item);
      }
    });

    currentActions.push(Object.assign({ ...action, items: items }));
  }
};

const getCollection = dataList => {
  let list = [];
  if (dataList) {
    var result = dataList.map(value => ({ id: value }));
    list.push(...result);
  }
  return list;
};

const getCollectionOfDataset = dataList => {
  let list = [];
  if (dataList) {
    for (const datasetId in dataList) {
      let values = dataList[datasetId];
      if (values) {
        var result = values.map(value => ({ id: value, datasetId: datasetId }));
        list.push(...result);
      }
    }
  }
  return list;
};

const getCollectionOfShoppingCart = dataList => {
  let list = [];
  if (dataList) {
    dataList.forEach(data => {
      let value = data.vector;
      if (value) {
        list.push({ id: value, compoundId: data.compoundId });
      }
    });
  }
  return list;
};

const getCollectionOfDatasetOfRepresentation = dataList => {
  let list = [];
  for (const view in dataList) {
    let objectView = dataList[view];
    if (objectView && objectView !== null && objectView.display_div === VIEWS.MAJOR_VIEW) {
      let value = dataList[view].name;
      if (value) {
        list.push({ id: value });
      }
    }
  }
  return list;
};

export const resetRestoringState = () => (dispatch, getState) => {
  dispatch(setActionsList([]));
  dispatch(setProjectActionList([]));
  dispatch(setSendActionsList([]));

  dispatch(setTargetOn(undefined));
  dispatch(setIsActionsRestoring(false, false));
};

export const restoreCurrentActionsList = snapshotID => async (dispatch, getState) => {
  dispatch(resetTrackingState());
  dispatch(resetTargetState());
  dispatch(setTargetOn(undefined));

  dispatch(setIsActionsRestoring(true, false));

  await dispatch(restoreTrackingActions(snapshotID));
  dispatch(setIsTrackingMoleculesRestoring(true));
  dispatch(setIsTrackingCompoundsRestoring(true));
  dispatch(resetTargetState());
  dispatch(resetReducersForRestoringActions());
  dispatch(restoreStateBySavedActionList());
};

const restoreTrackingActions = snapshotID => async (dispatch, getState) => {
  if (snapshotID) {
    try {
      const response = await api({
        url: `${base_url}/api/snapshot-actions/?snapshot=${snapshotID}`
      });
      let results = response.data.results;
      let listToSet = [];
      results.forEach(r => {
        let resultActions = JSON.parse(r.actions);
        listToSet.push(...resultActions);
      });

      let snapshotActions = [...listToSet];
      dispatch(setCurrentActionsList(snapshotActions));
    } catch (error) {
      throw new Error(error);
    }
  } else {
    return Promise.resolve();
  }
};

export const restoreStateBySavedActionList = () => (dispatch, getState) => {
  const state = getState();

  const currentActionList = state.trackingReducers.current_actions_list;
  const orderedActionList = currentActionList.sort((a, b) => a.timestamp - b.timestamp);

  let onCancel = () => {};
  dispatch(loadTargetList(onCancel))
    .then(() => {
      dispatch(restoreTargetActions(orderedActionList));
      dispatch(setIsSnapshotDirty(false));
    })
    .catch(error => {
      throw new Error(error);
    });
  return () => {
    onCancel();
  };
};

const restoreTargetActions = orderedActionList => (dispatch, getState) => {
  const state = getState();

  let targetAction = orderedActionList.find(action => action.type === actionType.TARGET_LOADED);
  if (targetAction) {
    let target = getTarget(targetAction.object_name, state);
    if (target) {
      dispatch(setTargetOn(target.id));
    }
  }
};

export const restoreAfterTargetActions = (stages, projectId) => async (dispatch, getState) => {
  const state = getState();

  const currentActionList = state.trackingReducers.current_actions_list;
  const orderedActionList = currentActionList.sort((a, b) => a.timestamp - b.timestamp);
  const targetId = state.apiReducers.target_on;

  if (targetId && stages && stages.length > 0) {
    const majorView = stages.find(view => view.id === VIEWS.MAJOR_VIEW);

    await dispatch(loadProteinOfRestoringActions({ nglViewList: stages }));

    await dispatch(
      loadMoleculeGroupsOfTarget({
        isStateLoaded: false,
        setOldUrl: url => {},
        target_on: targetId
      })
    )
      .catch(error => {
        throw error;
      })
      .finally(() => {});

    await dispatch(restoreSitesActions(orderedActionList));
    await dispatch(loadData(orderedActionList, targetId, majorView));
    await dispatch(restoreTagActions(orderedActionList));
    await dispatch(restoreMoleculesActions(orderedActionList, majorView.stage));
    await dispatch(restoreRepresentationActions(orderedActionList, stages));
    await dispatch(restoreProject(projectId));
    dispatch(restoreMoleculeSelectionActions(orderedActionList));
    dispatch(restoreTabActions(orderedActionList));
    await dispatch(restoreCartActions(orderedActionList, majorView.stage));
    dispatch(restoreSnapshotImageActions(projectId));
    dispatch(restoreNglStateAction(orderedActionList, stages));
    dispatch(restoreNglSettingsAction(orderedActionList, majorView.stage));
    dispatch(setIsActionsRestoring(false, true));
    dispatch(restoreViewerControlActions(orderedActionList));
    dispatch(resetDatasetScrolledMap()); // Have a look at useScrollToSelected.js
    dispatch(setIsSnapshotDirty(false));
  }
};

export const restoreMoleculeSelectionActions = orderedActionList => (dispatch, getState) => {
  const state = getState();
  let actions = orderedActionList.filter(action => action.type === actionType.MOLECULE_SELECTED);
  if (actions) {
    actions.forEach(a => {
      const mol = getMolecule(a.object_name, state);
      dispatch(appendToMolListToEdit(mol.id));
    });
  }
};

export const restoreNglViewSettings = stages => (dispatch, getState) => {
  const majorViewStage = stages.find(view => view.id === VIEWS.MAJOR_VIEW).stage;

  dispatch(restoreNglSettingsAction([], majorViewStage));
};

export const restoreNglSettingsAction = (orderedActionList, majorViewStage) => (dispatch, getState) => {
  const state = getState();
  const viewParams = state.nglReducers.viewParams;

  let backgroundAction = orderedActionList.find(action => action.type === actionType.BACKGROUND_COLOR_CHANGED);
  if (backgroundAction && backgroundAction.newSetting !== undefined) {
    let value = backgroundAction.newSetting;
    dispatch(setNglBckGrndColor(value, majorViewStage));
  } else {
    dispatch(setNglBckGrndColor(NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.backgroundColor], majorViewStage));
  }

  let clipNearAction = orderedActionList.find(action => action.type === actionType.CLIP_NEAR);
  if (clipNearAction && clipNearAction.newSetting !== undefined) {
    let value = clipNearAction.newSetting;
    dispatch(setNglClipNear(value, viewParams[NGL_PARAMS.clipNear], majorViewStage));
  } else {
    dispatch(
      setNglClipNear(NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.clipNear], viewParams[NGL_PARAMS.clipNear], majorViewStage)
    );
  }

  let clipFarAction = orderedActionList.find(action => action.type === actionType.CLIP_FAR);
  if (clipFarAction && clipFarAction.newSetting !== undefined) {
    let value = clipFarAction.newSetting;
    dispatch(setNglClipFar(value, viewParams[NGL_PARAMS.clipFar], majorViewStage));
  } else {
    dispatch(
      setNglClipFar(NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.clipFar], viewParams[NGL_PARAMS.clipFar], majorViewStage)
    );
  }

  let clipDistAction = orderedActionList.find(action => action.type === actionType.CLIP_DIST);
  if (clipDistAction && clipDistAction.newSetting !== undefined) {
    let value = clipDistAction.newSetting;
    dispatch(setNglClipDist(value, viewParams[NGL_PARAMS.clipDist], majorViewStage));
  } else {
    dispatch(
      setNglClipDist(NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.clipDist], viewParams[NGL_PARAMS.clipDist], majorViewStage)
    );
  }

  let fogNearAction = orderedActionList.find(action => action.type === actionType.FOG_NEAR);
  if (fogNearAction && fogNearAction.newSetting !== undefined) {
    let value = fogNearAction.newSetting;
    dispatch(setNglFogNear(value, viewParams[NGL_PARAMS.fogNear], majorViewStage));
  } else {
    dispatch(
      setNglFogNear(NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.fogNear], viewParams[NGL_PARAMS.fogNear], majorViewStage)
    );
  }

  let fogFarAction = orderedActionList.find(action => action.type === actionType.FOG_FAR);
  if (fogFarAction && fogFarAction.newSetting !== undefined) {
    let value = fogFarAction.newSetting;
    dispatch(setNglFogFar(value, viewParams[NGL_PARAMS.fogFar], majorViewStage));
  } else {
    dispatch(setNglFogFar(NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.fogFar], viewParams[NGL_PARAMS.fogFar], majorViewStage));
  }

  let isoLevelActions = orderedActionList.filter(action => action.type.startsWith('ISO_LEVEL'));
  isoLevelActions &&
    isoLevelActions.forEach(isoLevelAction => {
      if (isoLevelAction && isoLevelAction.newSetting !== undefined) {
        let value = isoLevelAction.newSetting;
        if (isoLevelAction.object_name === mapTypesStrings.EVENT) {
          dispatch(setIsoLevel(MAP_TYPE.event, value, viewParams[NGL_PARAMS.isolevel_DENSITY], majorViewStage));
        } else if (isoLevelAction.object_name === mapTypesStrings.DIFF) {
          dispatch(setIsoLevel(MAP_TYPE.diff, value, viewParams[NGL_PARAMS.isolevel_DENSITY_MAP_diff], majorViewStage));
        } else if (isoLevelAction.object_name === mapTypesStrings.SIGMAA) {
          dispatch(
            setIsoLevel(MAP_TYPE.sigmaa, value, viewParams[NGL_PARAMS.isolevel_DENSITY_MAP_sigmaa], majorViewStage)
          );
        }
      } else {
        if (isoLevelAction && isoLevelAction.object_name === mapTypesStrings.EVENT) {
          dispatch(
            setIsoLevel(
              MAP_TYPE.event,
              NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.isolevel_DENSITY],
              viewParams[NGL_PARAMS.isolevel_DENSITY],
              majorViewStage
            )
          );
        } else if (isoLevelAction && isoLevelAction.object_name === mapTypesStrings.DIFF) {
          dispatch(
            setIsoLevel(
              MAP_TYPE.diff,
              NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.isolevel_DENSITY_MAP_diff],
              viewParams[NGL_PARAMS.isolevel_DENSITY_MAP_diff],
              majorViewStage
            )
          );
        } else if (isoLevelAction && isoLevelAction.object_name === mapTypesStrings.SIGMAA) {
          dispatch(
            setIsoLevel(
              MAP_TYPE.sigmaa,
              NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.isolevel_DENSITY_MAP_sigmaa],
              viewParams[NGL_PARAMS.isolevel_DENSITY_MAP_sigmaa],
              majorViewStage
            )
          );
        }
      }
    });

  let boxSizeActions = orderedActionList.filter(action => action.type.startsWith('BOX_SIZE'));
  boxSizeActions &&
    boxSizeActions.forEach(boxSizeAction => {
      if (boxSizeAction && boxSizeAction.newSetting !== undefined) {
        let value = boxSizeAction.newSetting;
        if (boxSizeAction.object_name === mapTypesStrings.EVENT) {
          dispatch(setBoxSize(MAP_TYPE.event, value, viewParams[NGL_PARAMS.boxSize_DENSITY], majorViewStage));
        } else if (boxSizeAction.object_name === mapTypesStrings.DIFF) {
          dispatch(setBoxSize(MAP_TYPE.diff, value, viewParams[NGL_PARAMS.boxSize_DENSITY_MAP_diff], majorViewStage));
        } else if (boxSizeAction.object_name === mapTypesStrings.SIGMAA) {
          dispatch(
            setBoxSize(MAP_TYPE.sigmaa, value, viewParams[NGL_PARAMS.boxSize_DENSITY_MAP_sigmaa], majorViewStage)
          );
        }
      } else {
        if (boxSizeAction && boxSizeAction.object_name === mapTypesStrings.EVENT) {
          dispatch(
            setBoxSize(
              MAP_TYPE.event,
              NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.boxSize_DENSITY],
              viewParams[NGL_PARAMS.boxSize_DENSITY],
              majorViewStage
            )
          );
        } else if (boxSizeAction && boxSizeAction.object_name === mapTypesStrings.DIFF) {
          dispatch(
            setBoxSize(
              MAP_TYPE.diff,
              NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.boxSize_DENSITY_MAP_diff],
              viewParams[NGL_PARAMS.boxSize_DENSITY_MAP_diff],
              majorViewStage
            )
          );
        } else if (boxSizeAction && boxSizeAction.object_name === mapTypesStrings.SIGMAA) {
          dispatch(
            setBoxSize(
              MAP_TYPE.sigmaa,
              NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.boxSize_DENSITY_MAP_sigmaa],
              viewParams[NGL_PARAMS.boxSize_DENSITY_MAP_sigmaa],
              majorViewStage
            )
          );
        }
      }
    });

  let opacityActions = orderedActionList.filter(action => action.type.startsWith('OPACITY'));
  opacityActions &&
    opacityActions.forEach(opacityAction => {
      if (opacityAction && opacityAction.newSetting !== undefined) {
        let value = opacityAction.newSetting;
        if (opacityAction.object_name === mapTypesStrings.EVENT) {
          dispatch(setOpacity(MAP_TYPE.event, value, viewParams[NGL_PARAMS.opacity_DENSITY], majorViewStage));
        } else if (opacityAction.object_name === mapTypesStrings.DIFF) {
          dispatch(setOpacity(MAP_TYPE.diff, value, viewParams[NGL_PARAMS.opacity_DENSITY_MAP_diff], majorViewStage));
        } else if (opacityAction.object_name === mapTypesStrings.SIGMAA) {
          dispatch(
            setOpacity(MAP_TYPE.sigmaa, value, viewParams[NGL_PARAMS.opacity_DENSITY_MAP_sigmaa], majorViewStage)
          );
        }
      } else {
        if (opacityAction && opacityAction.object_name === mapTypesStrings.EVENT) {
          dispatch(
            setOpacity(
              MAP_TYPE.event,
              NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.opacity_DENSITY],
              viewParams[NGL_PARAMS.opacity_DENSITY],
              majorViewStage
            )
          );
        } else if (opacityAction && opacityAction.object_name === mapTypesStrings.DIFF) {
          dispatch(
            setOpacity(
              MAP_TYPE.diff,
              NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.opacity_DENSITY_MAP_diff],
              viewParams[NGL_PARAMS.opacity_DENSITY_MAP_diff],
              majorViewStage
            )
          );
        } else if (opacityAction && opacityAction.object_name === mapTypesStrings.SIGMAA) {
          dispatch(
            setOpacity(
              MAP_TYPE.sigmaa,
              NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.opacity_DENSITY_MAP_sigmaa],
              viewParams[NGL_PARAMS.opacity_DENSITY_MAP_sigmaa],
              majorViewStage
            )
          );
        }
      }
    });

  let contourActions = orderedActionList.filter(action => action.type.startsWith('CONTOUR'));
  contourActions &&
    contourActions.forEach(contourAction => {
      if (contourAction && contourAction.newSetting !== undefined) {
        let value = contourAction.newSetting;
        if (contourAction.object_name === mapTypesStrings.EVENT) {
          dispatch(setContour(MAP_TYPE.event, value, viewParams[NGL_PARAMS.contour_DENSITY], majorViewStage));
        } else if (contourAction.object_name === mapTypesStrings.DIFF) {
          dispatch(setContour(MAP_TYPE.diff, value, viewParams[NGL_PARAMS.contour_DENSITY_MAP_diff], majorViewStage));
        } else if (contourAction.object_name === mapTypesStrings.SIGMAA) {
          dispatch(
            setContour(MAP_TYPE.sigmaa, value, viewParams[NGL_PARAMS.contour_DENSITY_MAP_sigmaa], majorViewStage)
          );
        }
      } else {
        if (contourAction && contourAction.object_name === mapTypesStrings.EVENT) {
          dispatch(
            setContour(
              MAP_TYPE.event,
              NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.contour_DENSITY],
              viewParams[NGL_PARAMS.contour_DENSITY],
              majorViewStage
            )
          );
        } else if (contourAction && contourAction.object_name === mapTypesStrings.DIFF) {
          dispatch(
            setContour(
              MAP_TYPE.diff,
              NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.contour_DENSITY_MAP_diff],
              viewParams[NGL_PARAMS.contour_DENSITY_MAP_sigmaa],
              majorViewStage
            )
          );
        } else if (contourAction && contourAction.object_name === mapTypesStrings.SIGMAA) {
          dispatch(
            setContour(
              MAP_TYPE.sigmaa,
              NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.contour_DENSITY_MAP_sigmaa],
              viewParams[NGL_PARAMS.contour_DENSITY_MAP_sigmaa],
              majorViewStage
            )
          );
        }
      }
    });

  let colorActions = orderedActionList.filter(action => action.type.startsWith('COLOR'));
  colorActions &&
    colorActions.forEach(colorAction => {
      if (colorAction && colorAction.newSetting !== undefined) {
        let value = colorAction.newSetting;
        if (colorAction.object_name === mapTypesStrings.EVENT) {
          dispatch(
            setElectronDesityMapColor(MAP_TYPE.event, value, viewParams[NGL_PARAMS.color_DENSITY], majorViewStage)
          );
        } else if (colorAction.object_name === mapTypesStrings.DIFF) {
          dispatch(
            setElectronDesityMapColor(
              MAP_TYPE.diff,
              value,
              viewParams[NGL_PARAMS.color_DENSITY_MAP_diff],
              majorViewStage
            )
          );
        } else if (colorAction.object_name === mapTypesStrings.SIGMAA) {
          dispatch(
            setElectronDesityMapColor(
              MAP_TYPE.sigmaa,
              value,
              viewParams[NGL_PARAMS.color_DENSITY_MAP_sigmaa],
              majorViewStage
            )
          );
        }
      } else {
        if (colorAction && colorAction.object_name === mapTypesStrings.EVENT) {
          dispatch(
            setElectronDesityMapColor(
              MAP_TYPE.event,
              NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.color_DENSITY],
              viewParams[NGL_PARAMS.color_DENSITY],
              majorViewStage
            )
          );
        } else if (colorAction && colorAction.object_name === mapTypesStrings.DIFF) {
          dispatch(
            setElectronDesityMapColor(
              MAP_TYPE.diff,
              NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.color_DENSITY_MAP_diff],
              viewParams[NGL_PARAMS.color_DENSITY_MAP_sigmaa],
              majorViewStage
            )
          );
        } else if (colorAction && colorAction.object_name === mapTypesStrings.SIGMAA) {
          dispatch(
            setElectronDesityMapColor(
              MAP_TYPE.sigmaa,
              NGL_VIEW_DEFAULT_VALUES[NGL_PARAMS.color_DENSITY_MAP_sigmaa],
              viewParams[NGL_PARAMS.color_DENSITY_MAP_sigmaa],
              majorViewStage
            )
          );
        }
      }
    });

  let warningIconAction = orderedActionList.find(action => action.type === actionType.WARNING_ICON);
  if (warningIconAction && warningIconAction.newSetting !== undefined) {
    let value = warningIconAction.newSetting;
    dispatch(setWarningIcon(value, viewParams[COMMON_PARAMS.warningIcon], true));
  } else {
    dispatch(
      setWarningIcon(NGL_VIEW_DEFAULT_VALUES[COMMON_PARAMS.warningIcon], viewParams[COMMON_PARAMS.warningIcon], true)
    );
  }
};

export const restoreNglStateAction = (orderedActionList, stages, animate = false) => async (dispatch, getState) => {
  const state = getState();
  const skipOrientation = state.trackingReducers.skipOrientationChange;

  if (!skipOrientation) {
    let actions = orderedActionList.filter(action => action.type === actionType.NGL_STATE);
    let action = [...actions].pop();
    if (action && action.nglStateList) {
      action.nglStateList.forEach(nglView => {
        dispatch(setOrientation(nglView.id, nglView.orientation));
        let viewStage = stages.find(s => s.id === nglView.id);
        if (viewStage) {
          console.count(`Before restoring orientation - restoreNglStateAction - tracking`);
          if (!animate) {
            viewStage.stage.viewerControls.orient(nglView.orientation.elements);
          } else {
            viewStage.stage.animationControls.orient(nglView.orientation.elements, 2000);
          }
          console.count(`After restoring orientation - restoreNglStateAction - tracking`);
        }
      });
    }
  }
};

export const restoreNglOrientationAnim = (orderedActionList, stages) => async (dispatch, getState) => {
  const state = getState();
  const skipOrientation = state.trackingReducers.skipOrientationChange;

  if (!skipOrientation) {
    let actions = orderedActionList.filter(action => action.type === actionType.NGL_STATE);
    let action = [...actions].pop();
    if (action && action.nglStateList) {
      const nglView = action.nglStateList[0];
      dispatch(setOrientation(nglView.id, nglView.orientation));
      let viewStage = stages.find(s => s.id === nglView.id);
      if (viewStage) {
        console.count(`Before restoring orientation - restoreNglStateAction - tracking`);

        console.count(`After restoring orientation - restoreNglStateAction - tracking`);
        return viewStage.stage.animationControls.orient(nglView.orientation.elements, 2000);
      }
    }
  }
};

const loadData = (orderedActionList, targetId, majorView) => async (dispatch, getState) => {
  await dispatch(loadAllMolecules(targetId));
  await dispatch(loadAllDatasets(orderedActionList, targetId, majorView.stage));
};

const loadAllDatasets = (orderedActionList, target_on, stage) => async (dispatch, getState) => {
  dispatch(setMoleculeListIsLoading(true));

  await dispatch(loadDataSets(target_on));
  await dispatch(loadDatasetCompoundsWithScores());
  dispatch(setMoleculeListIsLoading(false));

  dispatch(restoreCompoundsActions(orderedActionList, stage));
};

const loadAllMolecules = target_on => async (dispatch, getState) => {
  await dispatch(loadMoleculesAndTags(target_on));
};

export const restoreSitesActions = orderedActionList => (dispatch, getState) => {
  const state = getState();

  let sitesAction = orderedActionList.filter(action => action.type === actionType.SITE_TURNED_ON);
  if (sitesAction) {
    sitesAction.forEach(action => {
      //when restoring tags we need to actually use object_id and not object_name because it can be changed by the user in the UI pretty much anytime
      const tag = getTag(action.object_id, state);
      if (tag) {
        dispatch(addSelectedTag(tag));
      }
    });
  }
};

export const restoreTagActions = orderedActionList => (dispatch, getState) => {
  const state = getState();

  let tagActions = orderedActionList.filter(action => action.type === actionType.TAG_SELECTED);
  if (tagActions) {
    tagActions.forEach(action => {
      //when restoring tags we need to actually use object_id and not object_name because it can be changed by the user in the UI pretty much anytime
      const tag = getTag(action.object_id, state);
      if (tag) {
        dispatch(addSelectedTag(tag));
      }
    });
  }
};

export const restoreMoleculesActions = (orderedActionList, stage) => async (dispatch, getState) => {
  const state = getState();
  let moleculesAction = orderedActionList.filter(
    action => action.object_type === actionObjectType.MOLECULE || action.object_type === actionObjectType.INSPIRATION
  );

  if (moleculesAction) {
    await dispatch(addNewType(moleculesAction, actionType.LIGAND_TURNED_ON, 'ligand', stage, state));
    await dispatch(addNewType(moleculesAction, actionType.SIDECHAINS_TURNED_ON, 'protein', stage, state));
    await dispatch(addNewType(moleculesAction, actionType.INTERACTIONS_TURNED_ON, 'complex', stage, state));
    await dispatch(addNewType(moleculesAction, actionType.SURFACE_TURNED_ON, 'surface', stage, state));
    await dispatch(addNewType(moleculesAction, actionType.QUALITY_TURNED_OFF, 'quality', stage, state));
    await dispatch(addNewType(moleculesAction, actionType.VECTORS_TURNED_ON, 'vector', stage, state));
    await dispatch(addNewType(moleculesAction, actionType.DENSITY_TURNED_ON, 'density', stage, state));
    await dispatch(addNewType(moleculesAction, actionType.DENSITY_TYPE_ON, 'density', stage, state));
    await dispatch(addNewType(moleculesAction, actionType.DENSITY_CUSTOM_TURNED_ON, 'densityCustom', stage, state));
    await dispatch(restoreSelectAllMolecules(moleculesAction));
  }

  dispatch(restoreAllSelectionActions(orderedActionList, stage, true));
  dispatch(restoreAllSelectionByTypeActions(orderedActionList, stage, true));
  dispatch(setIsTrackingMoleculesRestoring(false));
};

export const restoreCartActions = (orderedActionList, majorViewStage) => async (dispatch, getState) => {
  let vectorAction = orderedActionList.find(action => action.type === actionType.VECTOR_SELECTED);
  if (vectorAction) {
    await dispatch(selectVectorAndResetCompounds(vectorAction.object_name));
  }

  let shoppingCartAllaction = orderedActionList.find(
    action => action.type === actionType.MOLECULE_ADDED_TO_SHOPPING_CART_ALL
  );

  let shoppingCartItems = [];

  if (shoppingCartAllaction) {
    let allItems = shoppingCartAllaction.items;
    if (allItems) {
      allItems.forEach(i => {
        shoppingCartItems.push(i);
      });
    }
  }

  let shoppingCartActions = orderedActionList.filter(
    action => action.type === actionType.MOLECULE_ADDED_TO_SHOPPING_CART
  );
  if (shoppingCartActions) {
    shoppingCartActions.forEach(action => {
      if (action.item) {
        shoppingCartItems.push(action.item);
      }
    });
  }

  shoppingCartItems.forEach(item => {
    let data = item;
    if (data) {
      dispatch(handleBuyList({ isSelected: true, data, skipTracking: true }));
    }
  });

  let classSelectedAction = orderedActionList.find(action => action.type === actionType.CLASS_SELECTED);
  if (classSelectedAction) {
    dispatch(setCurrentCompoundClass(classSelectedAction.value, classSelectedAction.oldValue));
  }

  let classUpdatedAction = orderedActionList.find(action => action.type === actionType.CLASS_UPDATED);
  if (classUpdatedAction) {
    let id = classUpdatedAction.object_id;
    let newValue = classUpdatedAction.newCompoundClasses;
    let oldValue = classUpdatedAction.oldCompoundClasses;
    let value = classUpdatedAction.object_name;
    value = value !== undefined ? value : '';
    dispatch(setCompoundClasses(newValue, oldValue, value, id));
  }

  let vectorCompoundActions = orderedActionList.filter(action => action.type === actionType.VECTOR_COUMPOUND_ADDED);
  if (vectorCompoundActions) {
    vectorCompoundActions.forEach(action => {
      let data = action.item;
      dispatch(handleShowVectorCompound({ isSelected: true, data, majorViewStage: majorViewStage }));
    });
  }
};

const restoreAllSelectionActions = (moleculesAction, stage, isSelection) => (dispatch, getState) => {
  let state = getState();

  let actions =
    isSelection === true
      ? moleculesAction.filter(
          action =>
            action.type === actionType.ALL_TURNED_ON &&
            (action.object_type === actionObjectType.INSPIRATION || action.object_type === actionObjectType.MOLECULE)
        )
      : moleculesAction.filter(
          action =>
            action.type === actionType.ALL_TURNED_ON &&
            (action.object_type === actionObjectType.CROSS_REFERENCE ||
              action.object_type === actionObjectType.COMPOUND)
        );

  if (actions) {
    actions.forEach(action => {
      if (action) {
        if (isSelection) {
          const mol = getMolecule(action.object_name, state);
          if (mol) {
            dispatch(setSelectedAll(mol, action.isLigand, action.isProtein, action.isComplex));
          }
        } else {
          const compound = getCompound(action, state);
          if (compound) {
            dispatch(
              setSelectedAllOfDataset(
                action.dataset_id,
                action.item,
                action.isLigand,
                action.isProtein,
                action.isComplex
              )
            );
          }
        }

        if (action.isLigand) {
          dispatch(handleMoleculeAction(action, 'ligand', true, stage, state, true));
        }

        if (action.isProtein) {
          dispatch(handleMoleculeAction(action, 'protein', true, stage, state, true));
        }

        if (action.isComplex) {
          dispatch(handleMoleculeAction(action, 'complex', true, stage, state, true));
        }
      }
    });
  }
};

const restoreSelectAllMolecules = moleculesAction => (dispatch, getState) => {
  let action = moleculesAction.find(ma => ma.type === actionType.ALL_MOLECULES_SELECTED);
  if (action && action.items) {
    const state = getState();
    const allMolecules = state.apiReducers.all_mol_lists;
    dispatch(setNextXMolecules(allMolecules.length));
    action.items.forEach(m => {
      dispatch(handleSelectMoleculeByName(m.protein_code, true));
    });
  }
};

const restoreAllSelectionByTypeActions = (moleculesAction, stage, isSelection) => (dispatch, getState) => {
  const state = getState();
  let actions =
    isSelection === true
      ? moleculesAction.filter(
          action =>
            action.type === actionType.SELECTED_TURNED_ON_BY_TYPE &&
            (action.object_type === actionObjectType.INSPIRATION || action.object_type === actionObjectType.MOLECULE)
        )
      : moleculesAction.filter(
          action =>
            action.type === actionType.SELECTED_TURNED_ON_BY_TYPE &&
            (action.object_type === actionObjectType.CROSS_REFERENCE ||
              action.object_type === actionObjectType.COMPOUND)
        );

  if (actions) {
    actions.forEach(action => {
      if (action) {
        // let actionItems = action.items;
        let actionItems = [];
        if (isSelection) {
          action.items.forEach(item => {
            const mol = getMolecule(item.protein_code, state);
            if (mol) {
              actionItems.push(mol);
            }
          });
        } else {
          action.items.forEach(item => {
            const mol = getCompoundByName(item.protein_code, action.dataset_id, state);
            if (mol) {
              actionItems.push(mol);
            }
          });
        }
        let type = action.control_type;

        if (isSelection) {
          dispatch(setSelectedAllByType(type, actionItems, action.object_type === actionObjectType.INSPIRATION));

          actionItems.forEach(data => {
            if (data) {
              if (type === 'ligand') {
                dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true, true, true));
              } else if (type === 'vector') {
                dispatch(addType[type](stage, data, true));
              } else if (type === 'density' || type === 'densityCustom') {
                dispatch(addType[type](stage, data, colourList[data.id % colourList.length], false, true));
              } else {
                dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true));
              }
            }
          });
        } else {
          dispatch(
            setSelectedAllByTypeOfDataset(
              type,
              action.dataset_id,
              actionItems,
              action.object_type === actionObjectType.CROSS_REFERENCE
            )
          );

          actionItems.forEach(data => {
            if (data && data.molecule) {
              dispatch(
                addTypeCompound[type](
                  stage,
                  data.molecule,
                  colourList[data.molecule.id % colourList.length],
                  data.datasetID,
                  true
                )
              );
            }
          });
        }
      }
    });
  }
};

export const restoreRepresentationActions = (moleculesAction, stages) => (dispatch, getState) => {
  const nglView = stages.find(view => view.id === VIEWS.MAJOR_VIEW);

  let representationsActions = moleculesAction.filter(action => action.type === actionType.REPRESENTATION_ADDED);
  if (representationsActions) {
    representationsActions.forEach(action => {
      //here the object id is actually protein_code_object_type and is identifier in NGL view so it's ok to use object_id in here
      dispatch(addRepresentation(action.object_id, action.representation, nglView));
    });
  }

  let representationsChangesActions = moleculesAction.filter(
    action => action.type === actionType.REPRESENTATION_UPDATED
  );
  if (representationsChangesActions) {
    representationsChangesActions.forEach(action => {
      //here the object id is actually protein_code_object_type and is identifier in NGL view so it's ok to use object_id in here
      dispatch(updateRepresentation(true, action.change, action.object_id, action.representation, nglView));
    });
  }
};

export const restoreTabActions = moleculesAction => (dispatch, getState) => {
  const state = getState();
  const customDatasets = state.datasetsReducers.datasets;
  let firstCustomDatasetTitle = (customDatasets && customDatasets[0] && customDatasets[0].title) || '';

  let action = moleculesAction.find(action => action.type === actionType.TAB);
  if (action) {
    //in here the object id is the tab index on the right hand side so it should be ok. BUT what if the given dataset
    //was deleted? Is it even possible?
    dispatch(setTabValue(action.oldObjectId, action.object_id, action.object_name, action.oldObjectName));
  }

  let indexAction = moleculesAction.find(action => action.type === actionType.DATASET_INDEX);
  if (indexAction) {
    dispatch(
      setSelectedDatasetIndex(
        indexAction.oldObjectId,
        indexAction.object_id,
        indexAction.object_name,
        indexAction.oldObjectName
      )
    );
  } else {
    if (action && action.object_id === 2 && action.object_name !== firstCustomDatasetTitle) {
      let dataset = customDatasets.find(d => d.title === action.object_name);
      var index = customDatasets.findIndex(d => d.title === action.object_name);

      if (dataset) {
        dispatch(setSelectedDatasetIndex(index, index, dataset.title, dataset.title, true));
      }
    }
  }

  const dragDropFinishedAction = moleculesAction.find(action => action.type === actionType.DRAG_DROP_FINISHED);
  if (dragDropFinishedAction) {
    const { datasetID, newDragDropState } = dragDropFinishedAction;
    dispatch(setDragDropState(datasetID, newDragDropState));
  }

  let filterAction = moleculesAction.find(action => action.type === actionType.DATASET_FILTER);
  if (filterAction) {
    let datasetID = filterAction.datasetID;
    let newFilterProperties = filterAction.newProperties;
    let newFilterSettings = filterAction.newSettings;
    dispatch(setDatasetFilter(datasetID, newFilterProperties, newFilterSettings, filterAction.key, null));
    dispatch(setFilterProperties(datasetID, newFilterProperties));
    dispatch(setFilterSettings(datasetID, newFilterSettings));
  }

  let filterScoreAction = moleculesAction.find(action => action.type === actionType.DATASET_FILTER_SCORE);
  if (filterScoreAction) {
    let datasetID = filterScoreAction.dataset_id;
    dispatch(
      updateFilterShowedScoreProperties({
        datasetID,
        scoreList: filterScoreAction.newScoreList
      })
    );

    dispatch(
      setFilterShowedScoreProperties({
        datasetID,
        scoreList: filterScoreAction.newScoreList,
        oldScoreList: filterScoreAction.oldScoreList,
        isChecked: filterScoreAction.isChecked,
        scoreName: filterScoreAction.object_name
      })
    );
  }
};

export const restoreViewerControlActions = moleculesAction => dispatch => {
  const turnSideActions = moleculesAction.filter(action => action.type === actionType.TURN_SIDE);
  turnSideActions.forEach(action => {
    const { side, open } = action;
    dispatch(turnSide(side, open, true));
  });
};

export const restoreSnapshotImageActions = projectID => async (dispatch, getState) => {
  const state = getState();
  const isProjectActionListLoaded = state.trackingReducers.isProjectActionListLoaded;
  if (!isProjectActionListLoaded) {
    let actionList = await dispatch(getTrackingActions(projectID));
    let snapshotActions = actionList.filter(action => action.type === actionType.SNAPSHOT);
    if (snapshotActions) {
      let actions = snapshotActions.map(s => {
        return { id: s.object_id, image: s.image, title: s.object_name, timestamp: s.timestamp };
      });
      const key = 'object_id';
      const arrayUniqueByKey = [...new Map(actions.map(item => [item[key], item])).values()];
      dispatch(setSnapshotImageActionList(arrayUniqueByKey));
    }
  }
};

const restoreProject = projectId => (dispatch, getState) => {
  if (projectId !== undefined) {
    return api({ url: `${base_url}/api/session-projects/${projectId}/` }).then(response => {
      let promises = [];
      promises.push(
        dispatch(
          setCurrentProject({
            projectID: response.data.id,
            authorID: response.data.author || null,
            title: response.data.title,
            description: response.data.description,
            targetID: response.data.target.id,
            tags: JSON.parse(response.data.tags)
          })
        )
      );
      promises.push(dispatch(setProject(response.data.project)));

      return Promise.all(promises);
    });
  }
};

export const restoreCompoundsActions = (orderedActionList, stage) => (dispatch, getState) => {
  const state = getState();

  let compoundsAction = orderedActionList.filter(
    action =>
      action.object_type === actionObjectType.COMPOUND || action.object_type === actionObjectType.CROSS_REFERENCE
  );

  if (compoundsAction) {
    dispatch(addNewTypeCompound(compoundsAction, actionType.LIGAND_TURNED_ON, 'ligand', stage, state));
    dispatch(addNewTypeCompound(compoundsAction, actionType.SIDECHAINS_TURNED_ON, 'protein', stage, state));
    dispatch(addNewTypeCompound(compoundsAction, actionType.INTERACTIONS_TURNED_ON, 'complex', stage, state));
    dispatch(addNewTypeCompound(compoundsAction, actionType.SURFACE_TURNED_ON, 'surface', stage, state));
  }

  let compoundsSelectedAction = compoundsAction.filter(action => action.type === actionType.COMPOUND_SELECTED);

  compoundsSelectedAction.forEach(action => {
    let data = getCompound(action, state);
    if (data) {
      dispatch(appendMoleculeToCompoundsOfDatasetToBuy(action.dataset_id, data.id, data.name));
    }
  });

  dispatch(restoreAllSelectionActions(orderedActionList, stage, false));
  dispatch(restoreAllSelectionByTypeActions(orderedActionList, stage, false));
  dispatch(setIsTrackingCompoundsRestoring(false));
};

const addType = {
  ligand: addLigand,
  protein: addHitProtein,
  complex: addComplex,
  surface: addSurface,
  quality: addQuality,
  vector: addVector,
  density: addDensity,
  densityCustom: addDensityCustomView
};

const addTypeCompound = {
  ligand: addDatasetLigand,
  protein: addDatasetHitProtein,
  complex: addDatasetComplex,
  surface: addDatasetSurface
};

const removeType = {
  ligand: removeLigand,
  protein: removeHitProtein,
  complex: removeComplex,
  surface: removeSurface,
  density: removeDensity,
  quality: removeQuality,
  vector: removeVector
};

const removeTypeCompound = {
  ligand: removeDatasetLigand,
  protein: removeDatasetHitProtein,
  complex: removeDatasetComplex,
  surface: removeDatasetSurface
};

const addNewType = (moleculesAction, actionType, type, stage, state, skipTracking = false) => async dispatch => {
  let actions = moleculesAction.filter(action => action.type === actionType);
  if (actions) {
    for (const action of actions) {
      let data = getMolecule(action.object_name, state);
      if (data) {
        if (type === 'ligand') {
          await dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true, true, skipTracking));
        } else if (type === 'protein') {
          await dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true, skipTracking));
        } else if (type === 'vector') {
          await dispatch(addType[type](stage, data, true));
        } else if (type === 'density' || type === 'densityCustom') {
          if (!data.proteinData) {
            await dispatch(getProteinData(data)).then(i => {
              if (i && i.length > 0) {
                const proteinData = i[0];
                data.proteinData = proteinData;
                data.proteinData.render_event = !!action.render_event;
                data.proteinData.render_diff = !!action.render_diff;
                data.proteinData.render_sigmaa = !!action.render_sigmaa;
                data.proteinData.render_quality = !!action.render_quality;
              }
            });
            await dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true, skipTracking));
          } else {
            data.proteinData.render_event = !!action.render_event;
            data.proteinData.render_diff = !!action.render_diff;
            data.proteinData.render_sigmaa = !!action.render_sigmaa;
            data.proteinData.render_quality = !!action.render_quality;
            await dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true, skipTracking));
          }
        } else if (type === 'quality') {
          await dispatch(removeType[type](stage, data, colourList[data.id % colourList.length], skipTracking));
        } else {
          await dispatch(addType[type](stage, data, colourList[data.id % colourList.length], skipTracking));
        }
      }
    }
  }
};

const addNewTypeOfAction = (action, type, stage, state, skipTracking = false) => dispatch => {
  if (action) {
    let data = getMolecule(action.object_name, state);
    if (data) {
      if (type === 'ligand') {
        dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true, true, skipTracking));
      } else if (type === 'vector') {
        dispatch(addType[type](stage, data, true));
      } else if (type === 'density' || type === 'densityCustom') {
        dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true, skipTracking));
      } else {
        dispatch(addType[type](stage, data, colourList[data.id % colourList.length], skipTracking));
      }
    }
  }
};

const addNewTypeCompound = (moleculesAction, actionType, type, stage, state, skipTracking = false) => dispatch => {
  let actions = moleculesAction.filter(action => action.type === actionType);
  if (actions) {
    actions.forEach(action => {
      let data = getCompound(action, state);
      if (data) {
        dispatch(
          addTypeCompound[type](stage, data, colourList[data.id % colourList.length], action.dataset_id, skipTracking)
        );
      }
    });
  }
};

const addNewTypeCompoundOfAction = (action, type, stage, state, skipTracking = false) => dispatch => {
  if (action) {
    let data = getCompound(action, state);
    if (data) {
      dispatch(
        addTypeCompound[type](stage, data, colourList[data.id % colourList.length], action.dataset_id, skipTracking)
      );
    }
  }
};

const getTarget = (targetName, state) => {
  let targetList = state.apiReducers.target_id_list;
  let target = targetList.find(target => target.title === targetName);
  return target;
};

const getTag = (tagId, state) => {
  const tagList = state.apiReducers.tagList;
  const tag = tagList.find(t => t.id === tagId);
  return tag;
};

export const getMolecule = (moleculeName, state) => {
  let moleculeList = state.apiReducers.all_mol_lists;
  let molecule = null;

  molecule = moleculeList.find(m => m.protein_code === moleculeName);

  return molecule;
};

export const getCompound = (action, state) => {
  let moleculeList = state.datasetsReducers.moleculeLists;
  let molecule = null;

  let name = action.object_name;
  let datasetID = action.dataset_id;

  if (moleculeList) {
    let moleculeListOfDataset = moleculeList[datasetID];
    if (moleculeListOfDataset) {
      molecule = moleculeListOfDataset.find(m => m.name === name);
    }
  }
  return molecule;
};

export const getCompoundByName = (name, datasetID, state) => {
  let moleculeList = state.datasetsReducers.moleculeLists;
  let molecule = null;

  if (moleculeList) {
    let moleculeListOfDataset = moleculeList[datasetID];
    if (moleculeListOfDataset) {
      molecule = moleculeListOfDataset.find(m => m.name === name);
    }
  }
  return molecule;
};

export const undoAction = (stages = []) => (dispatch, getState) => {
  dispatch(setIsUndoRedoAction(true));
  let action = dispatch(getUndoAction());
  if (action) {
    Promise.resolve(dispatch(handleUndoAction(action, stages))).then(() => {
      dispatch(setIsUndoRedoAction(false));
    });
  }
};

const getUndoAction = () => (dispatch, getState) => {
  const state = getState();
  const actionUndoList = state.undoableTrackingReducers.future;

  let action = { text: '' };
  let actions = actionUndoList && actionUndoList[0];
  if (actions) {
    let actionsLenght = actions.undo_redo_actions_list.length;
    actionsLenght = actionsLenght > 0 ? actionsLenght - 1 : actionsLenght;
    action = actions.undo_redo_actions_list[actionsLenght];
  }

  return action;
};

const getRedoAction = () => (dispatch, getState) => {
  const state = getState();
  const actions = state.undoableTrackingReducers.present;

  let action = { text: '' };
  if (actions) {
    let actionsLenght = actions.undo_redo_actions_list.length;
    actionsLenght = actionsLenght > 0 ? actionsLenght - 1 : actionsLenght;
    action = actions.undo_redo_actions_list[actionsLenght];
  }

  return action;
};

const getNextUndoAction = () => (dispatch, getState) => {
  const state = getState();
  const actionUndoList = state.undoableTrackingReducers.present;

  let action = { text: '' };
  let actions = actionUndoList && actionUndoList.undo_redo_actions_list;
  if (actions) {
    let actionsLenght = actions.length;
    actionsLenght = actionsLenght > 0 ? actionsLenght - 1 : actionsLenght;
    action = actions[actionsLenght];
  }

  return action;
};

const getNextRedoAction = () => (dispatch, getState) => {
  const state = getState();
  const actionUndoList = state.undoableTrackingReducers.future;

  let action = { text: '' };
  let actionss = actionUndoList && actionUndoList[0];

  let actions = actionss && actionss.undo_redo_actions_list;
  if (actions) {
    let actionsLenght = actions.length;
    actionsLenght = actionsLenght > 0 ? actionsLenght - 1 : actionsLenght;
    action = actions[actionsLenght];
  }

  return action;
};

export const redoAction = (stages = []) => (dispatch, getState) => {
  dispatch(setIsUndoRedoAction(true));
  let action = dispatch(getRedoAction());
  if (action) {
    Promise.resolve(dispatch(dispatch(handleRedoAction(action, stages)))).then(() => {
      dispatch(setIsUndoRedoAction(false));
    });
  }
};

const handleUndoAction = (action, stages) => (dispatch, getState) => {
  const state = getState();

  if (action) {
    const majorView = stages.find(view => view.id === VIEWS.MAJOR_VIEW);
    // const summaryView = stages.find(view => view.id === VIEWS.SUMMARY_VIEW);
    // const stageSummaryView = summaryView.stage;
    const majorViewStage = majorView.stage;

    const type = action.type;
    switch (type) {
      case actionType.ALL_HIDE:
        dispatch(handleAllHideAction(action, true, majorViewStage));
        break;
      case actionType.ALL_TURNED_ON:
        dispatch(handleAllAction(action, false, majorViewStage, state));
        break;
      case actionType.ALL_TURNED_OFF:
        dispatch(handleAllAction(action, true, majorViewStage, state));
        break;
      case actionType.SELECTED_TURNED_ON_BY_TYPE:
        dispatch(handleAllActionByType(action, false, majorViewStage));
        break;
      case actionType.ALL_TURNED_OFF_BY_TYPE:
        dispatch(handleAllActionByType(action, true, majorViewStage));
        break;
      case actionType.LIGAND_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'ligand', false, majorViewStage, state));
        break;
      case actionType.SIDECHAINS_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'protein', false, majorViewStage, state));
        break;
      case actionType.INTERACTIONS_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'complex', false, majorViewStage, state));
        break;
      case actionType.SURFACE_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'surface', false, majorViewStage, state));
        break;
      case actionType.QUALITY_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'quality', false, majorViewStage, state));
        break;
      case actionType.DENSITY_TURNED_ON:
        dispatch(handleDensityMoleculeAction(action, 'density', false, majorViewStage, state));
        break;
      case actionType.DENSITY_TYPE_ON:
        dispatch(handleDensityMoleculeAction(action, 'density', false, majorViewStage, state));
        break;
      case actionType.DENSITY_CUSTOM_TURNED_ON:
        dispatch(handleDensityMoleculeAction(action, 'densityCustom', false, majorViewStage, state));
        break;
      case actionType.VECTORS_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'vector', false, majorViewStage, state));
        break;
      case actionType.LIGAND_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'ligand', true, majorViewStage, state));
        break;
      case actionType.SIDECHAINS_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'protein', true, majorViewStage, state));
        break;
      case actionType.INTERACTIONS_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'complex', true, majorViewStage, state));
        break;
      case actionType.SURFACE_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'surface', true, majorViewStage, state));
        break;
      case actionType.QUALITY_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'quality', true, majorViewStage, state));
        break;
      case actionType.DENSITY_TURNED_OFF:
        dispatch(handleDensityMoleculeAction(action, 'density', true, majorViewStage, state));
        break;
      case actionType.DENSITY_TYPE_OFF:
        dispatch(handleDensityMoleculeAction(action, 'density', true, majorViewStage, state));
        break;
      case actionType.VECTORS_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'vector', true, majorViewStage, state));
        break;
      case actionType.ARROW_NAVIGATION:
        dispatch(handleArrowNavigationAction(action, false, majorViewStage));
        break;
      case actionType.VECTOR_SELECTED:
        dispatch(handleVectorAction(action, false));
        break;
      case actionType.VECTOR_DESELECTED:
        dispatch(handleVectorAction(action, true));
        break;
      case actionType.VECTOR_COUMPOUND_ADDED:
        dispatch(handleVectorCompoundAction(action, false, majorViewStage));
        break;
      case actionType.VECTOR_COUMPOUND_REMOVED:
        dispatch(handleVectorCompoundAction(action, true, majorViewStage));
        break;
      case actionType.CLASS_SELECTED:
        dispatch(handleClassSelectedAction(action, false));
        break;
      case actionType.CLASS_UPDATED:
        dispatch(handleClassUpdatedAction(action, false));
        break;
      case actionType.TARGET_LOADED:
        dispatch(handleTargetAction(action, false));
        break;
      case actionType.SITE_TURNED_ON:
        dispatch(handleMoleculeGroupAction(action, false));
        break;
      case actionType.SITE_TURNED_OFF:
        dispatch(handleMoleculeGroupAction(action, true));
        break;
      case actionType.TAG_SELECTED:
        dispatch(handleTagAction(action, false));
        break;
      case actionType.TAG_UNSELECTED:
        dispatch(handleTagAction(action, true));
        break;
      case actionType.MOLECULE_ADDED_TO_SHOPPING_CART:
        dispatch(handleShoppingCartAction(action, false));
        break;
      case actionType.MOLECULE_REMOVED_FROM_SHOPPING_CART:
        dispatch(handleShoppingCartAction(action, true));
        break;
      case actionType.MOLECULE_ADDED_TO_SHOPPING_CART_ALL:
        dispatch(handleShoppingCartAllAction(action, false, majorViewStage));
        break;
      case actionType.MOLECULE_REMOVED_FROM_SHOPPING_CART_ALL:
        dispatch(handleShoppingCartAllAction(action, true, majorViewStage));
        break;
      case actionType.COMPOUND_SELECTED:
        dispatch(handleCompoundAction(action, false));
        break;
      case actionType.COMPOUND_DESELECTED:
        dispatch(handleCompoundAction(action, true));
        break;
      case actionType.MOLECULE_SELECTED:
        dispatch(handleSelectMoleculeAction(action, false));
        break;
      case actionType.MOLECULE_UNSELECTED:
        dispatch(handleSelectMoleculeAction(action, true));
        break;
      case actionType.ALL_MOLECULES_SELECTED:
        dispatch(handleSelectAllMolecules(action, false));
        break;
      case actionType.ALL_MOLECULES_UNSELECTED:
        dispatch(handleSelectAllMolecules(action, true));
        break;
      case actionType.TAB:
        dispatch(handleTabAction(action, false));
        break;
      case actionType.DATASET_INDEX:
        dispatch(handleTabAction(action, false));
        break;
      case actionType.DATASET_FILTER:
        dispatch(handleFilterAction(action, false));
        break;
      case actionType.DATASET_FILTER_SCORE:
        dispatch(handleFilterScoreAction(action, false));
        break;
      case actionType.DRAG_DROP_FINISHED:
        dispatch(handleDragDropFinished(action, false));
        break;
      case actionType.REPRESENTATION_VISIBILITY_UPDATED:
        dispatch(handleUpdateRepresentationVisibilityAction(action, false, majorView));
        break;
      case actionType.REPRESENTATION_VISIBILITY_ALL_UPDATED:
        dispatch(handleUpdateRepresentationVisibilityAllAction(action, false, majorView));
        break;
      case actionType.REPRESENTATION_UPDATED:
        dispatch(handleUpdateRepresentationAction(action, false, majorView));
        break;
      case actionType.REPRESENTATION_ADDED:
        dispatch(handleRepresentationAction(action, false, majorView));
        break;
      case actionType.REPRESENTATION_REMOVED:
        dispatch(handleRepresentationAction(action, true, majorView));
        break;
      case actionType.REPRESENTATION_CHANGED:
        dispatch(handleChangeRepresentationAction(action, false, majorView));
        break;
      case actionType.BACKGROUND_COLOR_CHANGED:
        dispatch(setNglBckGrndColor(action.oldSetting, majorViewStage));
        break;
      case actionType.CLIP_NEAR:
        dispatch(setNglClipNear(action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.CLIP_FAR:
        dispatch(setNglClipFar(action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.CLIP_DIST:
        dispatch(setNglClipDist(action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.FOG_NEAR:
        dispatch(setNglFogNear(action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.FOG_FAR:
        dispatch(setNglFogFar(action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.ISO_LEVEL_EVENT:
        dispatch(setIsoLevel(MAP_TYPE.event, action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.BOX_SIZE_EVENT:
        dispatch(setBoxSize(MAP_TYPE.event, action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.OPACITY_EVENT:
        dispatch(setOpacity(MAP_TYPE.event, action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.CONTOUR_EVENT:
        dispatch(setContour(MAP_TYPE.event, action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.COLOR_EVENT:
        dispatch(setElectronDesityMapColor(MAP_TYPE.event, action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.ISO_LEVEL_SIGMAA:
        dispatch(setIsoLevel(MAP_TYPE.sigmaa, action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.BOX_SIZE_SIGMAA:
        dispatch(setBoxSize(MAP_TYPE.sigmaa, action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.OPACITY_SIGMAA:
        dispatch(setOpacity(MAP_TYPE.sigmaa, action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.CONTOUR_SIGMAA:
        dispatch(setContour(MAP_TYPE.sigmaa, action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.COLOR_SIGMAA:
        dispatch(setElectronDesityMapColor(MAP_TYPE.sigmaa, action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.ISO_LEVEL_DIFF:
        dispatch(setIsoLevel(MAP_TYPE.diff, action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.BOX_SIZE_DIFF:
        dispatch(setBoxSize(MAP_TYPE.diff, action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.OPACITY_DIFF:
        dispatch(setOpacity(MAP_TYPE.diff, action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.CONTOUR_DIFF:
        dispatch(setContour(MAP_TYPE.diff, action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.COLOR_DIFF:
        dispatch(setElectronDesityMapColor(MAP_TYPE.diff, action.oldSetting, action.newSetting, majorViewStage));
        break;
      case actionType.WARNING_ICON:
        dispatch(setWarningIcon(action.oldSetting, action.newSetting));
        break;
      case actionType.TURN_SIDE:
        dispatch(handleTurnSideAction(action, false));
        break;
      default:
        break;
    }
  }
};

const handleRedoAction = (action, stages) => (dispatch, getState) => {
  const state = getState();

  if (action) {
    const majorView = stages.find(view => view.id === VIEWS.MAJOR_VIEW);
    // const summaryView = stages.find(view => view.id === VIEWS.SUMMARY_VIEW);
    // const stageSummaryView = summaryView.stage;
    const majorViewStage = majorView.stage;

    const type = action.type;
    switch (type) {
      case actionType.ALL_HIDE:
        dispatch(handleAllHideAction(action, false, majorViewStage));
        break;
      case actionType.ALL_TURNED_ON:
        dispatch(handleAllAction(action, true, majorViewStage, state));
        break;
      case actionType.ALL_TURNED_OFF:
        dispatch(handleAllAction(action, false, majorViewStage, state));
        break;
      case actionType.SELECTED_TURNED_ON_BY_TYPE:
        dispatch(handleAllActionByType(action, true, majorViewStage));
        break;
      case actionType.ALL_TURNED_OFF_BY_TYPE:
        dispatch(handleAllActionByType(action, false, majorViewStage));
        break;
      case actionType.LIGAND_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'ligand', true, majorViewStage, state));
        break;
      case actionType.SIDECHAINS_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'protein', true, majorViewStage, state));
        break;
      case actionType.INTERACTIONS_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'complex', true, majorViewStage, state));
        break;
      case actionType.SURFACE_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'surface', true, majorViewStage, state));
        break;
      case actionType.QUALITY_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'quality', true, majorViewStage, state));
        break;
      case actionType.DENSITY_TURNED_ON:
        dispatch(handleDensityMoleculeAction(action, 'density', true, majorViewStage, state));
        break;
      case actionType.DENSITY_TYPE_ON:
        dispatch(handleDensityMoleculeAction(action, 'density', true, majorViewStage, state));
        break;
      case actionType.DENSITY_CUSTOM_TURNED_ON:
        dispatch(handleDensityMoleculeAction(action, 'densityCustom', true, majorViewStage, state));
        break;
      case actionType.VECTORS_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'vector', true, majorViewStage, state));
        break;
      case actionType.LIGAND_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'ligand', false, majorViewStage, state));
        break;
      case actionType.SIDECHAINS_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'protein', false, majorViewStage, state));
        break;
      case actionType.INTERACTIONS_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'complex', false, majorViewStage, state));
        break;
      case actionType.SURFACE_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'surface', false, majorViewStage, state));
        break;
      case actionType.QUALITY_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'quality', false, majorViewStage, state));
        break;
      case actionType.DENSITY_TURNED_OFF:
        dispatch(handleDensityMoleculeAction(action, 'density', false, majorViewStage, state));
        break;
      case actionType.DENSITY_TYPE_OFF:
        dispatch(handleDensityMoleculeAction(action, 'density', false, majorViewStage, state));
        break;
      case actionType.VECTORS_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'vector', false, majorViewStage, state));
        break;
      case actionType.ARROW_NAVIGATION:
        dispatch(handleArrowNavigationAction(action, true, majorViewStage));
        break;
      case actionType.VECTOR_SELECTED:
        dispatch(handleVectorAction(action, true));
        break;
      case actionType.VECTOR_DESELECTED:
        dispatch(handleVectorAction(action, false));
        break;
      case actionType.VECTOR_COUMPOUND_ADDED:
        dispatch(handleVectorCompoundAction(action, true, majorViewStage));
        break;
      case actionType.VECTOR_COUMPOUND_REMOVED:
        dispatch(handleVectorCompoundAction(action, false, majorViewStage));
        break;
      case actionType.CLASS_SELECTED:
        dispatch(handleClassSelectedAction(action, true));
        break;
      case actionType.CLASS_UPDATED:
        dispatch(handleClassUpdatedAction(action, true));
        break;
      case actionType.TARGET_LOADED:
        dispatch(handleTargetAction(action, true));
        break;
      case actionType.SITE_TURNED_ON:
        dispatch(handleMoleculeGroupAction(action, true));
        break;
      case actionType.SITE_TURNED_OFF:
        dispatch(handleMoleculeGroupAction(action, false));
        break;
      case actionType.TAG_SELECTED:
        dispatch(handleTagAction(action, true));
        break;
      case actionType.TAG_UNSELECTED:
        dispatch(handleTagAction(action, false));
        break;
      case actionType.MOLECULE_ADDED_TO_SHOPPING_CART:
        dispatch(handleShoppingCartAction(action, true));
        break;
      case actionType.MOLECULE_REMOVED_FROM_SHOPPING_CART:
        dispatch(handleShoppingCartAction(action, false));
        break;
      case actionType.MOLECULE_ADDED_TO_SHOPPING_CART_ALL:
        dispatch(handleShoppingCartAllAction(action, true, majorViewStage));
        break;
      case actionType.MOLECULE_REMOVED_FROM_SHOPPING_CART_ALL:
        dispatch(handleShoppingCartAllAction(action, false, majorViewStage));
        break;
      case actionType.COMPOUND_SELECTED:
        dispatch(handleCompoundAction(action, true));
        break;
      case actionType.COMPOUND_DESELECTED:
        dispatch(handleCompoundAction(action, false));
        break;
      case actionType.MOLECULE_SELECTED:
        dispatch(handleSelectMoleculeAction(action, true));
        break;
      case actionType.MOLECULE_UNSELECTED:
        dispatch(handleSelectMoleculeAction(action, false));
        break;
      case actionType.ALL_MOLECULES_SELECTED:
        dispatch(handleSelectAllMolecules(action, true));
        break;
      case actionType.ALL_MOLECULES_UNSELECTED:
        dispatch(handleSelectAllMolecules(action, false));
        break;
      case actionType.TAB:
        dispatch(handleTabAction(action, true));
        break;
      case actionType.DATASET_INDEX:
        dispatch(handleTabAction(action, true));
        break;
      case actionType.DATASET_FILTER:
        dispatch(handleFilterAction(action, true));
        break;
      case actionType.DATASET_FILTER_SCORE:
        dispatch(handleFilterScoreAction(action, true));
        break;
      case actionType.DRAG_DROP_FINISHED:
        dispatch(handleDragDropFinished(action, true));
        break;
      case actionType.REPRESENTATION_VISIBILITY_UPDATED:
        dispatch(handleUpdateRepresentationVisibilityAction(action, true, majorView));
        break;
      case actionType.REPRESENTATION_VISIBILITY_ALL_UPDATED:
        dispatch(handleUpdateRepresentationVisibilityAllAction(action, true, majorView));
        break;
      case actionType.REPRESENTATION_UPDATED:
        dispatch(handleUpdateRepresentationAction(action, true, majorView));
        break;
      case actionType.REPRESENTATION_ADDED:
        dispatch(handleRepresentationAction(action, true, majorView));
        break;
      case actionType.REPRESENTATION_REMOVED:
        dispatch(handleRepresentationAction(action, false, majorView));
        break;
      case actionType.REPRESENTATION_CHANGED:
        dispatch(handleChangeRepresentationAction(action, true, majorView));
        break;
      case actionType.BACKGROUND_COLOR_CHANGED:
        dispatch(setNglBckGrndColor(action.newSetting, majorViewStage));
        break;
      case actionType.CLIP_NEAR:
        dispatch(setNglClipNear(action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.CLIP_FAR:
        dispatch(setNglClipFar(action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.CLIP_DIST:
        dispatch(setNglClipDist(action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.FOG_NEAR:
        dispatch(setNglFogNear(action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.FOG_FAR:
        dispatch(setNglFogFar(action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.ISO_LEVEL_EVENT:
        dispatch(setIsoLevel(MAP_TYPE.event, action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.BOX_SIZE_EVENT:
        dispatch(setBoxSize(MAP_TYPE.event, action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.OPACITY_EVENT:
        dispatch(setOpacity(MAP_TYPE.event, action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.CONTOUR_EVENT:
        dispatch(setContour(MAP_TYPE.event, action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.COLOR_EVENT:
        dispatch(setElectronDesityMapColor(MAP_TYPE.event, action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.ISO_LEVEL_SIGMAA:
        dispatch(setIsoLevel(MAP_TYPE.sigmaa, action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.BOX_SIZE_SIGMAA:
        dispatch(setBoxSize(MAP_TYPE.sigmaa, action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.OPACITY_SIGMAA:
        dispatch(setOpacity(MAP_TYPE.sigmaa, action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.CONTOUR_SIGMAA:
        dispatch(setContour(MAP_TYPE.sigmaa, action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.COLOR_SIGMAA:
        dispatch(setElectronDesityMapColor(MAP_TYPE.sigmaa, action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.ISO_LEVEL_DIFF:
        dispatch(setIsoLevel(MAP_TYPE.diff, action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.BOX_SIZE_DIFF:
        dispatch(setBoxSize(MAP_TYPE.diff, action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.OPACITY_DIFF:
        dispatch(setOpacity(MAP_TYPE.diff, action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.CONTOUR_DIFF:
        dispatch(setContour(MAP_TYPE.diff, action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.COLOR_DIFF:
        dispatch(setElectronDesityMapColor(MAP_TYPE.diff, action.newSetting, action.oldSetting, majorViewStage));
        break;
      case actionType.WARNING_ICON:
        dispatch(setWarningIcon(action.newSetting, action.oldSetting));
        break;
      case actionType.TURN_SIDE:
        dispatch(handleTurnSideAction(action, true));
        break;
      default:
        break;
    }
  }
};

const handleAllActionByType = (action, isAdd, stage) => (dispatch, getState) => {
  let actionItems = action.items;
  let type = action.control_type;
  if (action.object_type === actionObjectType.MOLECULE || action.object_type === actionObjectType.INSPIRATION) {
    if (isAdd) {
      dispatch(setSelectedAllByType(type, actionItems, action.object_type === actionObjectType.INSPIRATION));

      actionItems.forEach(data => {
        if (data) {
          if (type === 'ligand') {
            dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true, true, true));
          } else if (type === 'vector') {
            dispatch(addType[type](stage, data, true));
          } else if (type === 'density' || type === 'densityCustom') {
            dispatch(addType[type](stage, data, colourList[data.id % colourList.length], false, true));
          } else {
            dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true));
          }
        }
      });
    } else {
      dispatch(setDeselectedAllByType(type, actionItems, action.object_type === actionObjectType.INSPIRATION));

      actionItems.forEach(data => {
        if (data) {
          if (type === 'ligand' || type === 'vector') {
            dispatch(removeType[type](stage, data, true));
          } else {
            dispatch(removeType[type](stage, data, colourList[data.id % colourList.length], true));
          }
        }
      });
    }
  } else if (
    action.object_type === actionObjectType.COMPOUND ||
    action.object_type === actionObjectType.CROSS_REFERENCE
  ) {
    if (isAdd) {
      dispatch(
        setSelectedAllByTypeOfDataset(
          type,
          action.dataset_id,
          actionItems,
          action.object_type === actionObjectType.CROSS_REFERENCE
        )
      );

      actionItems.forEach(data => {
        if (data && data.molecule) {
          dispatch(
            addTypeCompound[type](
              stage,
              data.molecule,
              colourList[data.molecule.id % colourList.length],
              data.datasetID,
              true
            )
          );
        }
      });
    } else {
      dispatch(
        setDeselectedAllByTypeOfDataset(
          type,
          action.dataset_id,
          actionItems,
          action.object_type === actionObjectType.CROSS_REFERENCE
        )
      );

      actionItems.forEach(data => {
        if (data && data.molecule) {
          dispatch(
            removeTypeCompound[type](
              stage,
              data.molecule,
              colourList[data.molecule.id % colourList.length],
              data.datasetID,
              true
            )
          );
        }
      });
    }
  }
};

const handleAllHideAction = (action, isAdd, stage) => (dispatch, getState) => {
  let data = action.data;
  let ligandDataList = data.ligandList;
  let proteinDataList = data.proteinList;
  let complexDataList = data.complexList;
  let surfaceDataList = data.surfaceList;
  let vectorOnDataList = data.vectorOnList;

  dispatch(setHideAll(data, !isAdd));

  if (isAdd) {
    ligandDataList.forEach(data => {
      if (data) {
        dispatch(addType['ligand'](stage, data, colourList[data.id % colourList.length], true, true, true));
      }
    });

    proteinDataList.forEach(data => {
      if (data) {
        dispatch(addType['protein'](stage, data, colourList[data.id % colourList.length], true));
      }
    });

    complexDataList.forEach(data => {
      if (data) {
        dispatch(addType['complex'](stage, data, colourList[data.id % colourList.length], true));
      }
    });

    surfaceDataList.forEach(data => {
      if (data) {
        dispatch(addType['surface'](stage, data, colourList[data.id % colourList.length], true));
      }
    });
    vectorOnDataList.forEach(data => {
      if (data) {
        dispatch(addType['vector'](stage, data, true));
      }
    });
  } else {
    ligandDataList.forEach(data => {
      if (data) {
        dispatch(removeType['ligand'](stage, data, true));
      }
    });

    proteinDataList.forEach(data => {
      if (data) {
        dispatch(removeType['protein'](stage, data, colourList[data.id % colourList.length], true));
      }
    });

    complexDataList.forEach(data => {
      if (data) {
        dispatch(removeType['complex'](stage, data, colourList[data.id % colourList.length], true));
      }
    });

    surfaceDataList.forEach(data => {
      if (data) {
        dispatch(removeType['surface'](stage, data, colourList[data.id % colourList.length], true));
      }
    });
    vectorOnDataList.forEach(data => {
      if (data) {
        dispatch(removeType['vector'](stage, data, true));
      }
    });
  }
};

const handleAllAction = (action, isSelected, majorViewStage, state) => (dispatch, getState) => {
  let isSelection =
    action.object_type === actionObjectType.MOLECULE || action.object_type === actionObjectType.INSPIRATION;

  if (isSelected) {
    if (isSelection) {
      dispatch(setSelectedAll(action.item, true, true, true));
    } else {
      dispatch(setSelectedAllOfDataset(action.dataset_id, action.item, true, true, true));
    }
  } else {
    if (isSelection) {
      dispatch(setDeselectedAll(action.item, action.isLigand, action.isProtein, action.isComplex));
    } else {
      dispatch(
        setDeselectedAllOfDataset(action.dataset_id, action.item, action.isLigand, action.isProtein, action.isComplex)
      );
    }
  }

  if (action.isLigand) {
    dispatch(handleMoleculeAction(action, 'ligand', isSelected, majorViewStage, state, true));
  }

  if (action.isProtein) {
    dispatch(handleMoleculeAction(action, 'protein', isSelected, majorViewStage, state, true));
  }

  if (action.isComplex) {
    dispatch(handleMoleculeAction(action, 'complex', isSelected, majorViewStage, state, true));
  }
};

const handleVectorAction = (action, isSelected) => (dispatch, getState) => {
  if (action) {
    if (isSelected === false) {
      dispatch(selectVectorAndResetCompounds(undefined));
    } else {
      dispatch(selectVectorAndResetCompounds(action.object_name));
    }
  }
};

const handleVectorCompoundAction = (action, isSelected, majorViewStage) => (dispatch, getState) => {
  if (action) {
    let data = action.item;
    dispatch(handleShowVectorCompound({ isSelected, data, majorViewStage: majorViewStage }));
  }
};

const handleClassSelectedAction = (action, isAdd) => (dispatch, getState) => {
  if (action) {
    let value = isAdd ? action.value : action.oldValue;
    let oldValue = isAdd ? action.oldValue : action.value;
    dispatch(setCurrentCompoundClass(value, oldValue));
  }
};

const handleClassUpdatedAction = (action, isAdd) => (dispatch, getState) => {
  if (action) {
    let id = action.object_id;
    let newValue = isAdd ? action.newCompoundClasses : action.oldCompoundClasses;
    let oldValue = isAdd ? action.oldCompoundClasses : action.newCompoundClasses;
    let value = isAdd ? action.object_name : action.oldCompoundClasses[id];
    value = value !== undefined ? value : '';
    dispatch(setCompoundClasses(newValue, oldValue, value, id));
  }
};

const handleTargetAction = (action, isSelected, stages) => (dispatch, getState) => {
  const state = getState();
  if (action) {
    if (isSelected === false) {
      dispatch(setTargetOn(undefined));
    } else {
      let target = getTarget(action.object_name, state);
      if (target) {
        dispatch(setTargetOn(target.id));
        dispatch(shouldLoadProtein({ nglViewList: stages, currentSnapshotID: null, isLoadingCurrentSnapshot: false }));
      }
    }
  }
};

const handleTabAction = (action, isSelected) => (dispatch, getState) => {
  if (action) {
    let newValue = isSelected === true ? action.object_id : action.oldObjectId;
    let oldValue = isSelected === true ? action.oldObjectId : action.object_id;
    let name = isSelected === true ? action.object_name : action.oldObjectName;
    let oldName = isSelected === true ? action.oldObjectName : action.object_name;

    if (action.type === actionType.DATASET_INDEX) {
      dispatch(setSelectedDatasetIndex(oldValue, newValue, name, oldName));
    } else {
      dispatch(setSortDialogOpen(false));
      dispatch(setTabValue(oldValue, newValue, name, oldName));
    }
  }
};

const handleFilterAction = (action, isSelected) => (dispatch, getState) => {
  if (action) {
    const {
      datasetID,
      key,
      newProperties,
      oldProperties,
      newSettings,
      oldSettings,
      oldDragDropState,
      newDragDropState
    } = action;
    const newFilterProperties = isSelected ? newProperties : oldProperties;
    const newFilterSettings = isSelected ? newSettings : oldSettings;
    const newFilterDragDropState = isSelected ? newDragDropState : oldDragDropState;
    dispatch(setDatasetFilter(datasetID, newFilterProperties, newFilterSettings, key, newFilterDragDropState));
    dispatch(setFilterProperties(datasetID, newFilterProperties));
    dispatch(setFilterSettings(datasetID, newFilterSettings));
    dispatch(setDragDropState(datasetID, newFilterDragDropState));
  }
};

const handleFilterScoreAction = (action, isSelected) => (dispatch, getState) => {
  if (action) {
    let datasetID = action.dataset_id;
    let isChecked = isSelected === true ? action.isChecked : !action.isChecked;
    let scoreName = action.object_name;
    dispatch(selectScoreProperty({ isChecked, datasetID, scoreName }));
  }
};

const handleDragDropFinished = (action, isSelected) => dispatch => {
  if (action) {
    const { oldDragDropState, newDragDropState, datasetID } = action;
    dispatch(setDragDropState(datasetID, isSelected ? newDragDropState : oldDragDropState));
  }
};

const handleCompoundAction = (action, isSelected) => (dispatch, getState) => {
  const state = getState();
  if (action) {
    let data = getCompound(action, state);
    if (data) {
      if (isSelected === true) {
        dispatch(appendMoleculeToCompoundsOfDatasetToBuy(action.dataset_id, data.id, data.name));
      } else {
        dispatch(removeMoleculeFromCompoundsOfDatasetToBuy(action.dataset_id, data.id, data.name));
      }
    }
  }
};

const handleSelectMoleculeAction = (action, isSelected) => (dispatch, getState) => {
  if (action) {
    dispatch(handleSelectMoleculeByName(action.object_name));
  }
};

const handleSelectMoleculeByName = (molName, isSelected) => (dispatch, getState) => {
  const state = getState();
  if (molName) {
    let mol = getMolecule(molName, state);
    if (mol) {
      if (isSelected) {
        dispatch(appendToMolListToEdit(mol.id));
      } else {
        dispatch(removeFromMolListToEdit(mol.id));
      }
    }
  }
};

const handleSelectAllMolecules = (action, isSelected) => (dispatch, getState) => {
  if (action && action.items) {
    dispatch(selectAllHits(action.items, setNextXMolecules, !isSelected));
  }
};

const handleShoppingCartAction = (action, isAdd) => (dispatch, getState) => {
  if (action) {
    let data = action.item;
    if (data) {
      dispatch(handleBuyList({ isSelected: isAdd, data, skipTracking: false }));
    }
  }
};

const handleShoppingCartAllAction = (action, isAdd, majorViewStage) => (dispatch, getState) => {
  if (action) {
    dispatch(handleBuyListAll({ isSelected: isAdd, items: action.items, majorViewStage: majorViewStage }));
  }
};

const handleRepresentationAction = (action, isAdd, nglView) => (dispatch, getState) => {
  if (action) {
    if (isAdd === true) {
      dispatch(addRepresentation(action, action.object_id, action.representation, nglView));
    } else {
      dispatch(removeRepresentation(action, action.object_id, action.representation, nglView));
    }
  }
};

const handleTurnSideAction = (action, restore) => dispatch => {
  if (action) {
    const { side, open } = action;
    dispatch(turnSide(side, restore ? open : !open, true));
  }
};

const addRepresentation = (action, parentKey, representation, nglView, update, skipTracking = false) => (
  dispatch,
  getState
) => {
  const oldRepresentation = representation;
  const newRepresentationType = oldRepresentation.type;
  const comp = nglView.stage.getComponentsByName(parentKey).first;
  const newRepresentation = assignRepresentationToComp(
    newRepresentationType,
    oldRepresentation.params,
    comp,
    oldRepresentation.lastKnownID
  );
  action.representation = newRepresentation;
  if (update === true) {
    action.newRepresentation = newRepresentation;
  } else {
    action.oldRepresentation = newRepresentation;
  }
  dispatch(addComponentRepresentation(parentKey, newRepresentation, skipTracking));
};

const removeRepresentation = (action, parentKey, representation, nglView, skipTracking = false) => (
  dispatch,
  getState
) => {
  const comp = nglView.stage.getComponentsByName(parentKey).first;
  let foundedRepresentation = undefined;
  comp.eachRepresentation(r => {
    if (
      r.uuid === representation.uuid ||
      r.uuid === representation.lastKnownID ||
      r.repr.type === representation.type
    ) {
      foundedRepresentation = r;
    }
  });

  if (foundedRepresentation) {
    comp.removeRepresentation(foundedRepresentation);

    if (comp.reprList.length === 0) {
      dispatch(deleteObject(nglView, nglView.stage, true));
    } else {
      hideShapeRepresentations(foundedRepresentation, nglView, parentKey);
      dispatch(removeComponentRepresentation(parentKey, foundedRepresentation, skipTracking));
    }
  } else {
    console.log(`Not found representation:`, representation);
  }
};

const handleUpdateRepresentationVisibilityAction = (action, isAdd, nglView) => (dispatch, getState) => {
  if (action) {
    let parentKey = action.object_id;
    let representation = action.representation;
    let representationElement = null;

    const comp = nglView.stage.getComponentsByName(parentKey).first;
    comp.eachRepresentation(r => {
      if (r.uuid === representation.uuid || r.uuid === representation.lastKnownID) {
        representationElement = r;
        const newVisibility = isAdd ? action.value : !action.value;
        // update in redux
        representation.params.visible = newVisibility;
        dispatch(updateComponentRepresentation(parentKey, representation.uuid, representation, '', true));
        dispatch(
          updateComponentRepresentationVisibility(parentKey, representation.uuid, representation, newVisibility)
        );
        // update in nglView
        r.setVisibility(newVisibility);
      }
    });

    hideShapeRepresentations(representationElement, nglView, parentKey);
  }
};

const handleUpdateRepresentationVisibilityAllAction = (action, isAdd, nglView) => (dispatch, getState) => {
  if (action) {
    const state = getState();
    let parentKey = action.object_id;
    let objectsInView = state.nglReducers.objectsInView;
    let newVisibility = isAdd ? action.value : !action.value;

    const representations = (objectsInView[parentKey] && objectsInView[parentKey].representations) || [];
    const comp = nglView.stage.getComponentsByName(parentKey).first;

    if (representations) {
      representations.forEach((representation, index) => {
        let representationElement = null;
        comp.eachRepresentation(r => {
          if (r.uuid === representation.uuid || r.uuid === representation.lastKnownID) {
            representationElement = r;
            representation.params.visible = newVisibility;
            // update in nglView
            r.setVisibility(newVisibility);
            // update in redux
            dispatch(updateComponentRepresentation(parentKey, representation.uuid, representation, '', true));
          }
        });
        hideShapeRepresentations(representationElement, nglView, parentKey);
      });

      dispatch(updateComponentRepresentationVisibilityAll(parentKey, newVisibility));
    }
  }
};

const handleUpdateRepresentationAction = (action, isAdd, nglView) => (dispatch, getState) => {
  if (action) {
    dispatch(updateRepresentation(isAdd, action.change, action.object_id, action.representation, nglView));
  }
};

const updateRepresentation = (isAdd, change, parentKey, representation, nglView) => (dispatch, getState) => {
  const comp = nglView.stage.getComponentsByName(parentKey).first;
  const r = comp.reprList.find(rep => rep.uuid === representation.uuid || rep.uuid === representation.lastKnownID);
  if (r && change) {
    let key = change.key;
    let value = isAdd ? change.value : change.oldValue;

    r.setParameters({ [key]: value });
    representation.params[key] = value;

    dispatch(updateComponentRepresentation(parentKey, representation.uuid, representation));
  }
};

const handleChangeRepresentationAction = (action, isAdd, nglView) => (dispatch, getState) => {
  if (action) {
    let representation = action.newRepresentation;
    let type = action.oldRepresentation.type;
    dispatch(changeMolecularRepresentation(action, representation, type, action.object_id, nglView));
  }
};

const changeMolecularRepresentation = (action, representation, type, parentKey, nglView) => (dispatch, getState) => {
  const newRepresentationType = type;

  const oldRepresentation = JSON.parse(JSON.stringify(representation));
  const comp = nglView.stage.getComponentsByName(parentKey).first;

  // add representation to NGL
  const newRepresentation = assignRepresentationToComp(
    newRepresentationType,
    oldRepresentation.params,
    comp,
    oldRepresentation.lastKnownID
  );

  action.newRepresentation = newRepresentation;
  action.oldRepresentation = representation;

  // add new representation to redux
  dispatch(addComponentRepresentation(parentKey, newRepresentation, true));

  // remove previous representation from NGL
  dispatch(removeRepresentation(action, parentKey, representation, nglView, true));

  dispatch(changeComponentRepresentation(parentKey, oldRepresentation, newRepresentation));
};

const handleArrowNavigationAction = (action, isSelected, majorViewStage) => (dispatch, getState) => {
  if (action) {
    let isSelection =
      action.object_type === actionObjectType.MOLECULE || action.object_type === actionObjectType.INSPIRATION;

    if (isSelection === true) {
      dispatch(handleArrowNavigationActionOfMolecule(action, isSelected, majorViewStage));
    } else {
      dispatch(handleArrowNavigationActionOfCompound(action, isSelected, majorViewStage));
    }
  }
};

const handleArrowNavigationActionOfMolecule = (action, isSelected, majorViewStage) => (dispatch, getState) => {
  const state = getState();
  if (action) {
    let molecules = state.apiReducers.all_mol_lists;
    let item = isSelected === true ? action.item : action.newItem;
    let newItem = isSelected === true ? action.newItem : action.item;
    let isInspiration = newItem && newItem.isInspiration;
    let data = action.data;

    dispatch(removeSelectedMolTypes(majorViewStage, molecules, true, isInspiration));
    dispatch(moveSelectedMolSettings(majorViewStage, item, newItem, data, true));
    dispatch(setArrowUpDown(item, newItem, action.arrowType, data));
  }
};

const handleArrowNavigationActionOfCompound = (action, isSelected, majorViewStage) => (dispatch, getState) => {
  const state = getState();
  if (action) {
    const molecules = state.apiReducers.all_mol_lists;
    const allInspirations = state.datasetsReducers.allInspirations;

    let data = action.data;
    let item = isSelected === true ? action.item : action.newItem;
    let newItem = isSelected === true ? action.newItem : action.item;
    let datasetID = action.datasetID;

    const proteinListMolecule = data.proteinList;
    const complexListMolecule = data.complexList;
    const fragmentDisplayListMolecule = data.fragmentDisplayList;
    const surfaceListMolecule = data.surfaceList;
    const densityListMolecule = data.densityList;
    const densityListCustomMolecule = data.densityListCustom;
    const vectorOnListMolecule = data.vectorOnList;
    const qualityListMolecule = data.qualityList;

    dispatch(hideAllSelectedMolecules(majorViewStage, molecules, false, true));
    dispatch(removeSelectedDatasetMolecules(majorViewStage, true));

    const newDatasetID = (newItem.hasOwnProperty('datasetID') && newItem.datasetID) || datasetID;
    const moleculeTitlePrev = newItem && newItem.name;

    const inspirations = getInspirationsForMol(allInspirations, datasetID, newItem.id);
    dispatch(setInspirationMoleculeDataList(inspirations));
    dispatch(moveSelectedMoleculeSettings(majorViewStage, item, newItem, newDatasetID, datasetID, data, true));

    if (isSelected === true) {
      dispatch(
        moveMoleculeInspirationsSettings(
          item,
          newItem,
          majorViewStage,
          data.objectsInView,
          fragmentDisplayListMolecule,
          proteinListMolecule,
          complexListMolecule,
          surfaceListMolecule,
          densityListMolecule,
          densityListCustomMolecule,
          vectorOnListMolecule,
          qualityListMolecule,
          true
        )
      );
    } else {
      dispatch(
        moveSelectedInspirations(
          majorViewStage,
          data.objectsInView,
          fragmentDisplayListMolecule,
          proteinListMolecule,
          complexListMolecule,
          surfaceListMolecule,
          densityListMolecule,
          densityListCustomMolecule,
          vectorOnListMolecule,
          qualityListMolecule,
          true
        )
      );
    }

    dispatch(setCrossReferenceCompoundName(moleculeTitlePrev));
    dispatch(setArrowUpDownOfDataset(datasetID, item, newItem, action.arrowType, data));
  }
};

const handleMoleculeGroupAction = (action, isSelected, stageSummaryView, majorViewStage) => (dispatch, getState) => {
  const state = getState();
  if (action) {
    const tag = getTag(action.object_id, state);
    if (tag) {
      if (isSelected === true) {
        dispatch(addSelectedTag(tag));
      } else {
        dispatch(removeSelectedTag(tag));
      }
    }
  }
};

const handleTagAction = (action, isSelected) => (dispatch, getState) => {
  const state = getState();
  if (action) {
    const tag = getTag(action.object_id, state);
    if (tag) {
      if (isSelected === true) {
        dispatch(addSelectedTag(tag));
      } else {
        dispatch(removeSelectedTag(tag));
      }
    }
  }
};

const handleDensityMoleculeAction = (action, type, isAdd, stage, state, skipTracking) => (dispatch, getState) => {
  if (action.object_type === actionObjectType.MOLECULE || action.object_type === actionObjectType.INSPIRATION) {
    if (isAdd) {
      dispatch(addNewTypeOfAction(action, type, stage, state, skipTracking));
    } else {
      if (type === 'densityCustom') {
        dispatch(removeNewType(action, 'density', stage, state, skipTracking));
        dispatch(addNewTypeOfAction(action, 'density', stage, state, skipTracking));
      } else {
        dispatch(removeNewType(action, type, stage, state, skipTracking));
      }
    }
  }
};

const handleMoleculeAction = (action, type, isAdd, stage, state, skipTracking) => (dispatch, getState) => {
  if (action.object_type === actionObjectType.MOLECULE || action.object_type === actionObjectType.INSPIRATION) {
    if (isAdd) {
      dispatch(addNewTypeOfAction(action, type, stage, state, skipTracking));
    } else {
      dispatch(removeNewType(action, type, stage, state, skipTracking));
    }
  } else if (
    action.object_type === actionObjectType.COMPOUND ||
    action.object_type === actionObjectType.CROSS_REFERENCE
  ) {
    if (isAdd) {
      dispatch(addNewTypeCompoundOfAction(action, type, stage, state, skipTracking));
    } else {
      dispatch(removeNewTypeCompound(action, type, stage, state, skipTracking));
    }
  }
};

const removeNewType = (action, type, stage, state, skipTracking) => dispatch => {
  if (action) {
    let data = getMolecule(action.object_name, state);
    if (data) {
      if (type === 'ligand' || type === 'vector') {
        dispatch(removeType[type](stage, data, skipTracking, false));
      } else {
        dispatch(removeType[type](stage, data, colourList[data.id % colourList.length], skipTracking));
      }
    }
  }
};

const removeNewTypeCompound = (action, type, stage, state, skipTracking) => dispatch => {
  if (action) {
    let data = getCompound(action, state);
    if (data) {
      dispatch(
        removeTypeCompound[type](stage, data, colourList[data.id % colourList.length], action.dataset_id, skipTracking)
      );
    }
  }
};

export const getCanUndo = () => (dispatch, getState) => {
  const state = getState();
  return state.undoableTrackingReducers.past.length > 0;
};

export const getCanRedo = () => (dispatch, getState) => {
  const state = getState();
  return state.undoableTrackingReducers.future.length > 0;
};

export const getUndoActionText = () => (dispatch, getState) => {
  let action = dispatch(getNextUndoAction());
  return action?.text ?? '';
};

export const getRedoActionText = () => (dispatch, getState) => {
  let action = dispatch(getNextRedoAction());
  return action?.text ?? '';
};

export const appendAndSendTrackingActions = trackAction => async (dispatch, getState) => {
  const state = getState();
  const isUndoRedoAction = state.trackingReducers.isUndoRedoAction;
  dispatch(setIsActionTracking(true));
  if (trackAction && trackAction !== null) {
    const actionList = state.trackingReducers.track_actions_list;
    const sendActionList = state.trackingReducers.send_actions_list;
    const mergedActionList = mergeActions(trackAction, [...actionList]);
    const mergedSendActionList = mergeActions(trackAction, [...sendActionList]);
    dispatch(setActionsList(mergedActionList.list));
    dispatch(setSendActionsList(mergedSendActionList.list));
    if (isUndoRedoAction === false) {
      const undoRedoActionList = state.trackingReducers.undo_redo_actions_list;
      const mergedUndoRedoActionList = mergeActions(trackAction, [...undoRedoActionList]);
      if (mergedActionList.merged) {
        dispatch(setUndoRedoActionList(mergedUndoRedoActionList.list));
        dispatch(UndoActionCreators.removeLastPast());
      } else {
        dispatch(setUndoRedoActionList(mergedUndoRedoActionList.list));
      }
    }
  }
  dispatch(setIsActionTracking(false));
  dispatch(checkSendTrackingActions());
};

export const mergeActions = (trackAction, list) => {
  let merged = false;
  if (needsToBeMerged(trackAction)) {
    let newList = [];
    if (list.length > 0) {
      const lastEntry = list[list.length - 1];
      if (isSameTypeOfAction(trackAction, lastEntry) && isActionWithinTimeLimit(lastEntry, trackAction)) {
        trackAction.oldSetting = lastEntry.oldSetting;
        trackAction.text = trackAction.getText();
        newList = [...list.slice(0, list.length - 1), trackAction];
        merged = true;
      } else {
        newList = [...list, trackAction];
      }
    } else {
      newList.push(trackAction);
    }
    return { merged: merged, list: newList };
  } else {
    return { merged: merged, list: [...list, trackAction] };
  }
  // return {merged: merged, list: [...list, trackAction]};
};

const needsToBeMerged = trackAction => {
  return trackAction.merge !== undefined ? trackAction.merge : false;
};

const isSameTypeOfAction = (firstAction, secondAction) => {
  return firstAction.type === secondAction.type;
};

const isActionWithinTimeLimit = (firstAction, secondAction) => {
  const diffInSeconds = Math.abs(firstAction.timestamp - secondAction.timestamp) / 1000;
  return diffInSeconds <= NUM_OF_SECONDS_TO_IGNORE_MERGE;
};

export const manageSendTrackingActions = (projectID, copy) => async (dispatch, getState) => {
  if (copy) {
    await dispatch(checkActionsProject(projectID));
  } else {
    await dispatch(checkSendTrackingActions(true));
  }
};

export const checkSendTrackingActions = (save = false) => async (dispatch, getState) => {
  const state = getState();
  const currentProject = state.projectReducers.currentProject;
  const sendActions = state.trackingReducers.send_actions_list;
  const length = sendActions.length;

  if (length >= CONSTANTS.COUNT_SEND_TRACK_ACTIONS || save) {
    await dispatch(sendTrackingActions(sendActions, currentProject, true));
  }
};

const sendTrackingActions = (sendActions, project, clear = false) => async (dispatch, getState) => {
  if (project) {
    const projectID = project && project.projectID;

    if (projectID && sendActions && sendActions.length > 0) {
      dispatch(setIsActionsSending(true));

      const dataToSend = {
        session_project: projectID,
        author: project.authorID,
        last_update_date: moment().format(),
        actions: JSON.stringify(sendActions)
      };
      return api({
        url: `${base_url}/api/session-actions/`,
        method: METHOD.POST,
        data: JSON.stringify(dataToSend)
      })
        .then(() => {
          if (clear === true) {
            dispatch(setSendActionsList([]));
          }
        })
        .catch(error => {
          throw new Error(error);
        })
        .finally(() => {
          dispatch(setIsActionsSending(false));
        });
    } else {
      return Promise.resolve();
    }
  } else {
    return Promise.resolve();
  }
};

export const setProjectTrackingActions = () => (dispatch, getState) => {
  const state = getState();
  const isProjectActionListLoaded = state.trackingReducers.isProjectActionListLoaded;
  if (!isProjectActionListLoaded) {
    const currentProject = state.projectReducers.currentProject;
    const projectID = currentProject && currentProject.projectID;
    dispatch(setProjectActionList([]));
    dispatch(getTrackingActions(projectID, true));
  }
};

const getTrackingActions = (projectID, withTreeSeparation) => (dispatch, getState) => {
  const state = getState();
  const currentProject = state.projectReducers.currentProject;
  const currentProjectID = currentProject && currentProject.projectID;
  const sendActions = state.trackingReducers.send_actions_list;

  if (projectID) {
    dispatch(setIsActionsLoading(true));
    return api({
      url: `${base_url}/api/session-actions/?session_project=${projectID}`
    })
      .then(response => {
        let results = response.data.results;
        let listToSet = [];
        results.forEach(r => {
          let resultActions = JSON.parse(r.actions);
          let actions = resultActions.map(obj => ({ ...obj, actionId: r.id }));
          listToSet.push(...actions);
        });

        if (withTreeSeparation === true) {
          listToSet = dispatch(separateTrackkingActionBySnapshotTree(listToSet));

          let actionsWithoutSnapshot = listToSet.filter(action => action.type !== actionType.SNAPSHOT);
          let snapshotActions = listToSet.filter(action => action.type === actionType.SNAPSHOT);
          if (snapshotActions) {
            const key = 'object_id';
            const arrayUniqueByKey = [...new Map(snapshotActions.map(item => [item[key], item])).values()];
            actionsWithoutSnapshot.push(...arrayUniqueByKey);
            listToSet = actionsWithoutSnapshot;
          }
        }

        let projectActions = currentProjectID && currentProjectID != null ? [...listToSet, ...sendActions] : listToSet;
        dispatch(setProjectActionList(projectActions));
        dispatch(setProjectActionListLoaded(true));
        return Promise.resolve(projectActions);
      })
      .catch(error => {
        throw new Error(error);
      })
      .finally(() => {
        dispatch(setIsActionsLoading(false));
      });
  } else {
    let projectActions = [...sendActions];
    dispatch(setProjectActionList(projectActions));
    return Promise.resolve(projectActions);
  }
};

const separateTrackkingActionBySnapshotTree = actionList => (dispatch, getState) => {
  const state = getState();
  const snapshotID = state.projectReducers.currentSnapshot && state.projectReducers.currentSnapshot.id;
  const currentSnapshotTree = state.projectReducers.currentSnapshotTree;
  const currentSnapshotList = state.projectReducers.currentSnapshotList;

  if (snapshotID && currentSnapshotTree != null) {
    let treeActionList = [];
    let snapshotIdList = [];
    snapshotIdList.push(currentSnapshotTree.id);

    if (currentSnapshotList != null) {
      for (const id in currentSnapshotList) {
        let snapshot = currentSnapshotList[id];
        let snapshotChildren = snapshot.children;

        if (
          (snapshotChildren && snapshotChildren !== null && snapshotChildren.includes(snapshotID)) ||
          snapshot.id === snapshotID
        ) {
          snapshotIdList.push(snapshot.id);
        }
      }
    }

    treeActionList = actionList.filter(
      a => snapshotIdList.includes(a.snapshotId) || a.snapshotId === null || a.snapshotId === undefined
    );
    return treeActionList;
  } else {
    return actionList;
  }
};

const checkActionsProject = projectID => async (dispatch, getState) => {
  const state = getState();
  const currentProject = state.projectReducers.currentProject;
  const currentProjectID = currentProject && currentProject.projectID;

  await dispatch(getTrackingActions(projectID));
  await dispatch(
    copyActionsToProject(currentProject, true, currentProjectID && currentProjectID != null ? true : false)
  );
};

const copyActionsToProject = (toProject, setActionList = true, clear = false) => async (dispatch, getState) => {
  const state = getState();
  const actionList = state.trackingReducers.project_actions_list;

  if (toProject) {
    let newActionsList = [];

    actionList.forEach(r => {
      newActionsList.push(Object.assign({ ...r }));
    });

    if (setActionList === true) {
      dispatch(setActionsList(newActionsList));
    }
    await dispatch(sendTrackingActions(newActionsList, toProject, clear));
  }
};

export const sendTrackingActionsByProjectId = (projectID, authorID) => async (dispatch, getState) => {
  const state = getState();
  const currentProject = state.projectReducers.currentProject;
  const currentProjectID = currentProject && currentProject.projectID;

  const project = { projectID, authorID };

  await dispatch(getTrackingActions(currentProjectID));
  await dispatch(copyActionsToProject(project, false, currentProjectID && currentProjectID != null ? true : false));
};

export const sendInitTrackingActionByProjectId = target_on => (dispatch, getState) => {
  const state = getState();
  const snapshotID = state.projectReducers.currentSnapshot && state.projectReducers.currentSnapshot.id;

  let trackAction = dispatch(createInitAction(target_on));
  if (trackAction && trackAction != null) {
    let actions = [];
    actions.push(trackAction);
    dispatch(appendToSendActionList(trackAction));
    dispatch(checkSendTrackingActions(true));
    dispatch(saveTrackingActions(actions, snapshotID));
  }
};

export const updateTrackingActions = action => (dispatch, getState) => {
  const state = getState();
  const project = state.projectReducers.currentProject;
  const projectActions = state.trackingReducers.project_actions_list;
  const projectID = project && project.projectID;
  let actionID = action && action.actionId;

  if (projectID && actionID && projectActions) {
    let actions = projectActions.filter(a => a.actionId === actionID);

    if (actions && actions.length > 0) {
      const dataToSend = {
        session_action_id: actionID,
        session_project: projectID,
        author: project.authorID,
        last_update_date: moment().format(),
        actions: JSON.stringify(actions)
      };
      return api({
        url: `${base_url}/api/session-actions/${actionID}/`,
        method: METHOD.PUT,
        data: JSON.stringify(dataToSend)
      })
        .then(() => {})
        .catch(error => {
          throw new Error(error);
        })
        .finally(() => {});
    } else {
      return Promise.resolve();
    }
  } else {
    return Promise.resolve();
  }
};

function groupArrayOfObjects(list, key) {
  return list.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

export const setAndUpdateTrackingActions = (actionList, projectID) => (dispatch, getState) => {
  if (projectID) {
    const groupBy = groupArrayOfObjects(actionList, 'actionId');

    for (const group in groupBy) {
      let actionID = group;
      let actions = groupBy[group];
      if (actionID && actions && actions.length > 0) {
        const dataToSend = {
          session_action_id: actionID,
          session_project: projectID,
          last_update_date: moment().format(),
          actions: JSON.stringify(actions)
        };
        return api({
          url: `${base_url}/api/session-actions/${actionID}/`,
          method: METHOD.PUT,
          data: JSON.stringify(dataToSend)
        })
          .then(() => {})
          .catch(error => {
            throw new Error(error);
          })
          .finally(() => {});
      } else {
        return Promise.resolve();
      }
    }
  } else {
    return Promise.resolve();
  }
};
