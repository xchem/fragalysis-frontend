import axios from 'axios';
import { api, METHOD } from './api';

// Exercise the installed Axios transforms and serializer, rather than mocking Axios.
describe('api compatibility with the installed Axios release', () => {
  const withAdapter = async check => {
    const originalAdapter = axios.defaults.adapter;
    const adapter = jest.fn(config => Promise.resolve({ data: { ok: true }, status: 200, headers: {}, config }));
    axios.defaults.adapter = adapter;
    document.cookie = 'csrftoken=compatibility-token; path=/';
    try {
      await check(adapter, originalAdapter);
    } finally {
      axios.defaults.adapter = originalAdapter;
      document.cookie = 'csrftoken=; max-age=0; path=/';
    }
  };

  it('preserves existing URL queries, array params, CSRF and read cache policy', async () => {
    expect.hasAssertions();
    await withAdapter(async adapter => {
      const response = await api({
        url: new URL('http://localhost/api/items/?page=2'),
        params: { ids: [1, 2] }
      });
      const config = adapter.mock.calls[0][0];
      const url = new URL(axios.getUri(config));

      expect(response.data).toStrictEqual({ ok: true });
      expect(url.searchParams.get('page')).toBe('2');
      expect(url.searchParams.getAll('ids[]')).toStrictEqual(['1', '2']);
      expect(url.searchParams.get('__cacheBust')).toMatch(/^\d+-\d+$/);
      expect(config.headers).toStrictEqual(
        expect.objectContaining({
          'X-CSRFToken': 'compatibility-token',
          'Cache-Control': 'no-cache, no-store, max-age=0',
          Pragma: 'no-cache'
        })
      );
      expect(config.cancelToken).toBeInstanceOf(axios.CancelToken);
    });
  });

  it('keeps mutation payloads as JSON without adding read query parameters', async () => {
    expect.hasAssertions();
    await withAdapter(async adapter => {
      const data = { additional_info: { snapshotState: { apiReducers: { target_id_list: [7] } } } };

      await api({ url: '/api/snapshots/', method: METHOD.POST, data });

      const config = adapter.mock.calls[0][0];
      expect(config.data).toBe(JSON.stringify(data));
      expect(config.headers['Content-Type']).toBe('application/json');
      expect(axios.getUri(config)).toBe('/api/snapshots/');
    });
  });

  it('passes multipart image uploads through without serializing their native handles', async () => {
    expect.hasAssertions();
    await withAdapter(async adapter => {
      const data = new FormData();
      data.append('image', new Blob(['image bytes'], { type: 'image/png' }), 'snapshot.png');

      await api({ url: '/api/snapshot-images/', method: METHOD.POST, data });

      expect(adapter.mock.calls[0][0].data).toBe(data);
    });
  });

  it('lets the XHR transport supply the multipart boundary while retaining authentication', async () => {
    expect.hasAssertions();
    await withAdapter(async (adapter, originalAdapter) => {
      axios.defaults.adapter = originalAdapter;
      const data = new FormData();
      data.append('image', new Blob(['image bytes'], { type: 'image/png' }), 'snapshot.png');
      const setHeader = jest.spyOn(XMLHttpRequest.prototype, 'setRequestHeader');
      const send = jest.spyOn(XMLHttpRequest.prototype, 'send').mockImplementation(function() {
        Object.defineProperties(this, {
          status: { value: 201 },
          responseText: { value: '{}' }
        });
        this.onloadend();
      });

      try {
        await api({ url: '/api/images/', method: METHOD.POST, data });

        expect(send).toHaveBeenCalledWith(data);
        expect(setHeader.mock.calls.some(([name]) => name.toLowerCase() === 'content-type')).toBe(false);
        expect(setHeader).toHaveBeenCalledWith('X-CSRFToken', 'compatibility-token');
      } finally {
        send.mockRestore();
        setHeader.mockRestore();
      }
    });
  });

  it('retains CancelToken cancellation before dispatch', async () => {
    expect.hasAssertions();
    await withAdapter(async adapter => {
      const source = axios.CancelToken.source();
      source.cancel('navigation canceled');

      await expect(axios({ url: '/api/items/', cancelToken: source.token })).rejects.toMatchObject({
        message: 'navigation canceled',
        __CANCEL__: true
      });
      expect(adapter).not.toHaveBeenCalled();
    });
  });
});
