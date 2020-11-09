/**
 * Created by abradley on 03/03/2018.
 */
import { CONSTANTS } from './constants';

export const loadNglObject = (target, representations) => ({ type: CONSTANTS.LOAD_OBJECT, target, representations });

export const deleteNglObject = target => ({
  type: CONSTANTS.DELETE_OBJECT,
  target
});

export const updateComponentRepresentation = (objectInViewID, representationID, newRepresentation) => ({
  type: CONSTANTS.UPDATE_COMPONENT_REPRESENTATION,
  representationID,
  newRepresentation,
  objectInViewID
});

export const addComponentRepresentation = (objectInViewID, newRepresentation) => ({
  type: CONSTANTS.ADD_COMPONENT_REPRESENTATION,
  newRepresentation,
  objectInViewID
});

export const removeComponentRepresentation = (objectInViewID, representation) => ({
  type: CONSTANTS.REMOVE_COMPONENT_REPRESENTATION,
  representation,
  objectInViewID
});

export const setNglViewParams = (key, value, stage = undefined) => {
  if (stage) {
    stage.setParameters({ [key]: value });
  }
  return {
    type: CONSTANTS.SET_NGL_VIEW_PARAMS,
    key,
    value
  };
};

export const setNglOrientation = (orientation, div_id) => ({ type: CONSTANTS.SET_ORIENTATION, orientation, div_id });

export const setProteinLoadingState = hasLoaded => ({ type: CONSTANTS.SET_PROTEINS_HAS_LOADED, payload: hasLoaded });

export const setNglStateFromCurrentSnapshot = snapshot => ({
  type: CONSTANTS.SET_NGL_STATE_FROM_CURRENT_SNAPSHOT,
  payload: snapshot
});

export const removeAllNglComponents = (stage = undefined) => ({ type: CONSTANTS.REMOVE_ALL_NGL_COMPONENTS, stage });

export const setCountOfRemainingMoleculeGroups = count => ({
  type: CONSTANTS.SET_COUNT_OF_REMAINING_MOLECULE_GROUPS,
  payload: count
});

export const decrementCountOfRemainingMoleculeGroups = decrementedCount => ({
  type: CONSTANTS.DECREMENT_COUNT_OF_REMAINING_MOLECULE_GROUPS,
  payload: decrementedCount
});

export const incrementCountOfPendingNglObjects = NglViewId => ({
  type: CONSTANTS.INCREMENT_COUNT_OF_PENDING_NGL_OBJECTS,
  payload: NglViewId
});

export const decrementCountOfPendingNglObjects = NglViewId => ({
  type: CONSTANTS.DECREMENT_COUNT_OF_PENDING_NGL_OBJECTS,
  payload: NglViewId
});

export const appendMoleculeOrientation = (moleculeID, orientation) => ({
  type: CONSTANTS.APPEND_MOLECULE_ORIENTATION,
  payload: { moleculeID, orientation }
});

export const setMoleculeOrientations = moleculeOrientations => ({
  type: CONSTANTS.SET_MOLECULE_ORIENTATIONS,
  payload: moleculeOrientations
});

export const removeMoleculeOrientation = moleculeGroupID => ({
  type: CONSTANTS.REMOVE_MOLECULE_ORIENTATION,
  payload: moleculeGroupID
});
