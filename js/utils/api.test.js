import axios from 'axios';
import { api, METHOD } from './api';

jest.mock('axios', () => {
  const mockedAxios = jest.fn();
  mockedAxios.CancelToken = function CancelToken(executor) {
    executor(() => undefined);
  };
  return mockedAxios;
});

const getLastRequest = () => axios.mock.calls[axios.mock.calls.length - 1][0];

describe('api cache policy', () => {
  it.each([undefined, METHOD.GET, METHOD.HEAD, 'get'])('cache-busts read requests using method %s', method => {
    expect.assertions(2);
    axios.mockClear();

    api({ url: '/api/items/?page=2', method, params: { search: 'active' } });

    const request = getLastRequest();
    expect(request.url).toBe('/api/items/?page=2');
    expect(request.params).toStrictEqual({
      search: 'active',
      __cacheBust: expect.stringMatching(/^\d+-\d+$/)
    });
  });

  it('uses a unique cache-busting value for concurrent requests', () => {
    expect.assertions(1);
    axios.mockClear();

    api({ url: '/api/items/' });
    api({ url: '/api/items/' });

    expect(axios.mock.calls[0][0].params.__cacheBust).not.toBe(axios.mock.calls[1][0].params.__cacheBust);
  });

  it('does not add cache-busting parameters to mutation requests', () => {
    expect.assertions(2);
    axios.mockClear();
    const params = { dryRun: true };
    const data = { name: 'example' };

    api({ url: '/api/items/', method: METHOD.POST, params, data });

    expect(getLastRequest()).toStrictEqual(expect.objectContaining({ method: METHOD.POST, params, data }));
    expect(getLastRequest().params).not.toHaveProperty('__cacheBust');
  });

  it('enforces no-cache headers while preserving custom headers', () => {
    expect.assertions(1);
    axios.mockClear();

    api({
      url: '/api/items/',
      headers: {
        Authorization: 'Bearer token',
        'cache-control': 'public, max-age=3600',
        PRAGMA: 'allow-cache'
      }
    });

    expect(getLastRequest().headers).toStrictEqual({
      Authorization: 'Bearer token',
      'Cache-Control': 'no-cache, no-store, max-age=0',
      Pragma: 'no-cache'
    });
  });

  it('keeps the default API headers and creates a cancellation token', () => {
    expect.assertions(2);
    axios.mockClear();

    api({ url: '/api/items/' });

    expect(getLastRequest().headers).toStrictEqual(
      expect.objectContaining({
        accept: 'application/json',
        'content-type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache, no-store, max-age=0',
        Pragma: 'no-cache'
      })
    );
    expect(getLastRequest().cancelToken).toBeInstanceOf(axios.CancelToken);
  });

  it('normalizes URL objects before Axios appends cache-busting parameters', () => {
    expect.assertions(2);
    axios.mockClear();

    api({ url: new URL('https://example.test/api/items/?page=2') });

    expect(getLastRequest().url).toBe('https://example.test/api/items/?page=2');
    expect(getLastRequest().params).toHaveProperty('__cacheBust');
  });
});
