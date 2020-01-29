import { createSelector } from 'reselect';

const getToSelect = state => state.selectionReducers.to_select;
const getToQuery = state => state.selectionReducers.to_query;
const getThisVectorList = state => state.selectionReducers.this_vector_list;
const getCurrentCompoundClass = state => state.selectionReducers.currentCompoundClass;

export const getTotalCountOfMolecules = createSelector(getToSelect, to_select => {
  let tot_num = 0;
  Object.keys(to_select).forEach(key => {
    tot_num += to_select[key].addition ? to_select[key].addition.length : 0;
  });
  return tot_num;
});

export const getCompoundsList = createSelector(
  getThisVectorList,
  getCurrentCompoundClass,
  getToQuery,
  (thisVectorList, currentCompoundClass, to_query) => {
    let compoundsList = [];
    Object.keys(thisVectorList).forEach(key => {
      const vector_smi = thisVectorList[key].vector;
      const change_list = thisVectorList[key].addition;
      change_list.forEach((data_transfer, index) => {
        const input_data = {};
        input_data.smiles = data_transfer && data_transfer.end;
        // Set this back for now - because it's confusing - alter to change if want later
        input_data.show_frag = data_transfer && data_transfer.end;
        input_data.vector = vector_smi;
        input_data.mol = to_query;
        input_data.index = index;
        input_data.class = currentCompoundClass;
        compoundsList.push(input_data);
      });
    });

    return compoundsList;
  }
);
