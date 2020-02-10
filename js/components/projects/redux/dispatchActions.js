import { setProjectSnapshot } from './actions';
import { api } from '../../../utils/api';
import { base_url } from '../../routes/constants';

export const saveCurrentSnapshot = (snapshot, snapshotDetail) => (dispatch, getState) => {
  dispatch(setProjectSnapshot(snapshot, snapshotDetail));
};

export const addSnapshotToProject = (snapshot, snapshotDetail, projectId) => (dispatch, getState) => {
  // TODO store snapshot to BE
  return api({ url: `${base_url}/api/project/${projectId}`, data: { snapshot, snapshotDetail } });
};
