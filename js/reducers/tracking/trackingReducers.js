import { constants } from './constants';
import { undoable } from '../../undoredo/reducer';
import { includeAction } from '../../undoredo/helpers';

export const INITIAL_STATE = {
  track_actions_list: [],
  undo_redo_actions_list: [],
  current_actions_list: [],
  isTrackingMoleculesRestoring: false,
  isTrackingCompoundsRestoring: false,
  isUndoRedoAction: false,
  isActionsSending: false,
  isActionsLoading: false,
  isActionSaving: false,
  send_actions_list: [],
  project_actions_list: [],
  snapshotActionImageList: [],
  isActionRestoring: false,
  isActionRestored: false,
  isActionTracking: false,
  trackingImageSource: '',
  isProjectActionListLoaded: false,
  skipOrientationChange: false,
  isSnapshotDirty: false
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

    case constants.APPEND_UNDO_REDO_ACTIONS_LIST:
      return Object.assign({}, state, {
        undo_redo_actions_list: [...new Set([...state.undo_redo_actions_list, action.track_action])]
      });

    case constants.SET_UNDO_REDO_ACTIONS_LIST:
      return {
        ...state,
        undo_redo_actions_list: action.undo_redo_actions_list
      };

    case constants.SET_CURRENT_ACTIONS_LIST:
      return Object.assign({}, state, {
        current_actions_list: [...action.current_actions_list]
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
        send_actions_list: [...action.send_actions_list]
      });

    case constants.APPEND_SEND_ACTIONS_LIST:
      return Object.assign({}, state, {
        send_actions_list: [...new Set([...state.send_actions_list, action.track_action])]
      });

    case constants.SET_PROJECT_ACTIONS_LIST:
      return Object.assign({}, state, {
        project_actions_list: action.project_actions_list
      });

    case constants.SET_SNAPSOT_IMAGE_ACTIONS_LIST:
      return Object.assign({}, state, {
        snapshotActionImageList: action.snapshotActionImageList
      });

    case constants.SET_IS_ACTIONS_SAVING:
      return Object.assign({}, state, {
        isActionSaving: action.isActionSaving
      });

    case constants.SET_IS_ACTIONS_RESTORING:
      return Object.assign({}, state, {
        isActionRestoring: action.isActionRestoring,
        isActionRestored: action.isActionRestored
      });

    case constants.SET_PROJECT_ACTIONS_LIST_LOADED:
      return { ...state, isProjectActionListLoaded: action.isLoaded };

    case constants.SET_IS_ACTION_TRACKING:
      return Object.assign({}, state, {
        isActionTracking: action.isActionTracking
      });

    case constants.SET_TRACKING_IMAGE_SOURCE:
      return Object.assign({}, state, {
        trackingImageSource: action.payload
      });

    case constants.SET_SKIP_ORIENTATION_CHANGE:
      return { ...state, skipOrientationChange: action.skipOrientationChange };

    case constants.SET_IS_SNAPSHOT_DIRTY:
      return { ...state, isSnapshotDirty: action.isSnapshotDirty };

    case constants.RESET_TRACKING_STATE:
      return INITIAL_STATE;

    default:
      return state;
  }
}

export const undoableTrackingReducers = undoable(trackingReducers, {
  limit: false,
  filter: includeAction(constants.SET_UNDO_REDO_ACTIONS_LIST)
});
