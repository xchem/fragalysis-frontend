import { truncate } from 'lodash';
import { createSelector } from 'reselect';
import { CATEGORY_TYPE } from '../../../../constants/constants';

const getAllMolecules = state => state.apiReducers.all_mol_lists;
const getAllSelectedTags = state => state.selectionReducers.selectedTagList;
const getTagFilteringMode = state => state.selectionReducers.tagFilteringMode;
const getNoTagsReceived = state => state.apiReducers.noTagsReceived;
const getTagList = state => state.apiReducers.tagList;
const getTagCategoryList = state => state.apiReducers.categoryList;
const getDisplayAllMolecules = state => state.selectionReducers.displayAllMolecules;
const getDisplayUntaggedMolecules = state => state.selectionReducers.displayUntaggedMolecules;
export const getLHSCompoundsList = state => state.apiReducers.lhs_compounds_list;

export const selectJoinedMoleculeList = createSelector(
  getAllMolecules,
  getAllSelectedTags,
  getTagFilteringMode,
  getNoTagsReceived,
  getTagList,
  getTagCategoryList,
  getDisplayAllMolecules,
  getDisplayUntaggedMolecules,
  (all_mol_lists, selectedTagList, filteringMode, noTagsReceived, tagList, categoryList, displayAllMolecules, displayUntaggedMolecules) => {
    let allMoleculesList = [];

    if (!displayUntaggedMolecules) {
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
    } else {
      if (all_mol_lists) {
        allMoleculesList = all_mol_lists.filter(mol => {
          const categories = [];
          Object.entries(CATEGORY_TYPE).forEach(([key, categName]) => {
            const categ = categoryList.find(c => c.category === categName);
            if (categ) {
              categories.push({ ...categ });
            }
          });

          let hasCuratorTags = false;
          categories.some(categ => {
            mol.tags_set.some(tagId => {
              const tag = tagList.find(t => t.id === tagId);
              if (!tag.hidden && tag?.category === categ.id) {
                hasCuratorTags = true;
                return true;
              }
            });
            return hasCuratorTags;
          });

          return !mol.tags_set || mol.tags_set.length === 0 || !hasCuratorTags;
        });
      }
    }

    allMoleculesList.sort((a, b) => {
      if (a.code < b.code) {
        return -1;
      }
      if (a.code > b.code) {
        return 1;
      }
      return 0;
    });
    return allMoleculesList;
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
