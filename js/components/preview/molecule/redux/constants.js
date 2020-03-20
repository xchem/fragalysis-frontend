const prefix = 'PREVIEW_MOLECULE_';

export const constants = {
  SET_SORT_DIALOG_OPEN: prefix + 'SET_SORT_DIALOG_OPEN',

  RELOAD_REDUCER: prefix + 'RELOAD_REDUCER'
};

export const MOL_ATTR = {
  MW: {
    key: 'MW',
    name: 'Molecular weight (MW)',
    isFloat: true,
    color: '#f96587'
  },
  LOGP: { key: 'logP', name: 'logP', isFloat: true, color: '#3cb44b' },
  TPSA: {
    key: 'TPSA',
    name: 'Topological polar surface area (TPSA)',
    isFloat: true,
    color: '#ffe119'
  },
  HA: { key: 'HA', name: 'Heavy atom count', isFloat: false, color: '#079ddf' },
  HACC: {
    key: 'Hacc',
    name: '# H-bond acceptors (Hacc)',
    isFloat: false,
    color: '#f58231'
  },
  HDON: {
    key: 'Hdon',
    name: '# H-bond donors (Hdon)',
    isFloat: false,
    color: '#86844a'
  },
  ROTS: {
    key: 'Rots',
    name: '# Rotatable bonds (Rots)',
    isFloat: false,
    color: '#42d4f4'
  },
  RINGS: {
    key: 'Rings',
    name: '# rings (rings)',
    isFloat: false,
    color: '#f032e6'
  },
  VELEC: {
    key: 'Velec',
    name: '# valence electrons (velec)',
    isFloat: false,
    color: '#bfef45'
  },
  NCPD: {
    key: '#cpd',
    name: '# available follow-up cmpds. (#cpd)',
    isFloat: false,
    color: '#fabebe'
  }
};

export const MOL_ATTRIBUTES = Object.values(MOL_ATTR);
