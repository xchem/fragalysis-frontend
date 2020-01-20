import { createSelector } from 'reselect';

// concat molecule results for all selected molecule groups into single list
export const getJoinedMoleculeList = obj_selection => (dispatch, getState) => {
  const state = getState();
  const cached_mol_lists = state.apiReducers.present.cached_mol_lists;
  const mol_group_list = state.apiReducers.present.mol_group_list;

  const object_selection = obj_selection || state.selectionReducers.present.mol_group_selection;

  let joinedMoleculeLists = [];
  if (object_selection) {
    object_selection.forEach(obj => {
      const cachedData = cached_mol_lists[obj];
      const site = (mol_group_list || []).findIndex(group => group.id === obj) + 1;
      if (cachedData && cachedData.results) {
        cachedData.results.forEach(r => joinedMoleculeLists.push(Object.assign({ site: site }, r)));
      }
    });
  }
  return joinedMoleculeLists;
};
