const prefix = 'REDUCERS_NGL_';

export const CONSTANTS = {
  LOAD_OBJECT: prefix + 'LOAD_OBJECT',
  DELETE_OBJECT: prefix + 'DELETE_OBJECT',
  // NGL Component Representation
  UPDATE_COMPONENT_REPRESENTATION: prefix + 'UPDATE_COMPONENT_REPRESENTATION',
  REMOVE_COMPONENT_REPRESENTATION: prefix + 'REMOVE_COMPONENT_REPRESENTATION',
  ADD_COMPONENT_REPRESENTATION: prefix + 'ADD_COMPONENT_REPRESENTATION',
  CHANGE_COMPONENT_REPRESENTATION: prefix + 'CHANGE_COMPONENT_REPRESENTATION',

  SET_NGL_VIEW_PARAMS: prefix + 'SET_NGL_VIEW_PARAMS',
  SET_ORIENTATION: prefix + 'SET_ORIENTATION',
  SET_NGL_STATE_FROM_CURRENT_SNAPSHOT: prefix + 'SET_NGL_STATE_FROM_CURRENT_SNAPSHOT',
  REMOVE_ALL_NGL_COMPONENTS: prefix + 'REMOVE_ALL_NGL_COMPONENTS',

  // Helper variables for marking that protein and molecule groups are successful loaded
  SET_PROTEINS_HAS_LOADED: prefix + 'SET_PROTEINS_HAS_LOADED',
  SET_COUNT_OF_REMAINING_MOLECULE_GROUPS: prefix + 'SET_COUNT_OF_REMAINING_MOLECULE_GROUPS',
  DECREMENT_COUNT_OF_REMAINING_MOLECULE_GROUPS: prefix + 'DECREMENT_COUNT_OF_REMAINING_MOLECULE_GROUPS',
  INCREMENT_COUNT_OF_PENDING_NGL_OBJECTS: prefix + 'INCREMENT_COUNT_OF_PENDING_NGL_OBJECTS',
  DECREMENT_COUNT_OF_PENDING_NGL_OBJECTS: prefix + 'DECREMENT_COUNT_OF_PENDING_NGL_OBJECTS',

  SET_MOLECULE_ORIENTATIONS: prefix + 'SET_MOLECULE_ORIENTATIONS',
  APPEND_MOLECULE_ORIENTATION: prefix + 'SET_MOLECULE_ORIENTATION',
  REMOVE_MOLECULE_ORIENTATION: prefix + 'REMOVE_MOLECULE_ORIENTATION',

  ADD_TO_PDB_CACHE: prefix + 'ADD_TO_PDB_CACHE',

  SET_BACKGROUND_COLOR: prefix + 'SET_BACKGROUND_COLOR',
  SET_CLIP_NEAR: prefix + 'SET_CLIP_NEAR'
};

export const SCENES = {
  defaultScene: 'defaultScene',
  sessionScene: 'sessionScene'
};
