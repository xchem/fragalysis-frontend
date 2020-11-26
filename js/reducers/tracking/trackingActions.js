import { actionType, actionObjectType, actionDescription } from './constants';
import { constants as apiConstants } from '../api/constants';
import { CONSTANTS as nglConstants } from '../ngl/constants';
import { constants as selectionConstants } from '../selection/constants';
import { constants as customDatasetConstants } from '../../components/datasets/redux/constants';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';

export const findTruckAction = (action, state) => {
  const username = DJANGO_CONTEXT['username'];
  const target_on_name = state.apiReducers.target_on_name;
  const isUndoRedoAction = state.trackingReducers.isUndoRedoAction;
  const currentProject = state.projectReducers.currentProject;
  const projectID = currentProject && currentProject.projectID;
  const authorID = currentProject && currentProject.authorID;
  let project = { projectID, authorID };

  let truckAction = null;
  if (action.skipTracking !== true) {
    if (action.type.includes(apiConstants.SET_TARGET_ON)) {
      if (action.target_on) {
        let targetName = getTargetName(action.target_on, state);
        truckAction = {
          type: actionType.TARGET_LOADED,
          timestamp: Date.now(),
          username: username,
          project: project,
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
            project: project,
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
          project: project,
          object_type: actionObjectType.SITE,
          object_name: molGroupName,
          object_id: objectId,
          text: `${actionDescription.SITE} ${molGroupName} ${actionDescription.TURNED_OFF}`
        };
      }
    } else if (action.type === selectionConstants.SET_SELECTED_ALL) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        truckAction = {
          type: actionType.ALL_TURNED_ON,
          timestamp: Date.now(),
          username: username,
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          isLigand: action.isLigand,
          isProtein: action.isProtein,
          isComplex: action.isComplex,
          item: action.item,
          text: `${actionDescription.ALL} ${actionDescription.TURNED_ON} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
        };
      }
    } else if (action.type === selectionConstants.SET_DESELECTED_ALL) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        truckAction = {
          type: actionType.ALL_TURNED_OFF,
          timestamp: Date.now(),
          username: username,
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          isLigand: action.isLigand,
          isProtein: action.isProtein,
          isComplex: action.isComplex,
          item: action.item,
          text: `${actionDescription.ALL} ${actionDescription.TURNED_OFF} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
        };
      }
    } else if (action.type === selectionConstants.SET_SELECTED_ALL_BY_TYPE) {
      if (action.payload) {
        let payload = action.payload;
        let objectType = payload.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let paylodTypeDescription = getTypeDescriptionOfSelectedAllAction(payload.type);

        truckAction = {
          type: actionType.ALL_TURNED_ON_BY_TYPE,
          timestamp: Date.now(),
          username: username,
          project: project,
          object_type: objectType,
          control_type: payload.type,
          items: payload.items,
          text: `${actionDescription.ALL} ${paylodTypeDescription} ${actionDescription.TURNED_ON} ${objectType}`
        };
      }
    } else if (action.type === selectionConstants.SET_DESELECTED_ALL_BY_TYPE) {
      if (action.payload) {
        let payload = action.payload;
        let objectType = payload.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let paylodTypeDescription = getTypeDescriptionOfSelectedAllAction(payload.type);

        truckAction = {
          type: actionType.ALL_TURNED_OFF_BY_TYPE,
          timestamp: Date.now(),
          username: username,
          project: project,
          object_type: objectType,
          control_type: payload.type,
          items: payload.items,
          text: `${actionDescription.ALL} ${paylodTypeDescription} ${actionDescription.TURNED_OFF} ${objectType}`
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
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.LIGAND} ${actionDescription.TURNED_ON} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
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
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.LIGAND} ${actionDescription.TURNED_OFF} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
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
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.SIDECHAIN} ${actionDescription.TURNED_ON} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
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
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.SIDECHAIN} ${actionDescription.TURNED_OFF} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
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
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.INTERACTION} ${actionDescription.TURNED_ON} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
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
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.INTERACTION} ${actionDescription.TURNED_OFF} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
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
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.SURFACE} ${actionDescription.TURNED_ON} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
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
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.SURFACE} ${actionDescription.TURNED_OFF} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
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
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.VECTOR} ${actionDescription.TURNED_ON} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
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
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.VECTOR} ${actionDescription.TURNED_OFF} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
        };
      }
    } else if (action.type.includes(selectionConstants.APPEND_TO_BUY_LIST)) {
      if (action.item) {
        let objectType = actionObjectType.MOLECULE;
        let objectName = action.vector;

        truckAction = {
          type: actionType.MOLECULE_ADDED_TO_SHOPPING_CART,
          timestamp: Date.now(),
          username: username,
          project: project,
          object_type: actionObjectType.MOLECULE,
          object_name: objectName,
          object_id: objectName,
          item: action.item,
          text: `${objectType} ${objectName} ${actionDescription.ADDED} ${actionDescription.TO_SHOPPING_CART}`
        };
      }
    } else if (action.type.includes(selectionConstants.REMOVE_FROM_TO_BUY_LIST)) {
      if (action.item) {
        let objectType = actionObjectType.MOLECULE;
        let objectName = action.vector;

        truckAction = {
          type: actionType.MOLECULE_REMOVED_FROM_SHOPPING_CART,
          timestamp: Date.now(),
          username: username,
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: objectName,
          item: action.item,
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
          project: project,
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
          project: project,
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
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.moleculeID,
          dataset_id: action.payload.datasetID,
          text: `${objectType} ${objectName} ${actionDescription.DESELECTED} of dataset: ${action.payload.datasetID}`
        };
      }
    } else if (action.type === customDatasetConstants.SET_SELECTED_ALL) {
      if (action.payload && action.payload.item) {
        let objectType =
          action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
        let objectName = action.payload.item.name;

        truckAction = {
          type: actionType.ALL_TURNED_ON,
          timestamp: Date.now(),
          username: username,
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.item.id,
          dataset_id: action.payload.datasetID,
          isLigand: action.payload.isLigand,
          isProtein: action.payload.isProtein,
          isComplex: action.payload.isComplex,
          item: action.payload.item,
          text: `${actionDescription.ALL} ${actionDescription.TURNED_ON} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
        };
      }
    } else if (action.type === customDatasetConstants.SET_DESELECTED_ALL) {
      if (action.payload && action.payload.item) {
        let objectType =
          action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
        let objectName = action.payload.item.name;

        truckAction = {
          type: actionType.ALL_TURNED_OFF,
          timestamp: Date.now(),
          username: username,
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.item.id,
          dataset_id: action.payload.datasetID,
          isLigand: action.payload.isLigand,
          isProtein: action.payload.isProtein,
          isComplex: action.payload.isComplex,
          item: action.payload.item,
          text: `${actionDescription.ALL} ${actionDescription.TURNED_OFF} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
        };
      }
    } else if (action.type === customDatasetConstants.SET_SELECTED_ALL_BY_TYPE) {
      if (action.payload) {
        let payload = action.payload;
        let objectType =
          payload.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
        let paylodTypeDescription = getTypeDescriptionOfSelectedAllAction(payload.type);
        let datasetDescription = payload.datasetID ? `of dataset: ${payload.datasetID}` : '';

        truckAction = {
          type: actionType.ALL_TURNED_ON_BY_TYPE,
          timestamp: Date.now(),
          username: username,
          project: project,
          object_type: objectType,
          control_type: payload.type,
          items: payload.items,
          text: `${actionDescription.ALL} ${paylodTypeDescription} ${actionDescription.TURNED_ON} ${objectType} ${datasetDescription}`
        };
      }
    } else if (action.type === customDatasetConstants.SET_DESELECTED_ALL_BY_TYPE) {
      if (action.payload) {
        let payload = action.payload;
        let objectType =
          payload.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
        let paylodTypeDescription = getTypeDescriptionOfSelectedAllAction(payload.type);
        let datasetDescription = payload.datasetID ? `of dataset: ${payload.datasetID}` : '';

        truckAction = {
          type: actionType.ALL_TURNED_OFF_BY_TYPE,
          timestamp: Date.now(),
          username: username,
          project: project,
          object_type: objectType,
          control_type: payload.type,
          items: payload.items,
          text: `${actionDescription.ALL} ${paylodTypeDescription} ${actionDescription.TURNED_OFF} ${objectType} ${datasetDescription}`
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
          project: project,
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
          project: project,
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
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.item.id,
          dataset_id: action.payload.datasetID,
          text: `${actionDescription.SIDECHAIN} ${actionDescription.TURNED_ON} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
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
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.item.id,
          dataset_id: action.payload.datasetID,
          text: `${actionDescription.SIDECHAIN} ${actionDescription.TURNED_OFF} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
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
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.item.id,
          dataset_id: action.payload.datasetID,
          text: `${actionDescription.INTERACTION} ${actionDescription.TURNED_ON} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
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
          project: project,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.item.id,
          dataset_id: action.payload.datasetID,
          text: `${actionDescription.INTERACTION} ${actionDescription.TURNED_OFF} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
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
          project: project,
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
          project: project,
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
        project: project,
        object_type: actionObjectType.REPRESENTATION,
        object_name: action.objectInViewID,
        object_id: action.objectInViewID,
        representation_id: action.representationID,
        representation: action.newRepresentation,
        change: action.change,
        text: `${objectType} '${action.change?.key}' of ${action.objectInViewID} ${actionDescription.CHANGED} from value: ${action.change?.oldValue} to value: ${action.change?.value}`
      };
    } else if (action.type.includes(nglConstants.ADD_COMPONENT_REPRESENTATION)) {
      let objectType = actionObjectType.REPRESENTATION;
      let representationName = action.newRepresentation && action.newRepresentation.type;

      truckAction = {
        type: actionType.REPRESENTATION_ADDED,
        timestamp: Date.now(),
        username: username,
        project: project,
        object_type: actionObjectType.REPRESENTATION,
        object_name: representationName,
        object_id: action.objectInViewID,
        representation: action.newRepresentation,
        text: `${objectType} '${representationName}' of ${action.objectInViewID} ${actionDescription.ADDED}`
      };
    } else if (action.type.includes(nglConstants.REMOVE_COMPONENT_REPRESENTATION)) {
      let objectType = actionObjectType.REPRESENTATION;
      let representationName = action.representation && action.representation.type;

      truckAction = {
        type: actionType.REPRESENTATION_REMOVED,
        timestamp: Date.now(),
        username: username,
        project: project,
        object_type: objectType,
        object_name: representationName,
        object_id: action.objectInViewID,
        representation: action.representation,
        text: `${objectType} '${representationName}' of ${action.objectInViewID} ${actionDescription.REMOVED}`
      };
    }
  }
  return truckAction;
};

const getMoleculeTitle = (objectName, targetName) => {
  let title = objectName.replace(`${targetName}-`, '');
  return title;
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
  let moleculeList = state.apiReducers.all_mol_lists;
  let moleculeName = '';

  if (moleculeList) {
    for (const group in moleculeList) {
      let molecules = moleculeList[group];

      let molecule = molecules.find(molecule => molecule.id === moleculeId);
      if (molecule && molecule != null) {
        moleculeName = molecule.protein_code;
        break;
      }
    }
  }
  return moleculeName;
};

const getTypeDescriptionOfSelectedAllAction = type => {
  switch (type) {
    case 'ligand':
      return actionDescription.LIGANDS;
    case 'protein':
      return actionDescription.SIDECHAINS;
    case 'complex':
      return actionDescription.INTERACTIONS;
    default:
      return type;
  }
};
