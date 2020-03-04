import { resetCurrentCompoundsSettings, setCurrentCompounds } from '../../components/preview/compounds/redux/actions';
import { selectVector } from './actions';
import { getAllCompoundsList } from './selectors';

export const selectVectorAndResetCompounds = currentVector => async (dispatch, getState) => {
  await dispatch(resetCurrentCompoundsSettings(false));
  dispatch(selectVector(currentVector));
  dispatch(setCurrentCompounds(getAllCompoundsList(getState())));
};
