import { colourList } from './datasetMoleculeView';

export const changeButtonClassname = (givenList = [], moleculeList = []) => {
  if (moleculeList.length === givenList.length) {
    return true;
  } else if (givenList.length > 0) {
    return null;
  }
  return false;
};
