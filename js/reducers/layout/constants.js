const prefix = 'REDUCERS_LAYOUT_';

export const layoutBreakpoints = {
  lg: 1920, // Uncapped
  md: 0 // Max 1920px width
};
export const layoutCols = { lg: 256, md: 192 };

export const baseColumnSize = 64;
export const collapsedPanelSize = 5;

export const layoutItemNames = {
  TAG_DETAILS: 'tagDetails',
  HIT_LIST_FILTER: 'hitListFilter',
  HIT_NAVIGATOR: 'hitNavigator',
  NGL: 'NGL',
  RHS: 'RHS',
  VIEWER_CONTROLS: 'viewerControls',
  PROJECT_HISTORY: 'projectHistory'
};

export const constants = {
  ENABLE_LAYOUT: prefix + 'ENABLE_LAYOUT',
  SET_SELECTED_LAYOUT_NAME: prefix + 'SET_SELECTED_LAYOUT_NAME',
  SET_CURRENT_LAYOUT: prefix + 'SET_CURRENT_LAYOUT',
  SET_DEFAULT_LAYOUT: prefix + 'SET_DEFAULT_LAYOUT',
  RESET_CURRENT_LAYOUT: prefix + 'RESET_CURRENT_LAYOUT',
  LOCK_LAYOUT: prefix + 'LOCK_LAYOUT',
  SET_PANEL_EXPANDED: prefix + 'SET_PANEL_EXPANDED'
};
