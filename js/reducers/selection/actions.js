/**
 * Created by abradley on 15/03/2018.
 */

import { constants } from './constants';

export const setToBuyList = function (to_buy_list) {
  return {
    type: constants.SET_TO_BUY_LIST,
    to_buy_list: to_buy_list
  };
};

export const appendToBuyList = function (item, index, skipTracking = false) {
  return {
    type: constants.APPEND_TO_BUY_LIST,
    item: item,
    index: index,
    skipTracking: skipTracking
  };
};

export const removeFromToBuyList = function (item, index, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_TO_BUY_LIST,
    item: item,
    index: index,
    skipTracking: skipTracking
  };
};

export const appendToBuyListAll = function (items) {
  return {
    type: constants.APPEND_TO_BUY_LIST_ALL,
    items: items
  };
};

export const removeFromToBuyListAll = function (items) {
  return {
    type: constants.REMOVE_FROM_BUY_LIST_ALL,
    items: items
  };
};

export const setVectorList = function (vectList) {
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

export const setFragmentDisplayList = function (fragmentDisplayList, skipTracking = false) {
  return {
    type: constants.SET_FRAGMENT_DISPLAY_LIST,
    fragmentDisplayList: fragmentDisplayList,
    skipTracking
  };
};

export const appendFragmentDisplayList = function (item, skipTracking = false) {
  return {
    type: constants.APPEND_FRAGMENT_DISPLAY_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const removeFromFragmentDisplayList = function (item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_FRAGMENT_DISPLAY_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const setProteinList = function (proteinList, skipTracking = false) {
  return {
    type: constants.SET_PROTEIN_LIST,
    proteinList: proteinList,
    skipTracking
  };
};

export const appendProteinList = function (item, skipTracking = false) {
  return {
    type: constants.APPEND_PROTEIN_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const removeFromProteinList = function (item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_PROTEIN_LIST,
    item: item,
    skipTracking: skipTracking
  };
};
export const setComplexList = function (complexList, skipTracking = false) {
  return {
    type: constants.SET_COMPLEX_LIST,
    complexList: complexList,
    skipTracking
  };
};

export const appendComplexList = function (item, skipTracking = false) {
  return {
    type: constants.APPEND_COMPLEX_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const removeFromComplexList = function (item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_COMPLEX_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const setSurfaceList = function (surfaceList, skipTracking = false) {
  return {
    type: constants.SET_SURFACE_LIST,
    surfaceList: surfaceList,
    skipTracking
  };
};

export const appendSurfaceList = function (item, skipTracking = false) {
  return {
    type: constants.APPEND_SURFACE_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const removeFromSurfaceList = function (item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_SURFACE_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const appendToDensityListType = (item, skipTracking = false) => {
  return {
    type: constants.APPEND_DENSITY_TYPE,
    item: item,
    skipTracking
  };
};

export const removeFromDensityListType = (item, skipTracking = false) => {
  return {
    type: constants.REMOVE_DENSITY_TYPE,
    item: item,
    skipTracking
  };
};

export const setDensityList = function (densityList) {
  return {
    type: constants.SET_DENSITY_LIST,
    densityList: densityList
  };
};

export const appendDensityList = function (item, skipTracking = false) {
  return {
    type: constants.APPEND_DENSITY_LIST,
    item: item,
    skipTracking
  };
};

export const removeFromDensityList = function (item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_DENSITY_LIST,
    item: item,
    skipTracking
  };
};

export const setDensityListCustom = function (densityListCustom) {
  return {
    type: constants.SET_DENSITY_LIST_CUSTOM,
    densityListCustom: densityListCustom
  };
};

export const appendDensityListCustom = function (item, skipTracking = false) {
  return {
    type: constants.APPEND_DENSITY_LIST_CUSTOM,
    item: item,
    skipTracking
  };
};

export const removeFromDensityListCustom = function (item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_DENSITY_LIST_CUSTOM,
    item: item,
    skipTracking
  };
};

export const setQualityList = function (qualityList, skipTracking = false) {
  return {
    type: constants.SET_QUALITY_LIST,
    qualityList: qualityList,
    skipTracking
  };
};

export const appendInformationList = function (item) {
  return {
    type: constants.APPEND_INFORMATION_LIST,
    item: item
  };
};

export const removeFromInformationList = function (item) {
  return {
    type: constants.REMOVE_FROM_INFORMATION_LIST,
    item: item
  };
};

export const appendQualityList = function (item, skipTracking = false) {
  return {
    type: constants.APPEND_QUALITY_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const removeFromQualityList = function (item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_QUALITY_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const setVectorOnList = function (vectorOnList, skipTracking = false) {
  return {
    type: constants.SET_VECTOR_ON_LIST,
    vectorOnList: vectorOnList,
    skipTracking
  };
};

export const appendVectorOnList = function (item, skipTracking = false) {
  return {
    type: constants.APPEND_VECTOR_ON_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const removeFromVectorOnList = function (item, skipTracking = false) {
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

export const resetSelectionState = function () {
  return {
    type: constants.RESET_SELECTION_STATE
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

export const setTargetFilter = filter => ({
  type: constants.SET_TARGET_FILTER,
  payload: filter
});

export const resetFilters = filter => ({
  type: constants.RESET_FILTER,
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
  type: constants.SET_SELECTED_BY_TYPE,
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

export const setSelectedTagList = function (selectedTagList, skipTracking = false) {
  return {
    type: constants.SET_SELECTED_TAG_LIST,
    selectedTagList: selectedTagList,
    skipTracking
  };
};

export const appendSelectedTagList = function (item, skipTracking = false) {
  return {
    type: constants.APPEND_SELECTED_TAG_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const removeFromSelectedTagList = function (item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_SELECTED_TAG_LIST,
    item: item,
    skipTracking: skipTracking
  };
};

export const setTagEditorOpen = isOpen => {
  return {
    type: constants.SET_TAG_EDITOR_OPEN,
    isOpen: isOpen
  };
};

export const setTagEditorOpenObs = isOpen => {
  return {
    type: constants.SET_TAG_EDITOR_OPEN_OBS,
    isOpen: isOpen
  };
};

export const setOpenObservationsDialog = isOpen => {
  return {
    type: constants.SET_OPEN_OBSERVATIONS_DIALOG,
    isOpen: isOpen
  };
};

export const setPoseIdForObservationsDialog = poseId => {
  return {
    type: constants.SET_POSE_ID_FOR_OBSERVATIONS_DIALOG,
    poseId: poseId
  };
};

export const setObservationDialogAction = (poseId, observations, open, prevPoseId, prevObservations) => {
  return {
    type: constants.SET_OBSERVATION_DIALOG_ACTION,
    poseId: poseId,
    observations: observations,
    open: open,
    prevPoseId: prevPoseId,
    prevObservations: prevObservations
  };
};

export const setObservationsForLHSCmp = observations => {
  return {
    type: constants.SET_OBSERVATIONS_FOR_LHS_CMP,
    observations: observations
  };
};

export const updateMoleculeInLHSObservations = mol => {
  return {
    type: constants.UPDATE_MOL_IN_LHS_OBSERVATIONS,
    mol: mol
  };
};

export const setMoleculeForTagEdit = molIds => {
  return {
    type: constants.SET_MOLECULE_FOR_TAG_EDIT,
    molIds: molIds
  };
};

export const setLHSCompoundsInitialized = isInitialized => {
  return {
    type: constants.SET_LHS_COMPOUNDS_INITIALIZED,
    isInitialized: isInitialized
  };
};

export const setTagFilteringMode = isExclusive => {
  return {
    type: constants.SWITCH_TAG_FILTERING_MODE,
    mode: isExclusive
  };
};

export const setIsTagGlobalEdit = isGlobalEdit => {
  return {
    type: constants.SET_IS_TAG_GLOBAL_EDIT,
    isGlobalEdit: isGlobalEdit
  };
};

export const setIsLHSCmpTagEdit = isLHSCmpTagEdit => {
  return {
    type: constants.SET_IS_LHS_CMP_TAG_EDIT,
    isLHSCmpTagEdit: isLHSCmpTagEdit
  };
};

export const setMolListToEdit = list => {
  return {
    type: constants.SET_MOL_LIST_TO_EDIT,
    list: list
  };
};

export const appendToMolListToEdit = molId => {
  return {
    type: constants.APPEND_TO_MOL_LIST_TO_EDIT,
    molId: molId
  };
};

export const removeFromMolListToEdit = molId => {
  return {
    type: constants.REMOVE_FROM_MOL_LIST_TO_EDIT,
    molId: molId
  };
};

export const setTagToEdit = tag => {
  return {
    type: constants.SET_TAG_TO_EDIT,
    tagToEdit: tag
  };
};

export const setDisplayAllMolecules = displayAllMolecules => {
  return {
    type: constants.SET_DISPLAY_ALL_MOLECULES,
    displayAllMolecules: displayAllMolecules
  };
};

export const setDisplayUntaggedMolecules = displayUntaggedMolecules => {
  return {
    type: constants.SET_DISPLAY_UNTAGGED_MOLECULES,
    displayUntaggedMolecules: displayUntaggedMolecules
  };
};

//this is dummy action because we just need to record given action by tracking reducer
//so we can undo, redo it and also restore from snapshot
export const setSelectAllMolecules = listOfNames => {
  return {
    type: constants.SET_SELECT_ALL_MOLECULES,
    items: listOfNames
  };
};

//this is dummy action because we just need to record given action by tracking reducer
//so we can undo, redo it and also restore from snapshot
export const setUnselectAllMolecules = listOfNames => {
  return {
    type: constants.SET_UNSELECT_ALL_MOLECULES,
    items: listOfNames
  };
};

//this is dummy action because we just need to record given action by tracking reducer
//so we can undo, redo it and also restore from snapshot
export const setSelectVisiblePoses = listOfItems => {
  return {
    type: constants.SET_SELECT_VISIBLE_POSES,
    items: listOfItems
  };
};

//this is dummy action because we just need to record given action by tracking reducer
//so we can undo, redo it and also restore from snapshot
export const setUnselectVisiblePoses = listOfItems => {
  return {
    type: constants.SET_UNSELECT_VISIBLE_POSES,
    items: listOfItems
  };
};

export const setNextXMolecules = nextXMolecules => {
  return {
    type: constants.SET_NEXT_X_MOLECULES,
    nextXMolecules: nextXMolecules
  };
};

export const setTagDetailView = tagDetailView => {
  return {
    type: constants.SET_TAG_DETAIL_VIEW,
    payload: tagDetailView
  };
};

export const setResizableLayout = projects => ({
  type: constants.SET_RESIZABLE_LAYOUT,
  payload: projects
});

export const setAssignTagView = assignTagView => {
  return {
    type: constants.SET_ASSIGN_TAGS_VIEW,
    payload: assignTagView
  };
};

export const setActualRhsWidth = rhsWidth => {
  return {
    type: constants.SET_RHS_WIDTH,
    payload: rhsWidth
  };
};

export const setToastMessages = toastMessages => {
  return {
    type: constants.SET_TOAST_MESSAGES,
    toastMessages: toastMessages
  };
};

export const addToastMessage = toastMessage => {
  return {
    type: constants.ADD_TOAST_MESSAGE,
    toastMessage: toastMessage
  };
};

export const setScrollFiredForLHS = isFired => {
  return {
    type: constants.SET_SCROLL_FIRED_FOR_LHS,
    isFired: isFired
  };
};

export const setTargetToEdit = target => {
  return {
    type: constants.SET_TARGET_TO_EDIT,
    target: target
  };
};
