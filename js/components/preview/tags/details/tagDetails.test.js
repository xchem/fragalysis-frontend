import React, { memo } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import TagDetails from './tagDetails';
import { ThemeProvider } from '../../../../ui/styles';
import { getTheme } from '../../../../theme';
import { LoadingContext } from '../../../loading';

jest.mock('../../../../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));
jest.mock('../../../tooltip/RichTooltip', () => ({ children }) => children);
jest.mock('../modal/editTagsModal', () => ({ EditTagsModal: () => null }));
jest.mock('../redux/dispatchActions', () => ({}));
jest.mock('./tagDetailRow', () => () => null);
jest.mock('./tagGridRows', () => () => null);

describe('tag details initialization', () => {
  it('keeps tag row selection props stable during search and refreshes them for new observations', () => {
    expect.hasAssertions();
    const tag = { id: 7, tag: 'Site 1', category: 8 };
    const tags = [tag];
    const first = { id: 1, tags_set: [7] };
    const second = { id: 2, tags_set: [7] };
    const store = legacy_createStore(
      (
        state = {
          apiReducers: { tagList: tags, categoryList: [], all_mol_lists: [first, second] },
          selectionReducers: { selectedTagList: [], moleculesToEdit: [2, 1, 2, 99] }
        },
        action
      ) =>
        action.type === 'test/replace'
          ? { ...state, apiReducers: { ...state.apiReducers, all_mol_lists: action.observations } }
          : state
    );
    const rowRender = jest.fn();
    const Row = memo(props => {
      rowRender(props);
      return <div>Tag row</div>;
    });
    render(
      <Provider store={store}>
        <ThemeProvider theme={getTheme()}>
          <LoadingContext.Provider value={{ moleculesAndTagsAreLoading: false }}>
            <TagDetails preTagList={tags} TagDetailRowComponent={Row} tagDetailView={false} />
          </LoadingContext.Provider>
        </ThemeProvider>
      </Provider>
    );
    const original = rowRender.mock.calls[rowRender.mock.calls.length - 1][0].moleculesToEdit;
    expect(original).toStrictEqual([second, first, second, undefined]);
    const modeSwitch = screen.getAllByRole('switch')[0];
    rowRender.mockClear();
    fireEvent.change(screen.getByPlaceholderText('Search tags'), { target: { value: 'Site' } });
    expect(rowRender).not.toHaveBeenCalled();
    expect(screen.getAllByRole('switch')[0]).toBe(modeSwitch);
    const replacement = { ...second, code: 'updated' };
    modeSwitch.focus();
    act(() => store.dispatch({ type: 'test/replace', observations: [first, replacement] }));
    const updated = rowRender.mock.calls[rowRender.mock.calls.length - 1][0].moleculesToEdit;
    expect(updated).toStrictEqual([replacement, first, replacement, undefined]);
    expect(updated[0]).toBe(replacement);
    expect(updated).not.toBe(original);
    expect(screen.getAllByRole('switch')[0]).toBe(modeSwitch);
    expect(document.activeElement).toBe(modeSwitch);
  });
});
