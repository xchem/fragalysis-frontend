import React, { memo, useContext } from 'react';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { LoadingProvider } from './LoadingProvider';
import { LoadingContext } from './LoadingContext';

describe('shared loading context', () => {
  it('updates bulk progress without redrawing consumers of unchanged loading flags', () => {
    expect.hasAssertions();
    const rendered = jest.fn();
    let context;
    const Consumer = memo(() => {
      context = useContext(LoadingContext);
      rendered();
      return null;
    });
    const store = legacy_createStore(
      (
        state = {
          nglReducers: { isSnapshotRendering: false },
          selectionReducers: { toBeDisplayedList: [{ rendered: false }] },
          datasetsReducers: { toBeDisplayedList: {} }
        },
        action
      ) =>
        action.type === 'ACK'
          ? {
              ...state,
              selectionReducers: { toBeDisplayedList: [{ rendered: action.done }] }
            }
          : state
    );
    render(
      <Provider store={store}>
        <LoadingProvider>
          <Consumer />
        </LoadingProvider>
      </Provider>
    );
    const original = context;
    rendered.mockClear();
    for (let i = 0; i < 930; i++) act(() => store.dispatch({ type: 'ACK', done: i === 929 }));
    expect(rendered).not.toHaveBeenCalled();
    expect(context).toBe(original);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    act(() => context.setIsLoading(true));
    expect(context.isLoading).toBe(true);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
