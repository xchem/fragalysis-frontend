import { createSelector } from 'reselect';

const moleculeLists = state => state.datasetsReducers.moleculeLists;
const scoreCompoundMap = state => state.datasetsReducers.scoreCompoundMap;
const scoreDatasetMap = state => state.datasetsReducers.scoreDatasetMap;
const filterDatasetMap = state => state.datasetsReducers.filterDatasetMap;

export const scoreListOfMolecules = (state, datasetID) =>
  createSelector(moleculeLists, scoreCompoundMap, (moleculeLists, scoreCompoundMap) => {
    const moleculeListOfDataset = moleculeLists[datasetID];

    return (moleculeListOfDataset && moleculeListOfDataset.map(molecule => scoreCompoundMap[molecule.id])) || [];
  })(state);

export const getInitialDatasetFilterObject = (state, datasetID) =>
  createSelector(
    scoreListOfMolecules,
    scoreDatasetMap,
    filterDatasetMap,
    (scoreListOfMolecules, scoreDatasetMap, filterDatasetMap) => {
      const scoreDatasetMapList = scoreDatasetMap[datasetID];

      let initObject = filterDatasetMap[datasetID];

      if (initObject === undefined) {
        initObject = {
          active: false,
          predefined: 'none',
          filter: {},
          priorityOrder: scoreDatasetMapList.map(score => score.name)
        };
      } else {
        initObject = Object.assign({}, initObject);
        console.log('using saved filter');
      }

      for (let attr of scoreDatasetMapList) {
        let minValue = -999999;
        let maxValue = 0;
        for (let molecule of scoreListOfMolecules) {
          const attrValue = (molecule.find(item => item.score.name === attr.name) || {}).value;
          if (attrValue > maxValue) maxValue = attrValue;
          if (minValue === -999999) minValue = maxValue;
          if (attrValue < minValue) minValue = attrValue;
        }

        initObject.filter[attr.name] = {
          priority: 0,
          order: 1,
          minValue: minValue,
          maxValue: maxValue,
          isFloat: attr.isFloat
        };
      }
      return initObject;
    }
  )(state);
