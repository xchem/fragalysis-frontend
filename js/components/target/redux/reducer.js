import { constants } from './constatnts';

export const INITIAL_STATE = {
  oldUrl: '',
  isTargetLoading: false,
  targetDiscourseLinks: null,
  currentTargetLink: null
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

    case constants.SET_TARGET_DISCOURSE_LINKS:
      return { ...state, targetDiscourseLinks: { ...action.payload } };

    case constants.SET_CURRENT_TARGET_LINK:
      return { ...state, currentTargetLink: action.payload };

    default:
      return state;
  }
};
