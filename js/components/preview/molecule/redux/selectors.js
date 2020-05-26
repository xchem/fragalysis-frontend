import { createSelector } from 'reselect';

const getCachedMoleculeLists = state => state.apiReducers.cached_mol_lists;
const getMoleculeGroupLists = state => state.apiReducers.mol_group_list;
const getMoleculeGroupSelection = state => state.selectionReducers.mol_group_selection;
const getObjectSelection = state => state.selectionReducers.object_selection;

export const selectJoinedMoleculeList = createSelector(
  getCachedMoleculeLists,
  getMoleculeGroupLists,
  getMoleculeGroupSelection,
  getObjectSelection,
  (cached_mol_lists, mol_group_list, mol_group_selection, obj_selection) => {
    const object_selection = obj_selection || mol_group_selection;
    let joinedMoleculeLists = [];
    if (object_selection) {
      object_selection.forEach(obj => {
        const cachedData = cached_mol_lists[obj];
        const site = (mol_group_list || []).findIndex(group => group.id === obj) + 1;
        if (cachedData) {
          cachedData.forEach(r => joinedMoleculeLists.push(Object.assign({ site: site }, r)));
        }
      });
    }
    return joinedMoleculeLists;
  }
);
