const prefix = 'REDUCERS_TRACKING_';

export const constants = {
  SET_ACTIONS_LIST: prefix + 'SET_ACTIONS_LIST',
  APPEND_ACTIONS_LIST: prefix + 'APPEND_ACTIONS_LIST',
  SET_CURRENT_ACTIONS_LIST: prefix + 'SET_CURRENT_ACTIONS_LIST',
  SET_IS_TRACKING_COMPOUNDS_RESTORING: prefix + 'SET_IS_TRACKING_COMPOUNDS_RESTORING',
  SET_IS_TRACKING_MOLECULES_RESTORING: prefix + 'SET_IS_TRACKING_MOLECULES_RESTORING'
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
  REPRESENTATION_CHANGED: 'REPRESENTATION_CHANGED',
  REPRESENTATION_ADDED: 'REPRESENTATION_ADDED',
  REPRESENTATION_REMOVED: 'REPRESENTATION_REMOVED'
};

export const actionDescription = {
  LOADED: 'was loaded',
  TURNED_ON: 'was turned on',
  TURNED_OFF: 'was turned off',
  SELECTED: 'was selected',
  DESELECTED: 'was deselected',
  ADDED: 'was added',
  REMOVED: 'was removed',
  CHANGED: 'was changed',
  TO_SHOPPING_CART: 'to shopping cart',
  FROM_SHOPPING_CART: 'from shopping cart',
  LIGAND: 'Ligand',
  SIDECHAINS: 'Sidechain',
  INTERACTIONS: 'Interaction',
  VECTOR: 'Vector',
  SURFACE: 'Surface',
  SITE: 'Site',
  TARGET: 'Target'
};

export const actionObjectType = {
  TARGET: 'TARGET',
  SITE: 'SITE',
  MOLECULE: 'MOLECULE',
  COMPOUND: 'COMPOUND',
  INSPIRATION: 'INSPIRATION',
  CROSS_REFERENCE: 'CROSS_REFERENCE',
  REPRESENTATION: 'REPRESENTATION'
};
