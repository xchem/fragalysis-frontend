import { constants } from './constatnts';

export const setOldUrl = url => ({ type: constants.SET_OLD_URL, payload: url });

export const setIsTargetLoading = isLoading => ({ type: constants.SET_TARGET_IS_LOADING, payload: isLoading });

export const setTargetDiscourseLinks = links => ({
  type: constants.SET_TARGET_DISCOURSE_LINKS,
  payload: links
});

export const setCurrentTargetLink = link => ({ type: constants.SET_CURRENT_TARGET_LINK, payload: link });
