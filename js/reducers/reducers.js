/**
 * Created by abradley on 08/03/2018.
 */
import { combineReducers } from 'redux';
import apiRed from './apiReducers';
import nglRed from './nglReducers';
import selectionRed from './selectionReducers';
import renderReducers from './renderReducers';
import undoable from 'redux-undo';

const rootReducer = combineReducers({
  renderReducers,
  apiReducers: undoable(apiRed, { limit: 1 }),
  nglReducers: undoable(nglRed, { limit: 1 }),
  selectionReducers: undoable(selectionRed, { limit: 1 })
});

export default rootReducer;
