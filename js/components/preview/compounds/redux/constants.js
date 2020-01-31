export const constants = {
  SET_CURRENT_COMPOUNDS: 'PREVIEW_COMPOUNDS_SET_CURRENT_COMPOUNDS',
  SET_CURRENT_PAGE: 'PREVIEW_COMPOUNDS_SET_CURRENT_PAGE',
  RESET_CURRENT_COMPOUNDS_SETTINGS: 'PREVIEW_COMPOUNDS_RESET_CURRENT_COMPOUNDS_SETTINGS',
  UPDATE_COMPOUND: 'PREVIEW_COMPOUNDS_UPDATE_COMPOUND',
  SET_COMPOUND_CLASSES: 'PREVIEW_COMPOUNDS_SET_COMPOUND_CLASSES',
  SET_HIGHLIGHTED_COMPOUND_ID: 'PREVIEW_COMPOUNDS_SET_HIGHLIGHTED_COMPOUND_ID'
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
