import { constants } from './constatnts';

export const INITIAL_STATE = {
  oldUrl: '',
  isTargetLoading: false,
  targetDiscourseLinks: null,
  currentTargetLink: null,
  //these are not session projects i.e. projects created within fragalysis UI these
  //are projects defined at the diamond (?) level
  projects: [],
  currentProject: null,
  openPickProjectModal: false,
  projectsLoaded: false
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

    case constants.SET_PROJECTS:
      return { ...state, projects: [...action.payload] };

    case constants.SET_CURRENT_PROJECT:
      return { ...state, currentProject: action.payload };

    case constants.SET_OPEN_PICK_PROJECT_MODAL:
      return { ...state, openPickProjectModal: action.payload };

    case constants.SET_PROJECTS_LOADED:
      return { ...state, projectsLoaded: action.payload };

    default:
      return state;
  }
};
