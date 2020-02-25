import { compoundsColors, constants } from './constants';

export const INITIAL_STATE = {
  currentPage: -1,
  compoundsPerPage: 20,
  /* currentCompounds: [{
      smiles:"Cc1cc(CN(C)C(C)C(N)=O)no1",
      show_frag:"Cc1cc(CN(C)C(C)C(N)=O)no1",
      vector:"CC1CCC([101Xe])C1",
      mol:"CCNC(=O)Nc1cc(C)on1",
      index:0,
      selectedClass: undefined,
      isShowed: false
   }] */
  currentCompounds: [],
  currentCompoundClass: compoundsColors.blue.key,
  compoundClasses: {
    [compoundsColors.blue.key]: undefined,
    [compoundsColors.red.key]: undefined,
    [compoundsColors.green.key]: undefined,
    [compoundsColors.purple.key]: undefined,
    [compoundsColors.apricot.key]: undefined
  },
  highlightedCompoundId: undefined,
  // configuration: {
  //  [id]: undefined
  // }
  configuration: {}
};

export const compounds = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.SET_CURRENT_COMPOUNDS:
      return Object.assign({}, state, { currentCompounds: action.payload });

    case constants.SET_CURRENT_PAGE:
      return Object.assign({}, state, { currentPage: action.payload });

    case constants.UPDATE_COMPOUND:
      const currentCmpds = JSON.parse(JSON.stringify(state.currentCompounds));
      if (currentCmpds[action.payload.id] && action.payload.id && action.payload.key) {
        currentCmpds[action.payload.id][action.payload.key] = action.payload.value;
      }
      return Object.assign({}, state, { currentCompounds: currentCmpds });

    case constants.RESET_CURRENT_COMPOUNDS_SETTINGS:
      return Object.assign({}, INITIAL_STATE);

    case constants.SET_COMPOUND_CLASSES:
      return Object.assign({}, state, {
        compoundClasses: action.compoundClasses,
        currentCompoundClass: action.currentCompoundClass
      });

    case constants.SET_HIGHLIGHTED_COMPOUND_ID:
      return Object.assign({}, state, { highlightedCompoundId: action.payload });

    case constants.SET_CONFIGURATION:
      const currentConfiguration = JSON.parse(JSON.stringify(state.configuration));
      currentConfiguration[action.payload.id] = action.payload.data;
      return Object.assign({}, state, { configuration: currentConfiguration });

    default:
      return state;
  }
};
