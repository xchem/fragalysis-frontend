/**
 * Created by abradley on 01/03/2018.
 */

import React from 'react';
import fetch from 'cross-fetch';
import * as R from 'ramda';

export const FillMe = () => {
  return <h1>FILL ME UP PLEASE</h1>;
};

export const fetchWithMemoize = R.memoizeWith(R.identity, url => {
  return fetch(url).then(response => response.json(), error => console.error('An error occurred.', error));
});
