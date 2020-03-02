import { createSelector } from 'reselect';
import { compoundsColors } from './constants';

const getCompoundsPerPage = state => state.previewReducers.compounds.compoundsPerPage;
const getCurrentPage = state => state.previewReducers.compounds.currentPage;
const getCurrentCompounds = state => state.previewReducers.compounds.currentCompounds;
const getCompdClassBlue = state => state.previewReducers.compounds.compoundClasses[compoundsColors.blue.key];
const getCompdClassRed = state => state.previewReducers.compounds.compoundClasses[compoundsColors.red.key];
const getCompdClassGreen = state => state.previewReducers.compounds.compoundClasses[compoundsColors.green.key];
const getCompdClassPurple = state => state.previewReducers.compounds.compoundClasses[compoundsColors.purple.key];
const getCompdClassApricot = state => state.previewReducers.compounds.compoundClasses[compoundsColors.apricot.key];

export const getCompoundListOffset = createSelector(
  getCompoundsPerPage,
  getCurrentPage,
  (compoundsPerPage, currentPage) => {
    return (currentPage + 1) * compoundsPerPage;
  }
);

export const getCanLoadMoreCompounds = createSelector(
  getCompoundListOffset,
  getCurrentCompounds,
  (compoundsListOffset, compoundsList) => {
    return compoundsListOffset < compoundsList.length;
  }
);

export const getCompoundClasses = createSelector(
  getCompdClassBlue,
  getCompdClassRed,
  getCompdClassGreen,
  getCompdClassPurple,
  getCompdClassApricot,
  (blue, red, green, purple, apricot) => ({
    [compoundsColors.blue.key]: blue,
    [compoundsColors.red.key]: red,
    [compoundsColors.green.key]: green,
    [compoundsColors.purple.key]: purple,
    [compoundsColors.apricot.key]: apricot
  })
);
