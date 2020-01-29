import { constants } from './constants';

export const INITIAL_STATE = {
  currentPage: 0,
  compoundsPerPage: 28,
  currentCompounds: {}
};

export const compounds = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.SET_CURRENT_COMPOUNDS:
      return Object.assign({}, state, { currentCompounds: action.payload });

    case constants.SET_CURRENT_PAGE:
      return Object.assign({}, state, { currentPage: action.payload });

    case constants.RESET_CURRENT_COMPOUNDS_SETTINGS:
      return Object.assign({}, INITIAL_STATE);

    default:
      return state;
  }
};
