import { constants } from './constants';

export const INITIAL_STATE = {
  sortDialogOpen: false,
  imageCache: {},
  proteinDataCache: {}
};

export const molecule = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.SET_SORT_DIALOG_OPEN:
      return Object.assign({}, state, {
        sortDialogOpen: action.payload
      });

    case constants.RELOAD_REDUCER:
      return Object.assign({}, state, { ...action.payload });

    case constants.ADD_IMAGE_TO_CACHE:
      return {
        ...state,
        imageCache: {
          ...state.imageCache,
          [action.payload.molId]: action.payload.image
        }
      };

    case constants.ADD_PROTEIN_DATA_TO_CACHE:
      return {
        ...state,
        proteinDataCache: {
          ...state.proteinDataCache,
          [action.payload.molId]: action.payload.proteinData
        }
      };

    default:
      return state;
  }
};
