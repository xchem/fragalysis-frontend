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
