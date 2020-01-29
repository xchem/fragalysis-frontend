import { createSelector } from 'reselect';
import { setHighlighted } from './selectionActions';

const getToSelect = state => state.selectionReducers.to_select;
const getToQuery = state => state.selectionReducers.to_query;
const getThisVectorList = state => state.selectionReducers.this_vector_list;
const getCurrentCompoundClass = state => state.selectionReducers.currentCompoundClass;
const getCompoundsPerPage = state => state.previewReducers.compounds.compoundsPerPage;
const getCurrentPage = state => state.previewReducers.compounds.currentPage;

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

export const getCompoundListOffset = createSelector(
  getCompoundsPerPage,
  getCurrentPage,
  (compoundsPerPage, currentPage) => {
    return (currentPage + 1) * compoundsPerPage;
  }
);

export const getCanLoadMoreCompounds = createSelector(
  getCompoundListOffset,
  getCompoundsList,
  (compoundsListOffset, compoundsList) => {
    return compoundsListOffset < compoundsList.length;
  }
);

/*
export const handleClickOnCompound = ({ send_obj, event, setIsConfOn, isConfOn }) => (dispatch, getState) => {
  dispatch(
    setHighlighted({
      index: send_obj.index,
      smiles: send_obj.smiles
    })
  );
  if (event.shiftKey) {
    setIsConfOn(!isConfOn);
    handleConf();
  } else {
    if (compoundClass === currentCompoundClass) {
      setCompoundClass(0);
      removeFromToBuyList(send_obj);
    } else {
      setCompoundClass(currentCompoundClass);
      Object.assign(send_obj, {
        class: parseInt(currentCompoundClass)
      });
      appendToBuyList(send_obj);
    }
  }
};

export const loadCompoundImageData = () => (dispatch, getState) => {};
*/
