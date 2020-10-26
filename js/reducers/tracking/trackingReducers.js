import { constants } from './constants';

export const INITIAL_STATE = {
  truck_actions_list: []
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
    default:
      return state;
  }
}
