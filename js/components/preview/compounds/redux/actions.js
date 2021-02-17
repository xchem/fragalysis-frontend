import { constants } from './constants';

export const setCurrentCompounds = loadedCompounds => ({
  type: constants.SET_CURRENT_COMPOUNDS,
  payload: loadedCompounds
});

export const setCurrentPage = page => ({
  type: constants.SET_CURRENT_PAGE,
  payload: page
});

export const resetCurrentCompoundsSettings = (withCompoundClasses = false) => async dispatch => {
  await dispatch({
    type: constants.RESET_CURRENT_COMPOUNDS_SETTINGS
  });

  if (withCompoundClasses === true) {
    dispatch(resetCompoundClasses());
  }
};

export const resetCurrentCompoundSettingsWithoutSelection = (withCompoundClasses = false) => async dispatch => {
  await dispatch({
    type: constants.RESET_CURRENT_COMPOUNDS_SETTINGS_WITHOUT_SELECTION
  });

  if (withCompoundClasses === true) {
    dispatch(resetCompoundClasses());
  }
}

export const updateCurrentCompound = ({ id, key, value }) => ({
  type: constants.UPDATE_COMPOUND,
  payload: {
    id,
    key,
    value
  }
});

export const setCompoundClasses = (compoundClasses, oldCompoundClasses, value, id) => ({
  type: constants.SET_COMPOUND_CLASSES,
  payload: compoundClasses,
  oldCompoundClasses: oldCompoundClasses,
  value: value,
  id: id
});

export const resetCompoundClasses = compoundClasses => ({
  type: constants.RESET_COMPOUND_CLASSES,
  payload: compoundClasses
});

export const setCurrentCompoundClass = (currentCompoundClass, oldCompoundClass, skipTracking) => {
  return {
    type: constants.SET_CURRENT_COMPOUND_CLASS,
    payload: currentCompoundClass,
    oldCompoundClass: oldCompoundClass,
    skipTracking: skipTracking
  };
};

export const setHighlightedCompoundId = id => ({ type: constants.SET_HIGHLIGHTED_COMPOUND_ID, payload: id });

export const setConfiguration = (id, data) => ({ type: constants.SET_CONFIGURATION, payload: { id, data } });

export const resetConfiguration = () => ({ type: constants.RESET_CONFIGURATION });

export const setShowedCompoundList = compounds => ({
  type: constants.SET_SHOWED_COMPOUND_LIST,
  payload: compounds
});

export const addShowedCompoundToList = (compoundId, item) => ({
  type: constants.APPEND_SHOWED_COMPOUND_LIST,
  payload: compoundId,
  item: item
});

export const removeShowedCompoundFromList = (compoundId, item) => ({
  type: constants.REMOVE_SHOWED_COMPOUND_LIST,
  payload: compoundId,
  item: item
});

export const addSelectedCompoundClass = (classID, compoundID) => ({
  type: constants.APPEND_SELECTED_COMPOUND_CLASS,
  payload: { classID, compoundID }
});

export const removeSelectedCompoundClass = compoundID => ({
  type: constants.REMOVE_SELECTED_COMPOUND_CLASS,
  payload: compoundID
});

export const resetSelectedCompoundClass = () => ({
  type: constants.RESET_SELECTED_COMPOUND_CLASS
});

export const reloadCompoundsReducer = newState => ({
  type: constants.RELOAD_REDUCER,
  payload: newState
});

export const setSelectedCompounds = selectedCompounds => ({
  type: constants.SET_SELECTED_COMPOUNDS,
  payload: selectedCompounds
});
