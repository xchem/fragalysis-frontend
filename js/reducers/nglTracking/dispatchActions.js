import {
  setCurrentActionsList,
  setIsTrackingMoleculesRestoring,
  setIsTrackingCompoundsRestoring,
  setIsUndoRedoAction,
  nglClearHistory
} from './actions';
import { createInitAction } from './trackingActions';
import { actionType, actionObjectType, NUM_OF_SECONDS_TO_IGNORE_MERGE } from './constants';
import { VIEWS } from '../../../js/constants/constants';
import { setCurrentVector, appendToBuyList } from '../selection/actions';
import {
  resetReducersForRestoringActions,
  loadProteinOfRestoringActions
} from '../../components/preview/redux/dispatchActions';
import { setCurrentProject } from '../../components/projects/redux/actions';
import {
  selectMoleculeGroup,
  loadMoleculeGroupsOfTarget
} from '../../components/preview/moleculeGroups/redux/dispatchActions';
import { loadTargetList } from '../../components/target/redux/dispatchActions';
import { resetTargetState, setTargetOn } from '../api/actions';
import {
  addComplex,
  addLigand,
  addHitProtein,
  addSurface,
  addVector,
  removeComplex,
  removeLigand,
  removeHitProtein,
  removeSurface,
  removeVector
} from '../../components/preview/molecule/redux/dispatchActions';
import { colourList } from '../../components/preview/molecule/moleculeView';
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
  loadDatasetCompoundsWithScores
} from '../../components/datasets/redux/dispatchActions';
import {
  appendMoleculeToCompoundsOfDatasetToBuy,
  setMoleculeListIsLoading
} from '../../components/datasets/redux/actions';
import { setAllMolLists } from '../api/actions';
import { getUrl, loadAllMolsFromMolGroup } from '../../../js/utils/genericList';
import { addComponentRepresentation, updateComponentRepresentation } from '../../../js/reducers/ngl/actions';
import * as listType from '../../constants/listTypes';
import { assignRepresentationToComp } from '../../components/nglView/generatingObjects';
import { setOrientation, restoreNglOrientation } from '../../../js/reducers/ngl/dispatchActions';
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
import { setSelectedAll, setSelectedAllByType } from '../../../js/reducers/selection/actions';
import {
  setSelectedAll as setSelectedAllOfDataset,
  setSelectedAllByType as setSelectedAllByTypeOfDataset
} from '../../components/datasets/redux/actions';

export const addCurrentActionsListToSnapshot = (snapshot, project, nglViewList) => async dispatch => {
  let projectID = project && project.projectID;
  let actionList = await dispatch(getTrackingActions(projectID));

  await dispatch(setSnapshotToActions(actionList, snapshot, projectID, project, nglViewList, true));
};

export const saveCurrentActionsList = (snapshot, project, nglViewList, all = false) => async dispatch => {
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

  const currentTargetOn = state.apiReducers.target_on;
  const currentSites = state.selectionReducers.mol_group_selection;
  const currentLigands = state.selectionReducers.fragmentDisplayList;
  const currentProteins = state.selectionReducers.proteinList;
  const currentComplexes = state.selectionReducers.complexList;
  const currentSelectionAll = state.selectionReducers.moleculeAllSelection;

  const currentDatasetLigands = state.datasetsReducers.ligandLists;
  const currentDatasetProteins = state.datasetsReducers.proteinLists;
  const currentDatasetComplexes = state.datasetsReducers.complexLists;
  const currentDatasetSelectionAll = state.datasetsReducers.moleculeAllSelection;

  const currentTargets = (currentTargetOn && [currentTargetOn]) || [];

  let orderedActionList = actionList.reverse((a, b) => a.timestamp - b.timestamp);

  let currentActions = [];

  getCurrentActionList(orderedActionList, actionType.TARGET_LOADED, getCollection(currentTargets), currentActions);
  getCurrentActionList(orderedActionList, actionType.SITE_TURNED_ON, getCollection(currentSites), currentActions);
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
    actionType.ALL_TURNED_ON_BY_TYPE,
    'ligand',
    getCollection(currentLigands),
    currentActions
  );

  getCurrentActionListOfAllSelectionByType(
    orderedActionList,
    actionType.ALL_TURNED_ON_BY_TYPE,
    'protein',
    getCollection(currentProteins),
    currentActions
  );

  getCurrentActionListOfAllSelectionByType(
    orderedActionList,
    actionType.ALL_TURNED_ON_BY_TYPE,
    'complex',
    getCollection(currentComplexes),
    currentActions
  );

  getCurrentActionListOfAllSelectionByTypeOfDataset(
    orderedActionList,
    actionType.ALL_TURNED_ON_BY_TYPE,
    'ligand',
    getCollectionOfDataset(currentDatasetLigands),
    currentActions
  );

  getCurrentActionListOfAllSelectionByTypeOfDataset(
    orderedActionList,
    actionType.ALL_TURNED_ON_BY_TYPE,
    'protein',
    getCollectionOfDataset(currentDatasetProteins),
    currentActions
  );

  getCurrentActionListOfAllSelectionByTypeOfDataset(
    orderedActionList,
    actionType.ALL_TURNED_ON_BY_TYPE,
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

  getCurrentActionList(
    orderedActionList,
    actionType.SIDECHAINS_TURNED_ON,
    getCollection(currentProteins),
    currentActions
  );
  const snapshotID = snapshot && snapshot.id;
  if (snapshotID) {
    const currentTargetOn = state.apiReducers.target_on;
    const currentSites = state.selectionReducers.mol_group_selection;
    const currentLigands = state.selectionReducers.fragmentDisplayList;
    const currentProteins = state.selectionReducers.proteinList;
    const currentComplexes = state.selectionReducers.complexList;
    const currentSurfaces = state.selectionReducers.surfaceList;
    const currentVectors = state.selectionReducers.vectorOnList;
    const currentBuyList = state.selectionReducers.to_buy_list;
    const currentVector = state.selectionReducers.currentVector;
    const currentSelectionAll = state.selectionReducers.moleculeAllSelection;

    const currentDatasetLigands = state.datasetsReducers.ligandLists;
    const currentDatasetProteins = state.datasetsReducers.proteinLists;
    const currentDatasetComplexes = state.datasetsReducers.complexLists;
    const currentDatasetSurfaces = state.datasetsReducers.surfaceLists;
    const currentDatasetSelectionAll = state.datasetsReducers.moleculeAllSelection;

    const currentDatasetBuyList = state.datasetsReducers.compoundsToBuyDatasetMap;
    const currentobjectsInView = state.nglReducers.objectsInView;

    const currentTargets = (currentTargetOn && [currentTargetOn]) || [];
    const currentVectorSmiles = (currentVector && [currentVector]) || [];

    let orderedActionList = actionList.reverse((a, b) => a.timestamp - b.timestamp);

    let currentActions = [];

    getCurrentActionList(orderedActionList, actionType.TARGET_LOADED, getCollection(currentTargets), currentActions);
    getCurrentActionList(orderedActionList, actionType.SITE_TURNED_ON, getCollection(currentSites), currentActions);
    getCurrentActionList(orderedActionList, actionType.LIGAND_TURNED_ON, getCollection(currentLigands), currentActions);

    getCurrentActionList(
      orderedActionList,
      actionType.ALL_TURNED_ON,
      getCollection(currentSelectionAll),
      currentActions
    );
    getCurrentActionList(
      orderedActionList,
      actionType.ALL_TURNED_ON,
      getCollectionOfDataset(currentDatasetSelectionAll),
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
      actionType.MOLECULE_ADDED_TO_SHOPPING_CART,
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
  const trackingImageSource = state.nglTrackingReducers.trackingImageSource;

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

const setSnapshotToActions = (
  actionList,
  snapshot,
  projectID,
  project,
  nglViewList,
  addToSnapshot
) => async dispatch => {
  if (actionList && snapshot) {
    let actionsWithoutSnapshot = actionList.filter(a => a.snapshotId === null || a.snapshotId === undefined);
    let updatedActions = actionsWithoutSnapshot.map(obj => ({ ...obj, snapshotId: snapshot.id }));
    dispatch(setAndUpdateTrackingActions(updatedActions, projectID));

    if (addToSnapshot === true) {
      await dispatch(saveActionsList(project, snapshot, updatedActions, nglViewList));
    }
  }
};

const setSnapshotToAllActions = (actionList, snapshot, projectID) => async dispatch => {
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
      .then(() => {
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

const getCurrentActionList = (orderedActionList, type, collection, currentActions) => {
  let actionList = orderedActionList.filter(action => action.type === type);

  if (collection) {
    collection.forEach(data => {
      let action = actionList.find(action => action.object_id === data.id && action.dataset_id === data.datasetId);

      if (action) {
        currentActions.push(Object.assign({ ...action }));
      }
    });
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
        list.push({ id: value });
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

export const resetRestoringState = () => dispatch => {
  dispatch(setActionsList([]));
  dispatch(setProjectActionList([]));
  dispatch(setSendActionsList([]));

  dispatch(setTargetOn(undefined));
  dispatch(setIsActionsRestoring(false, false));
};

export const restoreCurrentActionsList = snapshotID => async dispatch => {
  dispatch(resetTrackingState());
  dispatch(setIsActionsRestoring(true, false));

  await dispatch(restoreTrackingActions(snapshotID));
  dispatch(setIsTrackingMoleculesRestoring(true));
  dispatch(setIsTrackingCompoundsRestoring(true));
  dispatch(resetTargetState());
  dispatch(resetReducersForRestoringActions());
  dispatch(restoreStateBySavedActionList());
};

const restoreTrackingActions = snapshotID => async dispatch => {
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

const restoreStateBySavedActionList = () => (dispatch, getState) => {
  const state = getState();

  const currentActionList = state.nglTrackingReducers.current_actions_list;
  const orderedActionList = currentActionList.sort((a, b) => a.timestamp - b.timestamp);

  let onCancel = () => {};
  dispatch(loadTargetList(onCancel))
    .then(() => dispatch(restoreTargetActions(orderedActionList)))
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

  const currentActionList = state.nglTrackingReducers.current_actions_list;
  const orderedActionList = currentActionList.sort((a, b) => a.timestamp - b.timestamp);
  const targetId = state.apiReducers.target_on;

  if (targetId && stages && stages.length > 0) {
    const majorView = stages.find(view => view.id === VIEWS.MAJOR_VIEW);
    const summaryView = stages.find(view => view.id === VIEWS.SUMMARY_VIEW);

    await dispatch(loadProteinOfRestoringActions({ nglViewList: stages }));

    await dispatch(
      loadMoleculeGroupsOfTarget({
        summaryView: summaryView.stage,
        isStateLoaded: false,
        setOldUrl: () => {},
        target_on: targetId
      })
    )
      .catch(error => {
        throw error;
      })
      .finally(() => {});

    await dispatch(restoreSitesActions(orderedActionList, summaryView));
    await dispatch(loadData(orderedActionList, targetId, majorView));
    await dispatch(restoreActions(orderedActionList, majorView.stage));
    await dispatch(restoreRepresentationActions(orderedActionList, stages));
    await dispatch(restoreProject(projectId));
    dispatch(restoreSnapshotImageActions(projectId));
    dispatch(restoreNglStateAction(orderedActionList, stages));
    dispatch(setIsActionsRestoring(false, true));
  }
};

const restoreNglStateAction = (orderedActionList, stages) => dispatch => {
  let actions = orderedActionList.filter(action => action.type === actionType.NGL_STATE);
  let action = [...actions].pop();
  if (action && action.nglStateList) {
    action.nglStateList.forEach(nglView => {
      dispatch(setOrientation(nglView.id, nglView.orientation));
      let viewStage = stages.find(s => s.id === nglView.id);
      if (viewStage) {
        viewStage.stage.viewerControls.orient(nglView.orientation.elements);
      }
    });
  }
};

const restoreActions = (orderedActionList, stage) => dispatch => {
  dispatch(restoreMoleculesActions(orderedActionList, stage));
};

const loadData = (orderedActionList, targetId, majorView) => async dispatch => {
  await dispatch(loadAllMolecules(orderedActionList, targetId, majorView.stage));
  await dispatch(loadAllDatasets(orderedActionList, targetId, majorView.stage));
};

const loadAllDatasets = (orderedActionList, target_on, stage) => async dispatch => {
  dispatch(setMoleculeListIsLoading(true));

  await dispatch(loadDataSets(target_on));
  await dispatch(loadDatasetCompoundsWithScores());
  dispatch(setMoleculeListIsLoading(false));

  dispatch(restoreCompoundsActions(orderedActionList, stage));
};

const loadAllMolecules = (orderedActionList, target_on) => async (dispatch, getState) => {
  const state = getState();
  const list_type = listType.MOLECULE;

  let molGroupList = state.apiReducers.mol_group_list;

  let promises = [];
  molGroupList.forEach(molGroup => {
    let id = molGroup.id;
    let url = getUrl({ list_type, target_on, mol_group_on: id });
    promises.push(
      loadAllMolsFromMolGroup({
        url,
        mol_group: id
      })
    );
  });
  try {
    const results = await Promise.all(promises);
    let listToSet = {};
    results.forEach(molResult => {
      listToSet[molResult.mol_group] = molResult.molecules;
    });
    dispatch(setAllMolLists(listToSet));
  } catch (error) {
    throw new Error(error);
  }
};

const restoreSitesActions = (orderedActionList, summaryView) => (dispatch, getState) => {
  const state = getState();

  let sitesAction = orderedActionList.filter(action => action.type === actionType.SITE_TURNED_ON);
  if (sitesAction) {
    sitesAction.forEach(action => {
      let molGroup = getMolGroup(action.object_name, state);
      if (molGroup) {
        dispatch(selectMoleculeGroup(molGroup, summaryView.stage));
      }
    });
  }
};

const restoreMoleculesActions = (orderedActionList, stage) => (dispatch, getState) => {
  const state = getState();
  let moleculesAction = orderedActionList.filter(
    action => action.object_type === actionObjectType.MOLECULE || action.object_type === actionObjectType.INSPIRATION
  );

  if (moleculesAction) {
    dispatch(addNewType(moleculesAction, actionType.LIGAND_TURNED_ON, 'ligand', stage, state));
    dispatch(addNewType(moleculesAction, actionType.SIDECHAINS_TURNED_ON, 'protein', stage, state));
    dispatch(addNewType(moleculesAction, actionType.INTERACTIONS_TURNED_ON, 'complex', stage, state));
    dispatch(addNewType(moleculesAction, actionType.SURFACE_TURNED_ON, 'surface', stage, state));
    dispatch(addNewType(moleculesAction, actionType.VECTORS_TURNED_ON, 'vector', stage, state));
  }

  let vectorAction = orderedActionList.find(action => action.type === actionType.VECTOR_SELECTED);
  if (vectorAction) {
    dispatch(setCurrentVector(vectorAction.object_name));
  }

  dispatch(restoreCartActions(moleculesAction));
  dispatch(restoreAllSelectionActions(orderedActionList, stage, true));
  dispatch(restoreAllSelectionByTypeActions(orderedActionList, stage, true));
  dispatch(setIsTrackingMoleculesRestoring(false));
};

const restoreCartActions = moleculesAction => dispatch => {
  let shoppingCartActions = moleculesAction.filter(
    action => action.type === actionType.MOLECULE_ADDED_TO_SHOPPING_CART
  );
  if (shoppingCartActions) {
    shoppingCartActions.forEach(action => {
      let data = action.item;
      if (data) {
        dispatch(appendToBuyList(data));
      }
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
          dispatch(setSelectedAll(action.item, action.isLigand, action.isProtein, action.isComplex));
        } else {
          dispatch(
            setSelectedAllOfDataset(action.dataset_id, action.item, action.isLigand, action.isProtein, action.isComplex)
          );
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

const restoreAllSelectionByTypeActions = (moleculesAction, stage, isSelection) => dispatch => {
  let actions =
    isSelection === true
      ? moleculesAction.filter(
          action =>
            action.type === actionType.ALL_TURNED_ON_BY_TYPE &&
            (action.object_type === actionObjectType.INSPIRATION || action.object_type === actionObjectType.MOLECULE)
        )
      : moleculesAction.filter(
          action =>
            action.type === actionType.ALL_TURNED_ON_BY_TYPE &&
            (action.object_type === actionObjectType.CROSS_REFERENCE ||
              action.object_type === actionObjectType.COMPOUND)
        );

  if (actions) {
    actions.forEach(action => {
      if (action) {
        let actionItems = action.items;
        let type = action.control_type;

        if (isSelection) {
          dispatch(setSelectedAllByType(type, actionItems, action.object_type === actionObjectType.INSPIRATION));

          actionItems.forEach(data => {
            if (data) {
              if (type === 'ligand') {
                dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true, true));
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

const restoreRepresentationActions = (moleculesAction, stages) => dispatch => {
  const nglView = stages.find(view => view.id === VIEWS.MAJOR_VIEW);

  let representationsActions = moleculesAction.filter(action => action.type === actionType.REPRESENTATION_ADDED);
  if (representationsActions) {
    representationsActions.forEach(action => {
      dispatch(addRepresentation(action.object_id, action.representation, nglView));
    });
  }

  let representationsChangesActions = moleculesAction.filter(
    action => action.type === actionType.REPRESENTATION_UPDATED
  );
  if (representationsChangesActions) {
    representationsChangesActions.forEach(action => {
      dispatch(updateRepresentation(true, action.change, action.object_id, action.representation, nglView));
    });
  }
};

const restoreSnapshotImageActions = projectID => async dispatch => {
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
};

const restoreProject = projectId => dispatch => {
  if (projectId !== undefined) {
    return api({ url: `${base_url}/api/session-projects/${projectId}/` }).then(response => {
      let promises = [];
      promises.push(
        dispatch(
          setCurrentProject({
            projectID: response.data.id,
            authorID: (response.data.author && response.data.author.id) || null,
            title: response.data.title,
            description: response.data.description,
            targetID: response.data.target.id,
            tags: JSON.parse(response.data.tags)
          })
        )
      );
      return Promise.all(promises);
    });
  }
};

const restoreCompoundsActions = (orderedActionList, stage) => (dispatch, getState) => {
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
  vector: addVector
};

const addTypeCompound = {
  ligand: addDatasetLigand,
  protein: addDatasetHitProtein,
  complex: addDatasetComplex,
  surface: addDatasetSurface
};

const addNewType = (moleculesAction, actionType, type, stage, state, skipTracking = false) => dispatch => {
  let actions = moleculesAction.filter(action => action.type === actionType);
  if (actions) {
    actions.forEach(action => {
      let data = getMolecule(action.object_name, state);
      if (data) {
        if (type === 'ligand') {
          dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true, skipTracking));
        } else {
          dispatch(addType[type](stage, data, colourList[data.id % colourList.length], skipTracking));
        }
      }
    });
  }
};

const addNewTypeOfAction = (action, type, stage, state, skipTracking = false) => dispatch => {
  if (action) {
    let data = getMolecule(action.object_name, state);
    if (data) {
      if (type === 'ligand') {
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

const getMolGroup = (molGroupName, state) => {
  let molGroupList = state.apiReducers.mol_group_list;
  let molGroup = molGroupList.find(group => group.description === molGroupName);
  return molGroup;
};

const getMolecule = (moleculeName, state) => {
  let moleculeList = state.apiReducers.all_mol_lists;
  let molecule = null;

  if (moleculeList) {
    for (const group in moleculeList) {
      let molecules = moleculeList[group];
      molecule = molecules.find(m => m.protein_code === moleculeName);
      if (molecule && molecule != null) {
        break;
      }
    }
  }
  return molecule;
};

const getCompound = (action, state) => {
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

export const undoAction = (stages = []) => dispatch => {
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
  const actionUndoList = state.undoableNglTrackingReducers.future;

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
  const actions = state.undoableNglTrackingReducers.present;

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
  const actionUndoList = state.undoableNglTrackingReducers.present;

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
  const actionUndoList = state.undoableNglTrackingReducers.future;

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

export const redoAction = (stages = []) => dispatch => {
  dispatch(setIsUndoRedoAction(true));
  let action = dispatch(getRedoAction());
  if (action) {
    Promise.resolve(dispatch(dispatch(handleRedoAction(action, stages)))).then(() => {
      dispatch(setIsUndoRedoAction(false));
    });
  }
};

const handleUndoAction = (action, stages) => (dispatch, getState) => {
  if (action) {
    const type = action.type;
    switch (type) {
      case actionType.ORIENTATION:
        dispatch(restoreNglOrientation(action.oldSetting, action.newSetting, action.div_id, stages));
        break;
      default:
        break;
    }
  }
};

const handleRedoAction = (action, stages) => (dispatch, getState) => {
  if (action) {
    const type = action.type;
    switch (type) {
      case actionType.ORIENTATION:
        dispatch(restoreNglOrientation(action.newSetting, action.oldSetting, action.div_id, stages));
        break;
      default:
        break;
    }
  }
};

const addRepresentation = (action, parentKey, representation, nglView, update, skipTracking = false) => dispatch => {
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

const updateRepresentation = (isAdd, change, parentKey, representation, nglView) => dispatch => {
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

const handleMoleculeAction = (action, type, isAdd, stage, state, skipTracking) => dispatch => {
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

const removeType = {
  ligand: removeLigand,
  protein: removeHitProtein,
  complex: removeComplex,
  surface: removeSurface,
  vector: removeVector
};

const removeTypeCompound = {
  ligand: removeDatasetLigand,
  protein: removeDatasetHitProtein,
  complex: removeDatasetComplex,
  surface: removeDatasetSurface
};

const removeNewType = (action, type, stage, state, skipTracking) => dispatch => {
  if (action) {
    let data = getMolecule(action.object_name, state);
    if (data) {
      if (type === 'ligand') {
        dispatch(removeType[type](stage, data, skipTracking));
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

export const getUndoActionText = () => dispatch => {
  let action = dispatch(getNextUndoAction());
  return action?.text ?? '';
};

export const getRedoActionText = () => dispatch => {
  let action = dispatch(getNextRedoAction());
  return action?.text ?? '';
};

export const appendAndSendTrackingActions = trackAction => (dispatch, getState) => {
  const state = getState();
  const isUndoRedoAction = state.nglTrackingReducers.isUndoRedoAction;
  dispatch(setIsActionTracking(true));

  if (trackAction && trackAction !== null) {
    const actionList = state.nglTrackingReducers.track_actions_list;
    const sendActionList = state.nglTrackingReducers.send_actions_list;
    const mergedActionList = mergeActions(trackAction, [...actionList]);
    const mergedSendActionList = mergeActions(trackAction, [...sendActionList]);
    dispatch(setActionsList(mergedActionList));
    dispatch(setSendActionsList(mergedSendActionList));

    if (isUndoRedoAction === false) {
      const undoRedoActionList = state.nglTrackingReducers.undo_redo_actions_list;
      const mergedUndoRedoActionList = mergeActions(trackAction, [...undoRedoActionList]);
      dispatch(setUndoRedoActionList(mergedUndoRedoActionList));
    }
  }
  dispatch(setIsActionTracking(false));
  dispatch(checkSendTrackingActions());
};

export const mergeActions = (trackAction, list) => {
  return [...list, trackAction];
};

export const manageSendTrackingActions = (projectID, copy) => dispatch => {
  if (copy) {
    dispatch(checkActionsProject(projectID));
  } else {
    dispatch(checkSendTrackingActions(true));
  }
};

export const checkSendTrackingActions = (save = false) => (dispatch, getState) => {
  const state = getState();
  const currentProject = state.projectReducers.currentProject;
  const sendActions = state.nglTrackingReducers.send_actions_list;
  const length = sendActions.length;

  if (length >= CONSTANTS.COUNT_SEND_TRACK_ACTIONS || save) {
    dispatch(sendTrackingActions(sendActions, currentProject));
  }
};

const sendTrackingActions = (sendActions, project, clear = true) => async dispatch => {
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
  const currentProject = state.projectReducers.currentProject;
  const projectID = currentProject && currentProject.projectID;
  dispatch(setProjectActionList([]));
  dispatch(getTrackingActions(projectID, true));
};

const getTrackingActions = (projectID, withTreeSeparation) => (dispatch, getState) => {
  const state = getState();
  const sendActions = state.nglTrackingReducers.send_actions_list;

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

        let projectActions = [...listToSet, ...sendActions];
        dispatch(setProjectActionList(projectActions));
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

const copyActionsToProject = (toProject, setActionList = true, clearSendList = true) => async (dispatch, getState) => {
  const state = getState();
  const actionList = state.nglTrackingReducers.project_actions_list;

  if (toProject) {
    let newActionsList = [];

    actionList.forEach(r => {
      newActionsList.push(Object.assign({ ...r }));
    });

    if (setActionList === true) {
      dispatch(setActionsList(newActionsList));
    }
    await dispatch(sendTrackingActions(newActionsList, toProject, clearSendList));
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
  const projectActions = state.nglTrackingReducers.project_actions_list;
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

export const setAndUpdateTrackingActions = (actionList, projectID) => () => {
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

export const resetNglTrackingState = () => (dispatch, getState) => {
  dispatch(resetTrackingState());
  dispatch(nglClearHistory());
};
