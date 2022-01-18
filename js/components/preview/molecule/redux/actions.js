import { constants } from './constants';

export const setSortDialogOpen = isOpen => ({
  type: constants.SET_SORT_DIALOG_OPEN,
  payload: isOpen
});

export const reloadMoleculeReducer = newState => ({
  type: constants.SET_SORT_DIALOG_OPEN,
  payload: newState
});

export const addImageToCache = (molId, image) => ({
  type: constants.ADD_IMAGE_TO_CACHE,
  payload: { molId: molId, image: image }
});

export const addProteindDataToCache = (molId, proteinData) => ({
  type: constants.ADD_PROTEIN_DATA_TO_CACHE,
  payload: { molId: molId, proteinData: proteinData }
});

export const disableMoleculeNglControlButton = (moleculeId, type) => ({
  type: constants.DISABLE_NGL_CONTROL_BUTTON,
  payload: { moleculeId, type }
});

export const enableMoleculeNglControlButton = (moleculeId, type) => ({
  type: constants.ENABLE_NGL_CONTROL_BUTTON,
  payload: { moleculeId, type }
});
