import { constants } from './constants';

export const setOldUrl = url => ({ type: constants.SET_URL, payload: url });

export const setCompoundImage = image => ({ type: constants.SET_COMPOUND_IMAGE, payload: image });

export const resetCompoundImage = () => ({ type: constants.RESET_COMPOUND_IMAGE });

export const setIsLoadingCompoundImage = () => ({ type: constants.SET_IS_LOADING_COMPOUND_IMAGE });

// summary view
export const setCountOfPicked = count => ({ type: constants.SET_COUNT_OF_PICKED, payload: count });
export const setCountOfExploredVectors = count => ({ type: constants.SET_COUNT_OF_EXPLORED_VECTORS, payload: count });
export const setCountOfExploredSeries = count => ({ type: constants.SET_COUNT_OF_EXPLORED_SERIES, payload: count });
export const setEstimatedCost = count => ({ type: constants.SET_ESTIMATED_COST, payload: count });
export const setSelectedInteraction = count => ({ type: constants.SET_SELECTED_INTERACTION, payload: count });
