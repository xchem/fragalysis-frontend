import { constants } from './constants';

export const setOldUrl = url => ({ type: constants.SET_OLD_URL, payload: url });

export const setIsTargetLoading = isLoading => ({ type: constants.SET_TARGET_IS_LOADING, payload: isLoading });

export const setTargetDiscourseLinks = links => ({
  type: constants.SET_TARGET_DISCOURSE_LINKS,
  payload: links
});

export const setCurrentTargetLink = link => ({ type: constants.SET_CURRENT_TARGET_LINK, payload: link });

export const setProjects = projects => ({ type: constants.SET_PROJECTS, payload: projects });

export const setCurrentProject = project => {
  return { type: constants.SET_CURRENT_PROJECT, payload: project };
};

export const setOpenPickProjectModal = isOpen => ({ type: constants.SET_OPEN_PICK_PROJECT_MODAL, payload: isOpen });

export const setProjectsLoaded = isLoaded => ({ type: constants.SET_PROJECTS_LOADED, payload: isLoaded });

export const setListOfFilteredTargets = targets => ({
  type: constants.SET_LIST_OF_FILTERED_TARGETS,
  payload: targets
});

export const setListOfFilteredTargetsByDate = targets => ({
  type: constants.SET_LIST_OF_FILTERED_TARGETS_BY_DATE,
  payload: targets
});

export const setSortTargetDialogOpen = isOpen => ({
  type: constants.SET_SORT_TARGET_DIALOG_OPEN,
  payload: isOpen
});

export const setListOfTargets = targets => ({
  type: constants.SET_LIST_OF_TARGETS,
  payload: targets
});

export const setDefaultFilter = isClean => ({
  type: constants.SET_FILTER_CLEAN,
  payload: isClean
});

export const setSearchTarget = searchTarget => {
  return {
    type: constants.SEARCH_TARGET,
    payload: searchTarget
  };
};

export const setSearchNumberOfChains = searchNumberOfChains => {
  return {
    type: constants.SEARCH_NUMBER_OF_CHAINS,
    payload: searchNumberOfChains
  };
};

export const setSearchPrimaryChain = searchPrimaryChain => {
  return {
    type: constants.SEARCH_PRIMARY_CHAIN,
    payload: searchPrimaryChain
  };
};

export const setSearchUniprot = searchUniprot => {
  return {
    type: constants.SEARCH_UNIPROT,
    payload: searchUniprot
  };
};

export const setSearchRange = searchRange => {
  return {
    type: constants.SEARCH_RANGE,
    payload: searchRange
  };
};

export const setSearchProteinName = searchProteinName => {
  return {
    type: constants.SEARCH_PROTEIN_NAME,
    payload: searchProteinName
  };
};

export const setSearchGeneName = searchGeneName => {
  return {
    type: constants.SEARCH_GENE_NAME,
    payload: searchGeneName
  };
};

export const setSearchSpecies = searchSpecies => {
  return {
    type: constants.SEARCH_SPECIES,
    payload: searchSpecies
  };
};

export const setSearchDomain = searchDomain => {
  return {
    type: constants.SEARCH_DOMAIN,
    payload: searchDomain
  };
};

export const setSearchECNumber = searchECNumber => {
  return {
    type: constants.SEARCH_EC_NUMBER,
    payload: searchECNumber
  };
};

export const setSearchNHits = searchNHits => {
  return {
    type: constants.SEARCH_N_HITS,
    payload: searchNHits
  };
};

export const setSearchDateLastEditFrom = searchDateLastEditFrom => {
  return {
    type: constants.SEARCH_DATE_LAST_EDIT_FROM,
    payload: searchDateLastEditFrom
  };
};

export const setSearchDateLastEditTo = searchDateLastEditTo => {
  return {
    type: constants.SEARCH_DATE_LAST_EDIT_TO,
    payload: searchDateLastEditTo
  };
};

export const setSearchTargetAccessString = searchTargetAccessString => {
  return {
    type: constants.SEARCH_TARGET_ACCESS_STRING,
    payload: searchTargetAccessString
  };
};

export const setSearchInitDateFrom = searchInitDateFrom => {
  return {
    type: constants.SEARCH_INIT_DATE_FROM,
    payload: searchInitDateFrom
  };
};

export const setSearchInitDateTo = searchInitDateTo => {
  return {
    type: constants.SEARCH_INIT_DATE_TO,
    payload: searchInitDateTo
  };
};

