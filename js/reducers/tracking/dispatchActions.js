import { actionType, actionObjectType, actionDescription } from './constants';

export const selectCurrentActionsList = () => async (dispatch, getState) => {
  const state = getState();

  const actionList = state.trackingReducers.truck_actions_list;

  let currentActions = [];
  let currentTargetList = actionList.map(function(action, index) {
    if (action.type === actionType.TARGET_LOADED) {
      return action;
    }
  });
  if (currentTargetList) {
    let currentTarget = currentTargetList.pop();
    currentActions.push(Object.assign({ ...currentTarget }));
  }
};
