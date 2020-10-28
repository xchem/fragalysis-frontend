import { constants } from './constants';

export const INITIAL_STATE = {
  truck_actions_list: []
  // isTrackingModalOpen: false
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
    // case constants.SET_TRACKING_MODAL_OPEN:
    //   return Object.assign({}, state, { isTrackingModalOpen: action.payload });

    default:
      return state;
  }
}
