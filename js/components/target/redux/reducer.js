import { constants } from './constatnts';

export const INITIAL_STATE = {
  oldUrl: '',
  isTargetLoading: false
};

export const targetReducers = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.SET_OLD_URL:
      return Object.assign({}, state, {
        oldUrl: action.payload
      });

    case constants.SET_TARGET_IS_LOADING:
      return Object.assign({}, state, {
        isTargetLoading: action.payload
      });

    default:
      return state;
  }
};
