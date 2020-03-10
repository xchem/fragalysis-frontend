import { constants } from './constants';

export const INITIAL_STATE = {
  currentProject: {
    author: null,
    title: null,
    description: null,
    targetId: 1, //change to null,
    tags: [],
    type: null
  },
  snapshot: null,
  snapshotDetail: {
    type: null,
    name: null,
    author: null,
    message: null,
    children: null, // if it has got children, it is created branch,
    created: null
  },
  isProjectModalOpen: false,
  isProjectModalLoading: false
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

    case constants.RESET_CURRENT_PROJECT_STATE:
      const currProj = JSON.parse(JSON.stringify(INITIAL_STATE.currentProject));
      return Object.assign({}, state, { currentProject: currProj });

    case constants.SET_PROJECT_MODAL_OPEN:
      return Object.assign({}, state, { isProjectModalOpen: action.payload });

    case constants.SET_PROJECT_MODAL_IS_LOADING:
      return Object.assign({}, state, { isProjectModalLoading: action.payload });

    case constants.SET_SNAPSHOT:
      return Object.assign({}, state, {
        snapshot: action.payload.snapshot,
        snapshotDetail: action.payload.snapshotDetail
      });

    case constants.RESET_PROJECTS_REDUCER:
      return Object.assign({}, INITIAL_STATE);

    default:
      return state;
  }
};
