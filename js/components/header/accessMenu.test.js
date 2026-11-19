import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../ui/styles';
import { getTheme } from '../../theme';
import { api } from '../../utils/api';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { Header } from './index';
import { HeaderProvider } from './headerContext';
import { NglContext } from '../nglView/nglProvider';
import { ToastContext } from '../toast';

jest.mock('../../utils/api', () => ({ api: jest.fn(), METHOD: { GET: 'GET' } }));
jest.mock('../../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));
jest.mock('../../utils/version', () => ({ getVersions: () => Promise.resolve({ data: {} }) }));
jest.mock('../../utils/computeSize', () => ({ ComputeSize: ({ children }) => children }));
jest.mock('../snapshot/redux/dispatchActions', () => ({ createNewSnapshot: jest.fn() }));
jest.mock('../services', () => ({ ServicesStatusWrapper: () => null }));
jest.mock('../preview/molecule/moleculeView/qualityStatus/QualityStatusService', () => ({
  QualityStatusService: () => null
}));
jest.mock('../funders/fundersModal', () => ({ FundersModal: () => null }));
jest.mock('../funders/constants', () => ({
  ...jest.requireActual('../funders/constants'),
  get_logo: () => 'test-logo.png'
}));
jest.mock('../target/targetSettingsModal', () => ({ TargetSettingsModal: () => null }));
jest.mock('./discourseErrorModal', () => ({ DiscourseErrorModal: () => null }));
jest.mock('../nglView/nglProvider', () => ({ NglContext: require('react').createContext({}) }));

const renderHeader = () => {
  const state = {
    apiReducers: {},
    projectReducers: { currentProject: { projectID: null } },
    snapshotReducers: {},
    layoutReducers: { layoutEnabled: false }
  };
  const store = legacy_createStore((current = state) => current);
  return render(
    <Provider store={store}>
      <ThemeProvider theme={getTheme()}>
        <MemoryRouter>
          <HeaderProvider>
            <NglContext.Provider value={{ nglViewList: [], getNglView: () => undefined }}>
              <ToastContext.Provider value={{}}>
                <Header />
              </ToastContext.Provider>
            </NglContext.Provider>
          </HeaderProvider>
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe('access inspection menu entry', () => {
  const resetMocks = () => {
    api.mockReset();
    Object.assign(DJANGO_CONTEXT, { pk: 37, authenticated: true, username: 'fedid1' });
  };

  it('opens the access list from the hamburger menu and closes the drawer', async () => {
    expect.hasAssertions();
    resetMocks();
    const user = userEvent.setup();
    api.mockResolvedValue({ data: { ping: 'OK', target_access: ['lb32627-71'] } });
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Menu' }));
    expect(api).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'What can I see' }));
    expect(await screen.findByRole('dialog', { name: 'What can I see' })).toHaveTextContent('lb32627-71');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Home', hidden: true })).not.toBeInTheDocument());
    expect(api).toHaveBeenCalledTimes(1);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveFocus();
  });

  it('omits the access menu entry for logged-out users', async () => {
    expect.hasAssertions();
    resetMocks();
    Object.assign(DJANGO_CONTEXT, { pk: undefined, authenticated: false, username: 'NOT_LOGGED_IN' });
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'What can I see' })).not.toBeInTheDocument();
    expect(api).not.toHaveBeenCalled();
  });
});
