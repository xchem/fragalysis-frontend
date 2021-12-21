import { addToPdbCache } from '../../reducers/ngl/actions';

export const getPdb = url => (dispatch, getState) => {
  const state = getState();

  const pdbCache = state.nglReducers.pdbCache;
  const pdbName = getNameOfPdb(url);
  if (pdbCache.hasOwnProperty(pdbName)) {
    return new Promise((resolve, reject) => {
      resolve(pdbCache[pdbName]);
    });
  } else {
    return loadPdbFile(url).then(b => {
      dispatch(addToPdbCache(pdbName, b));
      return b;
    });
  }
};

const loadPdbFile = url => {
  return fetch(url)
    .then(response => response.text())
    .then(str => {
      return new Blob([str], { type: 'text/plain' });
    });
};

const getNameOfPdb = url => {
  const parts = url.split('/');
  const last = parts[parts.length - 1];
  return last;
};
