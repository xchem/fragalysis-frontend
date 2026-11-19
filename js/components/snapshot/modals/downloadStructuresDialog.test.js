import fs from 'fs';
import path from 'path';
import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { ThemeProvider } from '../../../ui/styles';
import { getTheme } from '../../../theme';
import { NglContext } from '../../nglView/nglProvider';
import { ToastContext } from '../../toast';
import { DownloadStructureDialog } from './downloadStructuresDialog';

jest.mock('../redux/dispatchActions', () => ({ saveAndShareSnapshot: jest.fn() }));
jest.mock('../../../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));
jest.mock('../../preview/molecule/redux/selectors', () => ({
  selectJoinedMoleculeList: state => state.apiReducers.all_mol_lists
}));

const createState = () => ({
  snapshotReducers: { downloadStructuresDialogOpen: true },
  apiReducers: {
    target_on: 1,
    target_id_list: [{ id: 1, display_name: 'Test target' }],
    all_mol_lists: [],
    downloadTags: []
  },
  selectionReducers: { fragmentDisplayList: [], moleculesToEdit: [] },
  projectReducers: { currentSnapshot: { id: 1, data: '[]' } },
  targetReducers: { currentProject: { id: 1 } }
});

describe('download structures dialog', () => {
  it('keeps its theme text readable under Moorhen dark CSS and renders valid headings across snapshot switches', () => {
    expect.hasAssertions();
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    const nativeStyles = document.createElement('style');
    const nativeCss = fs.readFileSync(
      path.join(path.dirname(require.resolve('moorhen')), 'public/baby-gru/darkly.css'),
      'utf8'
    );
    // JSDOM cannot parse the complete Bootstrap stylesheet. Reproduce its
    // global body color using the value from the installed Moorhen asset.
    nativeStyles.textContent = `body { color: ${nativeCss.match(/--bs-body-color:([^;}]+)/)[1]}; }`;
    const store = legacy_createStore((state = createState(), action) =>
      action.type === 'test/switch-snapshot'
        ? { ...state, projectReducers: { currentSnapshot: { id: action.payload, data: '[]' } } }
        : state
    );
    let view;
    try {
      view = render(
        <Provider store={store}>
          <ThemeProvider theme={getTheme()}>
            <NglContext.Provider value={{ nglViewList: [] }}>
              <ToastContext.Provider value={{}}>
                <DownloadStructureDialog />
              </ToastContext.Provider>
            </NglContext.Provider>
          </ThemeProvider>
        </Provider>
      );
      // Moorhen appends this global stylesheet after the application theme.
      document.head.appendChild(nativeStyles);
      expect(getComputedStyle(document.body).color).toBe('rgb(255, 255, 255)');
      const title = screen.getByRole('heading', { name: 'Download structures and data for target Test target' });
      const paper = title.closest('[tabindex="-1"]');
      expect(getComputedStyle(paper).backgroundColor).toBe('rgb(255, 255, 255)');
      expect(getComputedStyle(paper).color).toBe('rgb(38, 50, 56)');
      expect(title.parentElement.tagName).toBe('DIV');
      expect(screen.getByRole('radio', { name: 'All structures' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Real-space map files (VERY BIG!!) (.map)' })).toBeDisabled();

      act(() => {
        store.dispatch({ type: 'test/switch-snapshot', payload: 2 });
      });
      act(() => {
        store.dispatch({ type: 'test/switch-snapshot', payload: 1 });
      });
      expect(screen.getByRole('heading', { name: 'Download structures and data for target Test target' })).toBe(title);
      expect(errors).not.toHaveBeenCalled();
    } finally {
      view?.unmount();
      nativeStyles.remove();
      errors.mockRestore();
    }
  });
});
