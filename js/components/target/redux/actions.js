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
