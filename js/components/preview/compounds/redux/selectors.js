import { createSelector } from 'reselect';
import { compoundsColors } from './constants';

const getCompoundsPerPage = state => state.previewReducers.compounds.compoundsPerPage;
const getCurrentPage = state => state.previewReducers.compounds.currentPage;
const getCurrentCompounds = state => state.previewReducers.compounds.currentCompounds;

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
