import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../ui/styles';
import { getTheme } from '../../theme';
import { api } from '../../utils/api';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { TargetAccessDialog, UserAccessDialog } from './AccessDialog';
import { TargetAccessAction } from './TargetAccessAction';

jest.mock('../../utils/api', () => ({ api: jest.fn(), METHOD: { GET: 'GET' } }));
jest.mock('../../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));

const wrapper = ({ children }) => <ThemeProvider theme={getTheme()}>{children}</ThemeProvider>;
const target = {
  id: 1,
  display_name: 'Example target',
  project: { target_access_string: 'lb32627-71', alias: 'Friendly alias', open_to_public: true }
};
const deferred = () => {
  let resolve;
  const promise = new Promise(complete => {
    resolve = complete;
  });
  return { promise, resolve };
};

describe('access inspection dialogs', () => {
  const resetMocks = () => {
    api.mockReset();
    Object.keys(DJANGO_CONTEXT).forEach(key => delete DJANGO_CONTEXT[key]);
    Object.assign(DJANGO_CONTEXT, { pk: 37, authenticated: true, username: 'fedid1' });
  };

  it('loads TAS on opening, sorts without mutating the response, searches and refreshes on reopening', async () => {
    expect.hasAssertions();
    resetMocks();
    const user = userEvent.setup();
    const pending = deferred();
    const entries = Object.freeze(['lb42888-88', 'lb32627-71']);
    api.mockReturnValueOnce(pending.promise).mockResolvedValueOnce({ data: { target_access: [] } });
    const view = render(<UserAccessDialog open={false} />, { wrapper });
    expect(api).not.toHaveBeenCalled();
    view.rerender(<UserAccessDialog open />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith({ url: expect.stringMatching(/\/api\/user\/$/), method: 'GET' });
    await act(async () => pending.resolve({ data: { ping: 'OK', target_access: entries } }));
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('lb32627-71');
    expect(rows[2]).toHaveTextContent('lb42888-88');
    expect(screen.getByRole('status')).toHaveTextContent('Showing 2 of 2 TAS');
    await user.type(screen.getByRole('textbox', { name: 'Search TAS' }), 'LB42888');
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 2 TAS');
    expect(screen.queryByText('lb32627-71')).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), 'missing');
    expect(screen.getByText('No matches found.')).toBeInTheDocument();
    view.rerender(<UserAccessDialog open={false} />);
    view.rerender(<UserAccessDialog open />);
    expect(await screen.findByText('No TAS are available to your account.')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(api).toHaveBeenCalledTimes(2);
  });

  it('uses the raw TAS and displays searchable mixed FedID and user-object responses', async () => {
    expect.hasAssertions();
    resetMocks();
    const user = userEvent.setup();
    const users = Object.freeze([
      'zfedid',
      Object.freeze({
        preferred_username: 'afedid',
        given_name: 'John',
        family_name: 'Doe',
        email: 'john@example.org'
      }),
      Object.freeze({ preferred_username: 'bfedid', family_name: 'Smith', given_name: null })
    ]);
    api.mockResolvedValue({ data: { ping: 'OK', users } });
    render(<TargetAccessDialog open target={target} />, { wrapper });
    expect(await screen.findByText('john@example.org')).toBeInTheDocument();
    expect(screen.getByText(/This target is publicly accessible/)).toBeInTheDocument();
    expect(screen.getByText('Example target — TAS: lb32627-71')).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith({
      url: expect.stringMatching(/\/api\/tas\/$/),
      method: 'GET',
      params: { tas: 'lb32627-71' }
    });
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(
      within(rows[1])
        .getAllByRole('cell')
        .map(cell => cell.textContent)
    ).toStrictEqual(['afedid', 'John Doe', 'john@example.org']);
    expect(
      within(rows[2])
        .getAllByRole('cell')
        .map(cell => cell.textContent)
    ).toStrictEqual(['bfedid', 'Smith', '']);
    expect(
      within(rows[3])
        .getAllByRole('cell')
        .map(cell => cell.textContent)
    ).toStrictEqual(['zfedid', '', '']);
    await user.type(screen.getByRole('textbox'), 'SMITH');
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 3 users');
    expect(screen.getByText('bfedid')).toBeInTheDocument();
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'JOHN@');
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 3 users');
    expect(screen.getByText('afedid')).toBeInTheDocument();
  });

  it('distinguishes an empty private membership list from public access and search results', async () => {
    expect.hasAssertions();
    resetMocks();
    api.mockResolvedValue({ data: { users: [] } });
    const privateTarget = { ...target, project: { ...target.project, open_to_public: false } };
    render(<TargetAccessDialog open target={privateTarget} />, { wrapper });
    expect(await screen.findByText('No users are associated with this TAS.')).toBeInTheDocument();
    expect(screen.queryByText(/This target is publicly accessible/)).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Showing 0 of 0 users');
  });

  it.each([
    ['missing list', { ping: 'OK' }],
    ['invalid list', { users: {} }],
    ['invalid member', { users: [null] }],
    ['missing FedID', { users: [{ given_name: 'John' }] }],
    ['failed service', { ping: 'ERROR', users: [] }]
  ])('shows %s as a retryable error, retaining the public-access note', async (label, data) => {
    expect.hasAssertions();
    resetMocks();
    const user = userEvent.setup();
    api.mockResolvedValueOnce({ data }).mockResolvedValueOnce({ data: { ping: 'OK', users: ['fedid1'] } });
    render(<TargetAccessDialog open target={target} />, { wrapper });
    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(screen.getByText(/This target is publicly accessible/)).toBeInTheDocument();
    expect(await screen.findByText('fedid1')).toBeInTheDocument();
    expect(screen.queryByText('No users are associated with this TAS.')).not.toBeInTheDocument();
    expect(api).toHaveBeenCalledTimes(2);
  });

  it.each([401, 403, 500])('handles HTTP %s without claiming the list is empty', async status => {
    expect.hasAssertions();
    resetMocks();
    api.mockRejectedValue({ response: { status } });
    render(<UserAccessDialog open />, { wrapper });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      status === 500 ? 'Unable to load access information' : 'Access lookup was denied'
    );
    expect(screen.queryByText('No TAS are available to your account.')).not.toBeInTheDocument();
  });

  it('handles network failures', async () => {
    expect.hasAssertions();
    resetMocks();
    api.mockRejectedValue({ request: {}, message: 'Network Error' });
    render(<UserAccessDialog open />, { wrapper });
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load access information');
  });

  it('ignores a previous target response that arrives after the next target', async () => {
    expect.hasAssertions();
    resetMocks();
    const first = deferred();
    const second = deferred();
    api.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const view = render(<TargetAccessDialog open target={target} />, { wrapper });
    const nextTarget = { id: 2, title: 'Next target', project: { target_access_string: 'lb2 & extra' } };
    view.rerender(<TargetAccessDialog open target={nextTarget} />);
    expect(screen.getByText('Next target — TAS: lb2 & extra')).toBeInTheDocument();
    expect(api).toHaveBeenLastCalledWith(expect.objectContaining({ params: { tas: 'lb2 & extra' } }));
    await act(async () => second.resolve({ data: { users: ['current-user'] } }));
    await act(async () => first.resolve({ data: { users: ['stale-user'] } }));
    expect(screen.getByText('current-user')).toBeInTheDocument();
    expect(screen.queryByText('stale-user')).not.toBeInTheDocument();
  });

  it('ignores a closed request when the dialog is reopened', async () => {
    expect.hasAssertions();
    resetMocks();
    const oldRequest = deferred();
    api.mockReturnValueOnce(oldRequest.promise).mockResolvedValueOnce({ data: { target_access: ['new-tas'] } });
    const view = render(<UserAccessDialog open />, { wrapper });
    view.rerender(<UserAccessDialog open={false} />);
    view.rerender(<UserAccessDialog open />);
    expect(await screen.findByText('new-tas')).toBeInTheDocument();
    await act(async () => oldRequest.resolve({ data: { target_access: ['old-tas'] } }));
    expect(screen.queryByText('old-tas')).not.toBeInTheDocument();
    expect(screen.getByText('new-tas')).toBeInTheDocument();
  });

  it.each([
    { pk: undefined, authenticated: false, username: 'NOT_LOGGED_IN' },
    { pk: 37, authenticated: false, username: 'fedid1' },
    { pk: undefined, authenticated: true, username: 'fedid1' },
    { pk: 37, authenticated: true, username: 'NOT_LOGGED_IN' }
  ])('hides controls and performs no access requests for unauthenticated context %#', context => {
    expect.hasAssertions();
    resetMocks();
    Object.assign(DJANGO_CONTEXT, context);
    render(
      <>
        <UserAccessDialog open />
        <TargetAccessDialog open target={target} />
        <TargetAccessAction target={target} />
      </>,
      { wrapper }
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(api).not.toHaveBeenCalled();
  });

  it('disables missing-TAS actions and omits legacy actions without making requests', () => {
    expect.hasAssertions();
    resetMocks();
    const missing = { ...target, project: { alias: 'Not a TAS' } };
    const view = render(
      <>
        <TargetAccessAction target={missing} />
        <TargetAccessDialog open target={missing} />
      </>,
      { wrapper }
    );
    expect(screen.getByRole('button', { name: 'Who can see this data' })).toBeDisabled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    view.rerender(<TargetAccessAction target={{ ...target, isLegacy: true }} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(api).not.toHaveBeenCalled();
  });
});
