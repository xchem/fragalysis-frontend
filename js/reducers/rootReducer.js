/**
 * Created by abradley on 08/03/2018.
 */
import { combineReducers } from 'redux';
import apiReducers from './api/apiReducers';
import nglReducers from './ngl/nglReducers';
import selectionReducers from './selection/selectionReducers';
import { targetReducers } from '../components/target/redux/reducer';
import { snapshotReducers } from '../components/session/redux/reducer';
import { previewReducers } from '../components/preview/redux';
import { projectReducers } from '../components/projects/redux/reducer';
import { issueReducers } from '../components/userFeedback/redux/reducer';

const rootReducer = combineReducers({
  apiReducers,
  nglReducers,
  selectionReducers,
  targetReducers,
  snapshotReducers,
  previewReducers,
  projectReducers,
  issueReducers
});

export { rootReducer };
