import { createSelector } from 'reselect';
import { getAllCompoundsList } from '../../../../reducers/selection/selectors';
//import { setHighlighted } from './selectionActions';

const getCompoundsPerPage = state => state.previewReducers.compounds.compoundsPerPage;
const getCurrentPage = state => state.previewReducers.compounds.currentPage;

export const getCompoundListOffset = createSelector(
  getCompoundsPerPage,
  getCurrentPage,
  (compoundsPerPage, currentPage) => {
    return (currentPage + 1) * compoundsPerPage;
  }
);

export const getCanLoadMoreCompounds = createSelector(
  getCompoundListOffset,
  getAllCompoundsList,
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
