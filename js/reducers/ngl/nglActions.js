/**
 * Created by abradley on 03/03/2018.
 */
import {
  LOAD_OBJECT,
  DELETE_OBJECT,
  SET_ORIENTATION,
  SET_NGL_ORIENTATION,
  SET_LOADING_STATE,
  SET_BACKGROUND_COLOR
} from '../actonTypes';
import { CONSTANTS } from './nglConstants';
import { nglObjectDictionary } from './renderingHelpers';

export const loadObject = (target, stage) => {
  if (stage) {
    nglObjectDictionary[target.OBJECT_TYPE](stage, target, target.name);
  }
  return {
    type: LOAD_OBJECT,
    target
  };
};

export const setOrientation = function(div_id, orientation) {
  return {
    type: SET_ORIENTATION,
    orientation: orientation,
    div_id: div_id
  };
};

export const setNGLOrientation = function(div_id, orientation) {
  return {
    type: SET_NGL_ORIENTATION,
    orientation: orientation,
    div_id: div_id
  };
};

export const deleteObject = (target, stage) => {
  return {
    type: DELETE_OBJECT,
    target
  };
};

export const setLoadingState = function(bool) {
  return {
    type: SET_LOADING_STATE,
    loadingState: bool
  };
};

export const setBackgroundColor = (backgroundColor, stage) => {
  stage.setParameters({ backgroundColor: backgroundColor });
  return {
    type: SET_BACKGROUND_COLOR,
    backgroundColor,
    stage
  };
};

export const populateNglView = stage => ({ type: CONSTANTS.POPULATE_VIEW, stage });

export const clearNglView = stage => ({ type: CONSTANTS.CLEAR_VIEW, stage });
