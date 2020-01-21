import { constants } from './constatnts';

export const setOldUrl = url => ({ type: constants.OLD_URL, payload: url });
