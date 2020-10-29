import { actionType, actionObjectType, actionDescription } from './constants';
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
        object_type: actionObjectType.TARGET,
        object_name: targetName,
        object_id: action.target_on,
        text: `${actionDescription.TARGET} ${targetName} ${actionDescription.LOADED}`
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
          object_type: actionObjectType.SITE,
          object_name: molGroupName,
          object_id: action.mol_group_on,
          text: `${actionDescription.SITE} ${molGroupName} ${actionDescription.TURNED_ON}`
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
        object_type: actionObjectType.SITE,
        object_name: molGroupName,
        object_id: objectId,
        text: `${actionDescription.SITE} ${molGroupName} ${actionDescription.TURNED_OFF}`
      };
    }
  } else if (action.type.includes(selectionConstants.APPEND_FRAGMENT_DISPLAY_LIST)) {
    if (action.item) {
      let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
      let objectName = action.item.name || getMoleculeName(action.item.id, state);

      truckAction = {
        type: actionType.LIGAND_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.item.id,
        text: `${actionDescription.LIGAND} ${actionDescription.TURNED_ON} ${objectType} ${objectName}`
      };
    }
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_FRAGMENT_DISPLAY_LIST)) {
    if (action.item) {
      let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
      let objectName = action.item.name || getMoleculeName(action.item.id, state);

      truckAction = {
        type: actionType.LIGAND_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.item.id,
        text: `${actionDescription.LIGAND} ${actionDescription.TURNED_OFF} ${objectType} ${objectName}`
      };
    }
  } else if (action.type.includes(selectionConstants.APPEND_PROTEIN_LIST)) {
    if (action.item) {
      let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
      let objectName = action.item.name || getMoleculeName(action.item.id, state);

      truckAction = {
        type: actionType.SIDECHAINS_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.item.id,
        text: `${actionDescription.SIDECHAINS} ${actionDescription.TURNED_ON} ${objectType} ${objectName}`
      };
    }
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_PROTEIN_LIST)) {
    if (action.item) {
      let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
      let objectName = action.item.name || getMoleculeName(action.item.id, state);

      truckAction = {
        type: actionType.SIDECHAINS_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.item.id,
        text: `${actionDescription.SIDECHAINS} ${actionDescription.TURNED_OFF} ${objectType} ${objectName}`
      };
    }
  } else if (action.type.includes(selectionConstants.APPEND_COMPLEX_LIST)) {
    if (action.item) {
      let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
      let objectName = action.item.name || getMoleculeName(action.item.id, state);

      truckAction = {
        type: actionType.INTERACTIONS_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.item.id,
        text: `${actionDescription.INTERACTIONS} ${actionDescription.TURNED_ON} ${objectType} ${objectName}`
      };
    }
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_COMPLEX_LIST)) {
    if (action.item) {
      let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
      let objectName = action.item.name || getMoleculeName(action.item.id, state);

      truckAction = {
        type: actionType.INTERACTIONS_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.item.id,
        text: `${actionDescription.INTERACTIONS} ${actionDescription.TURNED_OFF} ${objectType} ${objectName}`
      };
    }
  } else if (action.type.includes(selectionConstants.APPEND_SURFACE_LIST)) {
    if (action.item) {
      let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
      let objectName = action.item.name || getMoleculeName(action.item.id, state);

      truckAction = {
        type: actionType.SURFACE_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.item.id,
        text: `${actionDescription.SURFACE} ${actionDescription.TURNED_OFF} ${objectType} ${objectName}`
      };
    }
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_SURFACE_LIST)) {
    if (action.item) {
      let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
      let objectName = action.item.name || getMoleculeName(action.item.id, state);

      truckAction = {
        type: actionType.SURFACE_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.item.id,
        text: `${actionDescription.SURFACE} ${actionDescription.TURNED_OFF} ${objectType} ${objectName}`
      };
    }
  } else if (action.type.includes(selectionConstants.APPEND_VECTOR_ON_LIST)) {
    if (action.item) {
      let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
      let objectName = action.item.name || getMoleculeName(action.item.id, state);

      truckAction = {
        type: actionType.VECTORS_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.item.id,
        text: `${actionDescription.VECTOR} ${actionDescription.TURNED_ON} ${objectType} ${objectName}`
      };
    }
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_VECTOR_ON_LIST)) {
    if (action.item) {
      let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
      let objectName = action.item.name || getMoleculeName(action.item.id, state);

      truckAction = {
        type: actionType.VECTORS_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.item.id,
        text: `${actionDescription.VECTOR} ${actionDescription.TURNED_OFF} ${objectType} ${objectName}`
      };
    }
  } else if (action.type.includes(selectionConstants.APPEND_TO_BUY_LIST)) {
    if (action.item) {
      let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
      let objectName = action.item.name || getMoleculeName(action.item.id, state);

      truckAction = {
        type: actionType.MOLECULE_ADDED_TO_SHOPPING_CART,
        timestamp: Date.now(),
        username: username,
        object_type: actionObjectType.MOLECULE,
        object_name: objectName,
        object_id: action.item.id,
        text: `${objectType} ${objectName} ${actionDescription.ADDED} ${actionDescription.TO_SHOPPING_CART}`
      };
    }
  } else if (action.type.includes(selectionConstants.REMOVE_FROM_TO_BUY_LIST)) {
    if (action.item) {
      let objectType = actionObjectType.MOLECULE;
      let objectName = action.item.name || getMoleculeName(action.item.id, state);

      truckAction = {
        type: actionType.MOLECULE_REMOVED_FROM_SHOPPING_CART,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.item.id,
        text: `${objectType} ${objectName} ${actionDescription.REMOVED} ${actionDescription.FROM_SHOPPING_CART}`
      };
    }
  } else if (action.type.includes(selectionConstants.SET_CURRENT_VECTOR)) {
    if (action.payload) {
      let objectType = actionObjectType.MOLECULE;
      let objectName = action.payload;

      truckAction = {
        type: actionType.VECTOR_SELECTED,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.payload,
        text: `${actionDescription.VECTOR} ${objectName} ${actionDescription.SELECTED}`
      };
    }
  } else if (action.type.includes(customDatasetConstants.APPEND_MOLECULE_TO_COMPOUNDS_TO_BUY_OF_DATASET)) {
    if (action.payload) {
      let objectType = actionObjectType.COMPOUND;
      let objectName = action.payload.moleculeTitle;

      truckAction = {
        type: actionType.COMPOUND_SELECTED,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.payload.moleculeID,
        dataset_id: action.payload.datasetID,
        text: `${objectType} ${objectName} ${actionDescription.SELECTED} of dataset: ${action.payload.datasetID}`
      };
    }
  } else if (action.type.includes(customDatasetConstants.REMOVE_MOLECULE_FROM_COMPOUNDS_TO_BUY_OF_DATASET)) {
    if (action.payload) {
      let objectType = actionObjectType.COMPOUND;
      let objectName = action.payload.moleculeTitle;

      truckAction = {
        type: actionType.COMPOUND_DESELECTED,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.payload.moleculeID,
        dataset_id: action.payload.datasetID,
        text: `${objectType} ${objectName} ${actionDescription.DESELECTED} of dataset: ${action.payload.datasetID}`
      };
    }
  } else if (action.type.includes(customDatasetConstants.APPEND_LIGAND_LIST)) {
    if (action.payload && action.payload.item) {
      let objectType =
        action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
      let objectName = action.payload.item.name;

      truckAction = {
        type: actionType.LIGAND_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.payload.item.id,
        dataset_id: action.payload.datasetID,
        text: `${actionDescription.LIGAND} ${actionDescription.TURNED_ON} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
      };
    }
  } else if (action.type.includes(customDatasetConstants.REMOVE_FROM_LIGAND_LIST)) {
    if (action.payload && action.payload.item) {
      let objectType =
        action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
      let objectName = action.payload.item.name;

      truckAction = {
        type: actionType.LIGAND_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.payload.item.id,
        dataset_id: action.payload.datasetID,
        text: `${actionDescription.LIGAND} ${actionDescription.TURNED_OFF} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
      };
    }
  } else if (action.type.includes(customDatasetConstants.APPEND_PROTEIN_LIST)) {
    if (action.payload && action.payload.item) {
      let objectType =
        action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
      let objectName = action.payload.item.name;

      truckAction = {
        type: actionType.SIDECHAINS_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.payload.item.id,
        dataset_id: action.payload.datasetID,
        text: `${actionDescription.SIDECHAINS} ${actionDescription.TURNED_ON} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
      };
    }
  } else if (action.type.includes(customDatasetConstants.REMOVE_FROM_PROTEIN_LIST)) {
    if (action.payload && action.payload.item) {
      let objectType =
        action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
      let objectName = action.payload.item.name;

      truckAction = {
        type: actionType.SIDECHAINS_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.payload.item.id,
        dataset_id: action.payload.datasetID,
        text: `${actionDescription.SIDECHAINS} ${actionDescription.TURNED_OFF} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
      };
    }
  } else if (action.type.includes(customDatasetConstants.APPEND_COMPLEX_LIST)) {
    if (action.payload && action.payload.item) {
      let objectType =
        action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
      let objectName = action.payload.item.name;

      truckAction = {
        type: actionType.INTERACTIONS_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.payload.item.id,
        dataset_id: action.payload.datasetID,
        text: `${actionDescription.INTERACTIONS} ${actionDescription.TURNED_ON} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
      };
    }
  } else if (action.type.includes(customDatasetConstants.REMOVE_FROM_COMPLEX_LIST)) {
    if (action.payload && action.payload.item) {
      let objectType =
        action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
      let objectName = action.payload.item.name;

      truckAction = {
        type: actionType.INTERACTIONS_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.payload.item.id,
        dataset_id: action.payload.datasetID,
        text: `${actionDescription.INTERACTIONS} ${actionDescription.TURNED_OF} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
      };
    }
  } else if (action.type.includes(customDatasetConstants.APPEND_SURFACE_LIST)) {
    if (action.payload && action.payload.item) {
      let objectType =
        action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
      let objectName = action.payload.item.name;

      truckAction = {
        type: actionType.SURFACE_TURNED_ON,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.payload.item.id,
        dataset_id: action.payload.datasetID,
        text: `${actionDescription.SURFACE} ${actionDescription.TURNED_ON} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
      };
    }
  } else if (action.type.includes(customDatasetConstants.REMOVE_FROM_SURFACE_LIST)) {
    if (action.payload && action.payload.item) {
      let objectType =
        action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
      let objectName = action.payload.item.name;

      truckAction = {
        type: actionType.SURFACE_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.payload.item.id,
        dataset_id: action.payload.datasetID,
        text: `${actionDescription.SURFACE} ${actionDescription.TURNED_OFF} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
      };
    }
  } else if (action.type.includes(nglConstants.UPDATE_COMPONENT_REPRESENTATION)) {
    let objectType = actionObjectType.REPRESENTATION;

    truckAction = {
      type: actionType.REPRESENTATION_CHANGED,
      timestamp: Date.now(),
      username: username,
      object_type: actionObjectType.REPRESENTATION,
      object_name: action.objectInViewID,
      object_id: action.objectInViewID,
      representation_id: action.representationID,
      new_representation: action.newRepresentation,
      text: `${objectType} of ${action.objectInViewID} ${actionDescription.CHANGED}`
    };
  } else if (action.type.includes(nglConstants.ADD_COMPONENT_REPRESENTATION)) {
    let objectType = actionObjectType.REPRESENTATION;

    truckAction = {
      type: actionType.REPRESENTATION_ADDED,
      timestamp: Date.now(),
      username: username,
      object_type: actionObjectType.REPRESENTATION,
      object_name: action.objectInViewID,
      object_id: action.objectInViewID,
      new_representation: action.newRepresentation,
      text: `${objectType} of ${action.objectInViewID} ${actionDescription.ADDED}`
    };
  } else if (action.type.includes(nglConstants.REMOVE_COMPONENT_REPRESENTATION)) {
    let objectType = actionObjectType.REPRESENTATION;

    truckAction = {
      type: actionType.REPRESENTATION_REMOVED,
      timestamp: Date.now(),
      username: username,
      object_type: objectType,
      object_name: action.objectInViewID,
      object_id: action.objectInViewID,
      representation_id: action.representationID,
      text: `${objectType} of ${action.objectInViewID} ${actionDescription.REMOVED}`
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

const getMoleculeName = (moleculeId, state) => {
  let moleculeList = state.apiReducers.molecule_list;
  let molecule = moleculeList.find(molecule => molecule.id === moleculeId);
  let moleculeName = (molecule && molecule.protein_code) || '';
  return moleculeName;
};
