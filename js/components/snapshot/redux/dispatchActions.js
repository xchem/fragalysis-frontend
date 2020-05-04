import { reloadApiState, setSessionTitle } from '../../../reducers/api/actions';
import { reloadSelectionReducer } from '../../../reducers/selection/actions';
import { api, METHOD } from '../../../utils/api';
import {
  setDisableRedirect,
  setIsLoadingListOfSnapshots,
  setIsLoadingSnapshotDialog,
  setListOfSnapshots,
  setOpenSnapshotSavingDialog,
  setSharedSnapshot
} from './actions';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import {
  assignSnapshotToProject,
  createProjectFromSnapshotDialog,
  loadSnapshotTree
} from '../../projects/redux/dispatchActions';
import { reloadPreviewReducer } from '../../preview/redux/dispatchActions';
import { ProjectCreationType, SnapshotType } from '../../projects/redux/constants';
import moment from 'moment';
import { setProteinLoadingState } from '../../../reducers/ngl/actions';
import { reloadNglViewFromSnapshot } from '../../../reducers/ngl/dispatchActions';
import { base_url, URLS } from '../../routes/constants';
import { resetCurrentSnapshot, setCurrentSnapshot } from '../../projects/redux/actions';
import { selectFirstMolGroup } from '../../preview/moleculeGroups/redux/dispatchActions';

export const getListOfSnapshots = () => (dispatch, getState) => {
  dispatch(setIsLoadingListOfSnapshots(true));
  return api({ url: `${base_url}/api/snapshots/?session_project__isnull=False&author=${DJANGO_CONTEXT['pk']}` })
    .then(response => {
      if (response && response.data && response.data.results) {
        dispatch(setListOfSnapshots(response.data.results));
      }
    })
    .finally(() => {
      dispatch(setIsLoadingListOfSnapshots(false));
    });
};

export const reloadSession = (snapshotData, nglViewList) => (dispatch, getState) => {
  const state = getState();
  const snapshotTitle = state.projectReducers.currentSnapshot.title;

  dispatch(reloadApiState(snapshotData.apiReducers));
  // dispatch(setSessionId(myJson.id));
  dispatch(setSessionTitle(snapshotTitle));

  if (nglViewList.length > 0) {
    dispatch(reloadSelectionReducer(snapshotData.selectionReducers));

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
    data: { type, title, author, description, data: JSON.stringify(data), created, parent, children, session_project },
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
  const { apiReducers, nglReducers, selectionReducers, previewReducers } = getState();
  const data = { apiReducers, nglReducers, selectionReducers, previewReducers };
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

export const createNewSnapshot = ({ title, description, type, author, parent, session_project }) => (
  dispatch,
  getState
) => {
  const state = getState();
  const { apiReducers, nglReducers, selectionReducers, previewReducers } = state;
  const data = { apiReducers, nglReducers, selectionReducers, previewReducers };
  const selectedSnapshotToSwitch = state.snapshotReducers.selectedSnapshotToSwitch;
  const disableRedirect = state.snapshotReducers.disableRedirect;

  if (!session_project) {
    return Promise.reject('Project ID is missing!');
  }

  let newType = type;

  return Promise.all([
    dispatch(setIsLoadingSnapshotDialog(true)),
    api({ url: `${base_url}/api/snapshots/?session_project=${session_project}&type=INIT` }).then(response => {
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
          data: JSON.stringify(data),
          children: []
        },
        method: METHOD.POST
      }).then(res => {
        // redirect to project with newest created snapshot /:projectID/:snapshotID
        if (res.data.id && session_project) {
          if (disableRedirect === false) {
            // Really bad usage or redirection. Hint for everybody in this line ignore it, but in other parts of code
            // use react-router !
            window.location.replace(
              `${URLS.projects}${session_project}/${
                selectedSnapshotToSwitch === null ? res.data.id : selectedSnapshotToSwitch
              }`
            );
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
        }
      });
    })
  ]);
};

export const activateSnapshotDialog = (isUserLoggedIn = undefined, finallyShareSnapshot = false) => (
  dispatch,
  getState
) => {
  const targetId = getState().apiReducers.target_on;

  dispatch(setDisableRedirect(finallyShareSnapshot));

  if (!isUserLoggedIn && targetId) {
    const data = {
      title: ProjectCreationType.READ_ONLY,
      description: ProjectCreationType.READ_ONLY,
      target: targetId,
      author: null,
      tags: '[]'
    };
    dispatch(createProjectFromSnapshotDialog(data))
      .then(() => {
        dispatch(setOpenSnapshotSavingDialog(true));
      })
      .catch(error => {
        throw new Error(error);
      });
  } else {
    dispatch(setOpenSnapshotSavingDialog(true));
  }
};
