import * as R from 'ramda';
import axios from 'axios';

export const fetchWithMemoize = R.memoizeWith(R.identity, url => {
  return axios.get(url);
});
