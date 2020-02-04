import { constants } from './constants';

export const setCurrentProject = ({ author, title, description, target, tags }) => ({
  type: constants.SET_CURRENT_PROJECT,
  payload: { author, title, description, target, tags }
});

export const resetProjectState = () => ({
  type: constants.RESET_PROJECT_STATE
});

export const setProjectModalOpen = isOpen => ({
  type: constants.SET_PROJECT_MODAL_OPEN,
  payload: isOpen
});
