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

export const appendToBuyList = function(item, index, skipTracking = false) {
  return {
    type: constants.APPEND_TO_BUY_LIST,
    item: item,
    index: index,
    skipTracking: skipTracking
  };
};

export const removeFromToBuyList = function(item, index, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_TO_BUY_LIST,
    item: item,
    index: index,
    skipTracking: skipTracking
  };
};

export const appendToBuyListAll = function(items) {
  return {
    type: constants.APPEND_TO_BUY_LIST_ALL,
    items: items
  };
};

export const removeFromToBuyListAll = function(items) {
  return {
    type: constants.REMOVE_FROM_BUY_LIST_ALL,
    items: items
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

export const setFragmentDisplayList = function(fragmentDisplayList, skipTracking = false) {
  return {
    type: constants.SET_FRAGMENT_DISPLAY_LIST,
    fragmentDisplayList: fragmentDisplayList,
    skipTracking
  };
};

export const appendFragmentDisplayList = function(item, skipTracking = false) {
  return {
    type: constants.APPEND_FRAGMENT_DISPLAY_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const removeFromFragmentDisplayList = function(item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_FRAGMENT_DISPLAY_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const setProteinList = function(proteinList, skipTracking = false) {
  return {
    type: constants.SET_PROTEIN_LIST,
    proteinList: proteinList,
    skipTracking
  };
};

export const appendProteinList = function(item, skipTracking = false) {
  return {
    type: constants.APPEND_PROTEIN_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const removeFromProteinList = function(item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_PROTEIN_LIST,
    item: item,
    skipTracking: skipTracking
  };
};
export const setComplexList = function(complexList, skipTracking = false) {
  return {
    type: constants.SET_COMPLEX_LIST,
    complexList: complexList,
    skipTracking
  };
};

export const appendComplexList = function(item, skipTracking = false) {
  return {
    type: constants.APPEND_COMPLEX_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const removeFromComplexList = function(item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_COMPLEX_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const setSurfaceList = function(surfaceList, skipTracking = false) {
  return {
    type: constants.SET_SURFACE_LIST,
    surfaceList: surfaceList,
    skipTracking
  };
};

export const appendSurfaceList = function(item, skipTracking = false) {
  return {
    type: constants.APPEND_SURFACE_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const removeFromSurfaceList = function(item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_SURFACE_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const setDensityList = function(densityList) {
  return {
    type: constants.SET_DENSITY_LIST,
    densityList: densityList
  };
};

export const appendDensityList = function(item, skipTracking = false) {
  return {
    type: constants.APPEND_DENSITY_LIST,
    item: item,
    skipTracking
  };
};

export const removeFromDensityList = function(item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_DENSITY_LIST,
    item: item,
    skipTracking
  };
};

export const setDensityListCustom = function(densityListCustom) {
  return {
    type: constants.SET_DENSITY_LIST_CUSTOM,
    densityListCustom: densityListCustom
  };
};

export const appendDensityListCustom = function(item, skipTracking = false) {
  return {
    type: constants.APPEND_DENSITY_LIST_CUSTOM,
    item: item,
    skipTracking
  };
};

export const removeFromDensityListCustom = function(item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_DENSITY_LIST_CUSTOM,
    item: item,
    skipTracking
  };
};

export const setQualityList = function(qualityList, skipTracking = false) {
  return {
    type: constants.SET_QUALITY_LIST,
    qualityList: qualityList,
    skipTracking
  };
};

export const appendInformationList = function(item) {
  return {
    type: constants.APPEND_INFORMATION_LIST,
    item: item
  };
};

export const removeFromInformationList = function(item) {
  return {
    type: constants.REMOVE_FROM_INFORMATION_LIST,
    item: item
  };
};

export const appendQualityList = function(item, skipTracking = false) {
  return {
    type: constants.APPEND_QUALITY_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const removeFromQualityList = function(item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_QUALITY_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const setVectorOnList = function(vectorOnList, skipTracking = false) {
  return {
    type: constants.SET_VECTOR_ON_LIST,
    vectorOnList: vectorOnList,
    skipTracking
  };
};

export const appendVectorOnList = function(item, skipTracking = false) {
  return {
    type: constants.APPEND_VECTOR_ON_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const removeFromVectorOnList = function(item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_VECTOR_ON_LIST,
    item: item,
    skipTracking: skipTracking
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

export const setFilter = filter => ({
  type: constants.SET_FILTER,
  payload: filter
});

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

export const setSelectedAll = (item, isLigand, isProtein, isComplex) => ({
  type: constants.SET_SELECTED_ALL,
  item: item,
  isLigand: isLigand,
  isProtein: isProtein,
  isComplex: isComplex
});

export const setDeselectedAll = (item, isLigand, isProtein, isComplex) => ({
  type: constants.SET_DESELECTED_ALL,
  item: item,
  isLigand: isLigand,
  isProtein: isProtein,
  isComplex: isComplex
});

export const setSelectedAllByType = (type, items, isInspiration) => ({
  type: constants.SET_SELECTED_ALL_BY_TYPE,
  payload: { type, items, isInspiration }
});

export const setDeselectedAllByType = (type, items, isInspiration) => ({
  type: constants.SET_DESELECTED_ALL_BY_TYPE,
  payload: { type, items, isInspiration }
});

export const setHideAll = (data, isHide = true) => ({
  type: constants.SET_HIDE_ALL,
  isHide: isHide,
  data: data
});

export const setArrowUpDown = (item, newItem, arrowType, data) => ({
  type: constants.SET_ARROW_UP_DOWN,
  payload: {
    item: item,
    newItem: newItem,
    arrowType: arrowType,
    data
  }
});

export const setSelectedTagList = function(selectedTagList, skipTracking = false) {
  return {
    type: constants.SET_SELECTED_TAG_LIST,
    selectedTagList: selectedTagList,
    skipTracking
  };
};

export const appendSelectedTagList = function(item, skipTracking = false) {
  return {
    type: constants.APPEND_SELECTED_TAG_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const removeFromSelectedTagList = function(item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_SELECTED_TAG_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const setCategoryList = function(categoryList, skipTracking = false) {
  return {
    type: constants.SET_CATEGORY_LIST,
    categoryList: categoryList,
    skipTracking
  };
};

export const setTagList = function(tagList, skipTracking = false) {
  return {
    type: constants.SET_TAG_LIST,
    tagList: tagList,
    skipTracking
  };
};

export const setSpecialTagList = function(tagList, skipTracking = false) {
  return {
    type: constants.SET_SPECIAL_TAG_LIST,
    tagList: tagList,
    skipTracking
  };
};
