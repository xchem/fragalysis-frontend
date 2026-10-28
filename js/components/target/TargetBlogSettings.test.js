import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { ThemeProvider } from '../../ui/styles';
import { getTheme } from '../../theme';
import { api } from '../../utils/api';
import apiReducers from '../../reducers/api/apiReducers';
import { TargetSettingsModal } from './targetSettingsModal';

jest.mock('../../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));
jest.mock('../../utils/api', () => ({
  api: jest.fn(),
  getCsrfToken: () => 'csrf',
  METHOD: { GET: 'GET', PATCH: 'PATCH', POST: 'POST' }
}));

const makeTarget = id => ({
  id,
  title: `Target ${id}`,
  display_name: `Target ${id}`,
  short_name: '',
  long_name: '',
  organism: '',
  alias_order: [],
  project: { id: 10, alias: 'Alias' },
  settings: {
    preserved_setting: { value: 'keep' },
    electron_density_map_type: 'event',
    crystallographic_binding_events: 40,
    bound_compounds: 30,
    associated_affinity_measurements: 20,
    measured_compounds: 10,
    blog_url: 'https://example.org/legacy-do-not-use'
  }
});
const record = {
  id: 7,
  target: 1,
  title: 'API blog title',
  url: 'https://example.org/api-blog',
  published: '2026-10-21',
  overview: 'Blog summary',
  image: 'https://example.org/stored.png'
};
const field = name => screen.getByRole('textbox', { name: new RegExp(name, 'i') });
const change = (name, value) => fireEvent.change(field(name), { target: { value } });
const writes = () => api.mock.calls.map(([request]) => request).filter(request => request.method !== 'GET');
const blogWrites = () => writes().filter(request => request.url.includes('/target-blogs/'));
const setup = ({
  isTargetOn = false,
  blog = null,
  getBlog,
  writeBlog,
  writeTarget,
  writeProject,
  open = true
} = {}) => {
  api.mockReset();
  const target = makeTarget(1);
  const nextTarget = makeTarget(2);
  Object.freeze(target.settings);
  Object.freeze(target);
  const state = {
    apiReducers: {
      target_on: 1,
      target_on_name: 'Target 1',
      target_on_aliases: [],
      target_id_list: [target, nextTarget]
    },
    selectionReducers: { targetToEdit: target }
  };
  const store = legacy_createStore((current = state, action) =>
    action.type === 'test/target'
      ? { ...current, selectionReducers: { targetToEdit: nextTarget } }
      : { ...current, apiReducers: apiReducers(current.apiReducers, action) }
  );
  api.mockImplementation(request => {
    if (request.url.includes('/target-blogs/')) {
      if (request.method === 'GET')
        return getBlog ? getBlog(request) : Promise.resolve({ data: { results: blog ? [blog] : [] } });
      if (writeBlog) return writeBlog(request);
      return Promise.resolve({ data: { ...record, ...request.data } });
    }
    if (request.method === 'GET') return Promise.resolve({ data: { results: [] } });
    if (request.url.includes('/api/targets/') && writeTarget) return writeTarget(request);
    if (request.url.includes('/api/projects/') && writeProject) return writeProject(request);
    return Promise.resolve({ data: request.data });
  });
  const onClose = jest.fn();
  const ui = isOpen => (
    <Provider store={store}>
      <ThemeProvider theme={getTheme()}>
        <TargetSettingsModal openModal={isOpen} onModalClose={onClose} isTargetOn={isTargetOn} />
      </ThemeProvider>
    </Provider>
  );
  const view = render(ui(open));
  return { ...view, onClose, store, target, ui };
};
const edit = async () => {
  await waitFor(() => expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  await screen.findByRole('textbox', { name: /Blog title/i });
};
const save = () => fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

describe('target settings blog API integration', () => {
  it.each([true, false])('reads API fields and updates an existing blog (active target: %s)', async isTargetOn => {
    expect.hasAssertions();
    const view = setup({ isTargetOn, blog: record });
    expect(await screen.findByText(record.title)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Current blog preview' })).toHaveAttribute('src', record.image);
    expect(screen.queryByText(view.target.settings.blog_url)).not.toBeInTheDocument();
    expect(api).toHaveBeenCalledWith(expect.objectContaining({ method: 'GET', params: { target: 1 } }));
    await edit();
    expect(field('Blog URL')).toHaveValue(record.url);
    expect(screen.getByLabelText('Publication date')).toHaveValue('2026-10-21');
    change('Blog title', 'Updated blog');
    change('Blog URL', 'https://example.org/new');
    change('Overview', 'New summary');
    fireEvent.change(screen.getByLabelText('Publication date'), { target: { value: '' } });
    fireEvent.change(screen.getByPlaceholderText('enter measured compounds'), { target: { value: '15' } });
    save();
    await waitFor(() => expect(view.onClose).toHaveBeenCalledTimes(1));
    expect(blogWrites()).toStrictEqual([
      expect.objectContaining({
        method: 'PATCH',
        url: expect.stringContaining('/target-blogs/7/'),
        data: { title: 'Updated blog', url: 'https://example.org/new', published: null, overview: 'New summary' }
      })
    ]);
    expect(writes().find(request => request.url.includes('/api/targets/')).data.settings).toStrictEqual({
      ...view.target.settings,
      electron_density_rendering_mode: 'wireframe',
      measured_compounds: '15'
    });
    expect(view.target.display_name).toBe('Target 1');
    expect(
      view.store.getState().apiReducers.target_id_list.find(target => target.id === 1).settings.measured_compounds
    ).toBe('15');
  });

  it('shows no fallback and saves unrelated settings without creating an empty blog', async () => {
    expect.hasAssertions();
    const view = setup();
    expect(await screen.findByText('No blog has been added.')).toBeInTheDocument();
    await edit();
    expect(field('Blog URL')).toHaveValue('');
    change('Overview', 'Temporary');
    change('Overview', '');
    save();
    await waitFor(() => expect(view.onClose).toHaveBeenCalledTimes(1));
    expect(blogWrites()).toHaveLength(0);
  });

  it.each([true, false])('keeps target state intact for a blog-only save (active target: %s)', async isTargetOn => {
    expect.hasAssertions();
    const view = setup({ isTargetOn, blog: record });
    const initialState = view.store.getState().apiReducers;
    await edit();
    change('Blog title', 'Only the blog changed');
    save();
    await waitFor(() => expect(view.onClose).toHaveBeenCalledTimes(1));
    expect(writes()).toHaveLength(1);
    expect(writes()[0].url).toContain('/target-blogs/');
    expect(view.store.getState().apiReducers.target_id_list).toBe(initialState.target_id_list);
    expect(view.store.getState().apiReducers.target_on_aliases).toBe(initialState.target_on_aliases);
  });

  it('creates a new blog with optional values empty', async () => {
    expect.hasAssertions();
    const view = setup();
    await edit();
    change('Blog title', 'New blog');
    change('Blog URL', 'https://example.org/new');
    save();
    await waitFor(() => expect(view.onClose).toHaveBeenCalledTimes(1));
    expect(blogWrites()[0]).toStrictEqual(
      expect.objectContaining({
        method: 'POST',
        url: expect.stringMatching(/\/target-blogs\/$/),
        data: { target: 1, title: 'New blog', url: 'https://example.org/new', published: null, overview: '' }
      })
    );
  });

  it('validates required blog fields without sending partial settings', async () => {
    expect.hasAssertions();
    const view = setup();
    await edit();
    change('Overview', 'A blog needs a title and URL');
    save();
    expect(await screen.findByText('Enter a blog title.')).toBeInTheDocument();
    expect(screen.getByText('Enter the blog URL.')).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
    expect(view.onClose).not.toHaveBeenCalled();
  });

  it('uploads only the selected image source and preserves drafts after an upload error', async () => {
    expect.hasAssertions();
    const writeBlog = jest
      .fn()
      .mockRejectedValueOnce({ response: { data: { image: ['Invalid image file.'] } } })
      .mockResolvedValueOnce({ data: record });
    const view = setup({ blog: record, writeBlog });
    await edit();
    fireEvent.click(screen.getByRole('radio', { name: 'Image URL' }));
    change('Image URL', 'https://example.org/unused.png');
    fireEvent.click(screen.getByRole('radio', { name: 'Upload image' }));
    const file = new File(['image bytes'], 'blog.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('Upload blog image'), { target: { files: [file] } });
    save();
    expect(await screen.findByText('Invalid image file.')).toBeInTheDocument();
    expect(screen.getByText('blog.png')).toBeInTheDocument();
    expect(view.onClose).not.toHaveBeenCalled();
    expect(writeBlog.mock.calls[0][0].data.get('image')).toBe(file);
    expect(writeBlog.mock.calls[0][0].data.has('image_url')).toBe(false);
    save();
    await waitFor(() => expect(view.onClose).toHaveBeenCalledTimes(1));
  });

  it('submits an image URL without uploading a previously selected file', async () => {
    expect.hasAssertions();
    const view = setup({ blog: record });
    await edit();
    fireEvent.change(screen.getByLabelText('Upload blog image'), {
      target: { files: [new File(['bytes'], 'unused.png', { type: 'image/png' })] }
    });
    fireEvent.click(screen.getByRole('radio', { name: 'Image URL' }));
    change('Image URL', 'https://example.org/new.png');
    save();
    await waitFor(() => expect(view.onClose).toHaveBeenCalledTimes(1));
    expect(blogWrites()[0].data).toStrictEqual({
      title: record.title,
      url: record.url,
      published: record.published,
      overview: record.overview,
      image_url: 'https://example.org/new.png'
    });
  });

  it('retains an existing image when only text changes', async () => {
    expect.hasAssertions();
    const view = setup({ blog: record });
    await edit();
    change('Blog title', 'Edited title');
    save();
    await waitFor(() => expect(view.onClose).toHaveBeenCalledTimes(1));
    expect(blogWrites()[0].data).not.toHaveProperty('image');
    expect(blogWrites()[0].data).not.toHaveProperty('image_url');
  });

  it('keeps the dialog open with server field errors and permission failures', async () => {
    expect.hasAssertions();
    const writeBlog = jest
      .fn()
      .mockRejectedValueOnce({ response: { data: { url: ['Enter a valid URL.'] } } })
      .mockRejectedValueOnce({ response: { status: 403, data: { detail: 'You cannot edit this blog.' } } });
    const view = setup({ blog: record, writeBlog });
    await edit();
    change('Blog URL', 'invalid');
    save();
    expect(await screen.findByText('Enter a valid URL.')).toBeInTheDocument();
    expect(field('Blog URL')).toHaveValue('invalid');
    change('Blog URL', 'https://example.org/valid');
    save();
    expect(await screen.findByText('You cannot edit this blog.')).toBeInTheDocument();
    expect(view.onClose).not.toHaveBeenCalled();
    expect(writes().every(request => request.url.includes('/target-blogs/'))).toBe(true);
  });

  it('prevents duplicate saves and blocks closing while a blog is being saved', async () => {
    expect.hasAssertions();
    let finish;
    const view = setup({
      blog: record,
      writeBlog: () =>
        new Promise(resolve => {
          finish = resolve;
        })
    });
    await edit();
    change('Blog title', 'Pending blog');
    const saveButton = screen.getByRole('button', { name: 'Save changes' });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(view.onClose).not.toHaveBeenCalled();
    expect(blogWrites()).toHaveLength(1);
    await act(async () => finish({ data: { ...record, title: 'Pending blog' } }));
    await waitFor(() => expect(view.onClose).toHaveBeenCalledTimes(1));
  });

  it.each(['target', 'project'])('retries a failed %s save without creating the blog again', async failedResource => {
    expect.hasAssertions();
    const failOnce = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network failed'))
      .mockResolvedValueOnce({ data: {} });
    const view = setup({ [failedResource === 'target' ? 'writeTarget' : 'writeProject']: failOnce });
    await edit();
    change('Blog title', 'New blog');
    change('Blog URL', 'https://example.org/new');
    fireEvent.change(screen.getByPlaceholderText('enter display name'), { target: { value: 'Updated target' } });
    save();
    expect(await screen.findByText(/Blog changes were saved./)).toBeInTheDocument();
    expect(field('Blog title')).toHaveValue('New blog');
    expect(view.onClose).not.toHaveBeenCalled();
    save();
    await waitFor(() => expect(view.onClose).toHaveBeenCalledTimes(1));
    expect(blogWrites()).toHaveLength(1);
    expect(failOnce).toHaveBeenCalledTimes(2);
  });

  it('reports a failed load and retries without creating or overwriting anything', async () => {
    expect.hasAssertions();
    const getBlog = jest
      .fn()
      .mockRejectedValueOnce(new Error('Connection lost'))
      .mockResolvedValueOnce({ data: { results: [record] } });
    setup({ getBlog });
    expect(await screen.findByText('Connection lost')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry loading blog' }));
    expect(await screen.findByText(record.title)).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  });

  it('loads only while open and discards cancelled drafts on reopening', async () => {
    expect.hasAssertions();
    const view = setup({ open: false, blog: record });
    expect(api).not.toHaveBeenCalled();
    view.rerender(view.ui(true));
    await edit();
    change('Blog title', 'Unsaved');
    view.rerender(view.ui(false));
    view.rerender(view.ui(true));
    expect(await screen.findByText(record.title)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Unsaved')).not.toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  });

  it('ignores a stale blog load after the selected target changes', async () => {
    expect.hasAssertions();
    let finish;
    const view = setup({
      getBlog: request =>
        request.params.target === 1
          ? new Promise(resolve => {
              finish = resolve;
            })
          : Promise.resolve({ data: { results: [{ ...record, target: 2, title: 'Second target blog' }] } })
    });
    await act(async () => view.store.dispatch({ type: 'test/target' }));
    expect(await screen.findByText('Second target blog')).toBeInTheDocument();
    await act(async () => finish({ data: { results: [record] } }));
    expect(screen.queryByText(record.title)).not.toBeInTheDocument();
    expect(screen.getByText('Second target blog')).toBeInTheDocument();
  });

  it('does not continue saving target metadata after navigation away during a blog save', async () => {
    expect.hasAssertions();
    let finish;
    const view = setup({
      blog: record,
      writeBlog: () =>
        new Promise(resolve => {
          finish = resolve;
        })
    });
    await edit();
    change('Blog title', 'Pending');
    save();
    view.unmount();
    await act(async () => finish({ data: record }));
    expect(writes()).toHaveLength(1);
    expect(view.onClose).not.toHaveBeenCalled();
  });
});
