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
