import { constants } from './constants';

export const INITIAL_STATE = {
  saveType: '',
  nextUuid: '',
  newSessionFlag: 0,
  loadedSession: undefined
};

export const sessionReducers = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.SET_SAVE_TYPE:
      return Object.assign({}, state, {
        saveType: action.payload
      });

    case constants.SET_NEXT_UUID:
      return Object.assign({}, state, {
        nextUuid: action.payload
      });

    case constants.SET_NEW_SESSION_FLAG:
      return Object.assign({}, state, {
        newSessionFlag: action.payload
      });

    case constants.SET_LOADED_SESSION:
      return Object.assign({}, state, {
        loadedSession: action.payload
      });

    default:
      return state;
  }
};
