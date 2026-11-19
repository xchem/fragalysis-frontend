import React, { Profiler } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, legacy_createStore } from 'redux';
import { thunk } from 'redux-thunk';
import TagDetailRow from './tagDetailRow';
import { ThemeProvider } from '../../../../ui/styles';
import { getTheme } from '../../../../theme';
import { selectionReducers } from '../../../../reducers/selection/selectionReducers';

jest.mock('../../../../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));
jest.mock('../../../tooltip/RichTooltip', () => ({ children }) => children);
jest.mock('../tagView', () => () => null);
jest.mock('../../molecule/redux/dispatchActions', () => ({ getCategoryById: () => () => ({ category: 'Other' }) }));

describe('tag row startup', () => {
  it('defers full observation membership work until selecting hits, using current target data', () => {
    expect.hasAssertions();
    let reads = 0;
    const observations = Array.from({ length: 930 }, (_, id) => ({
      id,
      get tags_set() {
        reads++;
        return id % 2 === 0 ? [7] : [8];
      }
    }));
    const store = legacy_createStore(
      combineReducers({
        selectionReducers,
        apiReducers: (state = { all_mol_lists: observations, tagList: [] }, action) =>
          action.type === 'test/replace' ? { ...state, all_mol_lists: action.observations } : state
      }),
      applyMiddleware(thunk)
    );
    const commits = jest.fn();
    const tag = { id: 7 };
    const renderRow = (ids = [], molecules = []) => (
      <Provider store={store}>
        <ThemeProvider theme={getTheme()}>
          <Profiler id="tag" onRender={commits}>
            <TagDetailRow tag={tag} moleculesToEditIds={ids} moleculesToEdit={molecules} side="lhs" />
          </Profiler>
        </ThemeProvider>
      </Provider>
    );
    const { rerender } = render(renderRow());
    expect(reads).toBe(0);
    expect(commits).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Select hits' }));
    expect(store.getState().selectionReducers.moleculesToEdit).toStrictEqual(
      observations.filter((_, id) => id % 2 === 0).map(observation => observation.id)
    );
    expect(reads).toBe(observations.length);
    act(() => store.dispatch({ type: 'test/replace', observations: [{ id: 1000, tags_set: [7] }] }));
    const selectedIds = store.getState().selectionReducers.moleculesToEdit;
    rerender(renderRow(selectedIds, [{ id: 0, tags_set: [7] }]));
    fireEvent.click(screen.getByRole('button', { name: 'Unselect hits' }));
    expect(store.getState().selectionReducers.moleculesToEdit).toStrictEqual(selectedIds);
    rerender(renderRow(selectedIds));
    fireEvent.click(screen.getByRole('button', { name: 'Select hits' }));
    expect(store.getState().selectionReducers.moleculesToEdit).toContain(1000);
  });
});
