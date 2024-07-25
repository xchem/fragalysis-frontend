import { appendAndSendTrackingActions } from './dispatchActions';
import { constants } from './constants';
import { findTrackAction } from './trackingActions';
import { setIsSnapshotDirty } from './actions';

const trackingMiddleware = ({ dispatch, getState }) => next => action => {
  //console.log(`Redux Log:`, action);

  if (action) {
    const state = getState();
    if (action && action.type && !action.type.includes(constants.APPEND_ACTIONS_LIST)) {
      let trackAction = dispatch(findTrackAction(action, state));
      if (trackAction && trackAction != null && Object.keys(trackAction).length > 0) {
        const isSnapshotDirty = state.trackingReducers.isSnapshotDirty;
        const snapshotLoadingInProgress = state.apiReducers.snapshotLoadingInProgress;
        if (!isSnapshotDirty && !snapshotLoadingInProgress) {
          dispatch(setIsSnapshotDirty(true));
        }
        dispatch(appendAndSendTrackingActions(trackAction));
      } else if (trackAction && trackAction != null && Object.keys(trackAction).length === 0) {
        console.error(`Track action is empty for action: ${JSON.stringify(action)}`);
      }
    }

    next(action);
  }
};

export default trackingMiddleware;
