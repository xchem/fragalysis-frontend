import { constants } from './constants';

export const INITIAL_STATE = {
  truck_actions_list: [],
  current_actions_list: [],
  isTrackingMoleculesRestoring: false,
  isTrackingCompoundsRestoring: false
};

export default function trackingReducers(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case constants.SET_ACTIONS_LIST:
      return Object.assign({}, state, {
        truck_actions_list: action.truck_actions_list
      });

    case constants.APPEND_ACTIONS_LIST:
      return Object.assign({}, state, {
        truck_actions_list: [...new Set([...state.truck_actions_list, action.truck_action])]
      });

    case constants.SET_CURRENT_ACTIONS_LIST:
      return Object.assign({}, state, {
        current_actions_list: action.current_actions_list
      });

    case constants.SET_IS_TRACKING_MOLECULES_RESTORING:
      return Object.assign({}, state, {
        isTrackingMoleculesRestoring: action.isTrackingMoleculesRestoring
      });

    case constants.SET_IS_TRACKING_COMPOUNDS_RESTORING:
      return Object.assign({}, state, {
        isTrackingCompoundsRestoring: action.isTrackingCompoundsRestoring
      });

    default:
      return state;
  }
}
