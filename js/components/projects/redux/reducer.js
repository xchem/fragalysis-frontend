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
  isLoadingCurrentSnapshot: false,
  currentSnapshot: initCurrentSnapshot,
  currentSnapshotList: null,
  currentSnapshotJobList: {},
  jobList: [],
  jobConfigurationDialogOpen: false,
  jobLauncherDialogOpen: false,
  jobLauncherData: null,
  jobLauncherSquonkUrl: null,
  refreshJobsData: new Date().getTime()
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

    case constants.SET_LIST_OF_FILTERED_PROJECTS:
      return Object.assign({}, state, { listOfFilteredProjects: action.payload });

    case constants.SET_LIST_OF_FILTERED_PROJECTS_BY_DATE:
      return Object.assign({}, state, { listOfFilteredProjectsByDate: action.payload });

    case constants.SET_CURRENT_SNAPSHOT_LIST:
      return Object.assign({}, state, {
        currentSnapshotList: action.payload
      });

    case constants.SET_CURRENT_SNAPSHOT_JOBLIST: {
      const { snapshotId, jobList } = action.payload;

      const currentSnapshotJobList = { ...state.currentSnapshotJobList };
      currentSnapshotJobList[snapshotId] = jobList;
      return { ...state, currentSnapshotJobList };
    }

    case constants.SET_JOB_LIST:
      return { ...state, jobList: [...action.jobList] };

    case constants.RESET_PROJECTS_REDUCER:
      return Object.assign({}, INITIAL_STATE);

    case constants.RESET_LOADED_SNAPSHOTS:
      const currentState = JSON.parse(JSON.stringify(state));
      currentState.currentSnapshot = initCurrentSnapshot;
      currentState.currentSnapshotList = null;

      return Object.assign({}, currentState);

    case constants.SET_JOB_CONFIGURATION_DIALOG_OPEN:
      return Object.assign({}, state, { jobConfigurationDialogOpen: action.payload });

    case constants.SET_JOB_LAUNCHER_DIALOG_OPEN:
      return Object.assign({}, state, { jobLauncherDialogOpen: action.payload });

    case constants.SET_JOB_LAUNCHER_DATA:
      return Object.assign({}, state, { jobLauncherData: action.payload });

    case constants.SET_JOB_LAUNCHER_SQUONK_URL:
      return Object.assign({}, state, { jobLauncherSquonkUrl: action.payload });

    case constants.REFRESH_JOBS_DATA:
      return { ...state, refreshJobsData: new Date().getTime() };

    case constants.SET_FILTER_CLEAN:
      return Object.assign({}, state, { filterClean: action.payload });

    case constants.SEARCH_NAME:
      return Object.assign({}, state, {
        searchName: action.payload
      });

    case constants.SEARCH_TARGET:
      return Object.assign({}, state, {
        searchTarget: action.payload
      });

    case constants.SEARCH_DESCRIPTION:
      return Object.assign({}, state, {
        searchDescription: action.payload
      });

    case constants.SEARCH_TARGET_ACCESS_STRING:
      return Object.assign({}, state, {
        searchTargetAccessString: action.payload
      });

    case constants.SEARCH_AUTHORITY:
      return Object.assign({}, state, {
        searchAuthority: action.payload
      });

    case constants.SEARCH_DATE_FROM:
      return Object.assign({}, state, {
        searchDateFrom: action.payload
      });

    case constants.SEARCH_DATE_TO:
      return Object.assign({}, state, {
        searchDateTo: action.payload
      });

    default:
      return state;
  }
};
