import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { ThemeProvider } from '../../ui/styles';
import { getTheme } from '../../theme';
import { api } from '../../utils/api';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { TargetList } from '../target/targetList';
import { TargetSettingsModal } from '../target/targetSettingsModal';

jest.mock('../../utils/api', () => ({ api: jest.fn(), METHOD: { GET: 'GET' } }));
jest.mock('../../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));
jest.mock('../target/targetListSortFilterDialog', () => ({ TargetListSortFilterDialog: () => null }));
jest.mock('../target/redux/dispatchActions', () => ({
  getTargetProjectCombinations: targets => targets.map(target => ({ updatedTarget: target }))
}));

const publicTarget = {
  id: 1,
  title: 'Public target',
  display_name: 'Public target',
  short_name: '',
  long_name: '',
  organism: '',
  alias_order: [],
  project: { target_access_string: 'public-tas', alias: 'Public alias', open_to_public: true, init_date: '2026-01-01' }
};
const privateTarget = {
  ...publicTarget,
  id: 2,
  title: 'Private target',
  display_name: 'Private target',
  project: {
    ...publicTarget.project,
    target_access_string: 'private-tas',
    alias: 'Private alias',
    open_to_public: false
  }
};
const targets = [publicTarget, privateTarget];
const Location = () => <output data-testid="location">{useLocation().pathname}</output>;
const renderWithState = children => {
  const state = {
    apiReducers: { target_on: 1, target_on_name: 'Public target', target_on_aliases: [], target_id_list: targets },
    targetReducers: { projects: [] },
    selectionReducers: { targetToEdit: privateTarget }
  };
  const store = legacy_createStore((current = state) => current);
  return render(
    <Provider store={store}>
      <ThemeProvider theme={getTheme()}>
        <MemoryRouter initialEntries={['/viewer/react/landing/']}>
          <Location />
          {children}
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe('access inspection entry points', () => {
  const resetMocks = () => {
    Object.assign(DJANGO_CONTEXT, { pk: 37, authenticated: true, username: 'fedid1' });
    api.mockReset();
    api.mockImplementation(({ url }) =>
      Promise.resolve({
        data: url.includes('compound-identifier-types') ? { results: [] } : { ping: 'OK', users: ['member1'] }
      })
    );
  };

  it('opens public and private landing-page lookups without navigating or fetching ahead of a click', async () => {
    expect.hasAssertions();
    resetMocks();
    const user = userEvent.setup();
    renderWithState(<TargetList list={targets} />);
    const publicButton = await screen.findByRole('button', { name: 'Who can see this data: Public target' });
    expect(api).not.toHaveBeenCalled();
    await user.click(publicButton);
    expect(await screen.findByRole('dialog', { name: 'Who can see this data' })).toHaveTextContent('member1');
    expect(screen.getByText(/This target is publicly accessible/)).toBeInTheDocument();
    expect(api).toHaveBeenLastCalledWith(expect.objectContaining({ params: { tas: 'public-tas' } }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(publicButton).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Who can see this data: Private target' }));
    expect(await screen.findByText('member1')).toBeInTheDocument();
    expect(screen.queryByText(/This target is publicly accessible/)).not.toBeInTheDocument();
    expect(api).toHaveBeenLastCalledWith(expect.objectContaining({ params: { tas: 'private-tas' } }));
    expect(screen.getByTestId('location')).toHaveTextContent('/viewer/react/landing/');
    expect(api).toHaveBeenCalledTimes(2);
  });

  it('hides landing-page access actions for logged-out users', async () => {
    expect.hasAssertions();
    resetMocks();
    Object.assign(DJANGO_CONTEXT, { pk: undefined, authenticated: false, username: 'NOT_LOGGED_IN' });
    renderWithState(<TargetList list={targets} />);
    expect(await screen.findByRole('link', { name: 'Public target' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Who can see this data/ })).not.toBeInTheDocument();
    expect(api).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'preserves unsaved settings and focus when returning from access (active target: %s)',
    async isTargetOn => {
      expect.hasAssertions();
      resetMocks();
      const user = userEvent.setup();
      const onModalClose = jest.fn();
      renderWithState(<TargetSettingsModal openModal onModalClose={onModalClose} isTargetOn={isTargetOn} />);
      await screen.findByText(isTargetOn ? 'Public alias' : 'Private alias');
      await user.click(screen.getByRole('button', { name: 'Edit' }));
      const nameField = screen.getByPlaceholderText('enter display name');
      // Populate the draft in one input event; exercise modal focus separately below.
      fireEvent.change(nameField, { target: { value: 'Unsaved display name' } });
      expect(nameField).toHaveValue('Unsaved display name');
      const accessButton = screen.getByRole('button', { name: 'Who can see this data' });
      await user.click(accessButton);
      const accessDialog = await screen.findByRole('dialog', { name: 'Who can see this data' });
      expect(await within(accessDialog).findByText('member1')).toBeInTheDocument();
      expect(nameField).toBeInTheDocument();
      expect(nameField).toHaveValue('Unsaved display name');
      expect(onModalClose).not.toHaveBeenCalled();
      expect(api).toHaveBeenLastCalledWith(
        expect.objectContaining({ params: { tas: isTargetOn ? 'public-tas' : 'private-tas' } })
      );
      await user.keyboard('{Escape}');
      expect(onModalClose).not.toHaveBeenCalled();
      expect(api.mock.calls.every(([request]) => request.method === 'GET')).toBe(true);
      expect(screen.queryByRole('dialog', { name: 'Who can see this data' })).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText('enter display name')).toHaveValue('Unsaved display name');
      expect(accessButton).toHaveFocus();
      expect(onModalClose).not.toHaveBeenCalled();
      expect(api.mock.calls.every(([request]) => request.method === 'GET')).toBe(true);
    }
  );
});
