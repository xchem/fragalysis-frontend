import { constants } from './constants';

const loadingCompoundImage =
  '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="150px" height="150px"><g>' +
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

export const noCompoundImage = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="150px" height="150px"/>';

export const INITIAL_STATE = {
  oldUrl: '',
  compoundImage: noCompoundImage,
  width: 150,
  height: 150,

  // summary view
  countOfPicked: 0,
  countOfExploredVectors: 0,
  countOfExploredSeries: 0,
  estimatedCost: 0,
  selectedInteraction: undefined
};

export const summary = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.SET_OLD_URL:
      return Object.assign({}, state, { oldUrl: action.payload });

    case constants.SET_COMPOUND_IMAGE:
      return Object.assign({}, state, { compoundImage: action.payload });
    case constants.RESET_COMPOUND_IMAGE:
      return Object.assign({}, state, { compoundImage: noCompoundImage });
    case constants.SET_IS_LOADING_COMPOUND_IMAGE:
      return Object.assign({}, state, { compoundImage: loadingCompoundImage });

    // summary view
    case constants.SET_COUNT_OF_PICKED:
      return Object.assign({}, state, { countOfPicked: action.payload });
    case constants.SET_COUNT_OF_EXPLORED_VECTORS:
      return Object.assign({}, state, { countOfExploredVectors: action.payload });
    case constants.SET_COUNT_OF_EXPLORED_SERIES:
      return Object.assign({}, state, { countOfExploredSeries: action.payload });
    case constants.SET_ESTIMATED_COST:
      return Object.assign({}, state, { estimatedCost: action.payload });
    case constants.SET_SELECTED_INTERACTION:
      return Object.assign({}, state, { selectedInteraction: action.payload });

    case constants.RELOAD_REDUCER:
      return Object.assign({}, state, { ...action.payload });

    default:
      return state;
  }
};
