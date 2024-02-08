const main_identifier = 'x';
const sub_identifier = '_';
const count_send_track_actions = 5;

export const CONSTANTS = {
  MAIN_IDENTIFIER: main_identifier,
  SUB_IDENTIFIER: sub_identifier,
  COUNT_SEND_TRACK_ACTIONS: count_send_track_actions
};

export const VIEWS = {
  MAJOR_VIEW: 'major_view',
  SUMMARY_VIEW: 'summary_view',
  PANDDA_MAJOR: 'pandda_major',
  PANDDA_SUMMARY: 'pandda_summary'
};

export const PREFIX = {
  PROTEIN: 'PROTEIN_',
  EVENT_LOAD: 'EVENTLOAD_',
  COMPLEX_LOAD: 'COMPLEXLOAD_'
};

export const SUFFIX = {
  MAIN: '_MAIN',
  INTERACTION: '_INTERACTION'
};

export const ARROW_TYPE = {
  UP: 'UP',
  DOWN: 'DOWN'
};

export const CATEGORY_TYPE = {
  SITE: 'Sites',
  SERIES: 'Series',
  FORUM: 'Discussion',
  OTHER: 'Other'
};

export const CATEGORY_ID = {
  [CATEGORY_TYPE.SITE]: 1,
  [CATEGORY_TYPE.SERIES]: 2,
  [CATEGORY_TYPE.FORUM]: 3,
  [CATEGORY_TYPE.OTHER]: 4
};

export const CATEGORY_TYPE_BY_ID = {
  1: CATEGORY_TYPE.SITE,
  2: CATEGORY_TYPE.SERIES,
  3: CATEGORY_TYPE.FORUM,
  4: CATEGORY_TYPE.OTHER
};

export const OBSERVATION_TAG_CATEGORIES = ['ConformerSites', 'CrystalformSites', 'Quatassemblies', 'Crystalforms'];
export const COMPOUND_PRIO_TAG_CATEGORIES = ['CanonSites'];

export const TAG_TYPE = {
  ALL: 'ALL',
  UNTAGGED: 'UNTAGGED'
};
