import { constants } from './constants';

export const INITIAL_STATE = {
  selectedRows: []
};

export const jobTableReducer = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.SET_SELECTED_ROWS: {
      return { ...state, selectedRows: action.payload };
    }
    default: {
      return state;
    }
  }
};
