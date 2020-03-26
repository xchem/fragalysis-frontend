import { setListOfProjects, setCurrentSnapshot, resetCurrentSnapshot } from './actions';
import { api, METHOD } from '../../../utils/api';
import { base_url } from '../../routes/constants';

export const saveCurrentSnapshot = ({ type, title, author, description, data, created, parent, children }) => (
  dispatch,
  getState
) => {
  return api({
    url: `${base_url}/api/snapshots/`,
    data: { type, title, author, description, data: JSON.stringify(data), created, parent, children },
    method: METHOD.POST
  })
    .then(response =>
      dispatch(
        setCurrentSnapshot({
          id: response.data.id,
          type,
          title,
          author,
          description,
          created,
          parent,
          children: response.data.children,
          data
        })
      )
    )
    .catch(error => {
      throw new Error(error);
    });
};

export const storeSnapshotToProject = ({ projectID, snapshotID }) => (dispatch, getState) => {
  return api({
    url: `${base_url}/api/snapshots/${snapshotID}/`,
    data: { session_project: projectID },
    method: METHOD.PATCH
  })
    .then(response =>
      dispatch(
        setCurrentSnapshot({
          id: response.data.id,
          type: response.data.type,
          title: response.data.title,
          author: response.data.author,
          description: response.data.description,
          created: response.data.created,
          children: response.data.children,
          parent: response.data.parent,
          data: JSON.parse(response.data.data)
        })
      )
    )
    .catch(error => {
      throw new Error(error);
    });
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
export const removeProject = projectID => dispatch => {
  return api({ url: `${base_url}/api/session-projects/${projectID}/`, method: METHOD.DELETE }).then(() =>
    dispatch(loadListOfProjects())
  );
};

export const loadSnapshotByProjectID = projectID => (dispatch, getState) => {
  return api({ url: `${base_url}/api/snapshots/?session_project=${projectID}&type=INIT` }).then(response => {
    if (response.data.results.length === 0) {
      dispatch(resetCurrentSnapshot());
      return Promise.resolve(null);
    } else if (response.data.results[0] !== undefined) {
      dispatch(
        setCurrentSnapshot({
          id: response.data.results[0].id,
          type: response.data.results[0].type,
          title: response.data.results[0].title,
          author: response.data.results[0].author,
          description: response.data.results[0].description,
          created: response.data.results[0].created,
          children: response.data.results[0].children,
          parent: response.data.results[0].parent,
          data: JSON.parse(response.data.results[0].data)
        })
      );
      return Promise.resolve(response.data.results[0].id);
    }
  });
};
