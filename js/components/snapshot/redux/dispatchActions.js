import {
  reloadApiState,
  setIsSnapshot,
  setSessionTitle,
  setSnapshotLoadingInProgress
} from '../../../reducers/api/actions';
import {
  reloadSelectionReducer,
  setToBeDisplayedList,
  updateInToBeDisplayedList
} from '../../../reducers/selection/actions';
import { api, METHOD } from '../../../utils/api';
import {
  appendToListOfSnapshots,
  appendToSnapshotsCreatedThisSession,
  setDisableRedirect,
  setIsLoadingListOfSnapshots,
  setIsLoadingSnapshotDialog,
  setListOfSnapshots,
  setOpenSnapshotSavingDialog,
  setSharedSnapshot,
  setSnapshotIsSaving,
  setSnapshotJustSaved
} from './actions';
import { setDialogCurrentStep } from '../../snapshot/redux/actions';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { createProjectWithoutStateModification } from '../../projects/redux/dispatchActions';
import { reloadPreviewReducer } from '../../preview/redux/dispatchActions';
import { ProjectCreationType, SnapshotType } from '../../projects/redux/constants';
import moment from 'moment';
import {
  setIsSnapshotRendering,
  setNglObjectsInSnapshotToBeRendered,
  setProteinLoadingState,
  setReapplyOrientation
} from '../../../reducers/ngl/actions';
import { reloadNglViewFromSnapshot } from '../../../reducers/ngl/dispatchActions';
import { base_url, URLS } from '../../routes/constants';
import { resetCurrentSnapshot, setCurrentSnapshot } from '../../projects/redux/actions';
import { selectFirstMolGroup } from '../../preview/moleculeGroups/redux/dispatchActions';
import {
  reloadDatasetsReducer,
  setToBeDisplayedListForDataset,
  setToBeDisplayedLists,
  updateInToBeDisplayedListForDataset
} from '../../datasets/redux/actions';
import {
  captureScreenOfSnapshotFullScreen,
  captureScreenOfSnapshotNglScreen,
  rescaleImage
} from '../../userFeedback/browserApi';
import { setCurrentProject } from '../../projects/redux/actions';
import { createProjectPost } from '../../../utils/discourse';
import {
  deepClone,
  deepEqual,
  deepMergeWithPriority,
  deepMergeWithPriorityAndBlackList,
  deepMergeWithPriorityAndWhiteList
} from '../../../utils/objectUtils';
import {
  SNAPSHOT_VALUES_NOT_TO_BE_DELETED_SWITCHING_TARGETS,
  SNAPSHOT_VALUES_TO_BE_DELETED,
  SNAPSHOT_VALUES_TO_BE_DELETED_SWITCHING_SNAPSHOTS
} from './utilitySnapshotShapes';
import { setEntireState } from '../../../reducers/actions';
import { VIEWS } from '../../../constants/constants';
import { fr } from 'date-fns/locale';
import { DEFAULT_SCREENSHOT_RESOLUTION, SCREENSHOT_TYPE } from '../constants';
// import { display } from 'html2canvas/dist/types/css/property-descriptors/display';

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

const getAdditionalInfo = state => {
  const allMolecules = state.apiReducers.all_mol_lists;
  const { moleculesToEdit, fragmentDisplayList } = state.selectionReducers;
  const currentSnapshotSelectedCompounds = allMolecules
    .filter(molecule => moleculesToEdit.includes(molecule.id))
    .map(molecule => molecule.code);
  const currentSnapshotVisibleCompounds = allMolecules
    .filter(molecule => fragmentDisplayList.includes(molecule.id))
    .map(molecule => molecule.code);

  const { moleculeLists, ligandLists, compoundsToBuyDatasetMap } = state.datasetsReducers;
  const currentSnapshotVisibleDatasetsCompounds = Object.fromEntries(
    Object.entries(moleculeLists).map(([datasetID, mols]) => [
      datasetID,
      mols.filter(mol => ligandLists[datasetID]?.includes(mol.id)).map(mol => mol.name)
    ])
  );
  const currentSnapshotSelectedDatasetsCompounds = Object.fromEntries(
    Object.entries(moleculeLists).map(([datasetID, mols]) => [
      datasetID,
      mols.filter(mol => compoundsToBuyDatasetMap[datasetID]?.includes(mol.id)).map(mol => mol.name)
    ])
  );

  return {
    currentSnapshotSelectedCompounds,
    currentSnapshotVisibleCompounds,
    currentSnapshotSelectedDatasetsCompounds,
    currentSnapshotVisibleDatasetsCompounds
  };
};

export const createNewSnapshot = ({
  title,
  description,
  type,
  author,
  parent,
  session_project,
  nglViewList,
  stage,
  overwriteSnapshot,
  createDiscourse = false
}) => async (dispatch, getState) => {
  const state = getState();
  const snapshotData = dispatch(getCleanStateForSnapshot());
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

    await api({
      url: `${base_url}/api/snapshots/${currentSnapshotId}`,
      data: {
        title,
        description,
        type: type,
        author,
        parent,
        session_project,
        children: currentSnapshot.children,
        data: '[]',
        additional_info: getAdditionalInfo(state, snapshotData)
      },
      method: METHOD.PUT
    });

    // return Promise.resolve(dispatch(addCurrentActionsListToSnapshot(currentSnapshot, project, nglViewList))).then(
    return new Promise(resolve => {
      if (disableRedirect === false && selectedSnapshotToSwitch != null) {
        window.location.replace(`${URLS.projects}${session_project}/${selectedSnapshotToSwitch}`);
      } else {
        dispatch(setIsLoadingSnapshotDialog(false));
        dispatch(setOpenSnapshotSavingDialog(false));
      }
    });
  } else {
    let newType = type;

    // return Promise.all([
    dispatch(setIsLoadingSnapshotDialog(true)); //,
    return api({ url: `${base_url}/api/snapshots/?session_project=${session_project}&type=INIT` }).then(response => {
      if (response.data.count === 0) {
        newType = SnapshotType.INIT;
        // Without this, the snapshot tree wouldnt work
        //if it's INIT snapshot than it's a root snapshot of a project so parent MUST be null
        parent = null;
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
          children: [],
          additional_info: getAdditionalInfo(state, snapshotData)
        },
        method: METHOD.POST
      }).then(res => {
        // redirect to project with newest created snapshot /:projectID/:snapshotID
        if (res.data.id && session_project) {
          console.log('created snapshot id: ' + res.data.id);

          // return Promise.resolve(dispatch(saveCurrentActionsList(snapshot, project, nglViewList, false))).then(
          return new Promise(resolve => {
            if (disableRedirect === false) {
              if (selectedSnapshotToSwitch != null) {
                if (createDiscourse) {
                  dispatch(createSnapshotDiscoursePost(res.data.id));
                }
                //window.location.replace(`${URLS.projects}${session_project}/${selectedSnapshotToSwitch}`);
                // await dispatch(changeSnapshot(session_project, selectedSnapshotToSwitch, nglViewList, stage));
                dispatch(setOpenSnapshotSavingDialog(false));
                dispatch(setIsLoadingSnapshotDialog(false));
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
                      console.log('new snapshot id: ' + JSON.stringify(createdSnapshot?.id));

                      if (createdSnapshot !== undefined && createdSnapshot !== null) {
                        // If the tree fails to load, bail out first without modifying the store
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
                            authorID: projectResponse.data.author || null,
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
                        dispatch(setReapplyOrientation(true));
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
              return resolve(res.data.id);
            }
          });
        }
      });
    });
    // ]);
  }
};

export const createSnapshotDiscoursePost = (snapshotId = undefined) => (dispatch, getState) => {
  const state = getState();
  const currentProject = state.projectReducers.currentProject;
  const currentSnapshotId = snapshotId === undefined ? state.projectReducers.currentSnapshot.id : snapshotId;
  const targetName = state.apiReducers.target_on_name;
  const url = `${base_url}${URLS.projects}${currentProject.projectID}/${currentSnapshotId}`;
  const msg = `${url}`;
  return createProjectPost(currentProject.title, targetName, msg, []);
};

export const createNewSnapshotWithoutStateModification = ({
  title,
  description,
  type,
  author,
  parent,
  session_project,
  nglViewList,
  axuData = {},
  additional_info,
  state,
  imageFullScreen = null,
  imageNgl = null,
  overwriteSnapshot = false,
  snapshotIdToOverwrite = 0,
  oldImages = []
}) => (dispatch, getState) => {
  if (!session_project) {
    return Promise.reject('Project ID is missing!');
  }

  let newType = type;

  return api({ url: `${base_url}/api/snapshots/?session_project=${session_project}&type=INIT` }).then(response => {
    if (response.data.count === 0) {
      newType = SnapshotType.INIT;
    }

    const dataToSend = {
      title,
      description,
      type: newType,
      author,
      parent,
      session_project,
      data: JSON.stringify(axuData),
      children: [],
      additional_info
    };
    const dataString = JSON.stringify(dataToSend);

    let method = METHOD.POST;
    if (overwriteSnapshot) {
      method = METHOD.PUT;
    }

    let snapshotIdSlug = '';
    if (overwriteSnapshot) {
      snapshotIdSlug = `${snapshotIdToOverwrite}/`;
    }

    let fullscreenImageSlug = '';
    if (overwriteSnapshot && oldImages.length > 0) {
      const firstImage = oldImages.filter(image => image.screenshot_type === SCREENSHOT_TYPE.FULL_SCREEN);
      fullscreenImageSlug = firstImage.length > 0 ? `${firstImage[0].id}/` : '';
    }

    let nglViewImageSlug = '';
    if (overwriteSnapshot && oldImages.length > 1) {
      const secondImage = oldImages.filter(image => image.screenshot_type === SCREENSHOT_TYPE.NGL_SCREEN);
      nglViewImageSlug = secondImage.length > 0 ? `${secondImage[0].id}/` : '';
    }

    return api({
      url: `${base_url}/api/snapshots/${snapshotIdSlug}`,
      data: dataString,
      method
    }).then(res => {
      if (res.data.id && session_project) {
        dispatch(
          setSharedSnapshot({
            title,
            description,
            url: `${base_url}${URLS.projects}${session_project}/${res.data.id}`,
            relativeUrl: `${URLS.projects}${session_project}/${res.data.id}`,
            disableRedirect: true
          })
        );
        if (imageFullScreen && imageNgl) {
          const fullScreenImageData = {
            screenshot: imageFullScreen,
            screenshot_type: SCREENSHOT_TYPE.FULL_SCREEN,
            snapshot: res.data.id
          };
          const imageNglData = {
            screenshot: imageNgl,
            screenshot_type: SCREENSHOT_TYPE.NGL_SCREEN,
            snapshot: res.data.id
          };
          return Promise.all([
            api({
              url: `${base_url}/api/snapshot_screenshots/${fullscreenImageSlug}`,
              data: fullScreenImageData,
              method
            }),
            api({
              url: `${base_url}/api/snapshot_screenshots/${nglViewImageSlug}`,
              data: imageNglData,
              method
            }),
            api({
              url: `${base_url}/api/snapshot_state/${res.data.id}/`,
              data: { state: state },
              method: METHOD.PUT
            })
          ]).then(() => {
            return api({ url: `${base_url}/api/snapshots/${res.data.id}/` }).then(snapshot => {
              if (!overwriteSnapshot) {
                dispatch(appendToSnapshotsCreatedThisSession(res.data.id));
                dispatch(appendToListOfSnapshots(snapshot.data));
              }
              dispatch(setSnapshotIsSaving(false));
            });
          });
        }
      }
    });
  });
};

export const saveAndShareSnapshot = (
  nglViewList,
  showDialog = true,
  axuData = {},
  overwriteSnapshot = false,
  snapshotIdToOverwrite = 0,
  oldImages = [],
  sessionProjectId = 0
) => async (dispatch, getState) => {
  dispatch(setSnapshotIsSaving(true));
  const snapshotData = dispatch(getCleanStateForSnapshot());
  snapshotData.snapshotReducers.isSnapshotSaving = false;
  const state = getState();
  const targetId = state.apiReducers.target_on;
  const loggedInUserID = DJANGO_CONTEXT['pk'];
  const currentProject = state.targetReducers.currentProject;

  dispatch(setDisableRedirect(true));

  if (targetId) {
    let imageFullscreen = await dispatch(captureScreenOfSnapshotFullScreen());
    imageFullscreen = await rescaleImage(
      imageFullscreen,
      DEFAULT_SCREENSHOT_RESOLUTION.width,
      DEFAULT_SCREENSHOT_RESOLUTION.height
    );
    let imageNgl = await dispatch(captureScreenOfSnapshotNglScreen());
    imageNgl = await rescaleImage(imageNgl, DEFAULT_SCREENSHOT_RESOLUTION.width, DEFAULT_SCREENSHOT_RESOLUTION.height);
    if (showDialog) {
      dispatch(setIsLoadingSnapshotDialog(true));
    }

    const additional_info = getAdditionalInfo(state);

    let data = {
      title: ProjectCreationType.READ_ONLY,
      description: ProjectCreationType.READ_ONLY,
      target: targetId,
      author: loggedInUserID || null,
      tags: '[]',
      additional_info: {},
      project: currentProject?.id
    };

    try {
      let projectID = sessionProjectId;
      if (!overwriteSnapshot || !projectID) {
        projectID = await dispatch(createProjectWithoutStateModification(data));
      }
      const username = DJANGO_CONTEXT['username'];
      const title = moment().format('-- YYYY-MM-DD -- HH:mm:ss');
      const description =
        loggedInUserID === undefined ? 'Snapshot generated by anonymous user' : `snapshot generated by ${username}`;
      const type = SnapshotType.MANUAL;
      const author = loggedInUserID || null;
      const parent = null;
      const session_project = projectID;

      await dispatch(
        createNewSnapshotWithoutStateModification({
          title,
          description,
          type,
          author,
          parent,
          session_project,
          nglViewList,
          axuData,
          additional_info,
          state: snapshotData,
          imageFullScreen: imageFullscreen,
          imageNgl: imageNgl,
          overwriteSnapshot: overwriteSnapshot,
          snapshotIdToOverwrite: snapshotIdToOverwrite,
          oldImages: oldImages
        })
      );

      if (showDialog) {
        dispatch(setIsLoadingSnapshotDialog(false));
      }
    } catch (error) {
      dispatch(setSnapshotIsSaving(false));
      if (showDialog) {
        dispatch(setIsLoadingSnapshotDialog(false));
      }
      throw new Error(error);
    }
    // }
  }
};

export const getCleanStateForSnapshot = () => (dispatch, getState) => {
  const state = getState();

  let snapshotData = {};

  let notToBeCopiedClone = deepClone(SNAPSHOT_VALUES_NOT_TO_BE_DELETED_SWITCHING_TARGETS);
  delete notToBeCopiedClone.apiReducers.target_id_list;

  snapshotData = deepMergeWithPriorityAndBlackList({}, state, notToBeCopiedClone);
  snapshotData = deepClone(snapshotData);
  snapshotData = deepMergeWithPriority({ ...snapshotData }, notToBeCopiedClone);
  snapshotData = deepMergeWithPriority({ ...snapshotData }, SNAPSHOT_VALUES_TO_BE_DELETED);
  snapshotData.nglReducers.snapshotNglOrientation = { ...snapshotData.nglReducers.nglOrientations };
  //this is because we don't want the first ligand to be centered but we always want to apply snapshot orientation
  snapshotData.selectionReducers.toBeDisplayedList = snapshotData.selectionReducers.toBeDisplayedList.map(obj => ({
    ...obj,
    center: false,
    rendered: false
  }));
  let toBeDisplayedRHS = {};
  let numberOfItemsRHS = 0;
  Object.keys(snapshotData.datasetsReducers.toBeDisplayedList).forEach(datasetID => {
    toBeDisplayedRHS[datasetID] = snapshotData.datasetsReducers.toBeDisplayedList[datasetID].map(obj => ({
      ...obj,
      center: false,
      rendered: false
    }));
    numberOfItemsRHS += toBeDisplayedRHS[datasetID].length;
  });
  snapshotData.datasetsReducers.toBeDisplayedList = toBeDisplayedRHS;
  snapshotData.nglReducers.objectsInSnapshotToBeRendered =
    snapshotData.selectionReducers.toBeDisplayedList.length + numberOfItemsRHS;
  snapshotData.nglReducers.isSnapshotRendering = true;
  snapshotData.nglReducers.nglViewFromSnapshotRendered = false;
  snapshotData.nglReducers.isNGLQueueEmpty = false;

  return snapshotData;
};

export const changeSnapshot = (projectID, snapshotID, stage, fromJobExec = false) => async (dispatch, getState) => {
  dispatch(setSnapshotLoadingInProgress(true));
  dispatch(setIsSnapshot(true));
  // A hacky way of changing the URL without triggering react-router
  window.history.replaceState(null, null, `${URLS.projects}${projectID}/${snapshotID}`);

  // Load the needed data
  const snapshotResponse = await api({ url: `${base_url}/api/snapshots/${snapshotID}` });

  const snapshotStateResponse = await api({ url: `${base_url}/api/snapshot_state/${snapshotID}/` });
  let snapshotState = snapshotStateResponse.data.state;

  if (!snapshotState) {
    snapshotState = snapshotResponse.data.additional_info.snapshotState;
  }

  // const snapshotState = snapshotResponse.data.additional_info.snapshotState;

  if (!fromJobExec) {
    //orientation animation
    const newOrientation = snapshotState.nglReducers.nglOrientations[VIEWS.MAJOR_VIEW];
    //log with timestamp
    console.log(`Switch - Before smooth animation: ${new Date().toLocaleTimeString()}`);
    await stage.animationControls.orient(newOrientation.elements, 2000); //.then(() => {
    console.log(`Switch - After smooth animation: ${new Date().toLocaleTimeString()}`);
  }

  dispatch(
    setCurrentSnapshot({
      id: snapshotResponse.data.id,
      type: snapshotResponse.data.type,
      title: snapshotResponse.data.title,
      author: snapshotResponse.data.author,
      description: snapshotResponse.data.description,
      created: snapshotResponse.data.created,
      children: snapshotResponse.data.children,
      parent: snapshotResponse.data.parent,
      data: snapshotResponse.data.data
    })
  );

  let currentState = getState();
  let toBeDisplayedLHSNewDeepCopy = null;
  let toBeDisplayedRHSNewDeepCopy = null;
  if (!fromJobExec) {
    currentState.snapshotReducers.switchingSnapshotWithinProject = true;
    snapshotState.snapshotReducers.switchingSnapshotWithinProject = true;
    snapshotState.nglReducers.isNGLQueueEmpty = false;

    const toBeDisplayedLHSCurrent = currentState.selectionReducers.toBeDisplayedList;
    const toBeDisplayedRHSCurrent = currentState.datasetsReducers.toBeDisplayedList;
    const toBeDisplayedLHSNew = snapshotState.selectionReducers.toBeDisplayedList;
    const toBeDisplayedRHSNew = snapshotState.datasetsReducers.toBeDisplayedList;

    //remove LHS stuff that is not in the new snapshot
    const toBeNoLongerDisplayedLHS = toBeDisplayedLHSCurrent.filter(
      currentStruct =>
        !toBeDisplayedLHSNew.find(
          newStruct => newStruct.id === currentStruct.id && newStruct.type === currentStruct.type
        )
    );
    toBeNoLongerDisplayedLHS.forEach(notToBeDisplayed =>
      toBeDisplayedLHSNew.push({ ...notToBeDisplayed, display: false })
    );

    //remove RHS stuff that is not in the new snapshot
    const toBeNoLongerDisplayedRHS = [];
    Object.keys(toBeDisplayedRHSCurrent).forEach(datasetID => {
      const currentDataset = toBeDisplayedRHSCurrent[datasetID];
      const newDataset = toBeDisplayedRHSNew[datasetID];
      if (newDataset) {
        const toBeNoLongerDisplayed = currentDataset.filter(
          currentStruct =>
            !newDataset.find(newStruct => newStruct.id === currentStruct.id && newStruct.type === currentStruct.type)
        );
        toBeNoLongerDisplayedRHS.push(...toBeNoLongerDisplayed);
      }
    });
    toBeNoLongerDisplayedRHS.forEach(notToBeDisplayed =>
      toBeDisplayedRHSNew[notToBeDisplayed.datasetID]
        ? toBeDisplayedRHSNew[notToBeDisplayed.datasetID].push({ ...notToBeDisplayed, display: false })
        : (toBeDisplayedRHSNew[notToBeDisplayed.datasetID] = [{ ...notToBeDisplayed, display: false }])
    );

    toBeDisplayedLHSNewDeepCopy = deepClone(toBeDisplayedLHSNew);
    toBeDisplayedRHSNewDeepCopy = deepClone(toBeDisplayedRHSNew) || {};
  }

  currentState = getState();
  // const copyOfCurrentState = deepClone(currentState);
  console.log(`RenderingProgressDialog - merging state`);
  const newState = deepMergeWithPriorityAndBlackList(
    // copyOfCurrentState,
    currentState,
    snapshotState,
    SNAPSHOT_VALUES_NOT_TO_BE_DELETED_SWITCHING_TARGETS
  );

  if (!fromJobExec) {
    dispatch(setToBeDisplayedList(toBeDisplayedLHSNewDeepCopy));
    dispatch(setToBeDisplayedLists(toBeDisplayedRHSNewDeepCopy));
  }
  // });
  // await new Promise(r => setTimeout(r, 2000));

  // dispatch(setEntireState(newState));
  // console.log('msg');
};

export const isSnapshotModified = snapshotID => async (dispatch, getState) => {
  let result = false;

  const state = getState();

  const snapshotResponse = await api({ url: `${base_url}/api/snapshots/${snapshotID}` });
  const originalSnapshotState = snapshotResponse.data.additional_info.snapshotState;
  let originalSnapshotStateCopy = deepClone(originalSnapshotState);

  let notToBeCopiedClone = deepClone(SNAPSHOT_VALUES_NOT_TO_BE_DELETED_SWITCHING_TARGETS);
  delete notToBeCopiedClone.apiReducers.target_id_list; //array

  const currentSnapshotState = deepMergeWithPriorityAndBlackList({}, state, notToBeCopiedClone);
  let currentSnapshotStateCopy = deepClone(currentSnapshotState);
  currentSnapshotStateCopy = deepMergeWithPriority({ ...currentSnapshotStateCopy }, notToBeCopiedClone);
  currentSnapshotStateCopy = deepMergeWithPriority({ ...currentSnapshotStateCopy }, SNAPSHOT_VALUES_TO_BE_DELETED);

  delete originalSnapshotStateCopy.nglReducers;
  delete currentSnapshotStateCopy.nglReducers;

  delete originalSnapshotStateCopy.snapshotReducers;
  delete currentSnapshotStateCopy.snapshotReducers;

  delete originalSnapshotStateCopy.layoutReducers;
  delete currentSnapshotStateCopy.layoutReducers;

  delete originalSnapshotStateCopy.projectReducers;
  delete currentSnapshotStateCopy.projectReducers;

  delete originalSnapshotStateCopy.apiReducers;
  delete currentSnapshotStateCopy.apiReducers;

  delete originalSnapshotStateCopy.previewReducers.molecule.disableNglControlButtons; //array
  delete currentSnapshotStateCopy.previewReducers.molecule.disableNglControlButtons;
  delete originalSnapshotStateCopy.selectionReducers.toastMessages; //array
  delete currentSnapshotStateCopy.selectionReducers.toastMessages;

  delete originalSnapshotStateCopy.selectionReducers.toBeDisplayedList;
  delete originalSnapshotStateCopy.datasetsReducers.toBeDisplayedList;

  delete currentSnapshotStateCopy.selectionReducers.toBeDisplayedList;
  delete currentSnapshotStateCopy.datasetsReducers.toBeDisplayedList;

  let path = '';
  const isModified = !deepEqual(originalSnapshotStateCopy, currentSnapshotStateCopy, path);

  result = isModified;

  return result;
};
