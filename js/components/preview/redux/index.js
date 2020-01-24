import { combineReducers } from 'redux';
import { summary } from '../summary/redux/reducer';

export const previewReducers = combineReducers({
  summary
});
