import { createSelector } from 'reselect';

export const getMoleculeGroupLists = state => state.apiReducers.mol_group_list;
const getMoleculeGroupSelection = state => state.selectionReducers.mol_group_selection;
const getObjectSelection = state => state.selectionReducers.object_selection;
const getAllMolecules = state => state.apiReducers.all_mol_lists;

export const selectJoinedMoleculeList = createSelector(
  getAllMolecules,
  getMoleculeGroupLists,
  getMoleculeGroupSelection,
  getObjectSelection,
  (all_mol_lists, mol_group_list, mol_group_selection, obj_selection) => {
    const object_selection = obj_selection || mol_group_selection;
    let joinedMoleculeLists = [];
    if (object_selection) {
      object_selection.forEach(obj => {
        const cachedData = all_mol_lists[obj];
        const site = (mol_group_list || []).findIndex(group => group.id === obj) + 1;

        let cachedDataArray = [];
        if (cachedData && Array.isArray(cachedData)) {
          cachedDataArray = cachedData;
        } else if (cachedData && cachedData.results && Array.isArray(cachedData.results)) {
          cachedDataArray = cachedData.results;
        }
        cachedDataArray.forEach(r => {
          joinedMoleculeLists.push(Object.assign({ site: site }, r));
        });
      });
    }
    return joinedMoleculeLists;
  }
);

export const selectAllMoleculeList = createSelector(
  getAllMolecules,
  getMoleculeGroupLists,
  (all_mol_lists, mol_group_list) => {
    const groupList = mol_group_list || [];
    const allMoleculesList = [];
    groupList.forEach((site, index) => {
      const siteMolecules = (all_mol_lists || {})[site.id];

      if (siteMolecules) {
        siteMolecules.forEach(r => {
          allMoleculesList.push({ site: index + 1, ...r })
        });
      }
    });

    return allMoleculesList;
  }
);