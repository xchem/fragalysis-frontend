import { constants } from './constants';

export const setCurrentCompounds = loadedCompounds => ({
  type: constants.SET_CURRENT_COMPOUNDS,
  payload: loadedCompounds
});

export const setCurrentPage = page => ({
  type: constants.SET_CURRENT_PAGE,
  payload: page
});

export const resetCurrentCompoundsSettings = () => ({
  type: constants.RESET_CURRENT_COMPOUNDS_SETTINGS
});

export const updateCurrentCompound = ({ id, key, value }) => ({
  type: constants.UPDATE_COMPOUND,
  payload: {
    id,
    key,
    value
  }
});

export const setCompoundClasses = (compoundClasses, currentCompoundClass) => {
  return {
    type: constants.SET_COMPOUND_CLASSES,
    compoundClasses: compoundClasses,
    currentCompoundClass: currentCompoundClass
  };
};

export const setHighlightedCompoundId = id => ({ type: constants.SET_HIGHLIGHTED_COMPOUND_ID, payload: id });

export const setConfiguration = (id, data) => ({ type: constants.SET_CONFIGURATION, payload: { id, data } });

export const setShowedCompoundList = compounds => ({
  type: constants.SET_SHOWED_COMPOUND_LIST,
  payload: compounds
});

export const addShowedCompoundToList = compoundId => ({
  type: constants.APPEND_SHOWED_COMPOUND_LIST,
  payload: compoundId
});

export const removeShowedCompoundFromList = compoundId => ({
  type: constants.REMOVE_SHOWED_COMPOUND_LIST,
  payload: compoundId
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
