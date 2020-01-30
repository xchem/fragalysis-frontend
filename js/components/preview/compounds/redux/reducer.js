import { constants } from './constants';

export const loadingCompoundImage =
  '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100px" height="100px"><g>' +
  '<circle cx="50" cy="0" r="5" transform="translate(5 5)"/>' +
  '<circle cx="75" cy="6.6987298" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="93.3012702" cy="25" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="100" cy="50" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="93.3012702" cy="75" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="75" cy="93.3012702" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="50" cy="100" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="25" cy="93.3012702" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="6.6987298" cy="75" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="0" cy="50" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="6.6987298" cy="25" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="25" cy="6.6987298" r="5" transform="translate(5 5)"/> ' +
  '<animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 55 55" to="360 55 55" dur="3s" repeatCount="indefinite" /> </g> ' +
  '</svg>';

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
      currentCmpds[action.payload.id][action.payload.key] = action.payload.value;

      return Object.assign({}, state, { currentCompounds: currentCmpds });

    case constants.RESET_CURRENT_COMPOUNDS_SETTINGS:
      return Object.assign({}, INITIAL_STATE);

    default:
      return state;
  }
};
