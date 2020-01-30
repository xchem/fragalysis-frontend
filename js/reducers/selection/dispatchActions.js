import { resetCurrentCompoundsSettings, setCurrentCompounds } from '../../components/preview/compounds/redux/actions';
import { selectVector } from './selectionActions';
import { getAllCompoundsList } from './selectors';

export const selectVectorAndResetCompounds = currentVector => async (dispatch, getState) => {
  await dispatch(resetCurrentCompoundsSettings());
  dispatch(selectVector(currentVector));
  dispatch(setCurrentCompounds(getAllCompoundsList(getState())));
};
