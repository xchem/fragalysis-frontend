import { constants, layoutItemNames } from './constants';

const initialLayout = {};

export const INITIAL_STATE = {
  layoutEnabled: false, // Used to display the three control buttons in the header
  layoutLocked: true, // Enables custom positioning and resizing
  /**
   * Used for changing currentLayout and defaultLayout through useEffect in Preview. The reason the fields are updated
   * via a useEffect is that we need to know the amount of space in pixels we have available to calculate the amount
   * of rows we can use in React Grid Layout.
   */
  selectedLayoutName: 'Default',
  currentLayout: initialLayout,
  defaultLayout: initialLayout, // Used for restoring to default selected layout
  panelsExpanded: {
    // Whether or not the panels are collapsed, needed for space calculations
    [layoutItemNames.TAG_DETAILS]: true,
    [layoutItemNames.HIT_LIST_FILTER]: true,
    [layoutItemNames.PROJECT_HISTORY]: true
  }
};

export const layoutReducers = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.ENABLE_LAYOUT: {
      const layoutEnabled = action.payload;

      return { ...state, layoutEnabled };
    }
    case constants.SET_SELECTED_LAYOUT_NAME: {
      const selectedLayoutName = action.payload;

      return { ...state, selectedLayoutName };
    }
    case constants.SET_CURRENT_LAYOUT: {
      return { ...state, currentLayout: action.payload };
    }
    case constants.SET_DEFAULT_LAYOUT: {
      return { ...state, defaultLayout: action.payload };
    }
    case constants.RESET_CURRENT_LAYOUT: {
      return { ...state, currentLayout: state.defaultLayout };
    }
    case constants.LOCK_LAYOUT: {
      const locked = action.payload;
      const { currentLayout, defaultLayout } = state;

      return {
        ...state,
        layoutLocked: locked,
        currentLayout: Object.fromEntries(
          Object.entries(currentLayout).map(([key, layout]) => [key, layout.map(item => ({ ...item, static: locked }))])
        ),
        defaultLayout: Object.fromEntries(
          Object.entries(defaultLayout).map(([key, layout]) => [key, layout.map(item => ({ ...item, static: locked }))])
        )
      };
    }
    case constants.SET_PANEL_EXPANDED: {
      const { type, expanded } = action.payload;
      const { panelsExpanded } = state;

      return { ...state, panelsExpanded: { ...panelsExpanded, [type]: expanded } };
    }
    default:
      return state;
  }
};
