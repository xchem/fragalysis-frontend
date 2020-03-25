import { constants } from './constants';
const initCurrentSnapshot = {
  id: null,
  type: null,
  name: null,
  author: null,
  message: null,
  children: [], // if it has got children, it is created branch,
  parent: null,
  created: null,
  data: null
};

export const INITIAL_STATE = {
  currentProject: {
    projectID: null,
    authorID: null,
    title: null,
    description: null,
    targetID: null,
    tags: [],
    type: null
  },
  currentSnapshot: initCurrentSnapshot,
  isProjectModalOpen: false,
  isProjectModalLoading: false,
  listOfProjects: []
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
      return Object.assign({}, state, { currentSnapshot: action.payload.currentSnapshot });

    case constants.RESET_SNAPSHOT:
      return Object.assign({}, state, { currentSnapshot: initCurrentSnapshot });

    case constants.SET_LIST_OF_PROJECTS:
      return Object.assign({}, state, { listOfProjects: action.payload });

    case constants.RESET_PROJECTS_REDUCER:
      return Object.assign({}, INITIAL_STATE);

    default:
      return state;
  }
};
