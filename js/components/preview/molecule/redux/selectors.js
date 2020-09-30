import { createSelector } from 'reselect';
import { constants } from '../helperConstants';

const getCachedMoleculeLists = state => state.apiReducers.cached_mol_lists;
const getMoleculeGroupLists = state => state.apiReducers.mol_group_list;
const getMoleculeGroupSelection = state => state.selectionReducers.mol_group_selection;
const getObjectSelection = state => state.selectionReducers.object_selection;

export function getNumberFromCode(inputCode) {
  let number = 0;
  let subNumber = 0;

  let code = inputCode.toLowerCase();
  let codeAfterIdentifier = code.split(constants.MAIN_IDENTIFIER)[1];

  if (codeAfterIdentifier != null) {
    let startingNumber = (codeAfterIdentifier.match(/\d+/) || [0])
      .map(function(v) {
        return +v;
      })
      .shift();

    number = startingNumber;

    if (codeAfterIdentifier.includes(constants.SUB_IDENTIFIER)) {
      let codeAfterSubIdentifier = codeAfterIdentifier.split(constants.sub_identifier)[1];
      if (codeAfterSubIdentifier != null) {
        let startingSubNumber = (codeAfterSubIdentifier.match(/\d+/) || [0])
          .map(function(v) {
            return +v;
          })
          .shift();
        subNumber = startingSubNumber;
      }
    }
  }

  let numberWithSub = +(number + '.' + subNumber);
  return { number: numberWithSub };
}

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

        let cachedDataArray = [];
        if (cachedData && Array.isArray(cachedData)) {
          cachedDataArray = cachedData;
        } else if (cachedData && cachedData.results && Array.isArray(cachedData.results)) {
          cachedDataArray = cachedData.results;
        }
        cachedDataArray.forEach(r => {
          let result = getNumberFromCode(r.protein_code);
          joinedMoleculeLists.push(Object.assign({ site: site, number: result.number }, r));
        });
      });
    }
    return joinedMoleculeLists;
  }
);
