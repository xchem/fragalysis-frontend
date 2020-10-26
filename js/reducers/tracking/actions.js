import { constants } from './constants';

export const setActionsList = function(truck_actions_list) {
  return {
    type: constants.SET_ACTIONS_LIST,
    truck_actions_list: truck_actions_list
  };
};

export const appendToActionList = function(truck_action) {
  return {
    type: constants.APPEND_ACTIONS_LIST,
    truck_action: truck_action
  };
};
