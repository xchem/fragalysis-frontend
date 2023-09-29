const prefix = 'TARGET_';

export const constants = {
  SET_OLD_URL: prefix + 'SET_OLD_URL',
  SET_TARGET_IS_LOADING: prefix + 'SET_TARGET_IS_LOADING',
  SET_TARGET_DISCOURSE_LINKS: prefix + 'SET_TARGET_DISCOURSE_LINKS',
  SET_CURRENT_TARGET_LINK: prefix + 'SET_CURRENT_TARGET_LINK',
  SET_PROJECTS: prefix + 'SET_PROJECTS',
  SET_CURRENT_PROJECT: prefix + 'SET_CURRENT_PROJECT',
  SET_OPEN_PICK_PROJECT_MODAL: prefix + 'SET_OPEN_PICK_PROJECT_MODAL',
  SET_PROJECTS_LOADED: prefix + 'SET_PROJECTS_LOADED',
  SET_LIST_OF_FILTERED_TARGETS: prefix + 'SET_LIST_OF_FILTERED_TARGETS',
  SET_SORT_TARGET_DIALOG_OPEN: prefix + 'SET_SORT_TARGET_DIALOG_OPEN',
  SET_LIST_OF_TARGETS: prefix + 'SET_LIST_OF_TARGETS'
};

export const TARGETS_ATT = {
  target: {
    key: 'target',
    name: 'Target',
    isFloat: true,
    color: '#daa520',
    filter: true,
    dateFilter: false,
    path: undefined
  },
  numberOfChain: {
    key: 'numberOfChain',
    name: 'Number of chain',
    isFloat: true,
    color: '#f96587',
    filter: true,
    dateFilter: false,
    path: undefined
  },
  primaryChain: {
    key: 'primaryChain',
    name: 'Primary chain',
    isFloat: true,
    color: '#ffe119',
    filter: true,
    dateFilter: false,
    path: undefined
  },
  uniprot: {
    key: 'uniprot',
    name: 'Uniprot',
    isFloat: true,
    color: '#f58231',
    filter: true,
    dateFilter: false,
    path: undefined
  },
  range: {
    key: 'range',
    name: 'Range',
    isFloat: true,
    color: '#86844a',
    filter: true,
    dateFilter: false,
    path: undefined
  },
  proteinName: {
    key: 'proteinName',
    name: 'Protein name',
    isFloat: false,
    color: '#42d4f4',
    filter: true,
    dateFilter: false,
    value: ''
  },
  geneName: {
    key: 'geneName',
    name: 'Gene name',
    isFloat: false,
    color: '#49c4f4',
    filter: true,
    dateFilter: false,
    value: ''
  },
  species: {
    key: 'species',
    name: 'Species',
    isFloat: true,
    color: '#a6849a',
    filter: true,
    dateFilter: false,
    path: undefined
  },
  domain: {
    key: 'domain',
    name: 'Domain',
    isFloat: true,
    color: '#c9849a',
    filter: true,
    dateFilter: false,
    path: undefined
  },
  ECNumber: {
    key: 'ECNumber',
    name: 'EC number',
    isFloat: true,
    color: '#c9159c',
    filter: true,
    dateFilter: false,
    path: undefined
  },
  NHits: {
    key: 'NHits',
    name: 'N Hits',
    isFloat: true,
    color: '#f58588',
    filter: true,
    dateFilter: false,
    path: undefined
  },
  dateLastEdit: {
    key: 'dateLastEdit',
    name: 'Date last Edit',
    isFloat: true,
    color: '#dcc520',
    filter: true,
    dateFilter: true,
    path: undefined
  }
};

export const TARGETS_ATTR = Object.values(TARGETS_ATT);
