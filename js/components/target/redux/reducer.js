import { constants } from './constatnts';

export const INITIAL_STATE = {
  oldUrl: ''
};

export const targetReducers = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.OLD_URL:
      return Object.assign({}, state, {
        oldUrl: action.payload
      });

    default:
      return state;
  }
};
