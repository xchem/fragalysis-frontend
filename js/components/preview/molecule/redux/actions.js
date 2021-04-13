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
  payload: { molId: molId, image: proteinData }
});
