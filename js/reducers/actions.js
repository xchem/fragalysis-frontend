import { constants } from './constants';

export const setEntireState = newState => {
  return {
    type: constants.SET_ENTIRE_STATE,
    newState: newState
  };
};
