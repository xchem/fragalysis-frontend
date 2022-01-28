import { constants } from './constants';

export const INITIAL_STATE = {
  sidesOpen: {
    LHS: true,
    RHS: false
  }
};

export const viewerControls = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.TURN_SIDE: {
      const { side, open } = action.payload;

      return {
        ...state,
        sidesOpen: {
          ...state.sidesOpen,
          [side]: open
        }
      };
    }

    case constants.RESET_VIEWER_CONTROLS_STATE: {
      return INITIAL_STATE;
    }

    default: {
      return state;
    }
  }
};
