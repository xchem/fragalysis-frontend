import { reloadApiState, setSessionTitle } from '../../../reducers/api/actions';
import { reloadSelectionReducer } from '../../../reducers/selection/actions';
import { api, METHOD } from '../../../utils/api';
import {
  setDisableRedirect,
  setIsLoadingListOfSnapshots,
  setIsLoadingSnapshotDialog,
  setListOfSnapshots,
  setOpenSnapshotSavingDialog,
  setSharedSnapshot,
  setSnapshotJustSaved
} from './actions';
import { setDialogCurrentStep } from '../../snapshot/redux/actions';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import {
  assignSnapshotToProject,
  createProjectFromSnapshotDialog,
  createProjectWithoutStateModification,
  loadSnapshotTree
} from '../../projects/redux/dispatchActions';
import { reloadPreviewReducer } from '../../preview/redux/dispatchActions';
import { ProjectCreationType, SnapshotType } from '../../projects/redux/constants';
import moment from 'moment';
import { setProteinLoadingState } from '../../../reducers/ngl/actions';
import { reloadNglViewFromSnapshot } from '../../../reducers/ngl/dispatchActions';
import { base_url, URLS } from '../../routes/constants';
import {
  resetCurrentSnapshot,
  setCurrentSnapshot,
  setForceCreateProject,
  setForceProjectCreated
} from '../../projects/redux/actions';
import { selectFirstMolGroup } from '../../preview/moleculeGroups/redux/dispatchActions';
import { reloadDatasetsReducer } from '../../datasets/redux/actions';
import {
  saveCurrentActionsList,
  addCurrentActionsListToSnapshot,
  sendTrackingActionsByProjectId,
  manageSendTrackingActions
} from '../../../reducers/tracking/dispatchActions';
import { captureScreenOfSnapshot } from '../../userFeedback/browserApi';
import { setCurrentProject } from '../../projects/redux/actions';
import { createProjectPost } from '../../../utils/discourse';

export const getListOfSnapshots = () => (dispatch, getState) => {
  const userID = DJANGO_CONTEXT['pk'] || null;
  if (userID !== null) {
    dispatch(setIsLoadingListOfSnapshots(true));
    return api({ url: `${base_url}/api/snapshots/?session_project__isnull=False&author=${userID}` })
      .then(response => {
        if (response && response.data && response.data.results) {
          dispatch(setListOfSnapshots(response.data.results));
        }
      })
      .finally(() => {
        dispatch(setIsLoadingListOfSnapshots(false));
      });
  } else {
    return Promise.resolve();
  }
};

export const reloadSession = (snapshotData, nglViewList) => (dispatch, getState) => {
  const state = getState();
  const snapshotTitle = state.projectReducers.currentSnapshot.title;

  dispatch(reloadApiState(snapshotData.apiReducers));
  // dispatch(setSessionId(myJson.id));
  dispatch(setSessionTitle(snapshotTitle));

  if (nglViewList.length > 0) {
    dispatch(reloadSelectionReducer(snapshotData.selectionReducers));
    dispatch(reloadDatasetsReducer(snapshotData.datasetsReducers));

    nglViewList.forEach(nglView => {
      dispatch(reloadNglViewFromSnapshot(nglView.stage, nglView.id, snapshotData.nglReducers));
    });

    if (snapshotData.selectionReducers.vectorOnList.length !== 0) {
      dispatch(reloadPreviewReducer(snapshotData.previewReducers));
    }
  }

  dispatch(setProteinLoadingState(true));
};

export const saveCurrentSnapshot = ({
  type,
  title,
  author,
  description,
  data,
  created,
  parent,
  children,
  session_project = null
}) => (dispatch, getState) => {
  dispatch(resetCurrentSnapshot());
  return api({
    url: `${base_url}/api/snapshots/`,
    data: { type, title, author, description, created, parent, data: '[]', children, session_project },
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
    })
    .finally(() => {
      dispatch(getListOfSnapshots());
    });
};

export const createInitialSnapshot = (projectID, summaryView) => async (dispatch, getState) => {
  const { apiReducers, nglReducers, selectionReducers, previewReducers, datasetsReducers } = getState();
  const data = { apiReducers, nglReducers, selectionReducers, previewReducers, datasetsReducers };
  const type = SnapshotType.INIT;
  const title = 'Initial Snapshot';
  const author = DJANGO_CONTEXT.pk || null;
  const description = 'Auto generated initial snapshot';
  const parent = null;
  const children = [];
  const created = moment();

  // store initial snapshot to BE
  if (projectID) {
    await dispatch(saveCurrentSnapshot({ type, title, author, description, data, created, parent, children }));

    await dispatch(assignSnapshotToProject({ projectID, snapshotID: getState().projectReducers.currentSnapshot.id }));
    dispatch(loadSnapshotTree(projectID)).catch(error => {
      throw new Error(error);
    });
  }
  // store initial snapshot only to redux state
  else {
    await dispatch(
      setCurrentSnapshot({
        id: null,
        type,
        title,
        author,
        description,
        created,
        parent,
        children,
        data
      })
    );
    dispatch(selectFirstMolGroup({ summaryView }));
  }
};

export const createInitSnapshotFromCopy = ({
  title,
  author,
  description,
  data,
  created,
  parent,
  children,
  session_project
}) => (dispatch, getState) => {
  if (session_project) {
    return dispatch(
      saveCurrentSnapshot({
        type: SnapshotType.INIT,
        title,
        author,
        description,
        data,
        created,
        parent,
        children,
        session_project
      })
    );
  }
  return Promise.reject('ProjectID is missing');
};

export const createNewSnapshot = ({
  title,
  description,
  type,
  author,
  parent,
  session_project,
  nglViewList,
  overwriteSnapshot,
  createDiscourse = false
}) => (dispatch, getState) => {
  const state = getState();
  const selectedSnapshotToSwitch = state.snapshotReducers.selectedSnapshotToSwitch;
  const disableRedirect = state.snapshotReducers.disableRedirect;
  const currentSnapshot = state.projectReducers.currentSnapshot;
  const currentSnapshotId = currentSnapshot && currentSnapshot.id;

  if (!session_project) {
    return Promise.reject('Project ID is missing!');
  }

  if (overwriteSnapshot === true && currentSnapshotId) {
    dispatch(setIsLoadingSnapshotDialog(true));
    let project = { projectID: session_project, authorID: author };

    return Promise.resolve(dispatch(addCurrentActionsListToSnapshot(currentSnapshot, project, nglViewList))).then(
      () => {
        if (disableRedirect === false && selectedSnapshotToSwitch != null) {
          window.location.replace(`${URLS.projects}${session_project}/${selectedSnapshotToSwitch}`);
        } else {
          dispatch(setIsLoadingSnapshotDialog(false));
          dispatch(setOpenSnapshotSavingDialog(false));
        }
      }
    );
  } else {
    let newType = type;

    return Promise.all([
      dispatch(setIsLoadingSnapshotDialog(true)),
      api({ url: `${base_url}/api/snapshots/?session_project=${session_project}&type=INIT` }).then(response => {
        if (response.data.count === 0) {
          newType = SnapshotType.INIT;
          // Without this, the snapshot tree wouldnt work
          dispatch(setForceProjectCreated(false));
        }

        return api({
          url: `${base_url}/api/snapshots/`,
          data: {
            title,
            description,
            type: newType,
            author,
            parent,
            session_project,
            data: '[]',
            children: []
          },
          method: METHOD.POST
        }).then(res => {
          // redirect to project with newest created snapshot /:projectID/:snapshotID
          if (res.data.id && session_project) {
            let snapshot = { id: res.data.id, title: title };
            let project = { projectID: session_project, authorID: author };
            console.log('created snapshot id: ' + res.data.id);

            Promise.resolve(dispatch(saveCurrentActionsList(snapshot, project, nglViewList))).then(() => {
              if (disableRedirect === false) {
                if (selectedSnapshotToSwitch != null) {
                  window.location.replace(`${URLS.projects}${session_project}/${selectedSnapshotToSwitch}`);
                } else {
                  // A hacky way of changing the URL without triggering react-router
                  window.history.replaceState(
                    null,
                    null,
                    `${URLS.projects}${session_project}/${
                      selectedSnapshotToSwitch === null ? res.data.id : selectedSnapshotToSwitch
                    }`
                  );
                  api({ url: `${base_url}/api/session-projects/${session_project}/` })
                    .then(async projectResponse => {
                      const response = await api({
                        url: `${base_url}/api/snapshots/?session_project=${session_project}`
                      });

                      const length = response.data.results.length;
                      if (length === 0) {
                        dispatch(resetCurrentSnapshot());
                      } else {
                        const createdSnapshot =
                          response.data.results && response.data.results.find(r => r.id === res.data.id);
                        console.log('created snapshot: ' + JSON.stringify(createdSnapshot));

                        if (createdSnapshot !== undefined && createdSnapshot !== null) {
                          // If the tree fails to load, bail out first without modifying the store
                          await dispatch(loadSnapshotTree(projectResponse.data.id));
                          await dispatch(
                            setCurrentSnapshot({
                              id: createdSnapshot.id,
                              type: createdSnapshot.type,
                              title: createdSnapshot.title,
                              author: createdSnapshot.author,
                              description: createdSnapshot.description,
                              created: createdSnapshot.created,
                              children: createdSnapshot.children,
                              parent: createdSnapshot.parent,
                              data: '[]'
                            })
                          );
                          await dispatch(
                            setCurrentProject({
                              projectID: projectResponse.data.id,
                              authorID: (projectResponse.data.author && projectResponse.data.author.id) || null,
                              title: projectResponse.data.title,
                              description: projectResponse.data.description,
                              targetID: projectResponse.data.target.id,
                              tags: JSON.parse(projectResponse.data.tags)
                            })
                          );
                          if (createDiscourse) {
                            dispatch(createSnapshotDiscoursePost());
                          }
                          dispatch(setOpenSnapshotSavingDialog(false));
                          dispatch(setIsLoadingSnapshotDialog(false));
                          dispatch(setSnapshotJustSaved(projectResponse.data.id));
                          dispatch(setDialogCurrentStep());
                        }
                      }
                    })
                    .catch(error => {
                      dispatch(resetCurrentSnapshot());
                      dispatch(setIsLoadingSnapshotDialog(false));
                      console.log(`Error while saving snapshot: ${error}`);
                    });
                }
              } else {
                dispatch(setOpenSnapshotSavingDialog(false));
                dispatch(setIsLoadingSnapshotDialog(false));
                dispatch(
                  setSharedSnapshot({
                    title,
                    description,
                    url: `${base_url}${URLS.projects}${session_project}/${res.data.id}`
                  })
                );
              }
            });
          }
        });
      })
    ]);
  }
};

export const createSnapshotDiscoursePost = () => (dispatch, getState) => {
  const state = getState();
  const currentProject = state.projectReducers.currentProject;
  const currentSnapshot = state.projectReducers.currentSnapshot;
  const targetName = state.apiReducers.target_on_name;
  const url = `${base_url}${URLS.projects}${currentProject.projectID}/${currentSnapshot.id}`;
  const msg = `${url}`;
  return createProjectPost(currentProject.title, targetName, msg, []);
};

export const activateSnapshotDialog = (loggedInUserID = undefined, finallyShareSnapshot = false) => (
  dispatch,
  getState
) => {
  const state = getState();
  const targetId = state.apiReducers.target_on;
  const projectID = state.projectReducers.currentProject.projectID;
  const currentSnapshotAuthor = state.projectReducers.currentSnapshot.author;

  dispatch(captureScreenOfSnapshot());
  dispatch(manageSendTrackingActions());
  dispatch(setDisableRedirect(finallyShareSnapshot));

  if (!loggedInUserID && targetId) {
    const data = {
      title: ProjectCreationType.READ_ONLY,
      description: ProjectCreationType.READ_ONLY,
      target: targetId,
      author: null,
      tags: '[]'
    };
    dispatch(createProjectFromSnapshotDialog(data))
      .then(() => {
        dispatch(manageSendTrackingActions(projectID, true));
        dispatch(setOpenSnapshotSavingDialog(true));
      })
      .catch(error => {
        throw new Error(error);
      });
  } else if (finallyShareSnapshot === true && loggedInUserID && projectID !== null && currentSnapshotAuthor === null) {
    dispatch(setForceCreateProject(true));
    dispatch(setOpenSnapshotSavingDialog(true));
  } else {
    dispatch(setOpenSnapshotSavingDialog(true));
  }
};

export const createNewSnapshotWithoutStateModification = ({
  title,
  description,
  type,
  author,
  parent,
  session_project,
  nglViewList
}) => (dispatch, getState) => {
  if (!session_project) {
    return Promise.reject('Project ID is missing!');
  }

  let newType = type;

  return api({ url: `${base_url}/api/snapshots/?session_project=${session_project}&type=INIT` }).then(response => {
    if (response.data.count === 0) {
      newType = SnapshotType.INIT;
    }

    return api({
      url: `${base_url}/api/snapshots/`,
      data: {
        title,
        description,
        type: newType,
        author,
        parent,
        session_project,
        data: '[]',
        children: []
      },
      method: METHOD.POST
    }).then(res => {
      if (res.data.id && session_project) {
        dispatch(
          setSharedSnapshot({
            title,
            description,
            url: `${base_url}${URLS.projects}${session_project}/${res.data.id}`,
            disableRedirect: true
          })
        );

        let snapshot = { id: res.data.id, title: title };
        let project = { projectID: session_project, authorID: author };
        dispatch(saveCurrentActionsList(snapshot, project, nglViewList, true));
      }
    });
  });
};

export const saveAndShareSnapshot = (nglViewList, showDialog = true) => async (dispatch, getState) => {
  const state = getState();
  const targetId = state.apiReducers.target_on;
  const loggedInUserID = DJANGO_CONTEXT['pk'];

  dispatch(setDisableRedirect(true));

  if (targetId) {
    dispatch(captureScreenOfSnapshot());
    if (showDialog) {
      dispatch(setIsLoadingSnapshotDialog(true));
    }
    const data = {
      title: ProjectCreationType.READ_ONLY,
      description: ProjectCreationType.READ_ONLY,
      target: targetId,
      author: loggedInUserID || null,
      tags: '[]'
    };

    try {
      let projectID = await dispatch(createProjectWithoutStateModification(data));
      const username = DJANGO_CONTEXT['username'];
      const title = moment().format('-- YYYY-MM-DD -- HH:mm:ss');
      const description =
        loggedInUserID === undefined ? 'Snapshot generated by anonymous user' : `snapshot generated by ${username}`;
      const type = SnapshotType.MANUAL;
      const author = loggedInUserID || null;
      const parent = null;
      const session_project = projectID;

      await dispatch(sendTrackingActionsByProjectId(projectID, author));

      await dispatch(
        createNewSnapshotWithoutStateModification({
          title,
          description,
          type,
          author,
          parent,
          session_project,
          nglViewList
        })
      );

      if (showDialog) {
        dispatch(setIsLoadingSnapshotDialog(false));
      }
    } catch (error) {
      if (showDialog) {
        dispatch(setIsLoadingSnapshotDialog(false));
      }
      throw new Error(error);
    }
  }
};
