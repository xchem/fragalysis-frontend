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

export const removeComponentRepresentation = (objectInViewID, representationID) => ({
  type: CONSTANTS.REMOVE_COMPONENT_REPRESENTATION,
  representationID,
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

export const saveCurrentStateAsDefaultScene = () => ({ type: CONSTANTS.SAVE_NGL_STATE_AS_DEFAULT_SCENE });

export const saveCurrentStateAsSessionScene = () => ({ type: CONSTANTS.SAVE_NGL_STATE_AS_SESSION_SCENE });

export const resetStateToDefaultScene = () => ({ type: CONSTANTS.RESET_NGL_VIEW_TO_DEFAULT_SCENE });

export const resetStateToSessionScene = sessionData => ({
  type: CONSTANTS.RESET_NGL_VIEW_TO_SESSION_SCENE,
  payload: sessionData
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

export const incrementCountOfPendingNglObjects = () => ({
  type: CONSTANTS.INCREMENT_COUNT_OF_PENDING_NGL_OBJECTS
});

export const decrementCountOfPendingNglObjects = () => ({
  type: CONSTANTS.DECREMENT_COUNT_OF_PENDING_NGL_OBJECTS
});

export const setMoleculeOrientation = (moleculeGroupID, orientation) => ({
  type: CONSTANTS.SET_MOLECULE_ORIENTATION,
  payload: { moleculeGroupID, orientation }
});

export const removeMoleculeOrientation = moleculeGroupID => ({
  type: CONSTANTS.REMOVE_MOLECULE_ORIENTATION,
  payload: moleculeGroupID
});
