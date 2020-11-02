import { setCurrentActionsList } from './actions';
import { actionType } from './constants';

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
  const currentDatasets = state.datasetsReducers.datasets;

  const currentDatasetBuyList = state.datasetsReducers.compoundsToBuyDatasetMap;

  const orderedActionList = actionList.reverse((a, b) => a.timestamp - b.timestamp);
  const currentTargets = (currentTargetOn && [currentTargetOn]) || [];
  const currentVectorSmiles = (currentVector && [currentVector]) || [];

  let currentActions = [];

  getCurrentActionList(orderedActionList, actionType.TARGET_LOADED, currentTargets, currentActions);
  getCurrentActionList(orderedActionList, actionType.SITE_TURNED_ON, currentSites, currentActions);
  getCurrentActionList(orderedActionList, actionType.LIGAND_TURNED_ON, currentLigands, currentActions);
  getCurrentActionList(orderedActionList, actionType.SIDECHAINS_TURNED_ON, currentProteins, currentActions);
  getCurrentActionList(orderedActionList, actionType.INTERACTIONS_TURNED_ON, currentComplexes, currentActions);
  getCurrentActionList(orderedActionList, actionType.SURFACE_TURNED_ON, currentSurfaces, currentActions);
  getCurrentActionList(orderedActionList, actionType.VECTORS_TURNED_ON, currentVectors, currentActions);
  getCurrentActionList(orderedActionList, actionType.VECTOR_SELECTED, currentVectorSmiles, currentActions);

  getCurrentActionList(
    orderedActionList,
    actionType.MOLECULE_ADDED_TO_SHOPPING_CART,
    getCollectionOfShoppingCart(currentBuyList),
    currentActions
  );

  getCurrentActionList(
    orderedActionList,
    actionType.LIGAND_TURNED_ON,
    getCollectionOfDataset(currentDatasets, currentDatasetLigands),
    currentActions
  );
  getCurrentActionList(
    orderedActionList,
    actionType.SIDECHAINS_TURNED_ON,
    getCollectionOfDataset(currentDatasets, currentDatasetProteins),
    currentActions
  );
  getCurrentActionList(
    orderedActionList,
    actionType.INTERACTIONS_TURNED_ON,
    getCollectionOfDataset(currentDatasets, currentDatasetComplexes),

    currentActions
  );
  getCurrentActionList(
    orderedActionList,
    actionType.SURFACE_TURNED_ON,
    getCollectionOfDataset(currentDatasets, currentDatasetSurfaces),
    currentActions
  );

  getCurrentActionList(
    orderedActionList,
    actionType.COMPOUND_SELECTED,
    getCollectionOfDataset(currentDatasets, currentDatasetBuyList),
    currentActions
  );

  dispatch(setCurrentActionsList(currentActions));
};

const getCurrentActionList = (orderedActionList, actionType, collection, currentActions) => {
  let actionList = orderedActionList.filter(action => action.type === actionType);
  if (collection) {
    collection.forEach(data => {
      let action = actionList.find(action => action.object_id === data);

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

const getCollectionOfDataset = (currentDatasets, dataList) => {
  let list = [];
  if (currentDatasets && dataList) {
    currentDatasets.forEach(data => {
      let dataValues = dataList[data.id];
      if (dataValues) {
        list.push(...dataValues);
      }
    });
  }

  return list;
};

const getCollectionOfShoppingCart = dataList => {
  let list = [];
  if (dataList) {
    dataList.forEach(data => {
      let dataValue = data.vector;
      if (dataValue) {
        list.push(dataValue);
      }
    });
  }

  return list;
};
