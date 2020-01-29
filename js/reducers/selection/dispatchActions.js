import { resetCurrentCompoundsSettings } from '../../components/preview/compounds/redux/actions';
import { selectVector } from './selectionActions';

export const selectVectorAndResetCompounds = currentVector => async dispatch => {
  await dispatch(resetCurrentCompoundsSettings());
  dispatch(selectVector(currentVector));
};
