import axios from 'axios';
import { isRemoteDebugging } from '../components/routes/constants';

const CancelToken = axios.CancelToken;

const CACHE_BUST_PARAM = '__cacheBust';
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, max-age=0',
  Pragma: 'no-cache'
};

let cacheBustSequence = 0;

const getNoCacheHeaders = headers => {
  const mergedHeaders = { ...(headers || {}) };

  // Header names are case-insensitive. Remove caller-provided variants so the
  // application-wide cache policy cannot be accidentally overridden.
  Object.keys(mergedHeaders).forEach(header => {
    if (header.toLowerCase() === 'cache-control' || header.toLowerCase() === 'pragma') {
      delete mergedHeaders[header];
    }
  });

  return { ...mergedHeaders, ...NO_CACHE_HEADERS };
};

const getCacheBustValue = () => `${Date.now()}-${cacheBustSequence++}`;

const getCookie = name => {
  if (!document.cookie) {
    return null;
  }
  const xsrfCookies = document.cookie
    .split(';')
    .map(c => c.trim())
    .filter(c => c.startsWith(name + '='));
  if (xsrfCookies.length === 0) {
    return null;
  }
  return decodeURIComponent(xsrfCookies[0].split('=')[1]);
};

export const getCsrfToken = () => getCookie('csrftoken');

export const METHOD = { GET: 'GET', POST: 'POST', PUT: 'PUT', DELETE: 'DELETE', PATCH: 'PATCH', HEAD: 'HEAD' };

export const api = ({ url, method, headers, data, cancel, params }) => {
  // url && console.log(`${url}`);
  // data && console.log(`${data}`);
  const requestMethod = method !== undefined ? method : METHOD.GET;
  const shouldCacheBust = [METHOD.GET, METHOD.HEAD].includes(String(requestMethod).toUpperCase());
  const defaultHeaders = isRemoteDebugging
    ? {
        //we need to not to add X-CSRFToken because it's forbidden by the server when CORS are enabled and origins doen't match
        accept: 'application/json',
        'content-type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
        //'X-CSRFToken': getCsrfToken()
      }
    : {
        accept: 'application/json',
        'content-type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': getCsrfToken()
      };

  return axios({
    // Axios 0.19 cannot append params to a URL object, so normalize URL inputs
    // before adding the cache-busting query parameter.
    url: typeof url === 'string' ? url : url.toString(),
    method: requestMethod,
    params: shouldCacheBust ? { ...(params || {}), [CACHE_BUST_PARAM]: getCacheBustValue() } : params,
    headers: getNoCacheHeaders(headers !== undefined ? headers : defaultHeaders),
    data,
    cancelToken: new CancelToken(function executor(c) {
      // An executor function receives a cancel function as a parameter
      cancel = c;
    })
  });
};

export const getFileSize = fullUrl => {
  return api({
    url: fullUrl,
    method: METHOD.HEAD
  });
};

export const getFileSizeString = fileSizeInBytes => {
  const stepSize = 1024;
  let result = '';

  if (fileSizeInBytes < stepSize) {
    result = `${fileSizeInBytes}B`;
  } else {
    const fileSizeInKB = fileSizeInBytes / stepSize;
    if (fileSizeInKB < stepSize) {
      result = `${fileSizeInKB.toFixed(1)}KB`;
    } else {
      const fileSizeInMB = fileSizeInKB / stepSize;
      if (fileSizeInMB < stepSize) {
        result = `${fileSizeInMB.toFixed(1)}MB`;
      } else {
        const fileSizeInGB = fileSizeInMB / stepSize;
        result = `${fileSizeInGB.toFixed(1)}GB`;
      }
    }
  }

  return result;
};
