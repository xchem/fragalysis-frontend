import { setListOfProjects, setProjectSnapshot } from './actions';
import { api } from '../../../utils/api';
import { base_url } from '../../routes/constants';
import { reloadNglViewFromSnapshot } from '../../../reducers/ngl/dispatchActions';

export const saveCurrentSnapshot = (snapshot, snapshotDetail) => (dispatch, getState) => {
  dispatch(setProjectSnapshot(snapshot, snapshotDetail));
};

export const storeSnapshotToProject = (snapshot, snapshotDetail, projectId) => (dispatch, getState) => {
  // TODO store snapshot to BE
  return api({ url: `${base_url}/api/session-projects/${projectId}`, data: { snapshot, snapshotDetail } });
};

export const loadProjectFromSnapshot = (stage, stageId, snapshotData) => (dispatch, getState) => {
  dispatch(reloadNglViewFromSnapshot(stage, stageId, snapshotData));
  dispatch(setProjectSnapshot(snapshotData.snapshot, snapshotData.snapshotDetail));
};

export const loadListOfProjects = () => (dispatch, getState) => {
  return api({ url: `${base_url}/api/session-projects/` }).then(response =>
    dispatch(setListOfProjects((response && response.data && response.data.results) || []))
  );
};

export const searchInProjects = title => (dispatch, getState) => {
  return api({ url: `${base_url}/api/session-projects/?title=${title}` }).then(response =>
    dispatch(setListOfProjects((response && response.data && response.data.results) || []))
  );
};
