import { setEntireState } from './actions';
import { rootReducer } from './rootReducer';
import { DEFAULT_RHS_POSE_NAVIGATION_CONFIG } from '../constants/poseNavigation';

jest.mock('../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));

describe('rootReducer snapshot state replacement', () => {
  it('adds navigation defaults when a legacy full snapshot has no configuration', () => {
    expect.hasAssertions();
    const legacyState = {
      selectionReducers: {
        fragmentDisplayList: [1]
      },
      apiReducers: {}
    };

    const restoredState = rootReducer(undefined, setEntireState(legacyState));

    expect(restoredState.selectionReducers.fragmentDisplayList).toStrictEqual([1]);
    expect(restoredState.selectionReducers.rhsPoseNavigationConfig).toStrictEqual(
      DEFAULT_RHS_POSE_NAVIGATION_CONFIG
    );
  });
});
