import { appendAndSendTrackingActions } from './dispatchActions';
import { constants } from './constants';
import { findTrackAction } from './trackingActions';
import { setIsSnapshotDirty } from '../tracking/actions';

const nglTrackingMiddleware = ({ dispatch, getState }) => next => action => {
  //console.log(`Redux Log:`, action);

  if (action) {
    const state = getState();
    if (action && action.type && !action.type.includes(constants.APPEND_ACTIONS_LIST)) {
      let trackAction = findTrackAction(action, state);
      if (trackAction && trackAction != null) {
        // const isSnapshotDirty = state.trackingReducers.isSnapshotDirty;
        // if (!isSnapshotDirty) {
        //   dispatch(setIsSnapshotDirty(true));
        // }
        dispatch(appendAndSendTrackingActions(trackAction));
      }
    }

    next(action);
  }
};

export default nglTrackingMiddleware;
