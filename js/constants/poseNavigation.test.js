import { DEFAULT_RHS_POSE_NAVIGATION_CONFIG, normalizeRhsPoseNavigationConfig } from './poseNavigation';
import { selectionReducers } from '../reducers/selection/selectionReducers';
import { setRhsPoseNavigationConfig, setObservationsForLHSCmp } from '../reducers/selection/actions';
import { rootReducer } from '../reducers/rootReducer';
import { setEntireState } from '../reducers/actions';

jest.mock('../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));

describe('pose navigation compatibility', () => {
  it.each([undefined, {}, { transferOrder: 'invalid', transferScheduling: null, postTransferCenteringMode: 'invalid' }])(
    'normalizes absent or invalid settings: %s',
    value => {
      expect(normalizeRhsPoseNavigationConfig(value)).toStrictEqual(DEFAULT_RHS_POSE_NAVIGATION_CONFIG);
    }
  );

  it.each([[true, 'design-ligand'], [false, 'none']])('migrates legacy centering %s', (value, expected) => {
    expect(normalizeRhsPoseNavigationConfig({ centerOnDestinationLigandAfterTransfer: value }).postTransferCenteringMode)
      .toBe(expected);
  });

  it('updates settings incrementally and normalizes full legacy state hydration', () => {
    const initial = selectionReducers(undefined, {});
    const first = selectionReducers(initial, setRhsPoseNavigationConfig({ transferOrder: 'add-first' }));
    const second = selectionReducers(first, setRhsPoseNavigationConfig({ transferScheduling: 'phased' }));
    expect(second.rhsPoseNavigationConfig).toStrictEqual({
      transferOrder: 'add-first', transferScheduling: 'phased', postTransferCenteringMode: 'visible-ligand-centroid'
    });
    const legacy = { selectionReducers: { fragmentDisplayList: [7] } };
    const restored = rootReducer(undefined, setEntireState(legacy));
    expect(restored.selectionReducers.rhsPoseNavigationConfig).toStrictEqual(DEFAULT_RHS_POSE_NAVIGATION_CONFIG);
    expect(restored.selectionReducers.fragmentDisplayList).toStrictEqual([7]);
    expect(legacy.selectionReducers).not.toHaveProperty('rhsPoseNavigationConfig');
  });

  it('avoids observation dialog feedback for identical references but accepts changed observations', () => {
    const observation = { id: 7 };
    const state = selectionReducers(undefined, setObservationsForLHSCmp([observation]));
    expect(selectionReducers(state, setObservationsForLHSCmp([observation]))).toBe(state);
    const changed = { id: 7, code: 'updated' };
    expect(selectionReducers(state, setObservationsForLHSCmp([changed])).observationsForLHSCmp).toStrictEqual([changed]);
  });
});
