/**
 * Created by abradley on 03/03/2018.
 */
import { CONSTANTS } from './nglConstants';
import { defaultFocus, nglObjectDictionary } from './renderingHelpers';
import { OBJECT_TYPE } from '../../components/nglView/constants';

export const loadObject = (target, stage) => dispatch => {
  if (stage) {
    return nglObjectDictionary[target.OBJECT_TYPE](stage, target, target.name)
      .then(() =>
        dispatch({
          type: CONSTANTS.LOAD_OBJECT,
          target
        })
      )
      .catch(error => {
        console.error(error);
      });
  }
  return Promise.reject('Instance of NGL View is missing');
};

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

export const deleteObject = (target, stage) => {
  const comps = stage.getComponentsByName(target.name);
  for (let component in comps.list) {
    stage.removeComponent(comps.list[component]);
  }
  // Reset focus after receive ResetFocus object
  if (target.OBJECT_TYPE === OBJECT_TYPE.RESET_FOCUS) {
    stage.setFocus(defaultFocus);
    stage.autoView();
  }
  return {
    type: CONSTANTS.DELETE_OBJECT,
    target
  };
};

export const setLoadingState = function(bool) {
  return {
    type: CONSTANTS.SET_LOADING_STATE,
    loadingState: bool
  };
};

export const setBackgroundColor = (backgroundColor, stage) => {
  stage.setParameters({ backgroundColor: backgroundColor });
  return {
    type: CONSTANTS.SET_BACKGROUND_COLOR,
    backgroundColor,
    stage
  };
};

export const resetNglView = stage => ({ type: CONSTANTS.RESET_NGL_VIEW_TO_DEFAULT_SCENE, stage });

export const saveCurrentStateAsDefaultScene = stage => ({ type: CONSTANTS.SAVE_NGL_STATE_AS_DEFAULT_SCENE, stage });

export const clearNglView = stage => ({ type: CONSTANTS.REMOVE_ALL_NGL_COMPONENTS, stage });

// Helper actions for marking that protein and molecule groups are successful loaded
export const setProteinsHasLoad = hasLoad => (dispatch, getState) => {
  const state = getState();
  if (state.nglReducers.present.countOfRemainingMoleculeGroups === 0 && hasLoad === true) {
    dispatch(saveCurrentStateAsDefaultScene());
  }
  dispatch({ type: CONSTANTS.SET_PROTEINS_HAS_LOAD, payload: hasLoad });
};

export const setCountOfRemainingMoleculeGroups = count => ({
  type: CONSTANTS.SET_COUNT_OF_REMAINING_MOLECULE_GROUPS,
  payload: count
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
