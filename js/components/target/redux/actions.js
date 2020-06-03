import { constants } from './constatnts';

export const setOldUrl = url => ({ type: constants.SET_OLD_URL, payload: url });

export const setIsTargetLoading = isLoading => ({ type: constants.SET_TARGET_IS_LOADING, payload: isLoading });
