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

export const setInitialFullGraph = function(item) {
  return {
    type: constants.SET_INITIAL_FULL_GRAPH,
    item: item
  };
};

export const updateFullGraph = function(result) {
  return {
    type: constants.UPDATE_FULL_GRAPH,
    input_mol_dict: result
  };
};

export const setBondColorMap = function(result) {
  return {
    type: constants.SET_BOND_COLOR_MAP,
    bondColorMap: result
  };
};

export const setToQuery = function(to_query) {
  return {
    type: constants.SET_TO_QUERY,
    to_query
  };
};

export const setVectorList = function(vectList) {
  return {
    type: constants.SET_VECTOR_LIST,
    vector_list: vectList
  };
};

export const selectVector = function(vector) {
  return {
    type: constants.SELECT_VECTOR,
    vector: vector
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

export const reloadSelectionReducer = function(savedSelectionReducers) {
  return {
    type: constants.RELOAD_SELECTION_REDUCER,
    savedSelectionReducers
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

export const setFilterSettings = filterSettings => ({
  type: constants.SET_FILTER_SETTINGS,
  payload: filterSettings
});
