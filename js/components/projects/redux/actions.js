import { constants } from './constants';

export const setCurrentProject = ({ projectID, authorID, title, description, targetID, tags, type }) => ({
  type: constants.SET_CURRENT_PROJECT,
  payload: { projectID, authorID, title, description, targetID, tags, type }
});
export const setCurrentProjectProperty = (key, value) => ({
  type: constants.SET_CURRENT_PROJECT_PROPERTY,
  payload: { key, value }
});
export const resetProjectState = () => ({
  type: constants.RESET_CURRENT_PROJECT_STATE
});

export const setProjectModalOpen = isOpen => ({
  type: constants.SET_PROJECT_MODAL_OPEN,
  payload: isOpen
});

export const setProjectModalIsLoading = isLoading => ({
  type: constants.SET_PROJECT_MODAL_IS_LOADING,
  payload: isLoading
});

export const setCurrentSnapshot = currentSnapshot => ({
  type: constants.SET_SNAPSHOT,
  payload: { currentSnapshot }
});

export const setCurrentSnapshotProperty = (key, value) => ({
  type: constants.SET_CURRENT_SNAPSHOT_PROPERTY,
  payload: { key, value }
});

export const resetCurrentSnapshot = () => ({
  type: constants.RESET_SNAPSHOT
});

export const setIsLoadingCurrentSnapshot = isLoading => ({
  type: constants.SET_IS_LOADING_CURRENT_SNAPSHOT,
  payload: isLoading
});

export const resetProjectsReducer = () => ({ type: constants.RESET_PROJECTS_REDUCER });

export const resetLoadedSnapshots = () => ({ type: constants.RESET_LOADED_SNAPSHOTS });

export const setListOfProjects = projects => ({
  type: constants.SET_LIST_OF_PROJECTS,
  payload: projects
});

export const setIsLoadingListOfProjects = isLoading => ({
  type: constants.SET_IS_LOADING_LIST_OF_PROJECTS,
  payload: isLoading
});

export const setIsLoadingTree = isLoading => ({
  type: constants.SET_IS_LOADING_TREE,
  payload: isLoading
});

export const setCurrentSnapshotTree = tree => ({
  type: constants.SET_CURRENT_SNAPSHOT_TREE,
  payload: tree
});

export const setCurrentSnapshotList = list => ({
  type: constants.SET_CURRENT_SNAPSHOT_LIST,
  payload: list
});

export const setForceCreateProject = isForce => ({
  type: constants.SET_FORCE_CREATE_PROJECT,
  payload: isForce
});

export const setForceProjectCreated = isCreated => ({
  type: constants.SET_FORCE_PROJECT_CREATED,
  payload: isCreated
});

export const setProjectDiscourseLinks = links => ({
  type: constants.SET_PROJECT_DISCOURSE_LINKS,
  payload: links
});

export const setCurrentProjectDiscourseLink = link => ({
  type: constants.SET_CURRENT_PROJECT_DISCOURSE_LINK,
  payload: link
});
