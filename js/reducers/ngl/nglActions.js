/**
 * Created by abradley on 03/03/2018.
 */
import { CONSTANTS, SCENES } from './nglConstants';
import { nglObjectDictionary } from '../../components/nglView/renderingObjects';
import { SELECTION_TYPE } from '../../components/nglView/constants';
import {
  removeFromComplexList,
  removeFromFragmentDisplayList,
  removeFromVectorOnList
} from '../selection/selectionActions';
import { createRepresentationsArray } from '../../components/nglView/generatingObjects';

export const loadObject = (target, stage, previousRepresentations) => dispatch => {
  if (stage) {
    dispatch(incrementCountOfPendingNglObjects());
    return nglObjectDictionary[target.OBJECT_TYPE](stage, target, target.name, previousRepresentations)
      .then(representations =>
        dispatch({
          type: CONSTANTS.LOAD_OBJECT,
          target,
          representations
        })
      )
      .catch(error => {
        console.error(error);
      })
      .finally(() => dispatch(decrementCountOfPendingNglObjects()));
  }
  return Promise.reject('Instance of NGL View is missing');
};

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

export const setOrientation = function(div_id, orientation) {
  return {
    type: CONSTANTS.SET_ORIENTATION,
    orientation: orientation,
    div_id: div_id
  };
};

export const setNGLOrientation = function(div_id, orientation) {
  return {
    type: CONSTANTS.SET_NGL_ORIENTATION,
    orientation: orientation,
    div_id: div_id
  };
};

export const deleteObject = (target, stage, deleteFromSelections) => (dispatch, getState) => {
  const comps = stage.getComponentsByName(target.name);
  comps.list.forEach(component => stage.removeComponent(component));
  if (deleteFromSelections === true && target && target.selectionType && target.moleculeId) {
    const objectId = { id: target.moleculeId };
    switch (target.selectionType) {
      case SELECTION_TYPE.LIGAND:
        dispatch(removeFromFragmentDisplayList(objectId));
        break;
      case SELECTION_TYPE.COMPLEX:
        dispatch(removeFromComplexList(objectId));
        break;
      case SELECTION_TYPE.VECTOR:
        dispatch(removeFromVectorOnList(objectId));
        break;
    }
  }

  dispatch({
    type: CONSTANTS.DELETE_OBJECT,
    target
  });
};

export const setLoadingState = function(bool) {
  return {
    type: CONSTANTS.SET_LOADING_STATE,
    loadingState: bool
  };
};

export const setNglViewParams = (key, value, stage) => {
  stage.setParameters({ [key]: value });
  return {
    type: CONSTANTS.SET_NGL_VIEW_PARAMS,
    key,
    value
  };
};

/**
 *
 * @param stage - instance of NGL view
 * @param display_div - id of NGL View div
 * @param scene - type of scene (default or session)
 * @param sessionData - new session data loaded from API
 * @returns {function(...[*]=)}
 */
export const reloadNglViewFromScene = (stage, display_div, scene, sessionData) => (dispatch, getState) => {
  const currentScene =
    sessionData !== undefined ? sessionData.nglReducers.present[scene] : getState().nglReducers.present[scene];
  switch (scene) {
    case SCENES.defaultScene:
      dispatch({
        type: CONSTANTS.RESET_NGL_VIEW_TO_DEFAULT_SCENE
      });
      break;
    case SCENES.sessionScene:
      dispatch({
        type: CONSTANTS.RESET_NGL_VIEW_TO_SESSION_SCENE,
        payload: sessionData
      });
      break;
  }
  // Remove all components in NGL View
  stage.removeAllComponents();

  // Reconstruction of state in NGL View from currentScene data
  // objectsInView
  Object.keys(currentScene.objectsInView || {}).forEach(objInView => {
    if (currentScene.objectsInView[objInView].display_div === display_div) {
      dispatch(
        loadObject(
          currentScene.objectsInView[objInView],
          stage,
          createRepresentationsArray(currentScene.objectsInView[objInView].representations)
        )
      );
    }
  });

  // loop over nglViewParams
  Object.keys(currentScene.viewParams).forEach(param => {
    dispatch(setNglViewParams(param, currentScene.viewParams[param], stage));
  });

  // nglOrientations???
  // orientationToSet???
};

export const saveCurrentStateAsDefaultScene = () => ({ type: CONSTANTS.SAVE_NGL_STATE_AS_DEFAULT_SCENE });

export const saveCurrentStateAsSessionScene = () => ({ type: CONSTANTS.SAVE_NGL_STATE_AS_SESSION_SCENE });

export const clearNglView = stage => ({ type: CONSTANTS.REMOVE_ALL_NGL_COMPONENTS, stage });

// Helper actions for marking that protein and molecule groups are successful loaded
export const setProteinsHasLoaded = hasLoad => (dispatch, getState) => {
  const state = getState();
  if (state.nglReducers.present.countOfRemainingMoleculeGroups === 0 && hasLoad === true) {
    dispatch(saveCurrentStateAsDefaultScene());
  }
  dispatch({ type: CONSTANTS.SET_PROTEINS_HAS_LOADED, payload: hasLoad });
};

export const setCountOfRemainingMoleculeGroups = count => ({
  type: CONSTANTS.SET_COUNT_OF_REMAINING_MOLECULE_GROUPS,
  payload: count
});

export const incrementCountOfPendingNglObjects = () => ({
  type: CONSTANTS.INCREMENT_COUNT_OF_PENDING_NGL_OBJECTS
});

export const decrementCountOfPendingNglObjects = () => ({
  type: CONSTANTS.DECREMENT_COUNT_OF_PENDING_NGL_OBJECTS
});

export const decrementCountOfRemainingMoleculeGroups = () => (dispatch, getState) => {
  const state = getState();
  const decrementedCount = state.nglReducers.present.countOfRemainingMoleculeGroups - 1;
  if (decrementedCount === 0 && state.nglReducers.present.proteinsHasLoad === true) {
    dispatch(saveCurrentStateAsDefaultScene());
  }
  dispatch({
    type: CONSTANTS.DECREMENT_COUNT_OF_REMAINING_MOLECULE_GROUPS,
    payload: decrementedCount
  });
};
