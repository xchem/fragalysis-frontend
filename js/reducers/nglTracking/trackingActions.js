import { actionType, actionObjectType, actionDescription, actionAnnotation } from './constants';
import { CONSTANTS as nglConstants } from '../ngl/constants';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';

export const findTrackAction = (action, state) => {
  const username = DJANGO_CONTEXT['username'];
  const isActionRestoring = state.nglTrackingReducers.isActionRestoring;

  let trackAction = null;
  if (isActionRestoring === false && action.skipTracking !== true) {
    if (action.type.includes(nglConstants.SET_ORIENTATION_BY_INTERACTION)) {
      const { oldOrientation: oldSetting, orientation: newSetting, div_id } = action;

      trackAction = {
        type: actionType.ORIENTATION,
        merge: true,
        annotation: actionAnnotation.CHECK,
        timestamp: Date.now(),
        username: username,
        object_type: 'NGL',
        object_name: 'NGL',
        oldSetting,
        newSetting,
        div_id,
        getText: function() {
          return 'NGL transformation changed';
        },
        text: 'NGL transformation changed'
      };
    }
  }
  return trackAction;
};

const getTargetName = (targetId, state) => {
  let targetList = state.apiReducers.target_id_list;
  let target = targetList.find(target => target.id === targetId);
  let targetName = (target && target.title) || '';
  return targetName;
};

export const createInitAction = target_on => (dispatch, getState) => {
  const state = getState();
  const username = DJANGO_CONTEXT['username'];

  if (target_on) {
    let targetName = getTargetName(target_on, state);
    let trackAction = {
      type: actionType.TARGET_LOADED,
      timestamp: Date.now(),
      username: username,
      object_type: actionObjectType.TARGET,
      object_name: targetName,
      object_id: target_on,
      text: `${actionDescription.TARGET} ${targetName} ${actionDescription.LOADED}`
    };

    return trackAction;
  }
};
