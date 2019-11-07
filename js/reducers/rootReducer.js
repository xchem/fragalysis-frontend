/**
 * Created by abradley on 08/03/2018.
 */
import { combineReducers } from 'redux-starter-kit';
import apiRed from './api/apiReducers';
import nglRed from './ngl/nglReducers';
import selectionRed from './selection/selectionReducers';
import undoable from 'redux-undo';

const rootReducer = combineReducers({
  apiReducers: undoable(apiRed, { limit: 1 }),
  nglReducers: undoable(nglRed, { limit: 1 }),
  selectionReducers: undoable(selectionRed, { limit: 1 })
});

export { rootReducer };
