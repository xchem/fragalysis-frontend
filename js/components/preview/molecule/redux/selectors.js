import { createSelector } from 'reselect';

const getMoleculeGroupLists = state => state.apiReducers.mol_group_list;
//const getMoleculeGroupSelection = state => state.selectionReducers.mol_group_selection;
const getAllMolecules = state => state.apiReducers.all_mol_lists;
const getAllSelectedTags = state => state.selectionReducers.selectedTagList;

export const selectJoinedMoleculeList = createSelector(
  getAllMolecules,
  getAllSelectedTags,
  (all_mol_lists, selectedTagList) => {
    const allMoleculesList = [];
    selectedTagList.forEach(tag => {
      let filteredMols = all_mol_lists.filter(mol => {
        let foundTag = mol.tags_set.filter(t => t === tag.id);
        if (foundTag && foundTag.length > 0) {
          return true;
        } else {
          return false;
        }
      });
      filteredMols.forEach(mol => {
        let found = allMoleculesList.filter(addedMol => addedMol.id === mol.id);
        if (!found || found.length === 0) {
          allMoleculesList.push(mol);
        }
      });
    });

    return allMoleculesList;
  }
);

export const getMoleculeList = createSelector(
  getAllMolecules,
  getMoleculeGroupLists,
  (all_mol_lists, mol_group_list) => {
    let cachedDataArray = [];
    if (mol_group_list) {
      mol_group_list.forEach(obj => {
        const cachedData = all_mol_lists[obj.id];

        if (cachedData && Array.isArray(cachedData)) {
          cachedDataArray.push(...cachedData);
        } else if (cachedData && cachedData.results && Array.isArray(cachedData.results)) {
          cachedDataArray.push(...cachedData.results);
        }
      });
    }

    return cachedDataArray;
  }
);
export const selectAllMoleculeList = createSelector(
  getAllMolecules,
  getAllSelectedTags,
  (all_mol_lists, selectedTagList) => {
    // const allMoleculesList = [];
    // selectedTagList.forEach(tag => {
    //   let filteredMols = all_mol_lists.filter(mol => {
    //     let foundTag = mol.tags_set.filter(t => t === tag.id);
    //     if (foundTag && foundTag.length > 0) {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   });
    //   filteredMols.forEach(mol => {
    //     let found = allMoleculesList.filter(addedMol => addedMol.id === mol.id);
    //     if (!found || found.length === 0) {
    //       allMoleculesList.push(mol);
    //     }
    //   });
    // });

    return all_mol_lists;
  }
);
