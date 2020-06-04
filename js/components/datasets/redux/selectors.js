import { createSelector } from 'reselect';

const moleculeLists = state => state.datasetsReducers.moleculeLists;
const scoreCompoundMap = state => state.datasetsReducers.scoreCompoundMap;
const scoreDatasetMap = state => state.datasetsReducers.scoreDatasetMap;
const filterDatasetMap = state => state.datasetsReducers.filterDatasetMap;
const filterPropertiesDatasetMap = state => state.datasetsReducers.filterPropertiesDatasetMap;
const filterWithInspirations = state => state.datasetsReducers.filterWithInspirations;

const fragmentDisplayList = state => state.selectionReducers.fragmentDisplayList;
const proteinList = state => state.selectionReducers.proteinList;
const complexList = state => state.selectionReducers.complexList;
const surfaceList = state => state.selectionReducers.surfaceList;
const densityList = state => state.selectionReducers.densityList;
const vectorOnList = state => state.selectionReducers.vectorOnList;

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
        if (molecule) {
          const foundedMolecule = molecule.find(item => item.score.name === attr.name);
          if (disableFilter && foundedMolecule) {
            disableFilter = false;
          }
          const attrValue = (foundedMolecule || {}).value;
          if (attrValue > maxValue) {
            maxValue = attrValue;
          }
          if (minValue === -999999) {
            minValue = maxValue;
          }
          if (attrValue < minValue) {
            minValue = attrValue;
          }
        }
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

export const isAnyInspirationTurnedOn = createSelector(
  (_, inspiration_frags = []) => inspiration_frags,
  fragmentDisplayList,
  proteinList,
  complexList,
  surfaceList,
  densityList,
  vectorOnList,
  (inspirations, ligands, proteins, complexis, surfaces, densities, vectors) => {
    const allLists = new Set(ligands);
    proteins.forEach(p => allLists.add(p));
    complexis.forEach(p => allLists.add(p));
    surfaces.forEach(p => allLists.add(p));
    densities.forEach(p => allLists.add(p));
    vectors.forEach(p => allLists.add(p));
    let hasInspiration = false;
    inspirations.forEach(moleculeID => {
      if (allLists.has(moleculeID)) {
        hasInspiration = true;
        return hasInspiration;
      }
    });
    return hasInspiration;
  }
);

export const getFilteredDatasetMoleculeList = createSelector(
  (_, datasetID) => datasetID,
  filterDatasetMap,
  filterPropertiesDatasetMap,
  scoreCompoundMap,
  moleculeLists,
  scoreDatasetMap,
  filterWithInspirations,
  state => state,
  (
    datasetID,
    filterDatasetMap,
    filterPropertiesDatasetMap,
    scoreCompoundMap,
    moleculeLists,
    scoreDatasetMap,
    withInspirations,
    state
  ) => {
    const filterSettings = filterDatasetMap && datasetID && filterDatasetMap[datasetID];
    const filterProperties = filterPropertiesDatasetMap && datasetID && filterPropertiesDatasetMap[datasetID];
    let datasetMoleculeList = moleculeLists[datasetID] || [];
    const scoreDatasetList = scoreDatasetMap[datasetID];
    const isActiveFilter = !!(filterSettings || {}).active;
    if (isActiveFilter) {
      // 1. Filter by scores
      let filteredMolecules = [];
      datasetMoleculeList.forEach(molecule => {
        let add = true; // By default molecule passes filter
        for (let attr of scoreDatasetList) {
          const foundedMoleculeScore = scoreCompoundMap[molecule.id].find(item => item.score.name === attr.name);
          if (
            (foundedMoleculeScore &&
              (foundedMoleculeScore.value < filterProperties[attr.name].minValue ||
                foundedMoleculeScore.value > filterProperties[attr.name].maxValue)) ||
            (withInspirations === true && isAnyInspirationTurnedOn(state, molecule.inspiration_frags) === false) ||
            (!foundedMoleculeScore &&
              withInspirations === true &&
              isAnyInspirationTurnedOn(state, molecule.inspiration_frags) === false)
          ) {
            add = false;
            break; // Do not loop over other attributes
          }
        }
        if (add) {
          filteredMolecules.push(molecule);
        }
      });

      // 3. Sort
      let sortedAttributes = filterSettings.priorityOrder.map(attr => attr);

      return filteredMolecules.sort((a, b) => {
        for (let prioAttr of sortedAttributes) {
          const order = filterProperties[prioAttr].order;
          const attrLo = prioAttr.toLowerCase();
          let diff = order * (a[attrLo] - b[attrLo]);
          if (diff !== 0) {
            return diff;
          }
        }
      });
    }
    return datasetMoleculeList;
  }
);
