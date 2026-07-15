import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { combineReducers, legacy_createStore } from 'redux';
import { selectionReducers } from '../../../../../../reducers/selection/selectionReducers';
import { setUnifiedFilterItem } from '../../../../../../reducers/selection/actions';
import { ObservationFilter } from './observationFilter';

describe('ObservationFilter', () => {
  it('ignores identity churn in unrelated unified filters', async () => {
    const store = legacy_createStore(combineReducers({ selectionReducers }));
    const getObservationFilterKey = jest.fn(() => 'detail');
    const viewConfig = { getObservationFilterKey };

    render(
      <Provider store={store}>
        <ObservationFilter
          viewConfig={viewConfig}
          onFilterChange={jest.fn()}
          onSortingChange={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => expect(store.getState().selectionReducers.unifiedFilter.detail).toBeDefined());
    const renderCountAfterInitialization = getObservationFilterKey.mock.calls.length;

    act(() => {
      store.dispatch(setUnifiedFilterItem('unrelated', { value: 'first' }));
      store.dispatch(setUnifiedFilterItem('unrelated', { value: 'second' }));
    });

    expect(getObservationFilterKey).toHaveBeenCalledTimes(renderCountAfterInitialization);
  });
});
