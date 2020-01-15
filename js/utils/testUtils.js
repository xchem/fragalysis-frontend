function findAction(store, actionCreator) {
  return store.getActions().find(action => action.type === actionCreator.type);
}

export function getAction(store, type) {
  const action = findAction(store, type);
  if (action) {
    return Promise.resolve(action);
  }

  return Promise.resolve(null);
}
