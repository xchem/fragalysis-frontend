import { constants } from './constants';

export const loadingCompoundImage = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="25px" height="25px"><g>
  <circle cx="50" cy="50" fill="none" stroke="#3f51b5" stroke-width="4" r="26" stroke-dasharray="150.79644737231007 52.26548245743669" transform="rotate(238.988 50 50)">
    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.689655172413793s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
  </circle>  '</svg>`;

export const INITIAL_STATE = {
  currentPage: -1,
  compoundsPerPage: 28,
  /* currentCompounds: [{
      smiles:"Cc1cc(CN(C)C(C)C(N)=O)no1",
      show_frag:"Cc1cc(CN(C)C(C)C(N)=O)no1",
      vector:"CC1CCC([101Xe])C1",
      mol:"CCNC(=O)Nc1cc(C)on1",
      index:0,
      selectedClass: undefined,
      image: loadingCompoundImage
   }] */
  currentCompounds: []
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

    default:
      return state;
  }
};
