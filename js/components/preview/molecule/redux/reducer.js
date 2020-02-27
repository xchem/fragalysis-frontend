import { constants } from './constants';

export const INITIAL_STATE = {
  sortDialogOpen: false
};

export const molecule = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.SET_SORT_DIALOG_OPEN:
      return Object.assign({}, state, {
        sortDialogOpen: action.payload
      });

    case constants.RELOAD_REDUCER:
      return Object.assign({}, state, { ...action.payload });

    default:
      return state;
  }
};
