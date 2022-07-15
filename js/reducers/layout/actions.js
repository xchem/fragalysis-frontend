import { constants } from './constants';

export const enableLayout = enabled => {
  return {
    type: constants.ENABLE_LAYOUT,
    payload: enabled
  };
};

export const setSelectedLayoutName = name => {
  return {
    type: constants.SET_SELECTED_LAYOUT_NAME,
    payload: name
  };
};

export const setCurrentLayout = newLayout => {
  return {
    type: constants.SET_CURRENT_LAYOUT,
    payload: newLayout
  };
};

export const setDefaultLayout = newLayout => {
  return {
    type: constants.SET_DEFAULT_LAYOUT,
    payload: newLayout
  };
};

export const resetCurrentLayout = () => {
  return {
    type: constants.RESET_CURRENT_LAYOUT
  };
};

export const lockLayout = lock => {
  return {
    type: constants.LOCK_LAYOUT,
    payload: lock
  };
};

export const setPanelsExpanded = (type, expanded) => {
  return {
    type: constants.SET_PANEL_EXPANDED,
    payload: { type, expanded }
  };
};
