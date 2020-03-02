function findAction(store, actionCreator) {
  const actionObject = actionCreator();
  return store.getActions().find(action => action.type === actionObject.type);
}

export function getAction(store, type) {
  const action = findAction(store, type);

  if (action) {
    return Promise.resolve(action);
  }

  return Promise.resolve(null);
}

export const getActionType = (actionCreator = {}) => actionCreator().type;
