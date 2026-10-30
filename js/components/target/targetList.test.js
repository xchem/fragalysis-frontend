import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import { deserialize, serialize } from 'v8';
import { ThemeProvider } from '../../ui/styles';
import { getTheme } from '../../theme';
import { TargetList } from './targetList';
import { BarChart } from '@mui/x-charts/BarChart';
import { fetchTargetBlog } from './targetBlogApi';
import {
  downloadStructuresZip,
  getDownloadStructuresTaskOrUrl,
  getDownloadTaskStatusObject
} from '../snapshot/api/api';

jest.mock('../../utils/djangoContext', () => ({
  DJANGO_CONTEXT: { pk: 37, authenticated: true, username: 'tester' }
}));
jest.mock('./targetListSortFilterDialog', () => ({ TargetListSortFilterDialog: () => null }));
jest.mock('./redux/dispatchActions', () => ({
  getTargetProjectCombinations: targets => targets.map(target => ({ updatedTarget: target }))
}));
jest.mock('@mui/x-charts/BarChart', () => ({
  BarChart: jest.fn(() => <div data-testid="target-chart" />)
}));
jest.mock('./targetBlogApi', () => ({
  ...jest.requireActual('./targetBlogApi'),
  fetchTargetBlog: jest.fn()
}));
jest.mock('../snapshot/api/api', () => ({
  downloadStructuresZip: jest.fn(),
  getDownloadStructuresTaskOrUrl: jest.fn(),
  getDownloadTaskStatusObject: jest.fn()
}));

const makeTarget = (id, settings = {}) => ({
  id,
  title: `target-${id}`,
  display_name: `Target ${id}`,
  short_name: '',
  long_name: '',
  organism: '',
  settings,
  project: {
    alias: `Alias ${id}`,
    target_access_string: `real-tas-${id}`,
    open_to_public: id === 1,
    init_date: '2026-01-01'
  }
});
const target = makeTarget(1, {
  crystallographic_binding_events: 40,
  bound_compounds: 30,
  associated_affinity_measurements: 20,
  measured_compounds: 10,
  blog_url: 'https://example.org/a-future-blog'
});
const blogs = [
  {
    id: 11,
    target: 1,
    title: 'Public target blog',
    published: '2026-05-11',
    overview: 'Public target overview',
    image: 'https://example.org/public.png',
    url: 'https://example.org/public-blog'
  },
  {
    id: 12,
    target: 2,
    title: 'Private target blog',
    published: '2026-05-12',
    overview: 'Private target overview',
    image: 'https://example.org/private.png',
    url: 'https://example.org/private-blog'
  }
];
const renderLists = (panels, loadBlog = id => Promise.resolve(blogs.find(blog => blog.target === id) || null)) => {
  fetchTargetBlog.mockReset().mockImplementation(loadBlog);
  const state = { targetReducers: { projects: [] }, selectionReducers: {} };
  const store = legacy_createStore((current = state, action) =>
    action.type === 'test/edit'
      ? {
          ...current,
          targetReducers: { ...current.targetReducers, isEditTargetDialogOpen: action.open },
          selectionReducers: { targetToEdit: action.open ? target : null }
        }
      : current
  );
  const view = render(
    <StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={getTheme()}>
          <MemoryRouter>
            {panels.map((props, index) => (
              <TargetList key={index} {...props} />
            ))}
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    </StrictMode>
  );
  return { ...view, store };
};
const renderList = (list = [target], props = {}, loadBlog) => renderLists([{ list, ...props }], loadBlog);
const confirmDownload = async () => {
  fireEvent.click(await screen.findByRole('button', { name: 'Download the full dataset' }));
  const dialog = screen.getByRole('dialog', { name: 'Download target data?' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Download' }));
  await act(async () => {});
};

describe('landing target details and downloads', () => {
  it('expands public and private details by default, preserving blog links, aliases and target links', async () => {
    expect.hasAssertions();
    jest.clearAllMocks();
    jest.useRealTimers();
    const privateTarget = makeTarget(2);
    const before = JSON.stringify([target, privateTarget]);
    renderList([target, privateTarget]);
    expect(await screen.findByRole('link', { name: 'Target 1' })).toHaveAttribute(
      'href',
      '/viewer/react/preview/target/target-1/tas/real-tas-1'
    );
    expect(screen.getByText('Alias 1')).toBeInTheDocument();
    for (const id of [1, 2]) {
      const previewLink = within(screen.getByRole('region', { name: `Blog overview for Target ${id}` })).getByRole(
        'link',
        { name: 'Go to target' }
      );
      expect(previewLink).toHaveAttribute('href', screen.getByRole('link', { name: `Target ${id}` }).getAttribute('href'));
    }
    expect(getDownloadStructuresTaskOrUrl).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Collapse Target 1' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Collapse Target 2' })).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByText('May 11, 2026')).toHaveAttribute('datetime', '2026-05-11');
    const blogLink = screen.getByRole('link', { name: blogs[0].title });
    expect(blogLink).toHaveAttribute('href', blogs[0].url);
    expect(blogLink).toHaveAttribute('target', '_blank');
    expect(blogLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText(blogs[0].overview)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Blog preview for Target 1' })).toHaveAttribute('src', blogs[0].image);
    expect(screen.queryByText(target.settings.blog_url)).not.toBeInTheDocument();
    expect(BarChart.mock.calls.at(-1)[0].series.map(series => series.data[0])).toStrictEqual([40, 30, 20, 10]);
    expect(await screen.findByRole('link', { name: blogs[1].title })).toHaveAttribute('href', blogs[1].url);
    expect(screen.getByText('May 12, 2026')).toBeInTheDocument();
    expect(screen.getByText(blogs[1].overview)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Blog preview for Target 2' })).toHaveAttribute('src', blogs[1].image);
    expect(fetchTargetBlog).toHaveBeenCalledWith(1);
    expect(fetchTargetBlog).toHaveBeenCalledWith(2);
    expect(screen.getAllByRole('button', { name: 'Download the full dataset' })).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Target 1' }));
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Download the full dataset' })).toHaveLength(1));
    expect(screen.getByRole('button', { name: 'Expand Target 1' })).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Target 2' }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Download the full dataset' })).not.toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: 'Expand Target 2' })).toHaveAttribute('aria-expanded', 'false');
    expect(JSON.stringify([target, privateTarget])).toBe(before);
  });

  it.each(['Public targets', 'Private targets'])(
    'toggles all details in %s and follows individual expansions without refetching blogs',
    async title => {
      expect.hasAssertions();
      renderList(
        [target, makeTarget(2)].map(item => ({
          ...item,
          project: { ...item.project, open_to_public: title === 'Public targets' }
        })),
        { title, authRequired: title === 'Private targets' }
      );
      const originalImage = await screen.findByRole('img', { name: 'Blog preview for Target 1' });
      const originalUrl = originalImage.getAttribute('src');
      fireEvent.click(screen.getByRole('button', { name: 'Collapse Target 1' }));
      const collapseAll = screen.getByRole('button', { name: `Collapse all ${title.toLowerCase()}` });
      expect(collapseAll).toHaveTextContent('Collapse all');
      fireEvent.click(collapseAll);
      const expandAll = screen.getByRole('button', { name: `Expand all ${title.toLowerCase()}` });
      expect(expandAll).toHaveTextContent('Expand all');
      expect(screen.getByRole('button', { name: 'Expand Target 1' })).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByRole('button', { name: 'Expand Target 2' })).toHaveAttribute('aria-expanded', 'false');
      await waitFor(() => expect(originalImage).not.toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: 'Expand Target 1' }));
      fireEvent.click(screen.getByRole('button', { name: `Collapse all ${title.toLowerCase()}` }));
      await waitFor(() => expect(screen.queryByRole('img')).not.toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: `Expand all ${title.toLowerCase()}` }));
      expect(screen.getByRole('button', { name: 'Collapse Target 1' })).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('button', { name: 'Collapse Target 2' })).toHaveAttribute('aria-expanded', 'true');
      expect(await screen.findByRole('img', { name: 'Blog preview for Target 1' })).toHaveAttribute('src', originalUrl);
      expect(fetchTargetBlog).toHaveBeenCalledTimes(2);
    }
  );

  it('keeps the public and private panel expansion controls independent', async () => {
    expect.hasAssertions();
    renderLists([
      { list: [target], title: 'Public targets' },
      { list: [makeTarget(2)], title: 'Private targets', authRequired: true }
    ]);
    expect(await screen.findByRole('link', { name: blogs[1].title })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Collapse all public targets' }));
    expect(screen.getByRole('button', { name: 'Expand all public targets' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Expand Target 1' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Collapse all private targets' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Collapse Target 2' })).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Collapse all private targets' }));
    fireEvent.click(screen.getByRole('button', { name: 'Expand all public targets' }));
    expect(screen.getByRole('button', { name: 'Collapse Target 1' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Expand Target 2' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('includes targets hidden by search in the bulk action and its current-state label', async () => {
    expect.hasAssertions();
    renderList([target, makeTarget(2)]);
    await screen.findByRole('link', { name: blogs[1].title });
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Target 1' }));
    fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'Target 1' } });
    expect(screen.queryByRole('link', { name: 'Target 2' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Collapse all target list' }));
    expect(screen.getByRole('button', { name: 'Expand all target list' })).toBeEnabled();
    fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: '' } });
    expect(screen.getByRole('button', { name: 'Expand Target 2' })).toHaveAttribute('aria-expanded', 'false');
    fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'Target 1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Expand all target list' }));
    fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: '' } });
    expect(screen.getByRole('button', { name: 'Collapse Target 1' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Collapse Target 2' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('retains the source branch chart visibility for missing and zero counts', async () => {
    expect.hasAssertions();
    jest.clearAllMocks();
    jest.useRealTimers();
    renderList([makeTarget(1, { ...target.settings, bound_compounds: 0 }), makeTarget(2)]);
    expect(await screen.findByRole('link', { name: blogs[1].title })).toBeInTheDocument();
    expect(screen.queryByTestId('target-chart')).not.toBeInTheDocument();
  });

  it('reuses the blog and thumbnail URL after collapsing and reopening a target', async () => {
    expect.hasAssertions();
    renderList([target], {}, () =>
      Promise.resolve({ ...blogs[0], image: 'https://localhost/media/target_blog/11/' })
    );
    const originalImage = await screen.findByRole('img', { name: 'Blog preview for Target 1' });
    const originalUrl = originalImage.getAttribute('src');
    expect(new URL(originalUrl).searchParams.get('__cacheBust')).toMatch(/^\d+$/);
    expect(fetchTargetBlog).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Target 1' }));
    await waitFor(() => expect(originalImage).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Expand Target 1' }));
    expect(await screen.findByRole('img', { name: 'Blog preview for Target 1' })).toHaveAttribute('src', originalUrl);
    expect(fetchTargetBlog).toHaveBeenCalledTimes(1);
  });

  it('reuses an in-flight blog request when a target is reopened before the response arrives', async () => {
    expect.hasAssertions();
    let finish;
    renderList([target], {}, () => new Promise(resolve => (finish = resolve)));
    expect(await screen.findByText('Loading blog…')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Target 1' }));
    await waitFor(() => expect(screen.queryByText('Loading blog…')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Expand Target 1' }));
    expect(await screen.findByText('Loading blog…')).toBeInTheDocument();
    expect(fetchTargetBlog).toHaveBeenCalledTimes(1);
    await act(async () => finish(blogs[0]));
    expect(await screen.findByRole('link', { name: blogs[0].title })).toBeInTheDocument();
  });

  it('keeps legacy targets as external links without new detail/download controls', async () => {
    expect.hasAssertions();
    jest.clearAllMocks();
    jest.useRealTimers();
    renderList([{ ...makeTarget(1), isLegacy: true, legacyUrl: 'https://legacy.example/target' }], { legacy: true });
    expect(await screen.findByRole('link', { name: 'Target 1' })).toHaveAttribute(
      'href',
      'https://legacy.example/target'
    );
    expect(screen.queryByRole('button', { name: /(?:Expand|Collapse) Target/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /(?:Expand|Collapse) all/ })).not.toBeInTheDocument();
    expect(fetchTargetBlog).not.toHaveBeenCalled();
  });

  it('keeps downloads and chart data when no blog exists, without showing the old placeholders or URL fallback', async () => {
    expect.hasAssertions();
    renderList([target], {}, () => Promise.resolve(null));
    expect(await screen.findByText('No blog has been added.')).toBeInTheDocument();
    expect(screen.queryByText(/Inside OpenBind's First Public Data Release/)).not.toBeInTheDocument();
    expect(screen.queryByText('May 5, 2026')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /blog/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download the full dataset' })).toBeInTheDocument();
    expect(screen.getByTestId('target-chart')).toBeInTheDocument();
  });

  it('renders a blog without optional image, publication date, or overview', async () => {
    expect.hasAssertions();
    renderList([target], {}, () => Promise.resolve({ ...blogs[0], image: null, published: null, overview: '' }));
    expect(await screen.findByRole('link', { name: blogs[0].title })).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByText('May 11, 2026')).not.toBeInTheDocument();
    expect(screen.queryByText(blogs[0].overview)).not.toBeInTheDocument();
  });

  it('retries a blog load error while keeping dataset controls available', async () => {
    expect.hasAssertions();
    const loadBlog = jest.fn().mockResolvedValue(blogs[0]);
    loadBlog.mockRejectedValueOnce(new Error('Blog service unavailable'));
    renderList([target], {}, loadBlog);
    expect(await screen.findByRole('alert')).toHaveTextContent('Blog service unavailable');
    expect(screen.getByRole('button', { name: 'Download the full dataset' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry loading blog' }));
    expect(await screen.findByRole('link', { name: blogs[0].title })).toBeInTheDocument();
    expect(fetchTargetBlog).toHaveBeenCalledTimes(2);
  });

  it('keeps cached blog data until the landing page is revisited', async () => {
    expect.hasAssertions();
    const view = renderList();
    expect(await screen.findByRole('link', { name: blogs[0].title })).toBeInTheDocument();
    await act(async () => view.store.dispatch({ type: 'test/edit', open: true }));
    fetchTargetBlog.mockResolvedValue({ ...blogs[0], title: 'Updated title', url: 'https://example.org/updated' });
    await act(async () => view.store.dispatch({ type: 'test/edit', open: false }));
    expect(await screen.findByRole('link', { name: blogs[0].title })).toHaveAttribute('href', blogs[0].url);
    expect(fetchTargetBlog).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('link', { name: 'Updated title' })).not.toBeInTheDocument();
    view.unmount();
    renderList([target], {}, () =>
      Promise.resolve({ ...blogs[0], title: 'Updated title', url: 'https://example.org/updated' })
    );
    expect(await screen.findByRole('link', { name: 'Updated title' })).toHaveAttribute('href', 'https://example.org/updated');
    expect(screen.queryByRole('link', { name: blogs[0].title })).not.toBeInTheDocument();
  });

  it('confirms before requesting the source default archive using the actual access string', async () => {
    expect.hasAssertions();
    jest.clearAllMocks();
    jest.useRealTimers();
    getDownloadStructuresTaskOrUrl.mockResolvedValue({ status: 200, data: { file_url: '/archive.zip' } });
    renderList();
    fireEvent.click(await screen.findByRole('button', { name: 'Download the full dataset' }));
    expect(getDownloadStructuresTaskOrUrl).not.toHaveBeenCalled();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));
    expect(getDownloadStructuresTaskOrUrl).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByRole('button', { name: 'Download the full dataset' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Download' }));
    await waitFor(() => expect(downloadStructuresZip).toHaveBeenCalledWith('/archive.zip'));
    expect(getDownloadStructuresTaskOrUrl).toHaveBeenCalledTimes(1);
    expect(getDownloadStructuresTaskOrUrl).toHaveBeenCalledWith({
      target_name: 'target-1',
      target_access_string: 'real-tas-1',
      proteins: '',
      event_file: false,
      sigmaa_file: false,
      diff_file: false,
      trans_matrix_info: false,
      pdb_info: false,
      mtz_info: false,
      cif_info: false,
      map_info: false,
      single_sdf_file: true,
      compound_sets: true,
      soakdb_files: false,
      all_aligned_structures: true,
      metadata_info: true,
      static_link: false,
      file_url: '',
      use_zip: true
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('polls a pending archive, prevents duplicate submission, and downloads once', async () => {
    expect.hasAssertions();
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.useFakeTimers();
    getDownloadStructuresTaskOrUrl.mockResolvedValue({ status: 200, data: { task_status_url: '/status/1/' } });
    getDownloadTaskStatusObject
      .mockResolvedValueOnce({ data: { finished: false } })
      .mockResolvedValueOnce({ data: { finished: true, status: 'SUCCESS', messages: '/ready.zip' } });
    renderList();
    await confirmDownload();
    expect(screen.getByText('Preparing download…')).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Download' })).toBeDisabled();
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(getDownloadTaskStatusObject).toHaveBeenCalledTimes(2);
    expect(getDownloadStructuresTaskOrUrl).toHaveBeenCalledTimes(1);
    expect(downloadStructuresZip).toHaveBeenCalledTimes(1);
    expect(downloadStructuresZip).toHaveBeenCalledWith('/ready.zip');
  });

  it.each([
    { status: 208, data: {}, message: 'The same download is already being prepared.' },
    { status: 200, data: {}, message: 'The server returned an unexpected response.' },
    { error: { response: { data: { message: 'Backend unavailable' } } }, message: 'Backend unavailable' }
  ])('reports archive preparation errors and allows retry: $message', async scenario => {
    expect.hasAssertions();
    jest.clearAllMocks();
    jest.useRealTimers();
    if (scenario.error) getDownloadStructuresTaskOrUrl.mockRejectedValue(scenario.error);
    else getDownloadStructuresTaskOrUrl.mockResolvedValue(scenario);
    renderList();
    await confirmDownload();
    expect(await screen.findByText(scenario.message, { exact: false })).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Download' })).toBeEnabled();
    expect(downloadStructuresZip).not.toHaveBeenCalled();
  });

  it('reports failed task status without downloading', async () => {
    expect.hasAssertions();
    jest.clearAllMocks();
    jest.useRealTimers();
    getDownloadStructuresTaskOrUrl.mockResolvedValue({ status: 200, data: { task_status_url: '/status/1/' } });
    getDownloadTaskStatusObject.mockResolvedValue({
      data: { finished: true, status: 'FAILURE', messages: 'Archive failed' }
    });
    renderList();
    await confirmDownload();
    expect(await screen.findByText('Archive failed')).toBeInTheDocument();
    expect(downloadStructuresZip).not.toHaveBeenCalled();
  });

  it('ignores a late status success after leaving the landing page', async () => {
    expect.hasAssertions();
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.useFakeTimers();
    let finish;
    getDownloadStructuresTaskOrUrl.mockResolvedValue({ status: 200, data: { task_status_url: '/status/1/' } });
    getDownloadTaskStatusObject.mockReturnValue(
      new Promise(resolve => {
        finish = resolve;
      })
    );
    const view = renderList();
    await confirmDownload();
    view.unmount();
    await act(async () => {
      finish({ data: { finished: true, status: 'SUCCESS', messages: '/late.zip' } });
      jest.advanceTimersByTime(10000);
    });
    expect(downloadStructuresZip).not.toHaveBeenCalled();
    expect(getDownloadTaskStatusObject).toHaveBeenCalledTimes(1);
  });

  it('renders the installed chart package with the source four-series layout', () => {
    expect.hasAssertions();
    jest.clearAllMocks();
    jest.useRealTimers();
    const NativeBarChart = jest.requireActual('@mui/x-charts/BarChart').BarChart;
    // JSDOM omits this browser API, which the installed chart uses for plain gesture options.
    const originalClone = global.structuredClone;
    global.structuredClone = value => deserialize(serialize(value));
    try {
      render(
        <ThemeProvider theme={getTheme()}>
          <NativeBarChart
            width={800}
            height={260}
            layout="horizontal"
            skipAnimation
            yAxis={[{ scaleType: 'band', data: ['data'] }]}
            xAxis={[{ label: 'Count' }]}
            series={[
              { label: 'Binding events', data: [40] },
              { label: 'Bound compounds', data: [30] },
              { label: 'Affinity measurements', data: [20] },
              { label: 'Measured compounds', data: [10] }
            ]}
          />
        </ThemeProvider>
      );
      expect(screen.getByText('Count')).toBeInTheDocument();
      expect(screen.getByText('Binding events')).toBeInTheDocument();
      expect(screen.getByText('Measured compounds')).toBeInTheDocument();
    } finally {
      if (originalClone) global.structuredClone = originalClone;
      else delete global.structuredClone;
    }
  });
});
