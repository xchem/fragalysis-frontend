const prefix = 'REDUCERS_TRACKING_';

export const constants = {
  SET_ACTIONS_LIST: prefix + 'SET_ACTIONS_LIST',
  APPEND_ACTIONS_LIST: prefix + 'APPEND_ACTIONS_LIST',
  SET_CURRENT_ACTIONS_LIST: prefix + 'SET_CURRENT_ACTIONS_LIST',
  SET_IS_TRACKING_COMPOUNDS_RESTORING: prefix + 'SET_IS_TRACKING_COMPOUNDS_RESTORING',
  SET_IS_TRACKING_MOLECULES_RESTORING: prefix + 'SET_IS_TRACKING_MOLECULES_RESTORING',
  SET_IS_UNDO_REDO_ACTION: prefix + 'SET_IS_UNDO_REDO_ACTION',
  SET_SEND_ACTIONS_LIST: prefix + 'SET_SEND_ACTIONS_LIST',
  APPEND_SEND_ACTIONS_LIST: prefix + 'APPEND_SEND_ACTIONS_LIST',
  SET_IS_ACTIONS_SENDING: prefix + 'SET_IS_ACTIONS_SENDING',
  SET_IS_ACTIONS_LOADING: prefix + 'SET_IS_ACTIONS_LOADING',
  SET_PROJECT_ACTIONS_LIST: prefix + 'SET_PROJECT_ACTIONS_LIST',
  SET_IS_ACTIONS_SAVING: prefix + 'SET_IS_ACTIONS_SAVING',
  SET_IS_ACTIONS_RESTORING: prefix + 'SET_IS_ACTIONS_RESTORING',
  RESET_TRACKING_STATE: prefix + 'RESET_TRACKING_STATE',
  SET_TRACKING_IMAGE_SOURCE: prefix + 'SET_TRACKING_IMAGE_SOURCE',
  SET_SNAPSOT_IMAGE_ACTIONS_LIST: prefix + 'SET_SNAPSOT_IMAGE_ACTIONS_LIST',
  APPEND_UNDO_REDO_ACTIONS_LIST: prefix + 'APPEND_UNDO_REDO_ACTIONS_LIST',
  SET_UNDO_REDO_ACTIONS_LIST: prefix + 'SET_UNDO_REDO_ACTIONS_LIST'
};

export const actionType = {
  TARGET_LOADED: 'TARGET_LOADED',
  SITE_TURNED_ON: 'SITE_TURNED_ON',
  SITE_TURNED_OFF: 'SITE_TURNED_OFF',
  LIGAND_TURNED_ON: 'LIGAND_TURNED_ON',
  LIGAND_TURNED_OFF: 'LIGAND_TURNED_OFF',
  SIDECHAINS_TURNED_ON: 'SIDECHAINS_TURNED_ON',
  SIDECHAINS_TURNED_OFF: 'SIDECHAINS_TURNED_OFF',
  INTERACTIONS_TURNED_ON: 'INTERACTIONS_TURNED_ON',
  INTERACTIONS_TURNED_OFF: 'INTERACTIONS_TURNED_OFF',
  SURFACE_TURNED_ON: 'SURFACE_TURNED_ON',
  SURFACE_TURNED_OFF: 'SURFACE_TURNED_OFF',
  VECTORS_TURNED_ON: 'VECTORS_TURNED_ON',
  VECTORS_TURNED_OFF: 'VECTORS_TURNED_OFF',
  VECTOR_SELECTED: 'VECTOR_SELECTED',
  VECTOR_DESELECTED: 'VECTOR_DESELECTED',
  MOLECULE_ADDED_TO_SHOPPING_CART: 'MOLECULE_ADDED_TO_SHOPPING_CART',
  MOLECULE_REMOVED_FROM_SHOPPING_CART: 'MOLECULE_REMOVED_FROM_SHOPPING_CART',
  COMPOUND_SELECTED: 'COMPOUND_SELECTED',
  COMPOUND_DESELECTED: 'COMPOUND_DESELECTED',
  REPRESENTATION_UPDATED: 'REPRESENTATION_UPDATED',
  REPRESENTATION_ADDED: 'REPRESENTATION_ADDED',
  REPRESENTATION_REMOVED: 'REPRESENTATION_REMOVED',
  REPRESENTATION_CHANGED: 'REPRESENTATION_CHANGED',
  NGL_STATE: 'NGL_STATE',
  UNDO: 'UNDO',
  REDO: 'REDO',
  SNAPSHOT: 'SNAPSHOT',
  ALL_HIDE: 'ALL_HIDE',
  ALL_TURNED_ON: 'ALL_TURNED_ON',
  ALL_TURNED_OFF: 'ALL_TURNED_OFF',
  ALL_TURNED_ON_BY_TYPE: 'ALL_TURNED_ON_BY_TYPE',
  ALL_TURNED_OFF_BY_TYPE: 'ALL_TURNED_OFF_BY_TYPE',
  BACKGROUND_COLOR_CHANGED: 'BACKGROUND_COLOR_CHANGED',
  CLIP_NEAR: 'CLIP_NEAR'
};

export const actionDescription = {
  LOADED: 'was loaded',
  TURNED_ON: 'was turned on',
  TURNED_OFF: 'was turned off',
  SELECTED: 'was selected',
  DESELECTED: 'was deselected',
  HIDDEN: 'hidden',
  CANCELED: 'canceled',
  ADDED: 'was added',
  REMOVED: 'was removed',
  CHANGED: 'was changed',
  UPDATED: 'was updated',
  TO_SHOPPING_CART: 'to shopping cart',
  FROM_SHOPPING_CART: 'from shopping cart',
  LIGAND: 'Ligand',
  SIDECHAIN: 'Sidechain',
  INTERACTION: 'Interaction',
  VECTOR: 'Vector',
  SURFACE: 'Surface',
  SITE: 'Site',
  TARGET: 'Target',
  ALL: 'All',
  LIGANDS: 'Ligands',
  SIDECHAINS: 'Sidechains',
  INTERACTIONS: 'Interactions'
};

export const actionObjectType = {
  TARGET: 'TARGET',
  SITE: 'SITE',
  MOLECULE: 'MOLECULE',
  COMPOUND: 'COMPOUND',
  INSPIRATION: 'INSPIRATION',
  CROSS_REFERENCE: 'CROSS_REFERENCE',
  REPRESENTATION: 'REPRESENTATION',
  VIEWER_SETTINGS: 'VIEWER_SETTINGS'
};

export const actionAnnotation = {
  CHECK: 'CHECK',
  CLEAR: 'CLEAR',
  WARNING: 'WARNING',
  FAVORITE: 'FAVORITE',
  STAR: 'STAR'
};

export const NUM_OF_SECONDS_TO_IGNORE_MERGE = 5;
