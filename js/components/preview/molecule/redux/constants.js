const prefix = 'PREVIEW_MOLECULE_';

export const constants = {
  SET_SORT_DIALOG_OPEN: prefix + 'SET_SORT_DIALOG_OPEN',
  RELOAD_REDUCER: prefix + 'RELOAD_REDUCER',
  ADD_IMAGE_TO_CACHE: prefix + 'ADD_IMAGE_TO_CACHE',
  ADD_PROTEIN_DATA_TO_CACHE: prefix + 'ADD_PROTEIN_DATA_TO_CACHE',
  DISABLE_NGL_CONTROL_BUTTON: prefix + 'DISABLE_NGL_CONTROL_BUTTON',
  ENABLE_NGL_CONTROL_BUTTON: prefix + 'ENABLE_NGL_CONTROL_BUTTON',
  SET_SEARCH_STRING_HIT_NAVIGATOR: prefix + 'SET_SEARCH_STRING_HIT_NAVIGATOR'
};

export const MOL_ATTR = {
  SID: {
    key: 'site',
    name: 'Site ID (SID)',
    isFloat: false,
    color: '#72e5be',
    filter: false
  },
  /*  HID: {
    key: 'id',
    name: 'Hit ID (HID)',
    isFloat: false,
    color: '#daa520',
    filter: false
  }, */
  HID: {
    key: 'number',
    name: 'Hit ID (HID)',
    isFloat: true,
    color: '#daa520',
    filter: false
  },
  MW: {
    key: 'MW',
    name: 'Molecular weight (MW)',
    isFloat: true,
    color: '#f96587',
    filter: true
  },
  LOGP: { key: 'logP', name: 'logP', isFloat: true, color: '#3cb44b', filter: true },
  TPSA: {
    key: 'TPSA',
    name: 'Topological polar surface area (TPSA)',
    isFloat: true,
    color: '#ffe119',
    filter: true
  },
  HA: { key: 'HA', name: 'Heavy atom count', isFloat: false, color: '#079ddf', filter: true },
  HACC: {
    key: 'Hacc',
    name: '# H-bond acceptors (Hacc)',
    isFloat: false,
    color: '#f58231',
    filter: true
  },
  HDON: {
    key: 'Hdon',
    name: '# H-bond donors (Hdon)',
    isFloat: false,
    color: '#86844a',
    filter: true
  },
  ROTS: {
    key: 'Rots',
    name: '# Rotatable bonds (Rots)',
    isFloat: false,
    color: '#42d4f4',
    filter: true
  },
  RINGS: {
    key: 'Rings',
    name: '# rings (rings)',
    isFloat: false,
    color: '#f032e6',
    filter: true
  },
  VELEC: {
    key: 'Velec',
    name: '# valence electrons (velec)',
    isFloat: false,
    color: '#bfef45',
    filter: true
  } /*,
  NCPD: {
    key: '#cpd',
    name: '# available follow-up cmpds. (#cpd)',
    isFloat: false,
    color: '#fabebe',
    filter: true
  }*/
};

export const MOL_ATTRIBUTES = Object.values(MOL_ATTR);

export const MOL_TYPE = {
  HIT: 'HIT',
  DATASET: 'DATASET'
};
