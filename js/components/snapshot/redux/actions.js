import { constants } from './constants';
import { initSharedSnapshot } from './reducer';

export const setOpenSnapshotSavingDialog = (isOpen = false) => ({
  type: constants.SET_OPEN_SAVING_DIALOG,
  payload: isOpen
});

export const setDialogCurrentStep = (currentStep = 0) => ({
  type: constants.SET_DIALOG_CURRENT_STEP,
  payload: currentStep
});

export const setIsLoadingSnapshotDialog = isLoading => ({
  type: constants.SET_IS_LOADING_SNAPSHOT_DIALOG,
  payload: isLoading
});

export const setListOfSnapshots = list => ({
  type: constants.SET_LIST_OF_SNAPSHOTS,
  payload: list
});

export const setIsLoadingListOfSnapshots = isLoading => ({
  type: constants.SET_IS_LOADING_LIST_OF_SNAPSHOTS,
  payload: isLoading
});

export const setSharedSnapshot = (sharedSnapshot = initSharedSnapshot) => ({
  type: constants.SET_SHARED_SNAPSHOT,
  payload: sharedSnapshot
});

export const setIsOpenModalBeforeExit = (isOpen = false) => ({
  type: constants.SET_IS_OPEN_MODAL_BEFORE_EXIT,
  payload: isOpen
});

export const setSelectedSnapshotToSwitch = (snapshot = null) => ({
  type: constants.SET_SELECTED_SNAPSHOT_TO_SWITCH,
  payload: snapshot
});

export const setDisableRedirect = (disable = false) => ({
  type: constants.SET_DISABLE_REDIRECT,
  payload: disable
});

export const setSnapshotJustSaved = (saved) => ({
  type: constants.SET_SNAPSHOT_JUST_SAVED,
  payload: saved
});

export const setDontShowShareSnapshot = (dontShow) => ({
  type: constants.SET_DONT_SHOW_SHARE_SNAPSHOT,
  payload: dontShow
});
