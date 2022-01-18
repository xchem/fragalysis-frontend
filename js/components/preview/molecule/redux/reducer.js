import { constants } from './constants';

export const INITIAL_STATE = {
  sortDialogOpen: false,
  imageCache: {},
  proteinDataCache: {},

  // disables NGL control buttons for molecules
  disableNglControlButtons: {} // moleculeID.nglButtonDisableState
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

    case constants.DISABLE_NGL_CONTROL_BUTTON: {
      const { moleculeId, type } = action.payload;
      const disableNglControlButtons = { ...state.disableNglControlButtons };

      const moleculeNglControlButtons = { ...(disableNglControlButtons[moleculeId] || {}) };

      moleculeNglControlButtons[type] = true;
      disableNglControlButtons[moleculeId] = moleculeNglControlButtons;

      return {
        ...state,
        disableNglControlButtons
      };
    }

    case constants.ENABLE_NGL_CONTROL_BUTTON: {
      const { moleculeId, type } = action.payload;
      const disableNglControlButtons = { ...state.disableNglControlButtons };

      const moleculeNglControlButtons = { ...(disableNglControlButtons[moleculeId] || {}) };

      moleculeNglControlButtons[type] = false;
      disableNglControlButtons[moleculeId] = moleculeNglControlButtons;

      return {
        ...state,
        disableNglControlButtons
      };
    }

    default:
      return state;
  }
};
