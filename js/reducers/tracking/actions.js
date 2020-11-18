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

export const setCurrentActionsList = function(current_actions_list) {
  return {
    type: constants.SET_CURRENT_ACTIONS_LIST,
    current_actions_list: current_actions_list
  };
};

export const setIsTrackingMoleculesRestoring = function(isTrackingMoleculesRestoring) {
  return {
    type: constants.SET_IS_TRACKING_MOLECULES_RESTORING,
    isTrackingMoleculesRestoring: isTrackingMoleculesRestoring
  };
};

export const setIsTrackingCompoundsRestoring = function(isTrackingCompoundsRestoring) {
  return {
    type: constants.SET_IS_TRACKING_COMPOUNDS_RESTORING,
    isTrackingCompoundsRestoring: isTrackingCompoundsRestoring
  };
};

export const setIsUndoRedoAction = function(isUndoRedoAction) {
  return {
    type: constants.SET_IS_UNDO_REDO_ACTION,
    isUndoRedoAction: isUndoRedoAction
  };
};
