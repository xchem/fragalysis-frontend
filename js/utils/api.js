import axios from 'axios';
import { isRemoteDebugging } from '../components/routes/constants';

const CancelToken = axios.CancelToken;
let cacheBustSequence = 0;

const withNoCacheHeaders = (headers, data) => {
  const result = { ...headers };
  const isMultipart = typeof FormData !== 'undefined' && data instanceof FormData;
  Object.keys(result).forEach(name => {
    if (
      ['cache-control', 'pragma'].includes(name.toLowerCase()) ||
      (isMultipart && name.toLowerCase() === 'content-type')
    ) {
      delete result[name];
    }
  });
  return { ...result, 'Cache-Control': 'no-cache, no-store, max-age=0', Pragma: 'no-cache' };
};

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
  const isRead = [METHOD.GET, METHOD.HEAD].includes(String(requestMethod).toUpperCase());
  return axios({
    url: typeof url === 'string' ? url : url.toString(),
    method: requestMethod,
    params: isRead ? { ...params, __cacheBust: `${Date.now()}-${cacheBustSequence++}` } : params,
    headers: withNoCacheHeaders(
      headers !== undefined
        ? headers
        : isRemoteDebugging
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
          },
      // Preserve Axios 0.19's FormData pass-through and let the browser supply the boundary.
      data
    ),
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
