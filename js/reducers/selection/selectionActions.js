/**
 * Created by abradley on 15/03/2018.
 */

import {
  SET_TO_BUY_LIST,
  APPEND_TO_BUY_LIST,
  REMOVE_FROM_TO_BUY_LIST,
  SET_INITIAL_FULL_GRAPH,
  UPDATE_FULL_GRAPH,
  SET_VECTOR_LIST,
  SELECT_VECTOR,
  SET_TO_QUERY,
  SET_FRAGMENT_DISPLAY_LIST,
  APPEND_FRAGMENT_DISPLAY_LIST,
  REMOVE_FROM_FRAGMENT_DISPLAY_LIST,
  SET_COMPLEX_LIST,
  APPEND_COMPLEX_LIST,
  REMOVE_FROM_COMPLEX_LIST,
  SET_VECTOR_ON_LIST,
  APPEND_VECTOR_ON_LIST,
  REMOVE_FROM_VECTOR_ON_LIST,
  SET_HIGHLIGHTED,
  SET_COMPOUND_CLASSES,
  RELOAD_SELECTION_REDUCER,
  SET_BOND_COLOR_MAP,
  RESET_SELECTION_STATE,
  SET_MOL_GROUP_SELECTION
} from '../actonTypes';
import { constants } from './selectionConstants';

export const setToBuyList = function(to_buy_list) {
  return {
    type: SET_TO_BUY_LIST,
    to_buy_list: to_buy_list
  };
};

export const appendToBuyList = function(item) {
  return {
    type: APPEND_TO_BUY_LIST,
    item: item
  };
};

export const removeFromToBuyList = function(item) {
  return {
    type: REMOVE_FROM_TO_BUY_LIST,
    item: item
  };
};

export const setInitialFullGraph = function(item) {
  return {
    type: SET_INITIAL_FULL_GRAPH,
    item: item
  };
};

export const updateFullGraph = function(result) {
  return {
    type: UPDATE_FULL_GRAPH,
    input_mol_dict: result
  };
};

export const setBondColorMap = function(result) {
  return {
    type: SET_BOND_COLOR_MAP,
    bondColorMap: result
  };
};

export const setToQuery = function(to_query) {
  return {
    type: SET_TO_QUERY,
    to_query
  };
};

export const setVectorList = function(vectList) {
  return {
    type: SET_VECTOR_LIST,
    vector_list: vectList
  };
};

export const selectVector = function(vector) {
  return {
    type: SELECT_VECTOR,
    vector: vector
  };
};

export const setFragmentDisplayList = function(fragmentDisplayList) {
  return {
    type: SET_FRAGMENT_DISPLAY_LIST,
    fragmentDisplayList: fragmentDisplayList
  };
};

export const appendFragmentDisplayList = function(item) {
  return {
    type: APPEND_FRAGMENT_DISPLAY_LIST,
    item: item
  };
};

export const removeFromFragmentDisplayList = function(item) {
  return {
    type: REMOVE_FROM_FRAGMENT_DISPLAY_LIST,
    item: item
  };
};

export const setComplexList = function(complexList) {
  return {
    type: SET_COMPLEX_LIST,
    complexList: complexList
  };
};

export const appendComplexList = function(item) {
  return {
    type: APPEND_COMPLEX_LIST,
    item: item
  };
};

export const removeFromComplexList = function(item) {
  return {
    type: REMOVE_FROM_COMPLEX_LIST,
    item: item
  };
};

export const setVectorOnList = function(vectorOnList) {
  return {
    type: SET_VECTOR_ON_LIST,
    vectorOnList: vectorOnList
  };
};

export const appendVectorOnList = function(item) {
  return {
    type: APPEND_VECTOR_ON_LIST,
    item: item
  };
};

export const removeFromVectorOnList = function(item) {
  return {
    type: REMOVE_FROM_VECTOR_ON_LIST,
    item: item
  };
};

export const reloadSelectionReducer = function(savedSelectionReducers) {
  return {
    type: RELOAD_SELECTION_REDUCER,
    savedSelectionReducers
  };
};

export const resetSelectionState = function() {
  return {
    type: RESET_SELECTION_STATE
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
  type: SET_MOL_GROUP_SELECTION,
  mol_group_selection
});

export const setObjectSelection = object_selection => ({
  type: constants.SET_OBJECT_SELECTION,
  payload: object_selection
});
