import { reloadApiState, setSessionTitle } from '../../../reducers/api/actions';
import { reloadSelectionReducer, setBondColorMap, setVectorList } from '../../../reducers/selection/actions';
import { api, METHOD } from '../../../utils/api';
import { generateBondColorMap, generateObjectList } from '../helpers';
import { setDialogCurrentStep, setIsLoadingSnapshotDialog, setOpenSnapshotSavingDialog } from './actions';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { saveCurrentSnapshot, storeSnapshotToProject } from '../../projects/redux/dispatchActions';
import { reloadPreviewReducer } from '../../preview/redux/dispatchActions';
import { SnapshotType } from '../../projects/redux/constants';
import moment from 'moment';
import { setProteinLoadingState } from '../../../reducers/ngl/actions';
import { reloadNglViewFromSnapshot } from '../../../reducers/ngl/dispatchActions';
import { base_url } from '../../routes/constants';
import { setCurrentSnapshot } from '../../projects/redux/actions';

export const handleVector = json => dispatch => {
  let objList = generateObjectList(json['3d']);
  dispatch(setVectorList(objList));
  let vectorBondColorMap = generateBondColorMap(json['indices']);
  dispatch(setBondColorMap(vectorBondColorMap));
};

export const redeployVectorsLocal = url => dispatch => {
  return api({ url }).then(response => dispatch(handleVector(response.data['vectors'])));
};

export const reloadSession = (snapshotData, nglViewList) => (dispatch, getState) => {
  const state = getState();
  const snapshotTitle = state.projectReducers.currentSnapshot.title;

  dispatch(reloadApiState(snapshotData.apiReducers));
  // dispatch(setSessionId(myJson.id));
  dispatch(setSessionTitle(snapshotTitle));

  if (nglViewList.length > 0) {
    dispatch(reloadSelectionReducer(snapshotData.selectionReducers));

    nglViewList.forEach(async nglView => {
      await dispatch(reloadNglViewFromSnapshot(nglView.stage, nglView.id, snapshotData.nglReducers));
    });

    if (snapshotData.selectionReducers.vectorOnList.length !== 0) {
      let url =
        window.location.protocol +
        '//' +
        window.location.host +
        '/api/vector/' +
        snapshotData.selectionReducers.vectorOnList[JSON.stringify(0)] +
        '/';
      dispatch(redeployVectorsLocal(url)).catch(error => {
        throw new Error(error);
      });

      dispatch(reloadPreviewReducer(snapshotData.previewReducers));
    }
  }

  dispatch(setProteinLoadingState(true));
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

  await dispatch(saveCurrentSnapshot({ type, title, author, description, data, created, parent, children }));

  if (projectID) {
    await dispatch(storeSnapshotToProject({ projectID, snapshotID: getState().projectReducers.currentSnapshot.id }));
  }
};

export const createNewSnapshot = ({ title, description, type, author, parent, session_project }) => (
  dispatch,
  getState
) => {
  const { apiReducers, nglReducers, selectionReducers, previewReducers } = getState();
  const data = { apiReducers, nglReducers, selectionReducers, previewReducers };

  if (!session_project) {
    return Promise.reject('Project ID is missing!');
  }
  return Promise.all([
    dispatch(setIsLoadingSnapshotDialog(true)),
    api({
      url: `${base_url}/api/snapshots/`,
      data: { title, description, type, author, parent, session_project, data: JSON.stringify(data), children: [] },
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
        )
      ]);
    })
  ]);
};