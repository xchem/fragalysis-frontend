const prefix = 'PROJECTS_';

export const constants = {
  SET_CURRENT_PROJECT: prefix + 'SET_CURRENT_PROJECT',
  RESET_PROJECT_STATE: prefix + 'RESET_PROJECT_STATE',
  SET_PROJECT_MODAL_OPEN: prefix + 'SET_PROJECT_MODAL_OPEN'
};

export const ProjectCreationType = {
  NEW: 'NEW',
  FROM_SNAPSHOT: 'FROM_SNAPSHOT'
};
