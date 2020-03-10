import { constants } from './constants';

export const setCurrentProject = ({ author, title, description, target, tags, type }) => ({
  type: constants.SET_CURRENT_PROJECT,
  payload: { author, title, description, target, tags, type }
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

export const setProjectSnapshot = (snapshot, snapshotDetail) => ({
  type: constants.SET_SNAPSHOT,
  payload: { snapshot, snapshotDetail }
});

export const resetProjectsReducer = () => ({ type: constants.RESET_PROJECTS_REDUCER });
