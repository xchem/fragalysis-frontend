import * as listType from '../../../constants/listTypes';
import { getUrl, loadFromServer } from '../../../utils/genericList';
import {
  resetTargetState,
  setLatestSession,
  setTargetIdList,
  setTargetOn,
  setTargetUnrecognised,
  setUuid
} from '../../../reducers/api/apiActions';
import { setOldUrl } from './actions';
import { api } from '../../../utils/api';
import { resetSelectionState } from '../../../reducers/selection/selectionActions';

export const loadTargetList = onCancel => (dispatch, getState) => {
  const oldUrl = getState().targetReducers.oldUrl;
  const list_type = listType.TARGET;
  return loadFromServer({
    url: getUrl({ list_type }),
    setOldUrl: url => dispatch(setOldUrl(url)),
    old_url: oldUrl,
    setObjectList: params => dispatch(setTargetIdList(params)),
    list_type,
    cancel: onCancel
  });
};

export const updateTarget = (notCheckTarget, target, setIsLoading) => (dispatch, getState) => {
  const state = getState();
  const targetIdList = state.apiReducers.present.target_id_list;

  if (!notCheckTarget) {
    // Get from the REST API
    let targetUnrecognisedFlag = true;
    if (target !== undefined) {
      if (targetIdList && targetIdList.length > 0) {
        targetIdList.forEach(targetId => {
          if (target === targetId.title) {
            targetUnrecognisedFlag = false;
          }
        });
      }
      dispatch(setTargetUnrecognised(targetUnrecognisedFlag));
    }

    if (targetUnrecognisedFlag === false) {
      setIsLoading(true);
      return api({
        url: `${window.location.protocol}//${window.location.host}/api/targets/?title=${target}`
      })
        .then(response => {
          return dispatch(setTargetOn(response.data['results'][0].id));
        })
        .finally(() => setIsLoading(false));
    }
  }
  return Promise.resolve();
};

export const setTargetUUIDs = (uuid, snapshotUuid) => dispatch => {
  if (uuid !== undefined) {
    dispatch(setUuid(uuid));
    dispatch(setLatestSession(uuid));
  } else if (snapshotUuid !== undefined) {
    dispatch(setUuid(snapshotUuid));
  }
};

export const resetTargetAndSelection = resetSelection => dispatch => {
  if (resetSelection) {
    dispatch(resetTargetState());
    dispatch(resetSelectionState());
  }
};
