/**
 * Created by abradley on 15/03/2018.
 */

import { constants } from './constants';

export const setToBuyList = function(to_buy_list) {
  return {
    type: constants.SET_TO_BUY_LIST,
    to_buy_list: to_buy_list
  };
};

export const appendToBuyList = function(item) {
  return {
    type: constants.APPEND_TO_BUY_LIST,
    item: item
  };
};

export const removeFromToBuyList = function(item) {
  return {
    type: constants.REMOVE_FROM_TO_BUY_LIST,
    item: item
  };
};

export const setVectorList = function(vectList) {
  return {
    type: constants.SET_VECTOR_LIST,
    vector_list: vectList
  };
};

export const setCurrentVector = vectorSmile => {
  return {
    type: constants.SET_CURRENT_VECTOR,
    payload: vectorSmile
  };
};

export const setFragmentDisplayList = function(fragmentDisplayList) {
  return {
    type: constants.SET_FRAGMENT_DISPLAY_LIST,
    fragmentDisplayList: fragmentDisplayList
  };
};

export const appendFragmentDisplayList = function(item) {
  return {
    type: constants.APPEND_FRAGMENT_DISPLAY_LIST,
    item: item
  };
};

export const removeFromFragmentDisplayList = function(item) {
  return {
    type: constants.REMOVE_FROM_FRAGMENT_DISPLAY_LIST,
    item: item
  };
};

export const setProteinList = function(proteinList) {
  return {
    type: constants.SET_PROTEIN_LIST,
    proteinList: proteinList
  };
};

export const appendProteinList = function(item) {
  return {
    type: constants.APPEND_PROTEIN_LIST,
    item: item
  };
};

export const removeFromProteinList = function(item) {
  return {
    type: constants.REMOVE_FROM_PROTEIN_LIST,
    item: item
  };
};
export const setComplexList = function(complexList) {
  return {
    type: constants.SET_COMPLEX_LIST,
    complexList: complexList
  };
};

export const appendComplexList = function(item) {
  return {
    type: constants.APPEND_COMPLEX_LIST,
    item: item
  };
};

export const removeFromComplexList = function(item) {
  return {
    type: constants.REMOVE_FROM_COMPLEX_LIST,
    item: item
  };
};

export const setSurfaceList = function(surfaceList) {
  return {
    type: constants.SET_SURFACE_LIST,
    surfaceList: surfaceList
  };
};

export const appendSurfaceList = function(item) {
  return {
    type: constants.APPEND_SURFACE_LIST,
    item: item
  };
};

export const removeFromSurfaceList = function(item) {
  return {
    type: constants.REMOVE_FROM_SURFACE_LIST,
    item: item
  };
};

export const setDensityList = function(densityList) {
  return {
    type: constants.SET_DENSITY_LIST,
    densityList: densityList
  };
};

export const appendDensityList = function(item) {
  return {
    type: constants.APPEND_DENSITY_LIST,
    item: item
  };
};

export const removeFromDensityList = function(item) {
  return {
    type: constants.REMOVE_FROM_DENSITY_LIST,
    item: item
  };
};

export const setVectorOnList = function(vectorOnList) {
  return {
    type: constants.SET_VECTOR_ON_LIST,
    vectorOnList: vectorOnList
  };
};

export const appendVectorOnList = function(item) {
  return {
    type: constants.APPEND_VECTOR_ON_LIST,
    item: item
  };
};

export const removeFromVectorOnList = function(item) {
  return {
    type: constants.REMOVE_FROM_VECTOR_ON_LIST,
    item: item
  };
};

export const reloadSelectionReducer = savedSelectionReducers => {
  return {
    type: constants.RELOAD_SELECTION_REDUCER,
    payload: savedSelectionReducers
  };
};

export const resetSelectionState = function() {
  return {
    type: constants.RESET_SELECTION_STATE
  };
};
export const incrementCountOfPendingVectorLoadRequests = () => {
  return {
    type: constants.INCREMENT_COUNT_OF_PENDING_VECTOR_LOAD_REQUESTS
  };
};

export const decrementCountOfPendingVectorLoadRequests = () => {
  return {
    type: constants.DECREMENT_COUNT_OF_PENDING_VECTOR_LOAD_REQUESTS
  };
};

export const setMolGroupSelection = mol_group_selection => ({
  type: constants.SET_MOL_GROUP_SELECTION,
  mol_group_selection
});

export const setObjectSelection = object_selection => ({
  type: constants.SET_OBJECT_SELECTION,
  payload: object_selection
});

export const setFilter = filter => {
  return {
    type: constants.SET_FILTER,
    payload: filter
  };
};

export const resetCompoundsOfVectors = () => ({
  type: constants.RESET_COMPOUNDS_OF_VECTORS
});

export const updateVectorCompounds = (key, value) => ({
  type: constants.UPDATE_VECTOR_COMPOUNDS,
  payload: { key, value }
});

export const resetBondColorMapOfVectors = () => ({
  type: constants.RESET_BOND_COLOR_MAP_OF_VECTORS
});

export const updateBondColorMapOfCompounds = (key, value) => ({
  type: constants.UPDATE_BOND_COLOR_MAP_OF_COMPOUNDS,
  payload: { key, value }
});
