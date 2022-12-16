import { actionType } from './constants';

export const getQualityOffActions = (orderedActionList, currentActionList) => (dispatch, getState) => {
  const state = getState();
  const ligandsOn = state.selectionReducers.fragmentDisplayList;
  const qualitiesOn = state.selectionReducers.qualityList;

  const qualitiesToTurnOff = getDifference(ligandsOn, qualitiesOn);
  const actionList = orderedActionList.filter(action => action.type === actionType.QUALITY_TURNED_OFF);

  qualitiesToTurnOff.forEach(molId => {
    const action = actionList.find(action => action.object_id === molId);

    if (action) {
      currentActionList.push({ ...action });
    }
  });
};

/**
 * The goal of this method is to compare two arrays of primitive values and return the difference.
 */
export const getDifference = (array1, array2) => {
  const result = array1.filter(x => !array2.includes(x));
  return result;
};
