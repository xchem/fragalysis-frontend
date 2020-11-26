import { constants } from './constants';
import undoable, { includeAction } from 'redux-undo';

export const INITIAL_STATE = {
  track_actions_list: [],
  current_actions_list: [],
  isTrackingMoleculesRestoring: false,
  isTrackingCompoundsRestoring: false,
  isUndoRedoAction: false,
  isActionsSending: false,
  isActionsLoading: false,
  isActionSaving: false,
  send_actions_list: [],
  project_actions_list: [],
  isActionRestoring: false
};

export function trackingReducers(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case constants.SET_ACTIONS_LIST:
      return Object.assign({}, state, {
        track_actions_list: action.track_actions_list
      });

    case constants.APPEND_ACTIONS_LIST:
      return Object.assign({}, state, {
        track_actions_list: [...new Set([...state.track_actions_list, action.track_action])]
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

    case constants.SET_IS_UNDO_REDO_ACTION:
      return Object.assign({}, state, {
        isUndoRedoAction: action.isUndoRedoAction
      });

    case constants.SET_IS_ACTIONS_SENDING:
      return Object.assign({}, state, {
        isActionsSending: action.isActionsSending
      });

    case constants.SET_IS_ACTIONS_LOADING:
      return Object.assign({}, state, {
        isActionsLoading: action.isActionsLoading
      });

    case constants.SET_SEND_ACTIONS_LIST:
      return Object.assign({}, state, {
        send_actions_list: action.send_actions_list
      });

    case constants.APPEND_SEND_ACTIONS_LIST:
      return Object.assign({}, state, {
        send_actions_list: [...new Set([...state.send_actions_list, action.track_action])]
      });

    case constants.SET_PROJECT_ACTIONS_LIST:
      return Object.assign({}, state, {
        project_actions_list: action.project_actions_list
      });

    case constants.SET_IS_ACTIONS_SAVING:
      return Object.assign({}, state, {
        isActionSaving: action.isActionSaving
      });

    case constants.SET_IS_ACTIONS_RESTORING:
      return Object.assign({}, state, {
        isActionRestoring: action.isActionRestoring
      });

    default:
      return state;
  }
}

export const undoableTrackingReducers = undoable(trackingReducers, {
  limit: false,
  filter: includeAction(constants.APPEND_ACTIONS_LIST)
});
