import {
  setListOfProjects,
  setCurrentSnapshot,
  resetCurrentSnapshot,
  setCurrentProjectProperty,
  setProjectModalIsLoading,
  setCurrentSnapshotTree,
  setCurrentSnapshotList,
  setIsLoadingTree,
  setIsLoadingCurrentSnapshot,
  setCurrentProject,
  setForceCreateProject,
  setForceProjectCreated,
  setIsLoadingListOfProjects,
  setCurrentProjectDiscourseLink,
  setJobLauncherSquonkUrl,
  setJobList
} from './actions';
import { api, METHOD } from '../../../utils/api';
import { base_url, URLS } from '../../routes/constants';
import { setDialogCurrentStep } from '../../snapshot/redux/actions';
import { createInitSnapshotFromCopy, getListOfSnapshots } from '../../snapshot/redux/dispatchActions';
import { SnapshotType } from './constants';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { sendInitTrackingActionByProjectId } from '../../../reducers/tracking/dispatchActions';
import { resetTrackingState, setIsSnapshotDirty } from '../../../reducers/tracking/actions';
import { createProjectPost } from '../../../utils/discourse';
import { setOpenDiscourseErrorModal } from '../../../reducers/api/actions';

import moment from 'moment';
import { resetNglTrackingState } from '../../../reducers/nglTracking/dispatchActions';
import _ from 'lodash';

export const assignSnapshotToProject = ({ projectID, snapshotID, ...rest }) => (dispatch, getState) => {
  dispatch(resetCurrentSnapshot());
  return api({
    url: `${base_url}/api/snapshots/${snapshotID}/`,
    data: { session_project: projectID, ...rest },
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
          data: '[]'
        })
      )
    )

    .catch(error => {
      throw new Error(error);
    })
    .finally(() => {
      dispatch(getListOfSnapshots());
    });
};

export const loadListOfAllProjects = () => (dispatch, getState) => {
  const userID = DJANGO_CONTEXT['pk'] || null;
  if (userID !== null) {
    dispatch(setIsLoadingListOfProjects(true));
    return api({ url: `${base_url}/api/session-projects/?author=${userID}` })
      .then(response => dispatch(setListOfProjects((response && response.data && response.data.results) || [])))
      .finally(() => {
        dispatch(setIsLoadingListOfProjects(false));
      });
  } else {
    return Promise.resolve();
  }
};

export const searchInProjects = title => (dispatch, getState) => {
  const userID = DJANGO_CONTEXT['pk'] || null;
  if (userID !== null) {
    dispatch(setIsLoadingListOfProjects(true));
    return api({ url: `${base_url}/api/session-projects/?author=${userID}&title=${title}` })
      .then(response => dispatch(setListOfProjects((response && response.data && response.data.results) || [])))
      .finally(() => {
        dispatch(setIsLoadingListOfProjects(false));
      });
  } else {
    return Promise.resolve();
  }
};

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

export const removeSnapshotTree = projectID => dispatch => {
  return api({ url: `${base_url}/api/snapshots/?session_project=${projectID}&type=INIT` }).then(response => {
    if (response.data.count === 0) {
      return Promise.resolve('Not found INITIAL snapshot');
    } else if (response.data.count === 1) {
      const tree = parseSnapshotAttributes(response.data.results[0]);
      if (tree.children && tree.children.length === 0) {
        return dispatch(removeChildren([tree.id]));
      }
      return dispatch(removeChildren(tree.children));
    }
  });
};

export const removeProject = projectID => dispatch => {
  dispatch(setIsLoadingTree(true));
  return dispatch(removeSnapshotTree(projectID))
    .then(() => dispatch(removeSnapshotTree(projectID)))
    .then(() =>
      api({ url: `${base_url}/api/session-projects/${projectID}/`, method: METHOD.DELETE }).then(() =>
        dispatch(loadListOfAllProjects())
      )
    )
    .finally(() => {
      dispatch(setIsLoadingTree(false));
      dispatch(getListOfSnapshots());
    });
};

export const loadSnapshotByProjectID = projectID => (dispatch, getState) => {
  const state = getState();
  const isLoadingCurrentSnapshot = state.projectReducers.isLoadingCurrentSnapshot;
  if (isLoadingCurrentSnapshot === false) {
    dispatch(setIsLoadingCurrentSnapshot(true));
    return api({ url: `${base_url}/api/snapshots/?session_project=${projectID}&type=INIT` })
      .then(response => {
        if (response.data.results.length === 0) {
          dispatch(resetCurrentSnapshot());
          return Promise.resolve(null);
        } else if (response.data.results[0] !== undefined) {
          console.log(`Snapshot from server: ${JSON.stringify(response.data.results[0])}`);
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
              data: response.data.results[0].data
            })
          );
          return Promise.resolve(response.data.results[0].id);
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

export const loadCurrentSnapshotByID = snapshotID => (dispatch, getState) => {
  const state = getState();
  const isLoadingCurrentSnapshot = state.projectReducers.isLoadingCurrentSnapshot;
  if (isLoadingCurrentSnapshot === false) {
    dispatch(setIsLoadingCurrentSnapshot(true));
    return api({ url: `${base_url}/api/snapshots/${snapshotID}` })
      .then(response => {
        if (response.data.id === undefined) {
          dispatch(resetCurrentSnapshot());
          return Promise.resolve(null);
        } else {
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
              data: response.data.data
            })
          );
          return Promise.resolve(response.data);
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
  return api({ url: `${base_url}/api/snapshots/${snapshotID}` }).then(async response => {
    if (response.data && response.data.id !== undefined) {
      let currentSnapshotList = JSON.parse(JSON.stringify(getState().projectReducers.currentSnapshotList));
      if (currentSnapshotList === null) {
        currentSnapshotList = {};
      }
      const snapshot = parseSnapshotAttributes(response.data);
      currentSnapshotList[snapshotID] = snapshot;
      dispatch(setCurrentSnapshotList(currentSnapshotList));

      if (response.data.children && response.data.children.length > 0) {
        return dispatch(populateChildren(response.data.children));
      } else {
        return Promise.resolve(snapshot);
      }
    }
  });
};

const populateChildren = (children = []) => (dispatch, getState) => {
  if (children && children.length > 0) {
    return Promise.all(children.map(childID => dispatch(getSnapshotAttributesByID(childID))));
  }
};

export const loadSnapshotTree = projectID => (dispatch, getState) => {
  dispatch(setIsLoadingTree(true));
  dispatch(setCurrentSnapshotTree(null));
  return api({ url: `${base_url}/api/snapshots/?session_project=${projectID}&type=INIT` })
    .then(response => {
      if (response.data.count === 0) {
        return Promise.reject('Not found INITIAL snapshot');
      } else if (response.data.count === 1) {
        const tree = parseSnapshotAttributes(response.data.results[0]);
        dispatch(setCurrentSnapshotTree(tree));
        return dispatch(populateChildren([tree.id]));
      }
    })
    .finally(() => {
      dispatch(setIsLoadingTree(false));
      dispatch(setIsSnapshotDirty(false));
    });
};

export const createProjectFromSnapshotDialog = data => dispatch => {
  dispatch(setProjectModalIsLoading(true));
  return api({ url: `${base_url}/api/session-projects/`, method: METHOD.POST, data })
    .then(response => {
      const projectID = response.data.id;
      data.projectID = projectID;
      dispatch(setCurrentProjectProperty('projectID', projectID));
      dispatch(setCurrentProjectProperty('title', response.data.title));
    })
    .finally(() => {
      dispatch(setForceCreateProject(false));
      dispatch(setForceProjectCreated(true));
      dispatch(setDialogCurrentStep(1));
    });
};

export const createProjectDiscoursePost = (projectName, targetName, msg, tags) => (dispatch, getState) => {
  return createProjectPost(projectName, targetName, msg, tags)
    .then(response => {
      dispatch(setCurrentProjectDiscourseLink(response.data['Post url']));
    })
    .catch(err => {
      console.log(err);
      dispatch(setOpenDiscourseErrorModal(true));
    });
};

export const createProject = ({ title, description, target, author, tags, project }) => dispatch => {
  dispatch(setProjectModalIsLoading(true));
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

const copySnapshot = (selectedSnapshot, projectID, history) => dispatch => {
  return dispatch(
    createInitSnapshotFromCopy({
      title: selectedSnapshot.title,
      author: (selectedSnapshot && selectedSnapshot.author && selectedSnapshot.author.id) || null,
      description: selectedSnapshot.description,
      data: '[]',
      created: selectedSnapshot.created,
      parent: null,
      children: selectedSnapshot.children,
      session_project: projectID
    })
  )
    .then(() => {
      history.push(`${URLS.projects}${projectID}`);
    })
    .finally(() => {
      dispatch(setProjectModalIsLoading(false));
    });
};

export const createProjectFromSnapshot = ({ title, description, author, tags, history, parentSnapshotId }) => (
  dispatch,
  getState
) => {
  const listOfSnapshots = getState().snapshotReducers.listOfSnapshots;
  const currentProject = getState().targetReducers.currentProject;
  const selectedSnapshot = listOfSnapshots.find(item => item.id === parentSnapshotId);
  const snapshotData = JSON.parse(selectedSnapshot && selectedSnapshot.data);

  dispatch(setProjectModalIsLoading(true));
  dispatch(resetTrackingState());
  dispatch(resetNglTrackingState());
  return dispatch(
    createProject({
      title,
      description,
      target: (snapshotData && snapshotData.apiReducers && snapshotData.apiReducers.target_on) || null,
      author,
      tags,
      project: currentProject?.id
    })
  ).then(() => {
    const { projectID } = getState().projectReducers.currentProject;

    // in case when snapshot has assigned project => make copy
    if (selectedSnapshot && selectedSnapshot.session_project !== null) {
      return dispatch(copySnapshot(selectedSnapshot, projectID, history));
    }
    // in case when snapshot has not assigned project => mark snapshot as INIT and assign to project
    else if (selectedSnapshot && selectedSnapshot.session_project === null) {
      // in case when snapshot has no parent, use given snapshot, but mark it as INIT
      if (!selectedSnapshot.parent) {
        return dispatch(
          assignSnapshotToProject({
            projectID,
            snapshotID: selectedSnapshot.id,
            type: SnapshotType.INIT
          })
        )
          .then(() => {
            history.push(`${URLS.projects}${projectID}`);
          })
          .finally(() => {
            dispatch(setProjectModalIsLoading(false));
          });
      } // in case when snapshot has parent => create new snapshot with INIT type and copy all data from previous snapshot
      else {
        return dispatch(copySnapshot(selectedSnapshot, projectID, history));
      }
    }
  });
};

export const createProjectFromScratch = ({ title, description, target, author, tags, history, project }) => (
  dispatch,
  getState
) => {
  dispatch(setProjectModalIsLoading(true));
  dispatch(resetTrackingState());
  dispatch(resetNglTrackingState());
  return api({
    url: `${base_url}/api/session-projects/`,
    method: METHOD.POST,
    data: { title, description, target, author, tags, project }
  })
    .then(response => {
      const projectID = response.data.id;
      const title = response.data.title;
      const authorID = response.data.author;
      const description = response.data.description;
      const targetID = response.data.target;
      const tags = response.data.tags;

      dispatch(setCurrentProject({ projectID, authorID, title, description, targetID, tags }));

      let promises = [];
      promises.push(dispatch(createInitSnapshotToProjectWitActions(projectID, authorID, null, targetID)));

      Promise.all(promises).then(() => {
        // create project_target relationShip on BE
        history.push(`${URLS.projects}${projectID}`);
      });
    })
    .finally(() => {
      dispatch(setProjectModalIsLoading(false));
    });
};

export const createProjectWithoutStateModification = data => async () => {
  const response = await api({ url: `${base_url}/api/session-projects/`, method: METHOD.POST, data });
  return response.data.id;
};

export const createInitSnapshotToProjectWitActions = (session_project, author, parent, target) => (
  dispatch,
  getState
) => {
  let type = SnapshotType.INIT;
  const created = moment();
  const title = 'Initial Snapshot';
  const description = 'Auto generated initial snapshot';

  return Promise.all([
    api({ url: `${base_url}/api/snapshots/?session_project=${session_project}&type=INIT` }).then(response => {
      return api({
        url: `${base_url}/api/snapshots/`,
        data: {
          title,
          description,
          type: type,
          author,
          parent,
          session_project,
          data: '[]',
          children: []
        },
        method: METHOD.POST
      }).then(res => {
        dispatch(
          setCurrentSnapshot({
            id: res.data.id,
            type,
            title,
            author,
            description,
            created,
            parent,
            children: res.data.children,
            data: '[]'
          })
        );
        dispatch(sendInitTrackingActionByProjectId(target));
      });
    })
  ]);
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
  const resultCall = await api({
    url: `${base_url}/api/job_config/?job_name=${job_name.trim()}&job_version=${job_version.trim()}&job_collection=${job_collection.trim()}`
  });

  return resultCall.data;
};

const getJobOverrides = async () => {
  const resultCall = await api({
    url: `${base_url}/api/job_override/`
  });
  return resultCall.data.results[0].override;
};
