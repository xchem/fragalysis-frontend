import { createSelector } from 'reselect';

const moleculeLists = state => state.datasetsReducers.moleculeLists;
const scoreCompoundMap = state => state.datasetsReducers.scoreCompoundMap;
const scoreDatasetMap = state => state.datasetsReducers.scoreDatasetMap;
const filterDatasetMap = state => state.datasetsReducers.filterDatasetMap;
const filterPropertiesDatasetMap = state => state.datasetsReducers.filterPropertiesDatasetMap;
const filterWithInspirations = state => state.datasetsReducers.filterWithInspirations;
const compoundsToBuyDatasetMap = state => state.datasetsReducers.compoundsToBuyDatasetMap;
const crossReferenceCompoundName = state => state.datasetsReducers.crossReferenceCompoundName;
const datasetLigandLists = state => state.datasetsReducers.ligandLists;

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
  (_, computed_inspirations = []) => computed_inspirations,
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
          const foundedMoleculeScore =
            scoreCompoundMap &&
            scoreCompoundMap[molecule.id] &&
            scoreCompoundMap[molecule.id].find(item => item.score.name === attr.name);
          if (
            (foundedMoleculeScore &&
              (foundedMoleculeScore.value < filterProperties[attr.name].minValue ||
                foundedMoleculeScore.value > filterProperties[attr.name].maxValue)) ||
            (withInspirations === true && isAnyInspirationTurnedOn(state, molecule.computed_inspirations) === false) ||
            (!foundedMoleculeScore &&
              withInspirations === true &&
              isAnyInspirationTurnedOn(state, molecule.computed_inspirations) === false)
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
      const defaultFilterProperties = getInitialDatasetFilterProperties(state, datasetID);

      let sortedAttributes = filterSettings.priorityOrder
        .filter(attr => defaultFilterProperties[attr]?.disabled === false || false)
        .map(attr => attr);

      return filteredMolecules.sort((a, b) => {
        for (let prioAttr of sortedAttributes) {
          const order = filterProperties[prioAttr].order;
          const scoreValueOfA = scoreCompoundMap[a.id]?.find(item => item.score.name === prioAttr)?.value;
          const scoreValueOfB = scoreCompoundMap[b.id]?.find(item => item.score.name === prioAttr)?.value;

          let diff = order * (scoreValueOfA - scoreValueOfB);
          if (diff !== 0) {
            return diff;
          }
        }
      });
    }
    return datasetMoleculeList;
  }
);

export const getMoleculesObjectIDListOfCompoundsToBuy = createSelector(
  compoundsToBuyDatasetMap,
  moleculeLists,
  (compoundsToBuyDatasetMap, moleculeLists) => {
    let moleculeList = [];
    Object.keys(compoundsToBuyDatasetMap).forEach(datasetID => {
      compoundsToBuyDatasetMap[datasetID] &&
        compoundsToBuyDatasetMap[datasetID].forEach(moleculeID => {
          if (moleculeLists[datasetID]) {
            const foundedMolecule = moleculeLists[datasetID].find(molecule => molecule.id === moleculeID);
            if (foundedMolecule) {
              moleculeList.push({ molecule: foundedMolecule, datasetID });
            }
          }
        });
    });
    return moleculeList;
  }
);

export const getCrossReferenceCompoundListByCompoundName = createSelector(
  crossReferenceCompoundName,
  moleculeLists,
  (compoundName, moleculesDatasetMap) => {
    let results = [];
    Object.keys(moleculesDatasetMap).forEach(datasetID => {
      const currentList = moleculesDatasetMap[datasetID];
      if (currentList && Array.isArray(currentList)) {
        results.push({ molecule: currentList.find(item => item.name === compoundName), datasetID });
      }
    });
    return results;
  }
);

export const getListOfSelectedLigandOfAllDatasets = state => {
  let resultSet = new Set();
  const ligandsDatasetMap = state.datasetsReducers.ligandLists;
  Object.keys(ligandsDatasetMap).forEach(datasetID => {
    const currentDatasetArray = ligandsDatasetMap[datasetID];
    if (currentDatasetArray) {
      currentDatasetArray.forEach(moleculeID => resultSet.add(moleculeID));
    }
  });

  return [...resultSet];
};

export const getListOfSelectedProteinOfAllDatasets = state => {
  let resultSet = new Set();
  const proteinsDatasetMap = state.datasetsReducers.proteinLists;
  Object.keys(proteinsDatasetMap).forEach(datasetID => {
    const currentDatasetArray = proteinsDatasetMap[datasetID];
    if (currentDatasetArray) {
      currentDatasetArray.forEach(moleculeID => resultSet.add(moleculeID));
    }
  });

  return [...resultSet];
};

export const getListOfSelectedComplexOfAllDatasets = state => {
  let resultSet = new Set();
  const complexesDatasetMap = state.datasetsReducers.complexLists;
  Object.keys(complexesDatasetMap).forEach(datasetID => {
    const currentDatasetArray = complexesDatasetMap[datasetID];
    if (currentDatasetArray) {
      currentDatasetArray.forEach(moleculeID => resultSet.add(moleculeID));
    }
  });

  return [...resultSet];
};
