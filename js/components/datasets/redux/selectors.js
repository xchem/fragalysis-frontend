import { createSelector } from 'reselect';

const moleculeLists = state => state.datasetsReducers.moleculeLists;
const scoreCompoundMap = state => state.datasetsReducers.scoreCompoundMap;
const scoreDatasetMap = state => state.datasetsReducers.scoreDatasetMap;
const filterDatasetMap = state => state.datasetsReducers.filterDatasetMap;

export const scoreListOfMolecules = createSelector(
  (_, datasetID) => datasetID,
  moleculeLists,
  scoreCompoundMap,
  (datasetID, moleculeLists, scoreCompoundMap) => {
    const moleculeListOfDataset = moleculeLists[datasetID];
    return (moleculeListOfDataset && moleculeListOfDataset.map(molecule => scoreCompoundMap[molecule.id])) || [];
  }
);

export const getInitialDatasetFilterSettings = createSelector(
  (_, datasetID) => datasetID,
  scoreListOfMolecules,
  scoreDatasetMap,
  filterDatasetMap,
  (datasetID, scoreListOfMolecules, scoreDatasetMap, filterDatasetMap) => {
    const scoreDatasetMapList = scoreDatasetMap[datasetID];
    let initObject = filterDatasetMap[datasetID];

    if (initObject === undefined) {
      initObject = {
        active: false,
        predefined: 'none',
        priorityOrder: scoreDatasetMapList.map(score => score.name)
      };
    }
    return initObject;
  }
);

export const getInitialDatasetFilterProperties = createSelector(
  (_, datasetID) => datasetID,
  scoreListOfMolecules,
  scoreDatasetMap,
  (datasetID, scoreListOfMolecules, scoreDatasetMap) => {
    const scoreDatasetMapList = scoreDatasetMap[datasetID];

    let initObject = {};

    for (let attr of scoreDatasetMapList) {
      let minValue = 999999;
      let maxValue = -999999;
      let disableFilter = true;
      for (let molecule of scoreListOfMolecules) {
        const foundedMolecule = molecule.find(item => item.score.name === attr.name);
        if (disableFilter && foundedMolecule) {
          disableFilter = false;
        }
        const attrValue = (foundedMolecule || {}).value;
        if (attrValue > maxValue) maxValue = attrValue;
        if (minValue === -999999) minValue = maxValue;
        if (attrValue < minValue) minValue = attrValue;
      }

      initObject[attr.name] = {
        priority: 0,
        order: 1,
        minValue: minValue,
        maxValue: maxValue,
        isFloat: attr.isFloat,
        disabled: disableFilter
      };
    }
    return initObject;
  }
);
