export const COLUMN_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  MOLECULE: 'molecule',
  OBSERVATION: 'observation',
  PEER_REVIEW: 'peerReview',
  CANON_SITE: 'canonSite',
  CONFORMER_SITE: 'conformerSite',
  OBSERVATIONS: 'observations',
  CUSTOM: 'custom',

  DATASET_INDEX: 'datasetIndex',
  DATASET_DETAIL: 'datasetDetail',
  DATASET_ARROWS: 'datasetArrows',
  DATASET_MOLECULE: 'datasetMolecule'
};

export const ORDER = {
  ASC: true,
  DESC: false
};

const DETAIL_MIN_WIDTH = 60;

export const COLUMNS = [
  {
    name: 'peerReview',
    displayName: '',
    type: COLUMN_TYPES.PEER_REVIEW,
    minWidth: 22,
    width: 22,
    resizable: false,
    visible: true,
    data_type: 'custom'
  },
  {
    name: 'detail',
    displayName: 'Observation',
    type: COLUMN_TYPES.OBSERVATION,
    minWidth: DETAIL_MIN_WIDTH,
    width: 230,
    resizable: true,
    visible: true,
    data_type: 'custom'
  },
  {
    name: 'molecule',
    displayName: 'Molecule',
    type: COLUMN_TYPES.MOLECULE,
    minWidth: 150,
    width: 150,
    resizable: false,
    visible: true,
    data_type: 'custom'
  },
  {
    name: 'canonSite',
    displayName: '',
    type: COLUMN_TYPES.CANON_SITE,
    minWidth: 22,
    width: 22,
    resizable: false,
    visible: true,
    data_type: 'custom'
  },
  {
    name: 'conformerSite',
    displayName: '',
    type: COLUMN_TYPES.CONFORMER_SITE,
    minWidth: 22,
    width: 22,
    resizable: false,
    visible: true,
    data_type: 'custom'
  },
  {
    name: 'observations',
    displayName: '',
    type: COLUMN_TYPES.OBSERVATIONS,
    minWidth: 22,
    width: 22,
    resizable: false,
    visible: true,
    data_type: 'custom'
  }
];

export const RHS_COLUMNS = [
  {
    name: 'peerReview',
    displayName: '',
    type: COLUMN_TYPES.PEER_REVIEW,
    minWidth: 22,
    width: 22,
    resizable: false,
    visible: true,
    data_type: 'custom'
  },
  {
    name: 'detail',
    displayName: 'Observation',
    type: COLUMN_TYPES.OBSERVATION,
    minWidth: DETAIL_MIN_WIDTH,
    width: 230,
    resizable: true,
    visible: true,
    data_type: 'custom'
  },
  {
    name: 'molecule',
    displayName: 'Molecule',
    type: COLUMN_TYPES.MOLECULE,
    minWidth: 150,
    width: 150,
    resizable: false,
    visible: true,
    data_type: 'custom'
  },
  {
    name: 'observations',
    displayName: '',
    type: COLUMN_TYPES.OBSERVATIONS,
    minWidth: 22,
    width: 22,
    resizable: false,
    visible: true,
    data_type: 'custom'
  }
];
