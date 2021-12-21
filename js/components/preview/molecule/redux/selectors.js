import { createSelector } from 'reselect';

const getMoleculeGroupLists = state => state.apiReducers.mol_group_list;
const getAllMolecules = state => state.apiReducers.all_mol_lists;
const getAllSelectedTags = state => state.selectionReducers.selectedTagList;
const getTagFilteringMode = state => state.selectionReducers.tagFilteringMode;
const getNoTagsReceived = state => state.apiReducers.noTagsReceived;
const getDisplayAllMolecules = state => state.selectionReducers.displayAllMolecules;

export const selectJoinedMoleculeList = createSelector(
  getAllMolecules,
  getAllSelectedTags,
  getTagFilteringMode,
  getNoTagsReceived,
  getDisplayAllMolecules,
  (all_mol_lists, selectedTagList, filteringMode, noTagsReceived, displayAllMolecules) => {
    let allMoleculesList = [];

    if (!noTagsReceived && !displayAllMolecules) {
      let tagListToUse = [];
      tagListToUse = selectedTagList;

      if (!filteringMode) {
        //inclusive mode - i.e. if molecule has at least one of the selected tags then molecule is displayed
        tagListToUse.forEach(tag => {
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
      } else {
        //exclusive mode - i.e. molecule has to have all selected tags attached to it
        all_mol_lists.forEach(mol => {
          let foundAllTags = false;
          for (let i = 0; i < selectedTagList.length; i++) {
            let tag = selectedTagList[i];
            let foundTagId = mol.tags_set.find(tid => tid === tag.id);
            if (!foundTagId) {
              break;
            }
            if (i === selectedTagList.length - 1 && foundTagId) {
              foundAllTags = true;
            }
          }
          if (foundAllTags) {
            allMoleculesList.push(mol);
          }
        });
      }
    } else {
      if (all_mol_lists) {
        allMoleculesList = [...all_mol_lists];
      }
    }

    allMoleculesList.sort((a, b) => {
      if (a.protein_code < b.protein_code) {
        return -1;
      }
      if (a.protein_code > b.protein_code) {
        return 1;
      }
      return 0;
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
export const selectAllMoleculeList = createSelector(getAllMolecules, all_mol_lists => {
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
});
