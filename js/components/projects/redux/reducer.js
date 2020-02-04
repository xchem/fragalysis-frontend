import { constants } from './constants';

export const INITIAL_STATE = {
  currentProject: {
    author: null,
    title: null,
    description: null,
    target: null,
    tags: []
  },
  isProjectModalOpen: false
};

export const projectReducers = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.SET_CURRENT_PROJECT:
      return Object.assign({}, state, {
        currentProject: action.payload
      });

    case constants.SET_CURRENT_PROJECT_PROPERTY:
      const currProject = JSON.parse(JSON.stringify(state.currentProject));
      currProject[action.payload.key] = action.payload.value;

      return Object.assign({}, state, { currentProject: currProject });

    case constants.RESET_PROJECT_STATE:
      const initState = JSON.parse(JSON.stringify(INITIAL_STATE));
      return Object.assign({}, state, initState);

    case constants.SET_PROJECT_MODAL_OPEN:
      return Object.assign({}, state, { isProjectModalOpen: action.payload });

    default:
      return state;
  }
};
