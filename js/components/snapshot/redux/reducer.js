import { constants } from './constants';

export const initSharedSnapshot = {
  url: null,
  title: null,
  description: null,
  disableRedirect: false
};

export const INITIAL_STATE = {
  saveType: '',
  nextUuid: '',
  newSessionFlag: 0,
  loadedSession: undefined,
  openSavingDialog: false,
  dialogCurrentStep: 0,
  isLoadingSnapshotDialog: false,
  listOfSnapshots: [],
  isLoadingListOfSnapshots: false,
  sharedSnapshotURL: null,
  sharedSnapshot: initSharedSnapshot,
  isOpenModalSaveSnapshotBeforeExit: false,
  selectedSnapshotToSwitch: null,
  disableRedirect: false,
  snapshotJustSaved: false,
  dontShowShareSnapshot: false
};

export const snapshotReducers = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.SET_SAVE_TYPE:
      return Object.assign({}, state, {
        saveType: action.payload
      });

    case constants.SET_NEXT_UUID:
      return Object.assign({}, state, {
        nextUuid: action.payload
      });

    case constants.SET_NEW_SESSION_FLAG:
      return Object.assign({}, state, {
        newSessionFlag: action.payload
      });

    case constants.SET_LOADED_SESSION:
      return Object.assign({}, state, {
        loadedSession: action.payload
      });
    case constants.SET_OPEN_SAVING_DIALOG:
      return Object.assign({}, state, {
        openSavingDialog: action.payload
      });

    case constants.SET_DIALOG_CURRENT_STEP:
      return Object.assign({}, state, {
        dialogCurrentStep: action.payload
      });

    case constants.SET_IS_LOADING_SNAPSHOT_DIALOG:
      return Object.assign({}, state, {
        isLoadingSnapshotDialog: action.payload
      });

    case constants.SET_LIST_OF_SNAPSHOTS:
      return Object.assign({}, state, {
        listOfSnapshots: action.payload
      });

    case constants.SET_IS_LOADING_LIST_OF_SNAPSHOTS:
      return Object.assign({}, state, {
        isLoadingListOfSnapshots: action.payload
      });
    case constants.SET_SHARED_SNAPSHOT:
      return Object.assign({}, state, {
        sharedSnapshot: { ...initSharedSnapshot, ...action.payload }
      });

    case constants.SET_IS_OPEN_MODAL_BEFORE_EXIT:
      return Object.assign({}, state, {
        isOpenModalSaveSnapshotBeforeExit: action.payload
      });

    case constants.SET_SELECTED_SNAPSHOT_TO_SWITCH:
      return Object.assign({}, state, {
        selectedSnapshotToSwitch: action.payload
      });
    case constants.SET_DISABLE_REDIRECT:
      return Object.assign({}, state, {
        disableRedirect: action.payload
      });
    
    case constants.SET_DONT_SHOW_SHARE_SNAPSHOT:
      return Object.assign({}, state, {
        dontShowShareSnapshot: action.payload
      });

    case constants.SET_SNAPSHOT_JUST_SAVED: {
      return Object.assign({}, state, {
        snapshotJustSaved: action.payload
      });
    }

    default:
      return state;
  }
};
