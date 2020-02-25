import { createSelector } from 'reselect';

const getToSelect = state => state.selectionReducers.to_select;
const getToQuery = state => state.selectionReducers.to_query;
const getThisVectorList = state => state.selectionReducers.this_vector_list;
const getCurrentCompoundClass = state => state.previewReducers.compounds.currentCompoundClass;

export const getTotalCountOfMolecules = createSelector(getToSelect, to_select => {
  let tot_num = 0;
  Object.keys(to_select).forEach(key => {
    tot_num += to_select[key].addition ? to_select[key].addition.length : 0;
  });
  return tot_num;
});

export const getAllCompoundsList = createSelector(
  getThisVectorList,
  getCurrentCompoundClass,
  getToQuery,
  (thisVectorList, currentCompoundClass, to_query) => {
    let compoundsList = [];
    Object.keys(thisVectorList).forEach(key => {
      const vector_smi = thisVectorList[key].vector;
      const change_list = thisVectorList[key].addition;
      change_list.forEach((data_transfer, index) => {
        const inputData = {};
        inputData.smiles = data_transfer && data_transfer.end;
        // Set this back for now - because it's confusing - alter to change if want later
        inputData.show_frag = data_transfer && data_transfer.end;
        inputData.vector = vector_smi;
        inputData.mol = to_query;
        inputData.index = index;
        inputData.selectedClass = undefined;
        inputData.isShowed = false;
        compoundsList.push(inputData);
      });
    });

    return compoundsList;
  }
);
