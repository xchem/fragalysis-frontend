import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { useFilters } from './useFilters';
import { buildObservationViewConfig, LHS_OBSERVATION_VIEW_CONFIG } from '../viewConfigs';

jest.mock('@loschmidt/jsme-react', () => ({ Jsme: () => null }));

describe('displayed-observation filtering cost', () => {
  it('skips the displayed-hit override when off and checks once per pose when on', () => {
    expect.hasAssertions();
    const matches = jest.fn(() => false);
    const config = {
      matchesDisplayedObservations: matches,
      getShowDisplayedMolecules: state => state.show,
      getDisplayedObservationIds: () => []
    };
    const items = Array.from({ length: 930 }, (_, id) => ({ id }));
    const columns = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
    const store = legacy_createStore((state = { apiReducers: { quality_statuses: [] }, show: false }, action) =>
      action.type === 'SHOW' ? { ...state, show: true } : state
    );
    const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
    const { result } = renderHook(() => useFilters(items, columns, config), { wrapper });
    expect(result.current.filteredItems).toStrictEqual(items);
    expect(matches).not.toHaveBeenCalled();
    act(() => store.dispatch({ type: 'SHOW' }));
    expect(matches).toHaveBeenCalledTimes(930);
    expect(result.current.filteredItems).toStrictEqual(items);
  });

  it('indexes 930 displayed IDs once across all poses while retaining strict membership and missing-ID rules', () => {
    expect.hasAssertions();
    let reads = 0;
    const ids = Array.from({ length: 930 }, (_, id) => id);
    ids.forEach((id, index) =>
      Object.defineProperty(ids, index, {
        get: () => {
          reads++;
          return id;
        }
      })
    );
    const config = buildObservationViewConfig(LHS_OBSERVATION_VIEW_CONFIG);
    for (let id = 0; id < 930; id++)
      expect(config.matchesDisplayedObservations({ associatedObs: [{ id }] }, ids)).toBe(true);
    expect(reads).toBe(930);
    expect(config.matchesDisplayedObservations({ associatedObs: [{ id: '1' }] }, ids)).toBe(false);
    expect(config.matchesDisplayedObservations({ associatedObs: [{ id: null }] }, [null])).toBe(false);
  });
});
