import * as R from 'ramda';
import axios from 'axios';
const CancelToken = axios.CancelToken;

export const fetchWithMemoize = R.memoizeWith(R.identity, (url, cancel) => {
  return axios
    .get(url, {
      cancelToken: new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        cancel = c;
      })
    })
    .then(response => response.data);
});

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

export const METHOD = { GET: 'GET', POST: 'POST', PUT: 'PUT', DELETE: 'DELETE', PATCH: 'PATCH' };

export const api = (url, method, headers, data, cancel) =>
  axios({
    url,
    method: method !== undefined ? method : METHOD.GET,
    headers,
    data,
    cancelToken: new CancelToken(function executor(c) {
      // An executor function receives a cancel function as a parameter
      cancel = c;
    })
  });
