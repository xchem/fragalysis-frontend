import React, { useEffect, useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, legacy_createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { Router, Route, Switch } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { ThemeProvider } from '../../ui/styles';
import { getTheme } from '../../theme';
import { api } from '../../utils/api';
import apiReducers from '../../reducers/api/apiReducers';
import { replaceTarget, setTargetIdList } from '../../reducers/api/actions';
import { LoadingContext } from '../loading/LoadingContext';
import { TargetSettingsModal } from './targetSettingsModal';
import { withUpdatingTarget } from './withUpdatingTarget';

jest.mock('../../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));
jest.mock('../../utils/api', () => ({
  api: jest.fn(),
  getCsrfToken: () => 'csrf',
  METHOD: { GET: 'GET', PATCH: 'PATCH', POST: 'POST' }
}));
jest.mock('./handleUnrecognisedTarget', () => ({ HandleUnrecognisedTarget: () => <div>Target not resolved</div> }));

const targets = [1, 2].map(id => ({
  id,
  title: `target-${id}`,
  display_name: `Target ${id}`,
  short_name: '',
  long_name: '',
  organism: '',
  external_url: '',
  external_url_display_name: '',
  alias_order: [],
  project: { id: 10, alias: 'Project alias', target_access_string: 'project-access' },
  settings: {}
}));
const targetUrl = id => `/target/target-${id}/tas/project-access`;
const targetReads = () => api.mock.calls.map(([request]) => request).filter(request => request.url.includes('/targets/?'));

const setup = ({ list = targets, initialTargetId, route = targetUrl(1), readTarget } = {}) => {
  api.mockReset();
  const mounted = jest.fn();
  const disposed = jest.fn();
  const settingsClosed = jest.fn();
  const state = {
    apiReducers: {
      ...apiReducers(undefined, {}),
      target_id_list: list,
      target_on: initialTargetId,
      lhsDataIsLoaded: true,
      rhsDataIsLoaded: true,
      all_mol_lists: [{ id: 5 }]
    },
    projectReducers: { currentProject: { projectID: null } },
    targetReducers: { currentProject: null },
    selectionReducers: { toBeDisplayedList: [{ id: 5, display: true, rendered: true }] },
    nglReducers: { objectsInView: { ligand: { id: 5 } } }
  };
  const store = legacy_createStore(
    (current = state, action) => ({ ...current, apiReducers: apiReducers(current.apiReducers, action) }),
    applyMiddleware(thunk)
  );
  api.mockImplementation(request => {
    if (request.url.includes('/targets/?')) {
      if (readTarget) return readTarget(request);
      return Promise.resolve({ data: { results: [{ id: Number(request.url.split('id=')[1]) }] } });
    }
    if (request.url.includes('/session-projects/')) {
      return Promise.resolve({
        data: { id: 10, target: { id: 1 }, project: { id: 10 }, tags: '[]', title: 'Session' }
      });
    }
    if (!request.method || request.method === 'GET') return Promise.resolve({ data: { results: [] } });
    return Promise.resolve({ data: request.data });
  });
  const Preview = () => {
    useEffect(() => {
      mounted();
      return disposed;
    }, []);
    return <canvas data-testid="live-preview" />;
  };
  const RoutedPreview = withUpdatingTarget(Preview);
  const Settings = () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Open settings</button>
        <TargetSettingsModal
          openModal={open}
          onModalClose={() => {
            settingsClosed();
            setOpen(false);
          }}
        />
      </>
    );
  };
  const Loading = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    return (
      <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
        {children}
        {isLoading && <div role="status">Loading target route</div>}
      </LoadingContext.Provider>
    );
  };
  const history = createMemoryHistory({ initialEntries: [route] });
  const view = render(
    <Provider store={store}>
      <ThemeProvider theme={getTheme()}>
        <Loading>
          <Settings />
          <Router history={history}>
            <Switch>
              <Route path="/projects/:projectId/:snapshotId?">
                <RoutedPreview />
              </Route>
              <Route path="/target/*">
                <RoutedPreview />
              </Route>
            </Switch>
          </Router>
        </Loading>
      </ThemeProvider>
    </Provider>
  );
  return { ...view, store, history, mounted, disposed, settingsClosed };
};

describe('target route loading', () => {
  it('preserves the live preview and fetched data when non-blog target settings are saved', async () => {
    expect.hasAssertions();
    const view = setup();
    const preview = await screen.findByTestId('live-preview');
    const previousState = view.store.getState();
    const disposals = view.disposed.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Open settings' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByPlaceholderText('enter display name'), { target: { value: 'Edited target' } });
    fireEvent.change(screen.getByPlaceholderText('enter measured compounds'), { target: { value: '42' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(view.settingsClosed).toHaveBeenCalledTimes(1));
    expect(targetReads()).toHaveLength(1);
    expect(screen.getByTestId('live-preview')).toBe(preview);
    expect(view.disposed).toHaveBeenCalledTimes(disposals);
    const currentState = view.store.getState();
    expect(currentState.apiReducers.target_on_name).toBe('Edited target');
    expect(currentState.apiReducers.target_id_list.find(target => target.id === 1).settings.measured_compounds).toBe('42');
    expect(currentState.apiReducers.all_mol_lists).toBe(previousState.apiReducers.all_mol_lists);
    expect(currentState.selectionReducers.toBeDisplayedList).toBe(previousState.selectionReducers.toBeDisplayedList);
    expect(currentState.nglReducers.objectsInView).toBe(previousState.nglReducers.objectsInView);
  });

  it('does not restart an initial request when metadata changes while it is pending', async () => {
    expect.hasAssertions();
    let finish;
    const view = setup({
      readTarget: () =>
        new Promise(resolve => {
          finish = resolve;
        })
    });
    expect(screen.getByRole('status')).toHaveTextContent('Loading target route');
    await act(async () => view.store.dispatch(replaceTarget({ ...targets[0], display_name: 'Fresh metadata' })));
    expect(targetReads()).toHaveLength(1);
    await act(async () => finish({ data: { results: [{ id: 1 }] } }));
    expect(screen.getByTestId('live-preview')).toBeInTheDocument();
    expect(view.store.getState().apiReducers.target_on_name).toBe('Fresh metadata');
  });

  it('waits for target/project resolution and still loads on the first mount with an existing target ID', async () => {
    expect.hasAssertions();
    const view = setup({ list: [], initialTargetId: 1 });
    expect(targetReads()).toHaveLength(0);
    await act(async () => view.store.dispatch(setTargetIdList([{ ...targets[0], project: 10 }])));
    expect(targetReads()).toHaveLength(0);
    await act(async () => view.store.dispatch(setTargetIdList(targets)));
    await screen.findByTestId('live-preview');
    expect(targetReads()).toHaveLength(1);
    expect(view.store.getState().apiReducers.target_on).toBe(1);
  });

  it('continues to load actual target changes and navigation back to the original target', async () => {
    expect.hasAssertions();
    const view = setup();
    await screen.findByTestId('live-preview');
    await act(async () => view.history.push(targetUrl(2)));
    await waitFor(() => expect(view.store.getState().apiReducers.target_on).toBe(2));
    await act(async () => view.history.push(targetUrl(1)));
    await waitFor(() => expect(view.store.getState().apiReducers.target_on).toBe(1));
    expect(targetReads().map(request => request.url.split('id=')[1])).toStrictEqual(['1', '2', '1']);
  });

  it('retains project and snapshot route loading while ignoring metadata-only target list changes', async () => {
    expect.hasAssertions();
    const view = setup({ route: '/projects/10/1' });
    await screen.findByTestId('live-preview');
    await act(async () => view.store.dispatch(replaceTarget({ ...targets[0], display_name: 'New name' })));
    const sessionReads = () => api.mock.calls.filter(([request]) => request.url.includes('/session-projects/'));
    expect(sessionReads()).toHaveLength(1);
    await act(async () => view.history.push('/projects/10/2'));
    await screen.findByTestId('live-preview');
    expect(sessionReads()).toHaveLength(2);
  });
});
