import { createSelector } from 'reselect';

const moleculeLists = state => state.datasetsReducers.moleculeLists;
const scoreCompoundMap = state => state.datasetsReducers.scoreCompoundMap;

export const scoreListOfMolecules = (state, datasetID) =>
  createSelector(moleculeLists, scoreCompoundMap, (moleculeLists, scoreCompoundMap) => {
    const moleculeListOfDataset = moleculeLists[datasetID];

    return moleculeListOfDataset.map(molecule => scoreCompoundMap[molecule.id]);
  })(state);
