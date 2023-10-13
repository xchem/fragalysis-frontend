import { constants } from './constants';

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

    case constants.SET_LIST_OF_FILTERED_TARGETS:
      return Object.assign({}, state, { listOfFilteredTargets: action.payload });

    case constants.SET_SORT_TARGET_DIALOG_OPEN:
      return { ...state, targetListFilterDialog: action.payload };

    case constants.SET_LIST_OF_TARGETS:
      return { ...state, listOfTargets: action.payload };

    case constants.SET_IS_LOADING_LIST_OF_TARGETS:
      return Object.assign({}, state, { isLoadingListOfTargets: action.payload });

    case constants.SET_FILTER_CLEAN:
      return Object.assign({}, state, { filterClean: action.payload });

    case constants.SET_LIST_OF_FILTERED_TARGETS_BY_DATE:
      return Object.assign({}, state, { listOfFilteredTargetsByDate: action.payload });

    case constants.SEARCH_TARGET:
      return Object.assign({}, state, {
        searchTarget: action.payload
      });

    case constants.SEARCH_NUMBER_OF_CHAINS:
      return Object.assign({}, state, {
        searchNumberOfChains: action.payload
      });

    case constants.SEARCH_PRIMARY_CHAIN:
      return Object.assign({}, state, {
        searchPrimaryChain: action.payload
      });

    case constants.SEARCH_UNIPROT:
      return Object.assign({}, state, {
        searchUniprot: action.payload
      });

    case constants.SEARCH_RANGE:
      return Object.assign({}, state, {
        searchRange: action.payload
      });

    case constants.SEARCH_PROTEIN_NAME:
      return Object.assign({}, state, {
        searchProteinName: action.payload
      });

    case constants.SEARCH_GENE_NAME:
      return Object.assign({}, state, {
        searchGeneName: action.payload
      });

    case constants.SEARCH_SPECIES:
      return Object.assign({}, state, {
        searchSpecies: action.payload
      });

    case constants.SEARCH_DOMAIN:
      return Object.assign({}, state, {
        searchDomain: action.payload
      });

    case constants.SEARCH_EC_NUMBER:
      return Object.assign({}, state, {
        searchECNumber: action.payload
      });

    case constants.SEARCH_N_HITS:
      return Object.assign({}, state, {
        searchNHits: action.payload
      });

    case constants.SEARCH_DATE_LAST_EDIT_FROM:
      return Object.assign({}, state, {
        searchDateLastEditFrom: action.payload
      });

    case constants.SEARCH_DATE_LAST_EDIT_TO:
      return Object.assign({}, state, {
        searchDateLastEditTo: action.payload
      });

    case constants.SEARCH_TARGET_ACCESS_STRING:
      return Object.assign({}, state, {
        searchTargetAccessString: action.payload
      });

    case constants.SEARCH_INIT_DATE_FROM:
      return Object.assign({}, state, {
        searchInitDateFrom: action.payload
      });

    case constants.SEARCH_INIT_DATE_TO:
      return Object.assign({}, state, {
        searchInitDateTo: action.payload
      });

    default:
      return state;
  }
};
