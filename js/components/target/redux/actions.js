import { constants } from './constatnts';

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
