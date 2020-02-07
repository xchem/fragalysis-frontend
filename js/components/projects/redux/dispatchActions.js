import { setProjectSnapshot } from './actions';

export const saveCurrentSnapshot = (snapshot, snapshotDetail) => dispatch => {
  dispatch(setProjectSnapshot(snapshot, snapshotDetail));
  // TODO store snapshot to BE
};
