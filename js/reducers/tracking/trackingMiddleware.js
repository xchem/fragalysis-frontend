import { appendToActionList } from './actions';
import { constants, actionType, objectType } from './constants';
import { constants as apiConstants } from '../api/constants';
import { CONSTANTS as nglConstants } from '../ngl/constants';
import { constants as selectionConstants } from '../selection/constants';
import { constants as customDatasetConstants } from '../../components/datasets/redux/constants';

const trackingMiddleware = ({ dispatch, getState }) => next => action => {
  console.log(`Redux Log:`, action);

  const state = getState();
  if (!action.type.includes(constants.APPEND_ACTIONS_LIST)) {
    let truckAction = findTruckAction(action, state);
    if (truckAction != null) {
      dispatch(appendToActionList(truckAction));
    }
  }

  next(action);
};

const findTruckAction = (action, state) => {
  let truckAction = null;
  if (action.type.includes(apiConstants.SET_TARGET_ON)) {
    let targetList = state.apiReducers.target_id_list;
    let target = targetList.find(target => target.id === action.target_on);
    let target_on_name = (target && target.title) || '';

    truckAction = {
      type: actionType.TARGET_LOADED,
      timestamp: Date.now(),
      object_type: objectType.TARGET,
      object_name: target_on_name,
      object_id: action.target_on
    };
  } else if (action.type.includes(apiConstants.SET_MOL_GROUP_ON)) {
    let mol_group_list = state.apiReducers.mol_group_list;
    let mol_group = mol_group_list.find(group => group.id === action.mol_group_on);
    let mol_group_on_name = (mol_group && mol_group.description) || '';

    truckAction = {
      type: actionType.SITE_TURNED_ON,
      timestamp: Date.now(),
      object_type: objectType.SITE,
      object_name: mol_group_on_name,
      object_id: action.mol_group_on
    };
  } else if (action.type.includes(selectionConstants.SET_MOL_GROUP_SELECTION)) {
    truckAction = {
      type: actionType.SITE_TURNED_ON,
      timestamp: Date.now(),
      object_type: objectType.SITE
      //object_name: mol_group_on_name,
      //object_id: action.mol_group_on
    };
  } else if (action.type.includes(selectionConstants.SET_OBJECT_SELECTION)) {
    truckAction = {
      type: actionType.SITE_TURNED_ON,
      timestamp: Date.now(),
      object_type: objectType.SITE
      //object_name: mol_group_on_name,
      //object_id: action.mol_group_on
    };
  } else if (action.type.includes(selectionConstants.APPEND_FRAGMENT_DISPLAY_LIST)) {
    truckAction = {
      type: actionType.LIGAND_TURNED_ON,
      timestamp: Date.now(),
      object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_FRAGMENT_DISPLAY_LIST)) {
    truckAction = {
      type: actionType.LIGAND_TURNED_OFF,
      timestamp: Date.now(),
      object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(selectionConstants.APPEND_PROTEIN_LIST)) {
    truckAction = {
      type: actionType.SIDECHAINS_TURNED_ON,
      timestamp: Date.now(),
      object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_PROTEIN_LIST)) {
    truckAction = {
      type: actionType.SIDECHAINS_TURNED_OFF,
      timestamp: Date.now(),
      object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(selectionConstants.APPEND_COMPLEX_LIST)) {
    truckAction = {
      type: actionType.INTERACTIONS_TURNED_ON,
      timestamp: Date.now(),
      object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_COMPLEX_LIST)) {
    truckAction = {
      type: actionType.INTERACTIONS_TURNED_OFF,
      timestamp: Date.now(),
      object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(selectionConstants.APPEND_SURFACE_LIST)) {
    truckAction = {
      type: actionType.SURFACE_TURNED_ON,
      timestamp: Date.now(),
      object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_SURFACE_LIST)) {
    truckAction = {
      type: actionType.SURFACE_TURNED_OFF,
      timestamp: Date.now(),
      object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(selectionConstants.APPEND_VECTOR_ON_LIST)) {
    truckAction = {
      type: actionType.VECTORS_TURNED_ON,
      timestamp: Date.now(),
      object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_VECTOR_ON_LIST)) {
    truckAction = {
      type: actionType.VECTORS_TURNED_OFF,
      timestamp: Date.now(),
      object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(selectionConstants.APPEND_TO_BUY_LIST)) {
    truckAction = {
      type: actionType.MOLECULE_ADDED_TO_SHOPPING_CART,
      timestamp: Date.now(),
      object_type: objectType.MOLECULE,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_TO_BUY_LIST)) {
    truckAction = {
      type: actionType.MOLECULE_REMOVED_FROM_SHOPPING_CART,
      timestamp: Date.now(),
      object_type: objectType.MOLECULE,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(selectionConstants.SET_CURRENT_VECTOR)) {
    truckAction = {
      type: actionType.VECTOR_SELECTED,
      timestamp: Date.now(),
      object_type: objectType.MOLECULE,
      object_name: action.payload,
      object_id: action.payload
    };
  } else if (action.type.includes(customDatasetConstants.APPEND_MOLECULE_TO_COMPOUNDS_TO_BUY_OF_DATASET)) {
    truckAction = {
      type: actionType.COMPOUND_SELECTED,
      timestamp: Date.now(),
      object_type: objectType.COMPOUND,
      object_name: action.payload.moleculeTitle,
      object_id: action.payload.moleculeID,
      dataset_id: action.payload.datasetID
    };
  } else if (action.type.includes(customDatasetConstants.REMOVE_MOLECULE_FROM_COMPOUNDS_TO_BUY_OF_DATASET)) {
    truckAction = {
      type: actionType.COMPOUND_DESELECTED,
      timestamp: Date.now(),
      object_type: objectType.COMPOUND,
      object_name: action.payload.moleculeTitle,
      object_id: action.payload.moleculeID,
      dataset_id: action.payload.datasetID
    };
  } else if (action.type.includes(customDatasetConstants.APPEND_LIGAND_LIST)) {
    truckAction = {
      type: actionType.LIGAND_TURNED_ON,
      timestamp: Date.now(),
      object_type: action.item.isCrossReference === true ? objectType.CROSS_REFERENCE : objectType.COMPOUND,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(customDatasetConstants.REMOVE_FROM_LIGAND_LIST)) {
    truckAction = {
      type: actionType.LIGAND_TURNED_OFF,
      timestamp: Date.now(),
      object_type: objectType.COMPOUND,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(customDatasetConstants.APPEND_PROTEIN_LIST)) {
    truckAction = {
      type: actionType.SIDECHAINS_TURNED_ON,
      timestamp: Date.now(),
      object_type: action.item.isCrossReference === true ? objectType.CROSS_REFERENCE : objectType.COMPOUND,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(customDatasetConstants.REMOVE_FROM_PROTEIN_LIST)) {
    truckAction = {
      type: actionType.SIDECHAINS_TURNED_OFF,
      timestamp: Date.now(),
      object_type: action.item.isCrossReference === true ? objectType.CROSS_REFERENCE : objectType.COMPOUND,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(customDatasetConstants.APPEND_COMPLEX_LIST)) {
    truckAction = {
      type: actionType.INTERACTIONS_TURNED_ON,
      timestamp: Date.now(),
      object_type: action.item.isCrossReference === true ? objectType.CROSS_REFERENCE : objectType.COMPOUND,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(customDatasetConstants.REMOVE_FROM_COMPLEX_LIST)) {
    truckAction = {
      type: actionType.INTERACTIONS_TURNED_OFF,
      timestamp: Date.now(),
      object_type: action.item.isCrossReference === true ? objectType.CROSS_REFERENCE : objectType.COMPOUND,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(customDatasetConstants.APPEND_SURFACE_LIST)) {
    truckAction = {
      type: actionType.SURFACE_TURNED_ON,
      timestamp: Date.now(),
      object_type: action.item.isCrossReference === true ? objectType.CROSS_REFERENCE : objectType.COMPOUND,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(customDatasetConstants.REMOVE_FROM_SURFACE_LIST)) {
    truckAction = {
      type: actionType.SURFACE_TURNED_OFF,
      timestamp: Date.now(),
      object_type: action.item.isCrossReference === true ? objectType.CROSS_REFERENCE : objectType.COMPOUND,
      object_name: action.item.name,
      object_id: action.item.id
    };
  } else if (action.type.includes(nglConstants.UPDATE_COMPONENT_REPRESENTATION)) {
    truckAction = {
      type: actionType.REPRESENTATION_CHANGED,
      timestamp: Date.now()
      //object_type: objectType.MOLECULE,
      //object_name: mol_name,
      //object_id: action.item.id
    };
  } else if (action.type.includes(nglConstants.ADD_COMPONENT_REPRESENTATION)) {
    truckAction = {
      type: actionType.REPRESENTATION_CHANGED,
      timestamp: Date.now()
      //object_type: objectType.MOLECULE,
      //object_name: mol_name,
      //object_id: action.item.id
    };
  } else if (action.type.includes(nglConstants.REMOVE_COMPONENT_REPRESENTATION)) {
    truckAction = {
      type: actionType.REPRESENTATION_CHANGED,
      timestamp: Date.now()
      //object_type: objectType.MOLECULE,
      //object_name: mol_name,
      //object_id: action.item.id
    };
  }

  return truckAction;
};
export default trackingMiddleware;
