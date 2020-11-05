import { setCurrentActionsList } from './actions';
import { actionType, actionObjectType } from './constants';
import { VIEWS } from '../../../js/constants/constants';
import { setCurrentVector } from '../selection/actions';
import { unmountPreviewComponent, shouldLoadProtein } from '../../components/preview/redux/dispatchActions';
import {
  selectMoleculeGroup,
  loadMoleculeGroupsOfTarget
} from '../../components/preview/moleculeGroups/redux/dispatchActions';
import { resetTargetState, setTargetOn } from '../api/actions';
import {
  addComplex,
  addLigand,
  addHitProtein,
  addSurface,
  addVector
} from '../../components/preview/molecule/redux/dispatchActions';
import { colourList } from '../../components/preview/molecule/moleculeView';
import {
  addDatasetComplex,
  addDatasetLigand,
  addDatasetHitProtein,
  addDatasetSurface,
  loadDataSets,
  loadDatasetCompoundsWithScores
} from '../../components/datasets/redux/dispatchActions';
import { appendMoleculeToCompoundsOfDatasetToBuy } from '../../components/datasets/redux/actions';
import { setAllMolLists } from '../api/actions';
import { getUrl, loadAllMolsFromMolGroup } from '../../../js/utils/genericList';
import * as listType from '../../constants/listTypes';

export const selectCurrentActionsList = () => (dispatch, getState) => {
  const state = getState();

  const actionList = state.trackingReducers.truck_actions_list;
  const currentTargetOn = state.apiReducers.target_on;
  const currentSites = state.selectionReducers.mol_group_selection;
  const currentLigands = state.selectionReducers.fragmentDisplayList;
  const currentProteins = state.selectionReducers.proteinList;
  const currentComplexes = state.selectionReducers.complexLists;
  const currentSurfaces = state.selectionReducers.surfaceList;
  const currentVectors = state.selectionReducers.vectorOnList;
  const currentBuyList = state.selectionReducers.to_buy_list;
  const currentVector = state.selectionReducers.currentVector;

  const currentDatasetLigands = state.datasetsReducers.ligandLists;
  const currentDatasetProteins = state.datasetsReducers.proteinList;
  const currentDatasetComplexes = state.datasetsReducers.complexLists;
  const currentDatasetSurfaces = state.datasetsReducers.surfaceLists;

  const currentDatasetBuyList = state.datasetsReducers.compoundsToBuyDatasetMap;
  const currentobjectsInView = state.nglReducers.objectsInView;

  const orderedActionList = actionList.reverse((a, b) => a.timestamp - b.timestamp);
  const currentTargets = (currentTargetOn && [currentTargetOn]) || [];
  const currentVectorSmiles = (currentVector && [currentVector]) || [];

  let currentActions = [];

  getCurrentActionList(orderedActionList, actionType.TARGET_LOADED, getCollection(currentTargets), currentActions);
  getCurrentActionList(orderedActionList, actionType.SITE_TURNED_ON, getCollection(currentSites), currentActions);
  getCurrentActionList(orderedActionList, actionType.LIGAND_TURNED_ON, getCollection(currentLigands), currentActions);
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
  getCurrentActionList(orderedActionList, actionType.SURFACE_TURNED_ON, getCollection(currentSurfaces), currentActions);
  getCurrentActionList(orderedActionList, actionType.VECTORS_TURNED_ON, getCollection(currentVectors), currentActions);
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
    actionType.REPRESENTATION_CHANGED,
    getCollectionOfDatasetOfRepresentation(currentobjectsInView),
    currentActions
  );

  dispatch(setCurrentActionsList(currentActions));
};

const getCurrentActionList = (orderedActionList, type, collection, currentActions) => {
  let actionList =
    type !== actionType.REPRESENTATION_CHANGED
      ? orderedActionList.filter(action => action.type === type)
      : orderedActionList.filter(
          action =>
            action.type === actionType.REPRESENTATION_ADDED ||
            action.type === actionType.REPRESENTATION_REMOVED ||
            action.type === actionType.REPRESENTATION_CHANGED
        );
  if (collection) {
    collection.forEach(data => {
      let action = actionList.find(action => action.object_id === data.id && action.dataset_id === data.datasetId);

      if (action) {
        currentActions.push(Object.assign(mapCurrentAction(action)));
      }
    });
  }
};

const mapCurrentAction = action => {
  return Object.assign({
    timestamp: action.timestamp,
    object_name: action.object_name,
    object_type: action.object_type,
    action_type: action.type
  });
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

export const restoreCurrentActionsList = (stages = []) => (dispatch, getState) => {
  dispatch(unmountPreviewComponent(stages));
  dispatch(resetTargetState());
  dispatch(restoreStateBySavedActionList(stages));
};

const restoreStateBySavedActionList = stages => (dispatch, getState) => {
  const state = getState();

  const currentActionList = state.trackingReducers.current_actions_list;
  const orderedActionList = currentActionList.sort((a, b) => a.timestamp - b.timestamp);

  dispatch(restoreTargetActions(orderedActionList, stages));
};

const restoreTargetActions = (orderedActionList, stages, state) => (dispatch, getState) => {
  const state = getState();

  const summaryView = stages.find(view => view.id === VIEWS.SUMMARY_VIEW);

  let targetAction = orderedActionList.find(action => action.action_type === actionType.TARGET_LOADED);
  if (targetAction) {
    let target = getTarget(targetAction.object_name, state);
    if (target) {
      dispatch(setTargetOn(target.id));
      dispatch(shouldLoadProtein({ nglViewList: stages, currentSnapshotID: null, isLoadingCurrentSnapshot: false }));

      dispatch(
        loadMoleculeGroupsOfTarget({
          summaryView: summaryView.stage,
          isStateLoaded: false,
          setOldUrl: url => {},
          target_on: target.id
        })
      )
        .catch(error => {
          throw error;
        })
        .finally(() => {
          const majorView = stages.find(view => view.id === VIEWS.MAJOR_VIEW);
          const stage = majorView.stage;

          dispatch(restoreSitesActions(orderedActionList, summaryView));
          dispatch(loadAllMolecules(orderedActionList, target.id, stage));
        });

      dispatch(loadAllDatasaets);
    }
  }
};

const loadAllDatasaets = (orderedActionList, target_on, stage) => (dispatch, getState) => {
  //dispatch(setMoleculeListIsLoading(true));
  dispatch(loadDataSets(target_on))
    .then(results => {
      //setSelectedDatasetIndex(0);

      return dispatch(loadDatasetCompoundsWithScores());
    })
    .catch(error => {
      throw new Error(error);
    })
    .finally(() => {
      //dispatch(setMoleculeListIsLoading(false));
      dispatch(restoreCompoundsActions(orderedActionList, stage));
    });
};

const loadAllMolecules = (orderedActionList, target_on, stage) => (dispatch, getState) => {
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
  Promise.all(promises)
    .then(results => {
      let listToSet = {};
      results.forEach(molResult => {
        listToSet[molResult.mol_group] = molResult.molecules;
      });
      dispatch(setAllMolLists(listToSet));
      dispatch(restoreMoleculesActions(orderedActionList, stage));
    })
    .catch(err => console.log(err));
};

const restoreSitesActions = (orderedActionList, summaryView) => (dispatch, getState) => {
  const state = getState();

  let sitesAction = orderedActionList.filter(action => action.action_type === actionType.SITE_TURNED_ON);
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
    dispatch(addNewType(moleculesAction, actionType.VECTOR_SELECTED, 'vector', stage, state));
  }

  let vectorAction = orderedActionList.find(action => action.action_type === actionType.VECTOR_SELECTED);
  if (vectorAction) {
    dispatch(setCurrentVector(vectorAction.object_name));
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

  let compoundsSelectedAction = compoundsAction.filter(
    action => action.action_type === actionObjectType.COMPOUND_SELECTED
  );

  compoundsSelectedAction.forEach(action => {
    let data = getCompound(action.object_name, state);
    if (data) {
      dispatch(appendMoleculeToCompoundsOfDatasetToBuy(data.datasetID, data.id, data.name));
    }
  });
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

const addNewType = (moleculesAction, actionType, type, stage, state) => dispatch => {
  let actions = moleculesAction.filter(action => action.action_type === actionType);
  if (actions) {
    actions.forEach(action => {
      let data = getMolecule(action.object_name, state);
      if (data) {
        dispatch(addType[type](stage, data, colourList[data.id % colourList.length]), true);
      }
    });
  }
};

const addNewTypeCompound = (moleculesAction, actionType, type, stage, state) => dispatch => {
  let actions = moleculesAction.filter(action => action.action_type === actionType);
  if (actions) {
    actions.forEach(action => {
      let data = getCompound(action.object_name, state);
      if (data) {
        dispatch(addTypeCompound[type](stage, data, colourList[data.id % colourList.length]), data.datasetID);
      }
    });
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

const getCompound = (name, state) => {
  let moleculeList = state.datasetsReducers.moleculeLists;
  let molecule = null;

  if (moleculeList) {
    for (const group in moleculeList) {
      let molecules = moleculeList[group];
      molecule = molecules.find(m => m.name === name);
      if (molecule && molecule != null) {
        break;
      }
    }
  }
  return molecule;
};
