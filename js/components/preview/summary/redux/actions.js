import { constants } from './constants';

export const setOldUrl = url => ({ type: constants.SET_URL, payload: url });

export const setCompoundImage = image => ({ type: constants.SET_COMPOUND_IMAGE, payload: image });

export const resetCompoundImage = () => ({ type: constants.RESET_COMPOUND_IMAGE });

export const setIsLoadingCompoundImage = () => ({ type: constants.SET_IS_LOADING_COMPOUND_IMAGE });
