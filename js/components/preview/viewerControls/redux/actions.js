import { constants } from './constants';

export const turnSide = (side, open, skipTracking = false) => ({
  type: constants.TURN_SIDE,
  payload: { side, open },
  skipTracking
});

export const resetViewerControlsState = () => ({ type: constants.RESET_VIEWER_CONTROLS_STATE });
