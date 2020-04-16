import { reloadApiState, setSessionTitle } from '../../../reducers/api/actions';
import { reloadSelectionReducer } from '../../../reducers/selection/actions';
import { api, METHOD } from '../../../utils/api';
import {
  setDialogCurrentStep,
  setIsLoadingListOfSnapshots,
  setIsLoadingSnapshotDialog,
  setListOfSnapshots,
  setOpenSnapshotSavingDialog
} from './actions';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { assignSnapshotToProject, loadSnapshotTree } from '../../projects/redux/dispatchActions';
import { reloadPreviewReducer } from '../../preview/redux/dispatchActions';
import { SnapshotType } from '../../projects/redux/constants';
import moment from 'moment';
import { setProteinLoadingState } from '../../../reducers/ngl/actions';
import { reloadNglViewFromSnapshot } from '../../../reducers/ngl/dispatchActions';
import { base_url, URLS } from '../../routes/constants';
import { resetCurrentSnapshot, setCurrentSnapshot } from '../../projects/redux/actions';

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

export const createInitialSnapshot = projectID => async (dispatch, getState) => {
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
    dispatch(
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

export const createNewSnapshot = ({ title, description, type, author, parent, session_project, history }) => (
  dispatch,
  getState
) => {
  const { apiReducers, nglReducers, selectionReducers, previewReducers } = getState();
  const data = { apiReducers, nglReducers, selectionReducers, previewReducers };

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
      }).then(response => {
        Promise.all([
          dispatch(setDialogCurrentStep(0)),
          dispatch(setIsLoadingSnapshotDialog(false)),
          dispatch(setOpenSnapshotSavingDialog(false)),
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
          ),
          dispatch(getListOfSnapshots())
        ]);
        // redirect to project with newest created snapshot /:projectID/:snapshotID
        if (response.data.id && session_project) {
          history.push(`${URLS.projects}${session_project}/${response.data.id}`);
        }
      });
    })
  ]);
};

export const createSnapshotFromOld = (snapshot, history) => (dispatch, getState) => {
  if (!snapshot) {
    return Promise.reject('Snapshot is missing!');
  }
  const { title, description, data, author, session_project, children } = snapshot;
  if (!session_project) {
    return Promise.reject('Project ID is missing!');
  }

  return Promise.all([
    dispatch(setIsLoadingSnapshotDialog(true)),
    api({
      url: `${base_url}/api/snapshots/`,
      data: {
        title,
        description,
        type: SnapshotType.INIT,
        author,
        parent: null,
        session_project,
        data: JSON.stringify(data),
        children
      },
      method: METHOD.POST
    }).then(response => {
      Promise.all([
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
        ),
        dispatch(getListOfSnapshots())
      ]);
      // redirect to project with newest created snapshot /:projectID/:snapshotID
      if (response.data.id && session_project) {
        history.push(`${URLS.projects}${session_project}/${response.data.id}`);
      }
    })
  ]);
};

export const getListOfSnapshots = () => (dispatch, getState) => {
  dispatch(setIsLoadingListOfSnapshots(true));
  return api({ url: `${base_url}/api/snapshots/?session_project!=null` })
    .then(response => {
      if (response && response.data && response.data.results) {
        dispatch(setListOfSnapshots(response.data.results));
      }
    })
    .finally(() => {
      dispatch(setIsLoadingListOfSnapshots(false));
    });
};
