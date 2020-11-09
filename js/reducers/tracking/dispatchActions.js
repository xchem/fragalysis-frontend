import { setCurrentActionsList } from './actions';
import { actionType } from './constants';
import { VIEWS } from '../../../js/constants/constants';

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
