import { constants } from './constants';

export const setSaveType = saveType => ({ type: constants.SET_SAVE_TYPE, payload: saveType });

export const setNextUUID = uuid => ({ type: constants.SET_NEXT_UUID, payload: uuid });

export const setNewSessionFlag = flag => ({ type: constants.SET_NEW_SESSION_FLAG, payload: flag });

export const setLoadedSession = loadedSession => ({ type: constants.SET_LOADED_SESSION, payload: loadedSession });
