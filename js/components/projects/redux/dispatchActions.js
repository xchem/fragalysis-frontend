import { setProjectSnapshot } from './actions';
import { api } from '../../../utils/api';
import { base_url } from '../../routes/constants';
import { reloadNglViewFromSnapshot } from '../../../reducers/ngl/dispatchActions';

export const saveCurrentSnapshot = (snapshot, snapshotDetail) => (dispatch, getState) => {
  dispatch(setProjectSnapshot(snapshot, snapshotDetail));
};

export const storeSnapshotToProject = (snapshot, snapshotDetail, projectId) => (dispatch, getState) => {
  // TODO store snapshot to BE
  return api({ url: `${base_url}/api/project/${projectId}`, data: { snapshot, snapshotDetail } });
};

export const loadProjectFromSnapshot = (stage, stageId, snapshotData) => (dispatch, getState) => {
  dispatch(reloadNglViewFromSnapshot(stage, stageId, snapshotData));
  dispatch(setProjectSnapshot(snapshotData.snapshot, snapshotData.snapshotDetail));
};
