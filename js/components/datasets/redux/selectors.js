import { createSelector } from 'reselect';
import { isString, isInteger, create } from 'lodash';
import { sortMoleculesByDragDropState } from '../helpers';
import { AUX_VECTOR_SELECTOR_DATASET_ID } from '../../preview/compounds/redux/constants';

const moleculeLists = state => state.datasetsReducers.moleculeLists;
const scoreCompoundMap = state => state.datasetsReducers.scoreCompoundMap;
const scoreDatasetMap = state => state.datasetsReducers.scoreDatasetMap;
const filterDatasetMap = state => state.datasetsReducers.filterDatasetMap;
const filterPropertiesDatasetMap = state => state.datasetsReducers.filterPropertiesDatasetMap;
const filterWithInspirations = state => state.datasetsReducers.filterWithInspirations;
const compoundsToBuyDatasetMap = state => state.datasetsReducers.compoundsToBuyDatasetMap;
const crossReferenceCompoundName = state => state.datasetsReducers.crossReferenceCompoundName;

const fragmentDisplayList = state => state.selectionReducers.fragmentDisplayList;
const proteinList = state => state.selectionReducers.proteinList;
const complexList = state => state.selectionReducers.complexList;
const surfaceList = state => state.selectionReducers.surfaceList;
const densityList = state => state.selectionReducers.densityList;
const vectorOnList = state => state.selectionReducers.vectorOnList;
const filteredScoreProperties = state => state.datasetsReducers.filteredScoreProperties;

const selectedVectorCompounds = state => state.previewReducers.compounds.allSelectedCompounds;

const listOfCompoundColors = state => state.datasetsReducers.compoundColorByDataset;

// const compoundsToBuyDatasetMap = createSelector(listOfCompoundColors, listOfCompoundColorsPerDataset => {
//   const result = {};
//   Object.keys(listOfCompoundColorsPerDataset).forEach(datasetID => {
//     const dataset = listOfCompoundColorsPerDataset[datasetID];
//     const listOfCompounds = [];
//     Object.keys(dataset).forEach(c => {
//       listOfCompounds.push(Number(c));
//     });
//     if (listOfCompounds && listOfCompounds.length > 0) {
//       result[datasetID] = listOfCompounds;
//     }
//   });

//   return result;
// });

export const getInitialDatasetFilterSettings = createSelector(
  (_, datasetID) => datasetID,
  scoreDatasetMap,
  filterDatasetMap,
  (datasetID, scoreDatasetMap, filterDatasetMap) => {
    const scoreDatasetMapList = scoreDatasetMap[datasetID];
    let initObject = filterDatasetMap[datasetID];

    if (initObject === undefined) {
      initObject = {
        active: false,
        predefined: 'none',
        priorityOrder: scoreDatasetMapList && Object.keys(scoreDatasetMapList)
      };
    }
    return initObject;
  }
);

export const getInitialDatasetFilterProperties = createSelector(
  (_, datasetID) => datasetID,
  moleculeLists,
  scoreDatasetMap,
  (datasetID, moleculeLists, scoreDatasetMap) => {
    const scoreDatasetMapList = scoreDatasetMap[datasetID];

    let initObject = {};

    const moleculeListOfDataset = moleculeLists[datasetID];

    scoreDatasetMapList &&
      Object.keys(scoreDatasetMapList).forEach(scoreName => {
        //    })
        //    for (let attr of scoreDatasetMapList) {
        let minValue = 999999;
        let maxValue = -999999;
        let isChecked = undefined;
        let isBoolean = null;
        let isFloat = null;
        let isString = null;

        for (let molecule of moleculeListOfDataset) {
          if (molecule) {
            let foundedValueOfScore;
            if (molecule?.numerical_scores[scoreName] !== undefined) {
              foundedValueOfScore = molecule?.numerical_scores[scoreName];
            }
            if (molecule?.text_scores[scoreName] !== undefined) {
              foundedValueOfScore = molecule?.text_scores[scoreName];
            }
            // It is Number type
            if (foundedValueOfScore && !isNaN(foundedValueOfScore)) {
              if (isInteger(foundedValueOfScore)) {
                if (isFloat === true) {
                  isFloat = true;
                }
                if (isFloat === null) {
                  isFloat = false;
                }
              } else {
                isFloat = true;
              }
            }
            // It is String or Boolean type
            else if (foundedValueOfScore && isNaN(foundedValueOfScore)) {
              // Boolean type
              if (foundedValueOfScore === 'Y' || foundedValueOfScore === 'N') {
                isBoolean = true;
              }
              // String type
              else {
                isString = true;
              }
            }
            const attrValue = foundedValueOfScore;
            if (isFloat !== null) {
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
            if (isBoolean) {
              const isTrue = foundedValueOfScore === 'Y';
              const isFalse = foundedValueOfScore === 'N';
              const resultBoolean = isTrue && !isFalse;
              minValue = 1;
              maxValue = 50;
              if (isChecked === undefined) {
                isChecked = resultBoolean;
              } else if (isChecked !== resultBoolean) {
                isChecked = null;
              }
            }
          }
        }

        initObject[scoreName] = {
          priority: 0,
          order: 1,
          minValue,
          maxValue,
          isFloat,
          isBoolean,
          isChecked,
          isString
        };
      });
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

export const isAnyInspirationTurnedOnByType = (inspirations, data) => {
  let typeLists = new Set(data);
  let hasInspirationType = false;
  inspirations.forEach(moleculeID => {
    if (typeLists.has(moleculeID)) {
      hasInspirationType = true;
      return hasInspirationType;
    }
  });
  return hasInspirationType;
};

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
      datasetMoleculeList &&
        Array.isArray(datasetMoleculeList) &&
        datasetMoleculeList.forEach(molecule => {
          let add = true; // By default molecule passes filter
          Object.keys(scoreDatasetList || {}).forEach(scoreKey => {
            if (add === true) {
              const foundedNumericalScore = molecule?.numerical_scores[scoreKey];

              if (
                (foundedNumericalScore &&
                  (foundedNumericalScore < filterProperties[scoreKey].minValue ||
                    foundedNumericalScore > filterProperties[scoreKey].maxValue)) ||
                (withInspirations === true && isAnyInspirationTurnedOn(state, molecule.computed_inspirations) === false)
              ) {
                add = false; //break; Do not loop over other attributes
              }
            }

            // String or boolean
            const foundedTextScore = molecule?.text_scores[scoreKey];
            // It is String or Boolean type
            if (foundedTextScore && isNaN(foundedTextScore)) {
              // Boolean type
              if (foundedTextScore === 'Y' || foundedTextScore === 'N') {
                const isTrue = foundedTextScore === 'Y';
                const isFalse = foundedTextScore === 'N';
                const resultBoolean = isTrue && !isFalse;

                if (filterProperties[scoreKey].maxValue === 1) {
                  if (resultBoolean) {
                    add = false;
                  }
                } else if (filterProperties[scoreKey].maxValue === 100) {
                  if (!resultBoolean) {
                    add = false;
                  }
                }

                // if (resultBoolean !== filterProperties[scoreKey].isChecked) {
                //   add = false;
                // }
              }
              // String type
              else {
                // TODO: maybe in the future wi will filter string scores
              }
            }
          });

          if (add) {
            filteredMolecules.push(molecule);
          }
        });

      // 3. Sort
      const defaultFilterProperties = getInitialDatasetFilterProperties(state, datasetID);

      let sortedAttributes = filterSettings.priorityOrder
        .filter(attr => defaultFilterProperties[attr]?.order !== 0 || false)
        .map(attr => attr);

      return filteredMolecules.sort((a, b) => {
        for (let prioAttr of sortedAttributes) {
          const order = filterProperties[prioAttr].order;

          let scoreValueOfA =
            Object.keys(a.numerical_scores).find(key => key === prioAttr) && a.numerical_scores[prioAttr];
          scoreValueOfA =
            scoreValueOfA || (Object.keys(a.text_scores).find(key => key === prioAttr) && a.text_scores[prioAttr]);
          let scoreValueOfB =
            Object.keys(b.numerical_scores).find(key => key === prioAttr) && b.numerical_scores[prioAttr];
          scoreValueOfB =
            scoreValueOfB || (Object.keys(b.text_scores).find(key => key === prioAttr) && b.text_scores[prioAttr]);

          if (scoreValueOfA === 'Y') {
            scoreValueOfA = 1;
          } else if (scoreValueOfA === 'N') {
            scoreValueOfA = 0;
          }

          if (scoreValueOfB === 'Y') {
            scoreValueOfB = 1;
          } else if (scoreValueOfB === 'N') {
            scoreValueOfB = 0;
          }

          // const scoreValueOfA = scoreCompoundMap[a.id]?.find(item => item.score.name === prioAttr)?.value;
          // const scoreValueOfB = scoreCompoundMap[b.id]?.find(item => item.score.name === prioAttr)?.value;

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
  listOfCompoundColors,
  moleculeLists,
  selectedVectorCompounds,
  compoundsToBuyDatasetMap,
  (listOfCompoundColorsDatasetMap, moleculeLists, selectedVectorCompounds, compoundsToBuyDatasetMap) => {
    let moleculeList = [];

    const flatenedListOfCompounds = {};
    Object.keys(listOfCompoundColorsDatasetMap).forEach(datasetID => {
      const dataset = listOfCompoundColorsDatasetMap[datasetID];
      const listOfCompounds = [];
      Object.keys(dataset).forEach(c => {
        listOfCompounds.push(Number(c));
      });
      if (listOfCompounds && listOfCompounds.length > 0) {
        flatenedListOfCompounds[datasetID] = listOfCompounds;
      }
    });

    if (compoundsToBuyDatasetMap && compoundsToBuyDatasetMap.hasOwnProperty(AUX_VECTOR_SELECTOR_DATASET_ID)) {
      flatenedListOfCompounds[AUX_VECTOR_SELECTOR_DATASET_ID] =
        compoundsToBuyDatasetMap[AUX_VECTOR_SELECTOR_DATASET_ID];
    }

    Object.keys(flatenedListOfCompounds).forEach(datasetID => {
      flatenedListOfCompounds[datasetID] &&
        flatenedListOfCompounds[datasetID].forEach(moleculeID => {
          if (moleculeLists[datasetID]) {
            const foundedMolecule = moleculeLists[datasetID].find(molecule => molecule.id === moleculeID);
            if (foundedMolecule) {
              moleculeList.push({ molecule: foundedMolecule, datasetID });
            }
          } else if (selectedVectorCompounds[moleculeID]) {
            const cmp = selectedVectorCompounds[moleculeID];
            moleculeList.push({ molecule: { ...cmp, name: cmp.smiles }, datasetID });
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
        let molecule = currentList.find(item => item.name === compoundName);
        if (molecule) {
          results.push({ molecule, datasetID });
        }
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

export const getListOfSelectedSurfaceOfAllDatasets = state => {
  let resultSet = new Set();
  const complexesDatasetMap = state.datasetsReducers.surfaceLists;
  Object.keys(complexesDatasetMap).forEach(datasetID => {
    const currentDatasetArray = complexesDatasetMap[datasetID];
    if (currentDatasetArray) {
      currentDatasetArray.forEach(moleculeID => resultSet.add(moleculeID));
    }
  });

  return [...resultSet];
};

export const getJoinedMoleculeLists = (datasetID, state) => {
  const { moleculeLists, dragDropMap, filterDatasetMap, searchString } = state.datasetsReducers;
  const filteredDatasetMolecules = getFilteredDatasetMoleculeList(state, datasetID);
  const filterSettings = filterDatasetMap && datasetID && filterDatasetMap[datasetID];

  const isActiveFilter = !!(filterSettings || {}).active;

  let moleculeList = moleculeLists[datasetID] || [];
  const dragDropState = dragDropMap[datasetID];

  if (isActiveFilter) {
    if (dragDropState) {
      moleculeList = sortMoleculesByDragDropState(filteredDatasetMolecules, dragDropState);
    } else {
      moleculeList = filteredDatasetMolecules;
    }
  } else {
    if (dragDropState) {
      moleculeList = sortMoleculesByDragDropState(moleculeList, dragDropState);
    } else {
      // default sort is by site
      moleculeList.sort((a, b) => a.site - b.site);
    }
  }

  const restoredSearchString = state.trackingReducers.current_actions_list.find(
    action => action.type === 'SEARCH_STRING'
  );
  if (restoredSearchString !== null && restoredSearchString !== undefined) {
    const searchedString = restoredSearchString.searchString;
    if (searchedString !== undefined) {
      moleculeList = moleculeList.filter(molecule =>
        molecule.name.toLowerCase().includes(searchedString.toLowerCase())
      );
    }
  }
  if (searchString !== null && searchString !== undefined) {
    moleculeList = moleculeList.filter(molecule => molecule.name.toLowerCase().includes(searchString.toLowerCase()));
  }

  return moleculeList;
};
