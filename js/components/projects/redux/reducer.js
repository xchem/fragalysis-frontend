import { constants } from './constants';
const initCurrentSnapshot = {
  id: null,
  type: null,
  title: null,
  author: null,
  description: null,
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
  currentProjectDiscourseLink: null,
  isLoadingCurrentSnapshot: false,
  currentSnapshot: initCurrentSnapshot,
  isProjectModalOpen: false,
  isProjectModalLoading: false,
  listOfProjects: [],
  isLoadingListOfProjects: false,
  isLoadingTree: false,
  currentSnapshotTree: null,
  currentSnapshotList: null,
  forceCreateProject: false,
  isForceProjectCreated: false,
  projectDiscourseLinks: null
};

export const projectReducers = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.SET_CURRENT_PROJECT:
      return Object.assign({}, state, {
        currentProject: action.payload
      });

    case constants.SET_PROJECT_DISCOURSE_LINKS:
      return { ...state, projectDiscourseLinks: { ...action.payload } };

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

    case constants.SET_CURRENT_SNAPSHOT_PROPERTY:
      const currSnap = JSON.parse(JSON.stringify(state.currentSnapshot));
      currSnap[action.payload.key] = action.payload.value;
      return Object.assign({}, state, { currentSnapshot: currSnap });

    case constants.RESET_SNAPSHOT:
      return Object.assign({}, state, { currentSnapshot: initCurrentSnapshot });

    case constants.SET_IS_LOADING_CURRENT_SNAPSHOT:
      return Object.assign({}, state, { isLoadingCurrentSnapshot: action.payload });

    case constants.SET_LIST_OF_PROJECTS:
      return Object.assign({}, state, { listOfProjects: action.payload });

    case constants.SET_IS_LOADING_LIST_OF_PROJECTS:
      return Object.assign({}, state, { isLoadingListOfProjects: action.payload });

    case constants.SET_CURRENT_SNAPSHOT_TREE:
      return Object.assign({}, state, { currentSnapshotTree: action.payload });

    case constants.SET_IS_LOADING_TREE:
      return Object.assign({}, state, { isLoadingTree: action.payload });

    case constants.SET_CURRENT_SNAPSHOT_LIST:
      return Object.assign({}, state, { currentSnapshotList: action.payload });

    case constants.SET_FORCE_CREATE_PROJECT:
      return Object.assign({}, state, { forceCreateProject: action.payload });

    case constants.SET_FORCE_PROJECT_CREATED:
      return Object.assign({}, state, { isForceProjectCreated: action.payload });

    case constants.SET_CURRENT_PROJECT_DISCOURSE_LINK:
      return Object.assign({}, state, { currentProjectDiscourseLink: action.payload });

    case constants.RESET_PROJECTS_REDUCER:
      return Object.assign({}, INITIAL_STATE);

    case constants.RESET_LOADED_SNAPSHOTS:
      const currentState = JSON.parse(JSON.stringify(state));
      currentState.currentSnapshot = initCurrentSnapshot;
      currentState.currentSnapshotTree = null;
      currentState.currentSnapshotList = null;

      return Object.assign({}, currentState);

    default:
      return state;
  }
};
