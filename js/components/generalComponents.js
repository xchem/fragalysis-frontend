/**
 * Created by abradley on 01/03/2018.
 */

import React from 'react';
import { Pager, Well } from 'react-bootstrap';
import fetch from 'cross-fetch';
import * as R from 'ramda';
export function FillMe(props) {
  return <h1>FILL ME UP PLEASE</h1>;
}

const fetchWithMemoize = R.memoizeWith(R.identity, url => {
  return fetch(url).then(response => response.json(), error => console.log('An error occurred.', error));
});
exports.fetchWithMemoize = fetchWithMemoize;

// Generic Classes
