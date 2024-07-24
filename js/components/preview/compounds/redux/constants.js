const prefix = 'PREVIEW_COMPOUNDS_';

export const constants = {
  SET_CURRENT_COMPOUNDS: prefix + 'SET_CURRENT_COMPOUNDS',
  SET_CURRENT_PAGE: prefix + 'SET_CURRENT_PAGE',
  RESET_CURRENT_COMPOUNDS_SETTINGS: prefix + 'RESET_CURRENT_COMPOUNDS_SETTINGS',
  RESET_CURRENT_COMPOUNDS_SETTINGS_WITHOUT_SELECTION: prefix + 'RESET_CURRENT_COMPOUNDS_SETTINGS_WITHOUT_SELECTION',
  UPDATE_COMPOUND: prefix + 'UPDATE_COMPOUND',
  SET_CURRENT_COMPOUND_CLASS: prefix + 'SET_CURRENT_COMPOUND_CLASS',
  SET_COMPOUND_CLASSES: prefix + 'SET_COMPOUND_CLASSES',
  RESET_COMPOUND_CLASSES: prefix + 'RESET_COMPOUND_CLASSES',
  SET_HIGHLIGHTED_COMPOUND_ID: prefix + 'SET_HIGHLIGHTED_COMPOUND_ID',
  SET_CONFIGURATION: prefix + 'SET_CONFIGURATION',
  RESET_CONFIGURATION: prefix + 'RESET_CONFIGURATION',
  SET_SHOWED_COMPOUND_LIST: prefix + 'SET_SHOWED_COMPOUND_LIST',
  APPEND_SHOWED_COMPOUND_LIST: prefix + 'APPEND_SHOWED_COMPOUND_LIST',
  REMOVE_SHOWED_COMPOUND_LIST: prefix + 'REMOVE_SHOWED_COMPOUND_LIST',

  APPEND_SELECTED_COMPOUND_CLASS: prefix + 'APPEND_SELECTED_COMPOUND_CLASS',
  REMOVE_SELECTED_COMPOUND_CLASS: prefix + 'REMOVE_SELECTED_COMPOUND_CLASS',
  RESET_SELECTED_COMPOUND_CLASS: prefix + 'RESET_SELECTED_COMPOUND_CLASS',

  SET_SELECTED_COMPOUNDS: prefix + 'SET_SELECTED_COMPOUNDS',

  RELOAD_REDUCER: prefix + 'RELOAD_REDUCER'
};

const colors = {
  blue: 'blue',
  red: 'red',
  green: 'green',
  purple: 'purple',
  apricot: 'apricot'
};

export const compoundsColors = {
  [colors.blue]: { key: colors.blue, text: 'Blue', color: '#b3cde3' },
  [colors.red]: { key: colors.red, text: 'Red', color: '#fbb4ae' },
  [colors.green]: { key: colors.green, text: 'Green', color: '#ccebc5' },
  [colors.purple]: { key: colors.purple, text: 'Purple', color: '#decbe4' },
  [colors.apricot]: { key: colors.apricot, text: 'Apricot', color: '#fed9a6' }
};

export const AUX_VECTOR_SELECTOR_DATASET_ID = 'vector_selector';
