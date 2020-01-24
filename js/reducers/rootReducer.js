/**
 * Created by abradley on 08/03/2018.
 */
import { combineReducers } from 'redux';
import apiRed from './api/apiReducers';
import nglRed from './ngl/nglReducers';
import selectionRed from './selection/selectionReducers';
import { targetReducers } from '../components/target/redux/reducer';
import { sessionReducers } from '../components/session/redux/reducer';
import { previewReducers } from '../components/preview/redux';
import undoable from 'redux-undo';

const rootReducer = combineReducers({
  apiReducers: undoable(apiRed, { limit: 1 }),
  nglReducers: undoable(nglRed, { limit: 1 }),
  selectionReducers: undoable(selectionRed, { limit: 1 }),
  targetReducers,
  sessionReducers,
  previewReducers
});

export { rootReducer };
