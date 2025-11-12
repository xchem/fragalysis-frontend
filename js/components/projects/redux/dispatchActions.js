import {
  setCurrentSnapshot,
  resetCurrentSnapshot,
  setCurrentSnapshotList,
  setIsLoadingCurrentSnapshot,
  setCurrentProject
} from './actions';
import { api, METHOD } from '../../../utils/api';
import { base_url } from '../../routes/constants';
import { createProjectPost } from '../../../utils/discourse';
import { setIsSnapshot, setOpenDiscourseErrorModal } from '../../../reducers/api/actions';

import _ from 'lodash';
import { setEntireState } from '../../../reducers/actions';
import { loadTargetList } from '../../target/redux/dispatchActions';
import { changeSnapshot } from '../../snapshot/redux/dispatchActions';

export const removeSnapshotByID = snapshotID => dispatch => {
  return api({ url: `${base_url}/api/snapshots/${snapshotID}` }).then(response => {
    if (response.data && response.data.id !== undefined) {
      if (response.data.children && response.data.children.length > 0) {
        return dispatch(removeChildren(response.data.children));
      } else {
        return api({ url: `${base_url}/api/snapshots/${snapshotID}/`, method: METHOD.DELETE });
      }
    }
  });
};

const removeChildren = (children = []) => dispatch => {
  if (children && children.length > 0) {
    return Promise.all(children.map(childID => dispatch(removeSnapshotByID(childID))));
  }
};

const downloadSnapshotState = async snapshotId => {
  const snapshotState = await api({ url: `${base_url}/api/snapshot_state/${snapshotId}/` });
  return snapshotState.data.state;
};

export const loadSnapshotByProjectID = projectID => async (dispatch, getState) => {
  const state = getState();
  const isLoadingCurrentSnapshot = state.projectReducers.isLoadingCurrentSnapshot;
  if (isLoadingCurrentSnapshot === false) {
    dispatch(setIsLoadingCurrentSnapshot(true));
    dispatch(setIsSnapshot(true));
    return api({ url: `${base_url}/api/session-projects/${projectID}/` }).then(projectResponse => {
      return api({ url: `${base_url}/api/snapshots/?session_project=${projectID}&type=INIT` })
        .then(async response => {
          if (response.data.results.length === 0) {
            dispatch(resetCurrentSnapshot());
            return Promise.resolve(null);
          } else if (response.data.results[0] !== undefined) {
            const snapshot = response.data.results[0];
            console.log(`Snapshot from server: ${JSON.stringify(response.data.results[0])}`);
            console.log(`RenderingProgressDialog - before applying state`);
            let snapshotState = null;
            if (snapshot.additional_info.snapshotState) {
              snapshotState = snapshot.additional_info.snapshotState;
            } else {
              snapshotState = await downloadSnapshotState(snapshot.id);
            }

            snapshotState.nglReducers.isNGLQueueEmpty = false;
            dispatch(setEntireState(snapshotState));
            dispatch(
              setCurrentSnapshot({
                id: snapshot.id,
                type: snapshot.type,
                title: snapshot.title,
                author: snapshot.author,
                description: snapshot.description,
                created: snapshot.created,
                children: snapshot.children,
                parent: snapshot.parent,
                data: snapshot.data
              })
            );
            dispatch(
              setCurrentProject({
                projectID: projectResponse.data.id,
                authorID: projectResponse.data.author || null,
                title: projectResponse.data.title,
                description: projectResponse.data.description,
                targetID: projectResponse.data.target.id,
                tags: JSON.parse(projectResponse.data.tags)
              })
            );
            return Promise.resolve(snapshot.id);
          }
        })
        .catch(error => {
          dispatch(resetCurrentSnapshot());
        })
        .finally(() => {
          dispatch(setIsLoadingCurrentSnapshot(false));
        });
    });
  }
  return Promise.resolve(false);
};

export const loadCurrentSnapshotByIDOverlay = (projectId, snapshotID) => async (dispatch, getState) => {
  const state = getState();

  const isLoadingCurrentSnapshot = state.projectReducers.isLoadingCurrentSnapshot;
  if (isLoadingCurrentSnapshot) {
    return Promise.resolve(false);
  }

  try {
    dispatch(setIsLoadingCurrentSnapshot(true));
    dispatch(setIsSnapshot(true));

    //we don't need stage because we are not doing that animation that is done when switching snapshots from the UI
    // we are directly loading the snapshot state
    const snapshotResponse = await dispatch(changeSnapshot(projectId, snapshotID, null, true, true));
    dispatch(
      setCurrentProject({
        projectID: snapshotResponse.data.session_project.id,
        authorID: snapshotResponse.data.session_project.author || null,
        title: snapshotResponse.data.session_project.title,
        description: snapshotResponse.data.session_project.description,
        targetID: snapshotResponse.data.session_project.target.id,
        tags: JSON.parse(snapshotResponse.data.session_project.tags)
      })
    );
    return snapshotResponse.data;
  } finally {
    dispatch(setIsLoadingCurrentSnapshot(false));
  }
};

export const loadCurrentSnapshotByID = snapshotID => (dispatch, getState) => {
  const state = getState();
  const isLoadingCurrentSnapshot = state.projectReducers.isLoadingCurrentSnapshot;
  if (isLoadingCurrentSnapshot === false) {
    dispatch(setIsLoadingCurrentSnapshot(true));
    dispatch(setIsSnapshot(true));
    return api({ url: `${base_url}/api/snapshots/${snapshotID}` })
      .then(async response => {
        if (response.data.id === undefined) {
          dispatch(resetCurrentSnapshot());
          return Promise.resolve(null);
        } else {
          const snapshot = response.data;
          let snapshotState = null;
          if (snapshot.additional_info.snapshotState) {
            snapshotState = snapshot.additional_info.snapshotState;
          } else {
            snapshotState = await downloadSnapshotState(snapshot.id);
            // console.log(`loadCurrentSnapshotByID - snapshotState: ${JSON.stringify(snapshotState)}`);
          }

          snapshotState.nglReducers.isNGLQueueEmpty = false;
          //need to overlay the current state with the snapshot state
          // dispatch(setEntireState(snapshotState));
          dispatch(changeSnapshot());
          dispatch(
            setCurrentSnapshot({
              id: snapshot.id,
              type: snapshot.type,
              title: snapshot.title,
              author: snapshot.author,
              description: snapshot.description,
              created: snapshot.created,
              children: snapshot.children,
              parent: snapshot.parent,
              data: snapshot.data
            })
          );
          dispatch(
            setCurrentProject({
              projectID: response.data.session_project.id,
              authorID: response.data.session_project.author || null,
              title: response.data.session_project.title,
              description: response.data.session_project.description,
              targetID: response.data.session_project.target.id,
              tags: JSON.parse(response.data.session_project.tags)
            })
          );
          // dispatch(loadTargetListPostStateRestore());
          return Promise.resolve(snapshot);
        }
      })
      .catch(error => {
        dispatch(resetCurrentSnapshot());
      })
      .finally(() => {
        dispatch(setIsLoadingCurrentSnapshot(false));
      });
  }
  return Promise.resolve(false);
};

const parseSnapshotAttributes = data => ({
  id: data.id,
  type: data.type,
  title: data.title,
  author: data.author,
  description: data.description,
  created: data.created,
  children: data.children,
  additional_info: data.additional_info
});

export const getSnapshotAttributesByID = snapshotID => (dispatch, getState) => {
  return api({ url: `${base_url}/api/snapshots/${snapshotID}` })
    .then(async response => {
      if (response.data && response.data.id !== undefined) {
        let currentSnapshotList = JSON.parse(JSON.stringify(getState().projectReducers.currentSnapshotList));
        if (currentSnapshotList === null) {
          currentSnapshotList = {};
        }
        const snapshot = parseSnapshotAttributes(response.data);
        currentSnapshotList = { ...currentSnapshotList, [`${snapshotID}`]: snapshot };
        // currentSnapshotList[`${snapshotID}`] = snapshot;
        dispatch(setCurrentSnapshotList(currentSnapshotList));

        if (response.data.children && response.data.children.length > 0) {
          return dispatch(populateChildren(response.data.children));
        } else {
          return Promise.resolve(snapshot);
        }
      }
    })
    .catch(error => {
      console.log(error);
    });
};

const populateChildren = (children = []) => (dispatch, getState) => {
  if (children && children.length > 0) {
    return Promise.all(children.map(childID => dispatch(getSnapshotAttributesByID(childID))));
  }
};

export const createProjectDiscoursePost = (projectName, targetName, msg, tags) => (dispatch, getState) => {
  return createProjectPost(projectName, targetName, msg, tags).catch(err => {
    console.log(err);
    dispatch(setOpenDiscourseErrorModal(true));
  });
};

export const createProject = ({ title, description, target, author, tags, project }) => dispatch => {
  return api({
    url: `${base_url}/api/session-projects/`,
    method: METHOD.POST,
    data: { title, description, target, author, tags, project }
  }).then(response => {
    const projectID = response.data.id;
    const title = response.data.title;
    const authorID = response.data.author;
    const description = response.data.description;
    const targetID = response.data.target;
    const tags = response.data.tags;

    return dispatch(setCurrentProject({ projectID, authorID, title, description, targetID, tags }));
  });
};

export const createProjectWithoutStateModification = data => async () => {
  const response = await api({ url: `${base_url}/api/session-projects/`, method: METHOD.POST, data });
  return response.data.id;
};

export const jobFileTransfer = data => {
  return api({
    url: `${base_url}/api/job_file_transfer/`,
    method: METHOD.POST,
    data
  });
};

export const jobRequest = data => {
  return api({
    url: `${base_url}/api/job_request/`,
    method: METHOD.POST,
    data
  });
};

export const getJobConfigurationsFromServer = () => async (dispatch, getState) => {
  const result = [];

  const overrides = await getJobOverrides();
  if (!overrides) {
    return result;
  }

  const availableJobs = overrides['fragalysis-jobs'].map((job, index) => {
    return { job_collection: job.job_collection, job_name: job.job_name, job_version: job.job_version, index: index };
  });
  if (!availableJobs) {
    return result;
  }

  for (let i = 0; i < availableJobs.length; i++) {
    const job = availableJobs[i];
    let jobConfig = await getJobConfigFromServer(job.job_collection, job.job_name, job.job_version);
    if (jobConfig) {
      jobConfig = preprocessJobConfig(jobConfig);
      // console.log(JSON.stringify(filteredJobConfig));
      const jobOject = {
        id: jobConfig.id,
        name: jobConfig.collection,
        description: jobConfig.description,
        slug: jobConfig.job,
        spec: jobConfig,
        overrides: overrides,
        overrideIndex: job.index
      };
      result.push(jobOject);
    }
  }

  return result;
};

const preprocessJobConfig = jobConfig => {
  const result = { ...jobConfig };
  removePropDeep(result, 'pattern');
  return result;
};

const removePropDeep = (obj, propName) => {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key === propName) {
      delete obj[key];
    } else if (_.isPlainObject(obj[key])) {
      removePropDeep(obj[key], propName);
    }
  }
};

const getJobConfigFromServer = async (job_collection, job_name, job_version) => {
  let resultCall = null;
  try {
    resultCall = await api({
      url: `${base_url}/api/job_config/?job_name=${job_name.trim()}&job_version=${job_version.trim()}&job_collection=${job_collection.trim()}`
    });
  } catch (e) {
    console.log(`Job configuration for ${job_collection} ${job_name} ${job_version} not found`);
  }

  return resultCall?.data;
};

const getJobOverrides = async () => {
  const resultCall = await api({
    url: `${base_url}/api/job_override/`
  });
  return resultCall.data?.results[0]?.override;
};
