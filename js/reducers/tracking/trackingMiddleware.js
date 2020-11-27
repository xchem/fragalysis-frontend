import { appendToActionList } from './actions';
import { constants } from './constants';
import { findTruckAction } from './trackingActions';

const trackingMiddleware = ({ dispatch, getState }) => next => action => {
  //console.log(`Redux Log:`, action);

  const state = getState();
  if (!action.type.includes(constants.APPEND_ACTIONS_LIST)) {
    let truckAction = findTruckAction(action, state);
    if (truckAction && truckAction != null) {
      dispatch(appendToActionList(truckAction));
    }
  }

  next(action);
};

export default trackingMiddleware;
