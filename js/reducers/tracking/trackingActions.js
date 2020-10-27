import { actionType, objectType } from './constants';
import { constants as apiConstants } from '../api/constants';
import { CONSTANTS as nglConstants } from '../ngl/constants';
import { constants as selectionConstants } from '../selection/constants';
import { constants as customDatasetConstants } from '../../components/datasets/redux/constants';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';

export const findTruckAction = (action, state) => {
  const username = DJANGO_CONTEXT['username'];
  let truckAction = null;
  if (action.type.includes(apiConstants.SET_TARGET_ON)) {
    if (action.target_on) {
      let targetName = getTargetName(action.target_on, state);
      truckAction = {
        type: actionType.TARGET_LOADED,
        timestamp: Date.now(),
        username: username,
        object_type: objectType.TARGET,
        object_name: targetName,
        object_id: action.target_on
      };
    }
  } else if (action.type.includes(apiConstants.SET_MOL_GROUP_ON)) {
    if (action.mol_group_on) {
      let molGroupSelection = state.selectionReducers.mol_group_selection;
      let currentMolGroup = molGroupSelection && molGroupSelection.find(o => o === action.mol_group_on);
      if (!currentMolGroup) {
        let molGroupName = getMolGroupName(action.mol_group_on, state);
        truckAction = {
          type: actionType.SITE_TURNED_ON,
          timestamp: Date.now(),
          username: username,
          object_type: objectType.SITE,
          object_name: molGroupName,
          object_id: action.mol_group_on
        };
      }
    }
  } else if (action.type.includes(selectionConstants.SET_OBJECT_SELECTION)) {
    let objectId = action.payload && action.payload[0];
    if (objectId) {
      let molGroupName = getMolGroupName(objectId, state);
      truckAction = {
        type: actionType.SITE_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: objectType.SITE,
        object_name: molGroupName,
        object_id: objectId
      };
    }
  } else if (action.type.includes(selectionConstants.APPEND_FRAGMENT_DISPLAY_LIST)) {
    if (action.item) {
      truckAction = {
        type: actionType.LIGAND_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
        object_name: action.item.name,
        object_id: action.item.id
      };
    }
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_FRAGMENT_DISPLAY_LIST)) {
    if (action.item) {
      truckAction = {
        type: actionType.LIGAND_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
        object_name: action.item.name,
        object_id: action.item.id
      };
    }
  } else if (action.type.includes(selectionConstants.APPEND_PROTEIN_LIST)) {
    if (action.item) {
      truckAction = {
        type: actionType.SIDECHAINS_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
        object_name: action.item.name,
        object_id: action.item.id
      };
    }
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_PROTEIN_LIST)) {
    if (action.item) {
      truckAction = {
        type: actionType.SIDECHAINS_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
        object_name: action.item.name,
        object_id: action.item.id
      };
    }
  } else if (action.type.includes(selectionConstants.APPEND_COMPLEX_LIST)) {
    if (action.item) {
      truckAction = {
        type: actionType.INTERACTIONS_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
        object_name: action.item.name,
        object_id: action.item.id
      };
    }
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_COMPLEX_LIST)) {
    if (action.item) {
      truckAction = {
        type: actionType.INTERACTIONS_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
        object_name: action.item.name,
        object_id: action.item.id
      };
    }
  } else if (action.type.includes(selectionConstants.APPEND_SURFACE_LIST)) {
    if (action.item) {
      truckAction = {
        type: actionType.SURFACE_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
        object_name: action.item.name,
        object_id: action.item.id
      };
    }
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_SURFACE_LIST)) {
    if (action.item) {
      truckAction = {
        type: actionType.SURFACE_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
        object_name: action.item.name,
        object_id: action.item.id
      };
    }
  } else if (action.type.includes(selectionConstants.APPEND_VECTOR_ON_LIST)) {
    if (action.item) {
      truckAction = {
        type: actionType.VECTORS_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
        object_name: action.item.name,
        object_id: action.item.id
      };
    }
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_VECTOR_ON_LIST)) {
    if (action.item) {
      truckAction = {
        type: actionType.VECTORS_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: action.item.isInspiration === true ? objectType.INSPIRATION : objectType.MOLECULE,
        object_name: action.item.name,
        object_id: action.item.id
      };
    }
  } else if (action.type.includes(selectionConstants.APPEND_TO_BUY_LIST)) {
    if (action.item) {
      truckAction = {
        type: actionType.MOLECULE_ADDED_TO_SHOPPING_CART,
        timestamp: Date.now(),
        username: username,
        object_type: objectType.MOLECULE,
        object_name: action.item.name,
        object_id: action.item.id
      };
    }
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_TO_BUY_LIST)) {
    if (action.item) {
      truckAction = {
        type: actionType.MOLECULE_REMOVED_FROM_SHOPPING_CART,
        timestamp: Date.now(),
        username: username,
        object_type: objectType.MOLECULE,
        object_name: action.item.name,
        object_id: action.item.id
      };
    }
  } else if (action.type.includes(selectionConstants.SET_CURRENT_VECTOR)) {
    truckAction = {
      type: actionType.VECTOR_SELECTED,
      timestamp: Date.now(),
      username: username,
      object_type: objectType.MOLECULE,
      object_name: action.payload,
      object_id: action.payload
    };
  } else if (action.type.includes(customDatasetConstants.APPEND_MOLECULE_TO_COMPOUNDS_TO_BUY_OF_DATASET)) {
    if (action.payload) {
      truckAction = {
        type: actionType.COMPOUND_SELECTED,
        timestamp: Date.now(),
        username: username,
        object_type: objectType.COMPOUND,
        object_name: action.payload.moleculeTitle,
        object_id: action.payload.moleculeID,
        dataset_id: action.payload.datasetID
      };
    }
  } else if (action.type.includes(customDatasetConstants.REMOVE_MOLECULE_FROM_COMPOUNDS_TO_BUY_OF_DATASET)) {
    if (action.payload) {
      truckAction = {
        type: actionType.COMPOUND_DESELECTED,
        timestamp: Date.now(),
        username: username,
        object_type: objectType.COMPOUND,
        object_name: action.payload.moleculeTitle,
        object_id: action.payload.moleculeID,
        dataset_id: action.payload.datasetID
      };
    }
  } else if (action.type.includes(customDatasetConstants.APPEND_LIGAND_LIST)) {
    if (action.payload && action.payload.item) {
      truckAction = {
        type: actionType.LIGAND_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: action.payload.item.isCrossReference === true ? objectType.CROSS_REFERENCE : objectType.COMPOUND,
        object_name: action.payload.item.name,
        object_id: action.payload.item.id,
        dataset_id: action.payload.datasetID
      };
    }
  } else if (action.type.includes(customDatasetConstants.REMOVE_FROM_LIGAND_LIST)) {
    if (action.payload && action.payload.item) {
      truckAction = {
        type: actionType.LIGAND_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: action.payload.item.isCrossReference === true ? objectType.CROSS_REFERENCE : objectType.COMPOUND,
        object_name: action.payload.item.name,
        object_id: action.payload.item.id,
        dataset_id: action.payload.datasetID
      };
    }
  } else if (action.type.includes(customDatasetConstants.APPEND_PROTEIN_LIST)) {
    if (action.payload && action.payload.item) {
      truckAction = {
        type: actionType.SIDECHAINS_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: action.payload.item.isCrossReference === true ? objectType.CROSS_REFERENCE : objectType.COMPOUND,
        object_name: action.payload.item.name,
        object_id: action.payload.item.id,
        dataset_id: action.payload.datasetID
      };
    }
  } else if (action.type.includes(customDatasetConstants.REMOVE_FROM_PROTEIN_LIST)) {
    if (action.payload && action.payload.item) {
      truckAction = {
        type: actionType.SIDECHAINS_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: action.payload.item.isCrossReference === true ? objectType.CROSS_REFERENCE : objectType.COMPOUND,
        object_name: action.payload.item.name,
        object_id: action.payload.item.id,
        dataset_id: action.payload.datasetID
      };
    }
  } else if (action.type.includes(customDatasetConstants.APPEND_COMPLEX_LIST)) {
    if (action.payload && action.payload.item) {
      truckAction = {
        type: actionType.INTERACTIONS_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: action.payload.item.isCrossReference === true ? objectType.CROSS_REFERENCE : objectType.COMPOUND,
        object_name: action.payload.item.name,
        object_id: action.payload.item.id,
        dataset_id: action.payload.datasetID
      };
    }
  } else if (action.type.includes(customDatasetConstants.REMOVE_FROM_COMPLEX_LIST)) {
    if (action.payload && action.payload.item) {
      truckAction = {
        type: actionType.INTERACTIONS_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: action.payload.item.isCrossReference === true ? objectType.CROSS_REFERENCE : objectType.COMPOUND,
        object_name: action.payload.item.name,
        object_id: action.payload.item.id,
        dataset_id: action.payload.datasetID
      };
    } else if (action.type.includes(customDatasetConstants.APPEND_SURFACE_LIST)) {
      if (action.payload && action.payload.item) {
        truckAction = {
          type: actionType.SURFACE_TURNED_ON,
          timestamp: Date.now(),
          username: username,
          object_type: action.payload.item.isCrossReference === true ? objectType.CROSS_REFERENCE : objectType.COMPOUND,
          object_name: action.payload.item.name,
          object_id: action.payload.item.id,
          dataset_id: action.payload.datasetID
        };
      }
    }
  } else if (action.type.includes(customDatasetConstants.REMOVE_FROM_SURFACE_LIST)) {
    if (action.payload && action.payload.item) {
      truckAction = {
        type: actionType.SURFACE_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: action.payload.item.isCrossReference === true ? objectType.CROSS_REFERENCE : objectType.COMPOUND,
        object_name: action.payload.item.name,
        object_id: action.payload.item.id,
        dataset_id: action.payload.datasetID
      };
    }
  } else if (action.type.includes(nglConstants.UPDATE_COMPONENT_REPRESENTATION)) {
    truckAction = {
      type: actionType.REPRESENTATION_CHANGED,
      timestamp: Date.now(),
      username: username,
      object_type: objectType.REPRESENTATION,
      object_name: action.objectInViewID,
      object_id: action.objectInViewID,
      representation_id: action.representationID,
      new_representation: action.newRepresentation
    };
  } else if (action.type.includes(nglConstants.ADD_COMPONENT_REPRESENTATION)) {
    truckAction = {
      type: actionType.REPRESENTATION_CHANGED,
      timestamp: Date.now(),
      username: username,
      object_type: objectType.REPRESENTATION,
      object_name: action.objectInViewID,
      object_id: action.objectInViewID,
      new_representation: action.newRepresentation
    };
  } else if (action.type.includes(nglConstants.REMOVE_COMPONENT_REPRESENTATION)) {
    truckAction = {
      type: actionType.REPRESENTATION_CHANGED,
      timestamp: Date.now(),
      username: username,
      object_type: objectType.REPRESENTATION,
      object_name: action.objectInViewID,
      object_id: action.objectInViewID,
      representation_id: action.representationID
    };
  }

  return truckAction;
};

const getMolGroupName = (molGroupId, state) => {
  let molGroupList = state.apiReducers.mol_group_list;
  let molGroup = molGroupList.find(group => group.id === molGroupId);
  let molGroupName = (molGroup && molGroup.description) || '';
  return molGroupName;
};

const getTargetName = (targetId, state) => {
  let targetList = state.apiReducers.target_id_list;
  let target = targetList.find(target => target.id === targetId);
  let targetName = (target && target.title) || '';
  return targetName;
};
