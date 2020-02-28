import { SCENES } from '../../../reducers/ngl/constants';
import {
  reloadApiState,
  setUuid,
  setLatestSession,
  setLatestSnapshot,
  setSavingState,
  setSessionId,
  setSessionTitle,
  setTargetUnrecognised
} from '../../../reducers/api/actions';
import { reloadSelectionReducer, setBondColorMap, setVectorList } from '../../../reducers/selection/actions';
import { reloadNglViewFromScene } from '../../../reducers/ngl/dispatchActions';
import { api, getCsrfToken, METHOD } from '../../../utils/api';
import { canCheckTarget, generateBondColorMap, generateObjectList } from '../helpers';
import { saveCurrentStateAsSessionScene } from '../../../reducers/ngl/actions';
import { savingStateConst, savingTypeConst } from '../constants';
import { setLoadedSession, setNewSessionFlag, setNextUUID, setSaveType } from './actions';
import { getStore } from '../../helpers/globalStore';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';

export const handleVector = json => dispatch => {
  let objList = generateObjectList(json['3d']);
  dispatch(setVectorList(objList));
  let vectorBondColorMap = generateBondColorMap(json['indices']);
  dispatch(setBondColorMap(vectorBondColorMap));
};

export const redeployVectorsLocal = url => dispatch => {
  return api({ url }).then(response => dispatch(handleVector(response.data['vectors'])));
};

export const reloadSession = (myJson, nglViewList) => dispatch => {
  let jsonOfView = JSON.parse(JSON.parse(JSON.parse(myJson.scene)).state);
  dispatch(reloadApiState(jsonOfView.apiReducers));
  dispatch(setSessionId(myJson.id));
  dispatch(setSessionTitle(myJson.title));

  if (nglViewList.length > 0) {
    dispatch(reloadSelectionReducer(jsonOfView.selectionReducers));
    nglViewList.forEach(nglView => {
      dispatch(reloadNglViewFromScene(nglView.stage, nglView.id, SCENES.sessionScene, jsonOfView));
    });

    if (jsonOfView.selectionReducers.vectorOnList.length !== 0) {
      let url =
        window.location.protocol +
        '//' +
        window.location.host +
        '/api/vector/' +
        jsonOfView.selectionReducers.vectorOnList[JSON.stringify(0)] +
        '/';
      dispatch(redeployVectorsLocal(url)).catch(error => {
        throw new Error(error);
      });
    }
  }
};

export const setTargetAndReloadSession = ({ pathname, nglViewList, loadedSession, targetIdList }) => dispatch => {
  if (loadedSession) {
    let jsonOfView = JSON.parse(JSON.parse(JSON.parse(loadedSession.scene)).state);
    let target = jsonOfView.apiReducers.target_on_name;
    let targetUnrecognised = true;
    targetIdList.forEach(item => {
      if (target === item.title) {
        targetUnrecognised = false;
      }
    });

    if (canCheckTarget(pathname) === false) {
      dispatch(setTargetUnrecognised(targetUnrecognised));
    }
    if (targetUnrecognised === false && targetIdList.length > 0 && canCheckTarget(pathname) === true) {
      dispatch(reloadSession(loadedSession, nglViewList));
    }
  }
};

export const postToServer = sessionState => dispatch => {
  dispatch(saveCurrentStateAsSessionScene());
  dispatch(setSavingState(sessionState));
};

export const newSession = () => dispatch => {
  dispatch(postToServer(savingStateConst.savingSession));
  dispatch(setSaveType(savingTypeConst.sessionNew));
};
export const saveSession = () => dispatch => {
  dispatch(postToServer(savingStateConst.overwritingSession));
  dispatch(setSaveType(savingTypeConst.sessionSave));
};

export const newSnapshot = () => dispatch => {
  dispatch(postToServer(savingStateConst.savingSnapshot));
  dispatch(setSaveType(savingTypeConst.snapshotNew));
};

export const getSessionDetails = () => (dispatch, getState) => {
  const uuid = getState().apiReducers.uuid;

  return api({ method: METHOD.GET, url: '/api/viewscene/?uuid=' + uuid }).then(response =>
    response.data && response.data.results.length > 0
      ? setSessionTitle(response.data.results[JSON.stringify(0)].title)
      : setSessionTitle('')
  );
};

export const updateCurrentTarget = myJson => (dispatch, getState) => {
  const state = getState();
  const saveType = state.sessionReducers.saveType;

  if (saveType === savingTypeConst.sessionNew && myJson) {
    dispatch(setUuid(myJson.uuid));
    dispatch(setSessionId(myJson.id));
    dispatch(setSessionTitle(myJson.title));
    dispatch(setSaveType(''));
    dispatch(setNextUUID(''));
    return dispatch(getSessionDetails());
  } else if (saveType === savingTypeConst.sessionSave) {
    dispatch(setSaveType(''));
    return dispatch(getSessionDetails());
  } else if (saveType === savingTypeConst.snapshotNew && myJson) {
    dispatch(setLatestSnapshot(myJson.uuid));
    dispatch(setSaveType(''));
    return Promise.resolve();
  }
  return Promise.reject('Cannot update current target');
};

export const generateNextUuid = () => (dispatch, getState) => {
  const { nextUuid } = getState().sessionReducers;

  if (nextUuid === '') {
    const uuidv4 = require('uuid/v4');
    dispatch(setNextUUID(uuidv4()));
    dispatch(setNewSessionFlag(1));
  }
};

export const reloadScene = ({ saveType, newSessionFlag, nextUuid, uuid, sessionId }) => dispatch => {
  dispatch(generateNextUuid());

  if (saveType.length <= 0 && uuid !== 'UNSET') {
    return api({ method: METHOD.GET, url: '/api/viewscene/?uuid=' + uuid }).then(response =>
      dispatch(setLoadedSession(response.data.results[0]))
    );
  }

  let store = JSON.stringify(getStore().getState());
  const timeOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  };
  let TITLE = 'Created on ' + new Intl.DateTimeFormat('en-GB', timeOptions).format(Date.now());
  let userId = DJANGO_CONTEXT['pk'];
  let stateObject = JSON.parse(store);
  let newPresentObject = Object.assign(stateObject.apiReducers, {
    latestSession: nextUuid
  });

  const fullState = {
    state: JSON.stringify({
      apiReducers: newPresentObject,
      nglReducers: stateObject.nglReducers,
      selectionReducers: stateObject.selectionReducers
    })
  };

  if (saveType === savingTypeConst.sessionNew && newSessionFlag === 1) {
    dispatch(setNewSessionFlag(0));
    const formattedState = {
      uuid: nextUuid,
      title: TITLE,
      user_id: userId,
      scene: JSON.stringify(JSON.stringify(fullState))
    };
    return api({
      url: '/api/viewscene/',
      method: METHOD.POST,
      headers: {
        'X-CSRFToken': getCsrfToken(),
        accept: 'application/json',
        'content-type': 'application/json'
      },
      data: JSON.stringify(formattedState)
    }).then(response => {
      dispatch(updateCurrentTarget(response.data));
      dispatch(setLatestSession(nextUuid));
    });
  } else if (saveType === savingTypeConst.sessionSave) {
    const formattedState = {
      scene: JSON.stringify(JSON.stringify(fullState))
    };
    return api({
      url: '/api/viewscene/' + JSON.parse(sessionId),
      method: METHOD.PATCH,
      headers: {
        'X-CSRFToken': getCsrfToken(),
        accept: 'application/json',
        'content-type': 'application/json'
      },
      data: JSON.stringify(formattedState)
    }).then(response => {
      dispatch(updateCurrentTarget(response.data));
    });
  } else if (saveType === savingTypeConst.snapshotNew) {
    const uuidv4 = require('uuid/v4');
    const formattedState = {
      uuid: uuidv4(),
      title: 'shared snapshot',
      user_id: userId,
      scene: JSON.stringify(JSON.stringify(fullState))
    };
    return api({
      url: '/api/viewscene/',
      method: METHOD.POST,
      headers: {
        'X-CSRFToken': getCsrfToken(),
        accept: 'application/json',
        'content-type': 'application/json'
      },
      data: JSON.stringify(formattedState)
    }).then(response => {
      dispatch(updateCurrentTarget(response.data));
    });
  }
  return Promise.resolve('No scene data to reload');
};
