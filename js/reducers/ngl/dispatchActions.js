import {
  decrementCountOfPendingNglObjects,
  decrementCountOfRemainingMoleculeGroups,
  deleteNglObject,
  incrementCountOfPendingNglObjects,
  loadNglObject,
  resetStateToDefaultScene,
  resetStateToSessionScene,
  saveCurrentStateAsDefaultScene,
  setMoleculeOrientations,
  setNglOrientation,
  setNglViewParams,
  setProteinLoadingState
} from './actions';
import { isEmpty, isEqual } from 'lodash';
import { SCENES } from './constants';
import { createRepresentationsArray } from '../../components/nglView/generatingObjects';
import { SELECTION_TYPE } from '../../components/nglView/constants';
import { removeFromComplexList, removeFromFragmentDisplayList, removeFromVectorOnList } from '../selection/actions';
import { nglObjectDictionary } from '../../components/nglView/renderingObjects';

export const loadObject = (target, stage, previousRepresentations, orientationMatrix) => dispatch => {
  if (stage) {
    dispatch(incrementCountOfPendingNglObjects());
    return nglObjectDictionary[target.OBJECT_TYPE](
      stage,
      target,
      target.name,
      previousRepresentations,
      orientationMatrix
    )
      .then(representations => dispatch(loadNglObject(target, representations)))
      .catch(error => {
        console.error(error);
      })
      .finally(() => dispatch(decrementCountOfPendingNglObjects()));
  }
  return Promise.reject('Instance of NGL View is missing');
};

export const deleteObject = (target, stage, deleteFromSelections) => dispatch => {
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

  dispatch(deleteNglObject(target));
};

export const decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState = () => (dispatch, getState) => {
  const state = getState();
  const decrementedCount = state.nglReducers.countOfRemainingMoleculeGroups - 1;
  if (decrementedCount === 0 && state.nglReducers.proteinsHasLoaded === true) {
    dispatch(saveCurrentStateAsDefaultScene());
  }
  dispatch(decrementCountOfRemainingMoleculeGroups(decrementedCount));
};

// Helper actions for marking that protein and molecule groups are successful loaded
export const setProteinsHasLoaded = (hasLoaded = false, withoutSavingToDefaultState = false) => (
  dispatch,
  getState
) => {
  const state = getState();
  if (
    state.nglReducers.countOfRemainingMoleculeGroups === 0 &&
    hasLoaded === true &&
    withoutSavingToDefaultState === false
  ) {
    dispatch(saveCurrentStateAsDefaultScene());
  }
  dispatch(setProteinLoadingState(hasLoaded));
};

export const setOrientation = (div_id, orientation) => (dispatch, getState) => {
  const nglOrientations = getState().nglReducers.nglOrientations;

  if (
    orientation &&
    ((nglOrientations && nglOrientations[div_id] && !isEqual(orientation.elements, nglOrientations[div_id].elements)) ||
      isEmpty(nglOrientations) ||
      (nglOrientations && nglOrientations[div_id] === undefined))
  ) {
    // TODO Zoom out (about 2x demagnification) from whatever value it currently calculates
    orientation.elements[0] = 10 + orientation.elements[0];
    orientation.elements[5] = 10 + orientation.elements[5];
    orientation.elements[10] = 10 + orientation.elements[10];
    dispatch(setNglOrientation(orientation, div_id));
  }
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
  const currentScene = (sessionData && sessionData.nglReducers[scene]) || getState().nglReducers[scene];
  switch (scene) {
    case SCENES.defaultScene:
      dispatch(resetStateToDefaultScene());
      break;
    case SCENES.sessionScene:
      dispatch(resetStateToSessionScene(sessionData));
      break;
  }
  // Remove all components in NGL View
  stage.removeAllComponents();

  // Reconstruction of state in NGL View from currentScene data
  // objectsInView
  return Promise.all(
    Object.keys(currentScene.objectsInView || {}).map(objInView => {
      if (currentScene.objectsInView[objInView].display_div === display_div) {
        let representations = currentScene.objectsInView[objInView].representations;
        return dispatch(
          loadObject(currentScene.objectsInView[objInView], stage, createRepresentationsArray(representations))
        );
      } else {
        return Promise.resolve();
      }
    })
  ).finally(() => {
    // loop over nglViewParams
    Object.keys(currentScene.viewParams).forEach(param => {
      dispatch(setNglViewParams(param, currentScene.viewParams[param], stage));
    });

    // nglOrientations
    const newOrientation = currentScene.nglOrientations[display_div];
    if (newOrientation) {
      stage.viewerControls.orient(newOrientation.elements);
    }

    // set molecule orientations
    if (currentScene.moleculeOrientations) {
      dispatch(setMoleculeOrientations(currentScene.moleculeOrientations));
    }
  });
};
