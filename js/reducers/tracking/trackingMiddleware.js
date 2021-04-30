import { appendAndSendTrackingActions } from './dispatchActions';
import { constants } from './constants';
import { findTrackAction } from './trackingActions';

const trackingMiddleware = ({ dispatch, getState }) => next => action => {
  //console.log(`Redux Log:`, action);

  if (action) {
    const state = getState();
    if (action && action.type && !action.type.includes(constants.APPEND_ACTIONS_LIST)) {
      let trackAction = findTrackAction(action, state);
      if (trackAction && trackAction != null) {
        dispatch(appendAndSendTrackingActions(trackAction));
      }
    }

    next(action);
  }
};

export default trackingMiddleware;
