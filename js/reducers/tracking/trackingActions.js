import { actionType, actionObjectType, actionDescription, actionAnnotation } from './constants';
import { constants as apiConstants } from '../api/constants';
import { CONSTANTS as nglConstants } from '../ngl/constants';
import { constants as previewCompoundConstants } from '../../components/preview/compounds/redux/constants';
import { constants as selectionConstants } from '../selection/constants';
import { constants as customDatasetConstants } from '../../components/datasets/redux/constants';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { BACKGROUND_COLOR } from '../../components/nglView/constants/index';

export const findTrackAction = (action, state) => {
  const username = DJANGO_CONTEXT['username'];
  const target_on_name = state.apiReducers.target_on_name;
  const isActionRestoring = state.trackingReducers.isActionRestoring;

  let trackAction = null;
  if (isActionRestoring === false && action.skipTracking !== true) {
    if (action.type === apiConstants.SET_TARGET_ON) {
      if (action.target_on) {
        let targetName = getTargetName(action.target_on, state);
        trackAction = {
          type: actionType.TARGET_LOADED,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: actionObjectType.TARGET,
          object_name: targetName,
          object_id: action.target_on,
          text: `${actionDescription.TARGET} ${targetName} ${actionDescription.LOADED}`
        };
      }
    } else if (action.type === apiConstants.SET_MOL_GROUP_ON) {
      if (action.mol_group_on) {
        let molGroupSelection = state.selectionReducers.mol_group_selection;
        let currentMolGroup = molGroupSelection && molGroupSelection.find(o => o === action.mol_group_on);
        if (!currentMolGroup) {
          let molGroupName = getMolGroupName(action.mol_group_on, state);
          trackAction = {
            type: actionType.SITE_TURNED_ON,
            annotation: actionAnnotation.CHECK,
            timestamp: Date.now(),
            username: username,
            object_type: actionObjectType.SITE,
            object_name: molGroupName,
            object_id: action.mol_group_on,
            text: `${actionDescription.SITE} ${molGroupName} ${actionDescription.TURNED_ON}`
          };
        }
      }
    } else if (action.type === apiConstants.SET_MOL_GROUP_OFF) {
      const { mol_group_off } = action;
      let molGroupName = getMolGroupName(mol_group_off, state);
      trackAction = {
        type: actionType.SITE_TURNED_OFF,
        timestamp: Date.now(),
        username: username,
        object_type: actionObjectType.SITE,
        object_name: molGroupName,
        object_id: mol_group_off,
        text: `${actionDescription.SITE} ${molGroupName} ${actionDescription.TURNED_OFF}`
      };
    } else if (action.type === selectionConstants.SET_OBJECT_SELECTION) {
      let objectId = action.payload && action.payload[0];
      if (objectId) {
        let molGroupName = getMolGroupName(objectId, state);
        trackAction = {
          type: actionType.SITE_TURNED_OFF,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: actionObjectType.SITE,
          object_name: molGroupName,
          object_id: objectId,
          text: `${actionDescription.SITE} ${molGroupName} ${actionDescription.TURNED_OFF}`
        };
      }
    } else if (action.type === selectionConstants.SET_HIDE_ALL) {
      if (action.data) {
        let objectType = actionObjectType.MOLECULE;
        let description = action.isHide === true ? `` : `${actionDescription.CANCELED}`;

        trackAction = {
          type: actionType.ALL_HIDE,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          data: action.data,
          text: `${actionDescription.ALL} ${actionDescription.HIDDEN} ${description}`
        };
      }
    } else if (action.type === selectionConstants.SET_SELECTED_ALL) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        trackAction = {
          type: actionType.ALL_TURNED_ON,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
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

        trackAction = {
          type: actionType.ALL_TURNED_OFF,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
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

        trackAction = {
          type: actionType.ALL_TURNED_ON_BY_TYPE,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
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

        trackAction = {
          type: actionType.ALL_TURNED_OFF_BY_TYPE,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          control_type: payload.type,
          items: payload.items,
          text: `${actionDescription.ALL} ${paylodTypeDescription} ${actionDescription.TURNED_OFF} ${objectType}`
        };
      }
    } else if (action.type === selectionConstants.APPEND_FRAGMENT_DISPLAY_LIST) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        trackAction = {
          type: actionType.LIGAND_TURNED_ON,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.LIGAND} ${actionDescription.TURNED_ON} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
        };
      }
    } else if (action.type === selectionConstants.REMOVE_FROM_FRAGMENT_DISPLAY_LIST) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        trackAction = {
          type: actionType.LIGAND_TURNED_OFF,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.LIGAND} ${actionDescription.TURNED_OFF} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
        };
      }
    } else if (action.type === selectionConstants.APPEND_PROTEIN_LIST) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        trackAction = {
          type: actionType.SIDECHAINS_TURNED_ON,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.SIDECHAIN} ${actionDescription.TURNED_ON} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
        };
      }
    } else if (action.type === selectionConstants.REMOVE_FROM_PROTEIN_LIST) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        trackAction = {
          type: actionType.SIDECHAINS_TURNED_OFF,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.SIDECHAIN} ${actionDescription.TURNED_OFF} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
        };
      }
    } else if (action.type === selectionConstants.APPEND_DENSITY_LIST) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        trackAction = {
          type: actionType.DENSITY_TURNED_ON,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.DENSITY} ${actionDescription.TURNED_ON} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
        };
      }
    } else if (action.type === selectionConstants.REMOVE_FROM_DENSITY_LIST) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        trackAction = {
          type: actionType.DENSITY_TURNED_OFF,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.DENSITY} ${actionDescription.TURNED_OFF} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
        };
      }
    } else if (action.type === selectionConstants.APPEND_DENSITY_LIST_CUSTOM) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        trackAction = {
          type: actionType.DENSITY_CUSTOM_TURNED_ON,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.DENSITY} ${actionDescription.CUSTOM_VIEW} ${
            actionDescription.TURNED_ON
          } ${objectType} ${getMoleculeTitle(objectName, target_on_name)}`
        };
      }
    } else if (action.type === selectionConstants.REMOVE_FROM_DENSITY_LIST_CUSTOM) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        trackAction = {
          type: actionType.DENSITY_CUSTOM_TURNED_OFF,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.DENSITY} ${actionDescription.CUSTOM_VIEW} ${
            actionDescription.TURNED_OFF
          } ${objectType} ${getMoleculeTitle(objectName, target_on_name)}`
        };
      }
    } else if (action.type === selectionConstants.APPEND_COMPLEX_LIST) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        trackAction = {
          type: actionType.INTERACTIONS_TURNED_ON,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.INTERACTION} ${actionDescription.TURNED_ON} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
        };
      }
    } else if (action.type === selectionConstants.REMOVE_FROM_COMPLEX_LIST) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        trackAction = {
          type: actionType.INTERACTIONS_TURNED_OFF,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.INTERACTION} ${actionDescription.TURNED_OFF} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
        };
      }
    } else if (action.type === selectionConstants.APPEND_SURFACE_LIST) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        trackAction = {
          type: actionType.SURFACE_TURNED_ON,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.SURFACE} ${actionDescription.TURNED_ON} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
        };
      }
    } else if (action.type === selectionConstants.REMOVE_FROM_SURFACE_LIST) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        trackAction = {
          type: actionType.SURFACE_TURNED_OFF,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.SURFACE} ${actionDescription.TURNED_OFF} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
        };
      }
    } else if (action.type === selectionConstants.APPEND_VECTOR_ON_LIST) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        trackAction = {
          type: actionType.VECTORS_TURNED_ON,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.VECTOR} ${actionDescription.TURNED_ON} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
        };
      }
    } else if (action.type === selectionConstants.REMOVE_FROM_VECTOR_ON_LIST) {
      if (action.item) {
        let objectType = action.item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectName = action.item.name || getMoleculeName(action.item.id, state);

        trackAction = {
          type: actionType.VECTORS_TURNED_OFF,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.item.id,
          text: `${actionDescription.VECTOR} ${actionDescription.TURNED_OFF} ${objectType} ${getMoleculeTitle(
            objectName,
            target_on_name
          )}`
        };
      }
    } else if (action.type === selectionConstants.SET_ARROW_UP_DOWN) {
      let payload = action.payload;
      if (payload) {
        let item = payload.item;
        let newItem = payload.newItem;
        let objectType = item && item.isInspiration === true ? actionObjectType.INSPIRATION : actionObjectType.MOLECULE;
        let objectTypeDescription =
          item && item.isInspiration === true ? actionDescription.INSPIRATION : actionDescription.MOLECULE;
        let itemName = item?.name || getMoleculeName(item?.id, state);
        let newItemName = newItem?.name || getMoleculeName(newItem?.id, state);

        trackAction = {
          type: actionType.ARROW_NAVIGATION,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: itemName,
          object_id: item?.id,
          item: item,
          newItem: newItem,
          data: payload.data,
          arrowType: payload.arrowType,
          text: `${objectTypeDescription} ${actionDescription.MOVED} from: ${itemName} to ${newItemName}`
        };
      }
    } else if (action.type === selectionConstants.APPEND_TO_BUY_LIST) {
      if (action.item) {
        let objectType = actionObjectType.MOLECULE;
        let objectName = action.item && action.item.vector;

        trackAction = {
          type: actionType.MOLECULE_ADDED_TO_SHOPPING_CART,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: objectName,
          compoundId: action.index,
          item: action.item,
          text: `${actionDescription.VECTOR} ${objectName} ${actionDescription.ADDED} ${actionDescription.TO_SHOPPING_CART}`
        };
      }
    } else if (action.type === selectionConstants.REMOVE_FROM_TO_BUY_LIST) {
      if (action.item) {
        let objectType = actionObjectType.MOLECULE;
        let objectName = action.item && action.item.vector;

        trackAction = {
          type: actionType.MOLECULE_REMOVED_FROM_SHOPPING_CART,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: objectName,
          compoundId: action.index,
          item: action.item,
          text: `${actionDescription.VECTOR} ${objectName} ${actionDescription.REMOVED} ${actionDescription.FROM_SHOPPING_CART}`
        };
      }
    } else if (action.type === selectionConstants.APPEND_TO_BUY_LIST_ALL) {
      let items = action.items;
      let objectType = actionObjectType.COMPOUND;

      trackAction = {
        type: actionType.MOLECULE_ADDED_TO_SHOPPING_CART_ALL,
        annotation: actionAnnotation.CHECK,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        items: items,
        text: `${actionDescription.ALL} ${actionDescription.ADDED} ${actionDescription.TO_SHOPPING_CART}`
      };
    } else if (action.type === selectionConstants.REMOVE_FROM_BUY_LIST_ALL) {
      let items = action.items;
      let objectType = actionObjectType.COMPOUND;

      trackAction = {
        type: actionType.MOLECULE_REMOVED_FROM_SHOPPING_CART_ALL,
        annotation: actionAnnotation.CLEAR,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        items: items,
        text: `${actionDescription.ALL} ${actionDescription.REMOVED} ${actionDescription.FROM_SHOPPING_CART}`
      };
    } else if (action.type === previewCompoundConstants.APPEND_SHOWED_COMPOUND_LIST) {
      let objectType = actionObjectType.COMPOUND;
      let objectName = action.item && action.item.vector;

      trackAction = {
        type: actionType.VECTOR_COUMPOUND_ADDED,
        annotation: actionAnnotation.CHECK,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.payload,
        item: action.item,
        compoundId: action.payload,
        text: `${actionDescription.COMPOUND} ${objectName} ${actionDescription.ADDED}`
      };
    } else if (action.type === previewCompoundConstants.REMOVE_SHOWED_COMPOUND_LIST) {
      let objectType = actionObjectType.COMPOUND;
      let objectName = action.item && action.item.vector;

      trackAction = {
        type: actionType.VECTOR_COUMPOUND_REMOVED,
        annotation: actionAnnotation.CLEAR,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: objectName,
        object_id: action.payload,
        item: action.item,
        compoundId: action.payload,
        text: `${actionDescription.COMPOUND} ${objectName} ${actionDescription.REMOVED}`
      };
    } else if (action.type === selectionConstants.SET_CURRENT_VECTOR) {
      if (action.payload) {
        let objectType = actionObjectType.MOLECULE;
        let objectName = action.payload;

        trackAction = {
          type: actionType.VECTOR_SELECTED,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload,
          text: `${actionDescription.VECTOR} ${objectName} ${actionDescription.SELECTED}`
        };
      }
    } else if (action.type === previewCompoundConstants.SET_CURRENT_COMPOUND_CLASS) {
      if (action.payload) {
        let objectType = actionObjectType.COMPOUND;
        let objectName = action.payload;
        let oldObjectName = action.oldCompoundClass;

        trackAction = {
          type: actionType.CLASS_SELECTED,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: objectName,
          oldValue: oldObjectName,
          value: objectName,
          text: `${actionDescription.CLASS} ${actionDescription.CHANGED} from value: ${oldObjectName} to value: ${objectName}`
        };
      }
    } else if (action.type === previewCompoundConstants.SET_COMPOUND_CLASSES) {
      if (action.payload) {
        let objectType = actionObjectType.COMPOUND;

        trackAction = {
          type: actionType.CLASS_UPDATED,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: action.value,
          object_id: action.id,
          newCompoundClasses: action.payload,
          oldCompoundClasses: action.oldCompoundClasses,
          text: `${actionDescription.CLASS} value ${actionDescription.UPDATED}: ${action.id}:${action.value}`
        };
      }
    } else if (action.type === customDatasetConstants.APPEND_MOLECULE_TO_COMPOUNDS_TO_BUY_OF_DATASET) {
      if (action.payload) {
        let objectType = actionObjectType.COMPOUND;
        let objectName = action.payload.moleculeTitle;

        trackAction = {
          type: actionType.COMPOUND_SELECTED,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.moleculeID,
          dataset_id: action.payload.datasetID,
          text: `${objectType} ${objectName} ${actionDescription.SELECTED} of dataset: ${action.payload.datasetID}`
        };
      }
    } else if (action.type === customDatasetConstants.REMOVE_MOLECULE_FROM_COMPOUNDS_TO_BUY_OF_DATASET) {
      if (action.payload) {
        let objectType = actionObjectType.COMPOUND;
        let objectName = action.payload.moleculeTitle;

        trackAction = {
          type: actionType.COMPOUND_DESELECTED,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
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

        trackAction = {
          type: actionType.ALL_TURNED_ON,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
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

        trackAction = {
          type: actionType.ALL_TURNED_OFF,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
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

        trackAction = {
          type: actionType.ALL_TURNED_ON_BY_TYPE,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
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

        trackAction = {
          type: actionType.ALL_TURNED_OFF_BY_TYPE,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          control_type: payload.type,
          items: payload.items,
          text: `${actionDescription.ALL} ${paylodTypeDescription} ${actionDescription.TURNED_OFF} ${objectType} ${datasetDescription}`
        };
      }
    } else if (action.type === customDatasetConstants.APPEND_LIGAND_LIST) {
      if (action.payload && action.payload.item) {
        let objectType =
          action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
        let objectName = action.payload.item.name;

        trackAction = {
          type: actionType.LIGAND_TURNED_ON,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.item.id,
          dataset_id: action.payload.datasetID,
          text: `${actionDescription.LIGAND} ${actionDescription.TURNED_ON} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
        };
      }
    } else if (action.type === customDatasetConstants.REMOVE_FROM_LIGAND_LIST) {
      if (action.payload && action.payload.item) {
        let objectType =
          action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
        let objectName = action.payload.item.name;

        trackAction = {
          type: actionType.LIGAND_TURNED_OFF,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.item.id,
          dataset_id: action.payload.datasetID,
          text: `${actionDescription.LIGAND} ${actionDescription.TURNED_OFF} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
        };
      }
    } else if (action.type === customDatasetConstants.APPEND_PROTEIN_LIST) {
      if (action.payload && action.payload.item) {
        let objectType =
          action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
        let objectName = action.payload.item.name;

        trackAction = {
          type: actionType.SIDECHAINS_TURNED_ON,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.item.id,
          dataset_id: action.payload.datasetID,
          text: `${actionDescription.SIDECHAIN} ${actionDescription.TURNED_ON} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
        };
      }
    } else if (action.type === customDatasetConstants.REMOVE_FROM_PROTEIN_LIST) {
      if (action.payload && action.payload.item) {
        let objectType =
          action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
        let objectName = action.payload.item.name;

        trackAction = {
          type: actionType.SIDECHAINS_TURNED_OFF,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.item.id,
          dataset_id: action.payload.datasetID,
          text: `${actionDescription.SIDECHAIN} ${actionDescription.TURNED_OFF} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
        };
      }
    } else if (action.type === customDatasetConstants.APPEND_COMPLEX_LIST) {
      if (action.payload && action.payload.item) {
        let objectType =
          action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
        let objectName = action.payload.item.name;

        trackAction = {
          type: actionType.INTERACTIONS_TURNED_ON,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.item.id,
          dataset_id: action.payload.datasetID,
          text: `${actionDescription.INTERACTION} ${actionDescription.TURNED_ON} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
        };
      }
    } else if (action.type === customDatasetConstants.REMOVE_FROM_COMPLEX_LIST) {
      if (action.payload && action.payload.item) {
        let objectType =
          action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
        let objectName = action.payload.item.name;

        trackAction = {
          type: actionType.INTERACTIONS_TURNED_OFF,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.item.id,
          dataset_id: action.payload.datasetID,
          text: `${actionDescription.INTERACTION} ${actionDescription.TURNED_OFF} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
        };
      }
    } else if (action.type === customDatasetConstants.APPEND_SURFACE_LIST) {
      if (action.payload && action.payload.item) {
        let objectType =
          action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
        let objectName = action.payload.item.name;

        trackAction = {
          type: actionType.SURFACE_TURNED_ON,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.item.id,
          dataset_id: action.payload.datasetID,
          text: `${actionDescription.SURFACE} ${actionDescription.TURNED_ON} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
        };
      }
    } else if (action.type === customDatasetConstants.REMOVE_FROM_SURFACE_LIST) {
      if (action.payload && action.payload.item) {
        let objectType =
          action.payload.item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
        let objectName = action.payload.item.name;

        trackAction = {
          type: actionType.SURFACE_TURNED_OFF,
          annotation: actionAnnotation.CLEAR,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: action.payload.item.id,
          dataset_id: action.payload.datasetID,
          text: `${actionDescription.SURFACE} ${actionDescription.TURNED_OFF} ${objectType} ${objectName} of dataset: ${action.payload.datasetID}`
        };
      }
    } else if (action.type === customDatasetConstants.SET_ARROW_UP_DOWN) {
      let payload = action.payload;
      if (payload) {
        const proteinList = state.selectionReducers.proteinList;
        const complexList = state.selectionReducers.complexList;
        const fragmentDisplayList = state.selectionReducers.fragmentDisplayList;
        const surfaceList = state.selectionReducers.surfaceList;
        const densityList = state.selectionReducers.densityList;
        const vectorOnList = state.selectionReducers.vectorOnList;

        let item = payload.item;
        let newItem = payload.newItem;
        let objectType =
          item && item.isCrossReference === true ? actionObjectType.CROSS_REFERENCE : actionObjectType.COMPOUND;
        let objectTypeDescription =
          item && item.isCrossReference === true ? actionDescription.CROSS_REFERENCE : actionDescription.COMPOUND;
        let itemId = item?.id;
        let itemName = item?.name;
        let newItemName = newItem?.name;

        let data = Object.assign(
          { proteinList, complexList, fragmentDisplayList, surfaceList, densityList, vectorOnList },
          payload.data
        );

        trackAction = {
          type: actionType.ARROW_NAVIGATION,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: itemName,
          object_id: itemId,
          datasetID: payload.datasetID,
          item: item,
          newItem: newItem,
          data: data,
          arrowType: payload.arrowType,
          text: `${objectTypeDescription} ${actionDescription.MOVED} from: ${itemName} to ${newItemName}`
        };
      }
    } else if (action.type === customDatasetConstants.SET_TAB_VALUE) {
      if (action.payload) {
        let objectType = actionObjectType.COMPOUND;
        let objectName = action.payload.name;
        let objectId = action.payload.value;
        let oldObjectId = action.payload.oldValue;
        let oldObjectName = action.payload.oldName;

        trackAction = {
          type: actionType.TAB,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: objectId,
          oldObjectId: oldObjectId,
          oldObjectName: oldObjectName,
          text: `${actionDescription.TAB} ${objectName} ${actionDescription.SELECTED}`
        };
      }
    } else if (action.type === customDatasetConstants.SET_SELECTED_DATASET_INDEX) {
      if (action.payload) {
        let objectType = actionObjectType.COMPOUND;
        let objectName = action.payload.name;
        let objectId = action.payload.value;
        let oldObjectId = action.payload.oldValue;
        let oldObjectName = action.payload.oldName;

        trackAction = {
          type: actionType.DATASET_INDEX,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: objectName,
          object_id: objectId,
          oldObjectId: oldObjectId,
          oldObjectName: oldObjectName,
          text: `${actionDescription.DATASET} ${objectName} ${actionDescription.SELECTED}`
        };
      }
    } else if (action.type === customDatasetConstants.SET_DATASET_FILTER) {
      if (action.payload) {
        const filterProperties = state.datasetsReducers.filterPropertiesDatasetMap;
        const filterSettings = state.datasetsReducers.filterDatasetMap;

        let filterPropertiesOfDataset = filterProperties[action.payload.datasetID];
        let filterSettingsOfDataset = filterSettings[action.payload.datasetID];
        let newProperties = action.payload.properties;

        let objectType = actionObjectType.COMPOUND;
        let key = action.payload.key;
        let descriptionProperties = getFilterKeyChange(filterPropertiesOfDataset[key], newProperties[key]);

        trackAction = {
          type: actionType.DATASET_FILTER,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          oldProperties: filterPropertiesOfDataset,
          oldSettings: filterSettingsOfDataset,
          newProperties: newProperties,
          newSettings: action.payload.settings,
          dataset_id: action.payload.datasetID,
          key: key,
          text:
            key === 'clear'
              ? `Filter ${actionDescription.CHANGED} to default values of dataset: ${action.payload.datasetID}`
              : `Filter parameter: ${key} ${actionDescription.CHANGED} ${descriptionProperties} of dataset: ${action.payload.datasetID}`
        };
      }
    } else if (action.type === customDatasetConstants.SET_FILTER_SHOWED_SCORE_PROPERTIES) {
      if (action.payload) {
        let objectType = actionObjectType.COMPOUND;
        let valueDescription = action.payload.isChecked === true ? actionDescription.VISIBLE : actionDescription.HIDDEN;

        trackAction = {
          type: actionType.DATASET_FILTER_SCORE,
          annotation: actionAnnotation.CHECK,
          timestamp: Date.now(),
          username: username,
          object_type: objectType,
          object_name: action.payload.scoreName,
          isChecked: action.payload.isChecked,
          oldScoreList: action.payload.oldScoreList,
          newScoreList: action.payload.scoreList,
          dataset_id: action.payload.datasetID,
          text: `Filter parameter: ${action.payload.scoreName} ${actionDescription.CHANGED} to ${valueDescription} of dataset: ${action.payload.datasetID}`
        };
      }
    } else if (action.type === nglConstants.UPDATE_COMPONENT_REPRESENTATION_VISIBILITY) {
      let objectType = actionObjectType.REPRESENTATION;
      let value = action.newVisibility;
      let valueDescription = value === true ? actionDescription.VISIBLE : actionDescription.HIDDEN;

      trackAction = {
        type: actionType.REPRESENTATION_VISIBILITY_UPDATED,
        annotation: actionAnnotation.CHECK,
        timestamp: Date.now(),
        username: username,
        object_type: actionObjectType.REPRESENTATION,
        object_name: action.objectInViewID,
        object_id: action.objectInViewID,
        representation_id: action.representationID,
        representation: action.representation,
        value: value,
        text: `${objectType} '${action.representation?.type}' ${actionDescription.VISIBILITY} of ${action.objectInViewID} ${actionDescription.CHANGED} to: ${valueDescription}`
      };
    } else if (action.type === nglConstants.UPDATE_COMPONENT_REPRESENTATION_VISIBILITY_ALL) {
      let objectType = actionObjectType.REPRESENTATION;
      let value = action.newVisibility;
      let valueDescription = value === true ? actionDescription.VISIBLE : actionDescription.HIDDEN;

      trackAction = {
        type: actionType.REPRESENTATION_VISIBILITY_ALL_UPDATED,
        annotation: actionAnnotation.CHECK,
        timestamp: Date.now(),
        username: username,
        object_type: actionObjectType.REPRESENTATION,
        object_name: action.objectInViewID,
        object_id: action.objectInViewID,
        value: value,
        text: `${objectType} ${actionDescription.VISIBILITY} of ${action.objectInViewID} ${actionDescription.CHANGED} to: ${valueDescription}`
      };
    } else if (action.type === nglConstants.UPDATE_COMPONENT_REPRESENTATION) {
      let objectType = actionObjectType.REPRESENTATION;
      let key = action.change?.key;
      let oldValue = action.change?.oldValue;
      let newValue = action.change?.value;
      let valueDescription =
        key !== 'clipCenter'
          ? `from value: ${oldValue} to value: ${newValue}`
          : getClipCenterChange(oldValue, newValue);

      trackAction = {
        type: actionType.REPRESENTATION_UPDATED,
        annotation: actionAnnotation.CHECK,
        timestamp: Date.now(),
        username: username,
        object_type: actionObjectType.REPRESENTATION,
        object_name: action.objectInViewID,
        object_id: action.objectInViewID,
        representation_id: action.representationID,
        representation: action.newRepresentation,
        change: action.change,
        text: `${objectType} '${key}' of ${action.objectInViewID} ${actionDescription.UPDATED} ${valueDescription}`
      };
    } else if (action.type === nglConstants.ADD_COMPONENT_REPRESENTATION) {
      let objectType = actionObjectType.REPRESENTATION;
      let representationName = action.newRepresentation && action.newRepresentation.type;

      trackAction = {
        type: actionType.REPRESENTATION_ADDED,
        annotation: actionAnnotation.CHECK,
        timestamp: Date.now(),
        username: username,
        object_type: actionObjectType.REPRESENTATION,
        object_name: representationName,
        object_id: action.objectInViewID,
        representation: action.newRepresentation,
        text: `${objectType} '${representationName}' of ${action.objectInViewID} ${actionDescription.ADDED}`
      };
    } else if (action.type === nglConstants.REMOVE_COMPONENT_REPRESENTATION) {
      let objectType = actionObjectType.REPRESENTATION;
      let representationName = action.representation && action.representation.type;

      trackAction = {
        type: actionType.REPRESENTATION_REMOVED,
        annotation: actionAnnotation.CLEAR,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: representationName,
        object_id: action.objectInViewID,
        representation: action.representation,
        text: `${objectType} '${representationName}' of ${action.objectInViewID} ${actionDescription.REMOVED}`
      };
    } else if (action.type === nglConstants.CHANGE_COMPONENT_REPRESENTATION) {
      let objectType = actionObjectType.REPRESENTATION;
      let oldRepresentationName = action.oldRepresentation && action.oldRepresentation.type;
      let newRepresentationName = action.newRepresentation && action.newRepresentation.type;

      trackAction = {
        type: actionType.REPRESENTATION_CHANGED,
        annotation: actionAnnotation.CHECK,
        timestamp: Date.now(),
        username: username,
        object_type: objectType,
        object_name: action.objectInViewID,
        object_id: action.objectInViewID,
        oldRepresentation: action.oldRepresentation,
        newRepresentation: action.newRepresentation,
        text: `${objectType} of ${action.objectInViewID} ${actionDescription.CHANGED} from value: ${oldRepresentationName} to value: ${newRepresentationName}`
      };
    } else if (action.type === nglConstants.SET_BACKGROUND_COLOR) {
      let oldSetting = action.payload === BACKGROUND_COLOR.white ? BACKGROUND_COLOR.black : BACKGROUND_COLOR.white;
      let newSetting = action.payload;

      trackAction = {
        type: actionType.BACKGROUND_COLOR_CHANGED,
        annotation: actionAnnotation.CHECK,
        timestamp: Date.now(),
        username: username,
        object_type: 'NGL',
        object_name: 'NGL',
        oldSetting: oldSetting,
        newSetting: newSetting,
        text: `Color of NGL ${actionDescription.CHANGED} to value: ${newSetting}`
      };
    } else if (action.type === nglConstants.SET_CLIP_NEAR) {
      let oldSetting = action.payload.oldValue;
      let newSetting = action.payload.newValue;

      trackAction = {
        type: actionType.CLIP_NEAR,
        merge: true,
        annotation: actionAnnotation.CHECK,
        timestamp: Date.now(),
        username: username,
        object_type: 'NGL',
        object_name: 'NGL',
        oldSetting: oldSetting,
        newSetting: newSetting,
        getText: function() {
          return (
            'Clip near of NGL ' +
            actionDescription.CHANGED +
            ' from value: ' +
            this.oldSetting +
            ' to value: ' +
            this.newSetting
          );
        },
        text: `Clip near of NGL ${actionDescription.CHANGED} to value: ${newSetting}`
      };
    } else if (action.type === nglConstants.SET_CLIP_FAR) {
      let oldSetting = action.payload.oldValue;
      let newSetting = action.payload.newValue;

      trackAction = {
        type: actionType.CLIP_FAR,
        merge: true,
        annotation: actionAnnotation.CHECK,
        timestamp: Date.now(),
        username: username,
        object_type: 'NGL',
        object_name: 'NGL',
        oldSetting: oldSetting,
        newSetting: newSetting,
        getText: function() {
          return (
            'Clip far of NGL ' +
            actionDescription.CHANGED +
            ' from value: ' +
            this.oldSetting +
            ' to value: ' +
            this.newSetting
          );
        },
        text: `Clip far of NGL ${actionDescription.CHANGED} to value: ${newSetting}`
      };
    } else if (action.type === nglConstants.SET_CLIP_DIST) {
      let oldSetting = action.payload.oldValue;
      let newSetting = action.payload.newValue;

      trackAction = {
        type: actionType.CLIP_DIST,
        merge: true,
        annotation: actionAnnotation.CHECK,
        timestamp: Date.now(),
        username: username,
        object_type: 'NGL',
        object_name: 'NGL',
        oldSetting: oldSetting,
        newSetting: newSetting,
        getText: function() {
          return (
            'Clip dist of NGL ' +
            actionDescription.CHANGED +
            ' from value: ' +
            this.oldSetting +
            ' to value: ' +
            this.newSetting
          );
        },
        text: `Clip dist of NGL ${actionDescription.CHANGED} to value: ${newSetting}`
      };
    } else if (action.type === nglConstants.SET_FOG_NEAR) {
      let oldSetting = action.payload.oldValue;
      let newSetting = action.payload.newValue;

      trackAction = {
        type: actionType.FOG_NEAR,
        merge: true,
        annotation: actionAnnotation.CHECK,
        timestamp: Date.now(),
        username: username,
        object_type: 'NGL',
        object_name: 'NGL',
        oldSetting: oldSetting,
        newSetting: newSetting,
        getText: function() {
          return (
            'Fog near of NGL ' +
            actionDescription.CHANGED +
            ' from value: ' +
            this.oldSetting +
            ' to value: ' +
            this.newSetting
          );
        },
        text: `Fog near of NGL ${actionDescription.CHANGED} to value: ${newSetting}`
      };
    } else if (action.type === nglConstants.SET_FOG_FAR) {
      let oldSetting = action.payload.oldValue;
      let newSetting = action.payload.newValue;

      trackAction = {
        type: actionType.FOG_FAR,
        merge: true,
        annotation: actionAnnotation.CHECK,
        timestamp: Date.now(),
        username: username,
        object_type: 'NGL',
        object_name: 'NGL',
        oldSetting: oldSetting,
        newSetting: newSetting,
        getText: function() {
          return (
            'Fog far of NGL ' +
            actionDescription.CHANGED +
            ' from value: ' +
            this.oldSetting +
            ' to value: ' +
            this.newSetting
          );
        },
        text: `Fog far of NGL ${actionDescription.CHANGED} to value: ${newSetting}`
      };
    }
  }
  return trackAction;
};

const getMoleculeTitle = (objectName, targetName) => {
  let title = objectName.replace(new RegExp(`${targetName}-`, 'i'), '');
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

const getClipCenterChange = (oldValue, newValue) => {
  let description = '';
  if (oldValue && newValue) {
    if (oldValue.x !== newValue.x) {
      description += ' from value: x:' + oldValue.x + ' to value: x:' + newValue.x;
    }
    if (oldValue.y !== newValue.y) {
      description += ' from value: y:' + oldValue.y + ' to value: y:' + newValue.y;
    }
    if (oldValue.z !== newValue.z) {
      description += ' from value: z:' + oldValue.z + ' to value: z:' + newValue.z;
    }
  }
  return description;
};

const getFilterKeyChange = (oldValue, newValue) => {
  let description = '';
  if (oldValue && newValue) {
    if (oldValue.order !== newValue.order) {
      description +=
        ' from value: order: ' +
        getOrderDescription(oldValue.order) +
        ' to value: order: ' +
        getOrderDescription(newValue.order);
      return description;
    } else if (oldValue.newPrio !== newValue.newPrio) {
      description +=
        ' from value: priority: ' + (newValue.oldPrio + 1) + ' to value: priority: ' + (newValue.newPrio + 1);
      return description;
    } else {
      if (oldValue.isBoolean === true) {
        if (oldValue.minValue !== newValue.minValue) {
          return (
            ' from value: ' +
            getBooleanDescription(oldValue.minValue) +
            ' to value: ' +
            getBooleanDescription(newValue.minValue)
          );
        } else if (oldValue.maxValue !== newValue.maxValue) {
          return (
            ' from value: ' +
            getBooleanDescription(oldValue.maxValue) +
            ' to value: ' +
            getBooleanDescription(newValue.maxValue)
          );
        } else {
          return ' to value: ignore';
        }
      } else {
        if (oldValue.minValue !== newValue.minValue) {
          return ' from value: ' + oldValue.minValue + ' to value: ' + newValue.minValue;
        } else if (oldValue.maxValue !== newValue.maxValue) {
          return ' from value: max: ' + oldValue.maxValue + ' to value: max: ' + newValue.maxValue;
        }
      }
    }
  }
  return description;
};

const getOrderDescription = order => {
  let description = '';
  if (order === 1) {
    return 'up';
  }

  if (order === -1) {
    return 'down';
  }

  if (order === 0) {
    return 'ignore';
  }
  return description;
};

const getBooleanDescription = value => {
  let description = '';
  if (value === 1) {
    return 'false';
  }

  if (value === 50) {
    return 'ignore';
  }

  if (value === 100) {
    return 'true';
  }
  return description;
};

export const createInitAction = target_on => (dispatch, getState) => {
  const state = getState();
  const username = DJANGO_CONTEXT['username'];

  if (target_on) {
    let targetName = getTargetName(target_on, state);
    let trackAction = {
      type: actionType.TARGET_LOADED,
      timestamp: Date.now(),
      username: username,
      object_type: actionObjectType.TARGET,
      object_name: targetName,
      object_id: target_on,
      text: `${actionDescription.TARGET} ${targetName} ${actionDescription.LOADED}`
    };

    return trackAction;
  }
};
