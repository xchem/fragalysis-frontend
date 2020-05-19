import { deleteObject, loadObject, setOrientation } from '../../../reducers/ngl/dispatchActions';
import {
  setFilterSettings,
  appendLigandList,
  appendProteinList,
  appendComplexList,
  appendSurfaceList,
  removeFromLigandList,
  removeFromProteinList,
  removeFromComplexList,
  removeFromSurfaceList,
  setDataset,
  appendToScoreDatasetMap,
  appendToScoreCompoundMap,
  appendToScoreCompoundMapByScoreCategory,
  updateFilterShowedScoreProperties,
  setFilterProperties
} from './actions';
import { base_url } from '../../routes/constants';
import {
  generateMoleculeId,
  generateHitProteinObject,
  generateComplexObject,
  generateSurfaceObject,
  generateMoleculeObject
} from '../../nglView/generatingObjects';
import { VIEWS } from '../../../constants/constants';
import { addMoleculeList } from './actions';
import { api } from '../../../utils/api';
import { getInitialDatasetFilterProperties, getInitialDatasetFilterSettings } from './selectors';
import { COUNT_OF_VISIBLE_SCORES } from './constants';
import { MOL_ATTRIBUTES } from '../../preview/molecule/redux/constants';
import { useSelector } from 'react-redux';

export const initializeDatasetMoleculeLists = moleculeList => (dispatch, getState) => {
  console.log('initializing testing datasets');
  const state = getState();
  const customDatasets = state.datasetsReducers.datasets;
  const testingMoleculeList = moleculeList.slice(0, 6);
  // TODO temporarily, just adding testing data
  customDatasets.forEach(dataset => {
    dispatch(
      addMoleculeList(
        dataset.id,
        (testingMoleculeList => {
          const newList = [];
          testingMoleculeList.forEach(molecule => {
            // molecule.protein_code is used as prefix for element names in display controls
            newList.push(Object.assign({}, molecule, { protein_code: dataset.id + '_' + molecule.id }));
          });
          return newList;
        })(testingMoleculeList)
      )
    );
  });
};

export const getListedMolecules = (object_selection, cached_mol_lists) => {
  let molecules = [];
  if ((object_selection || []).length) {
    for (let molgroupId of object_selection) {
      // Selected molecule groups
      const molGroup = cached_mol_lists[molgroupId];
      if (molGroup) {
        molecules = molecules.concat(molGroup);
      } else {
        console.log(`Molecule group ${molgroupId} not found in cached list`);
      }
    }
  }

  return molecules;
};

export const initializeDatasetFilter = datasetID => (dispatch, getState) => {
  const initFilterSettings = getInitialDatasetFilterSettings(getState(), datasetID);
  const initFilterProperties = getInitialDatasetFilterProperties(getState(), datasetID);

  dispatch(setFilterSettings(datasetID, initFilterSettings));
  dispatch(setFilterProperties(datasetID, initFilterProperties));
};

export const addProtein = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    loadObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateHitProteinObject(data, colourToggle, base_url)),
      stage,
      undefined,
      null
    )
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendProteinList(datasetID, generateMoleculeId(data)));
};

export const removeProtein = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateHitProteinObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromProteinList(datasetID, generateMoleculeId(data)));
};

export const addComplex = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    loadObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url)),
      stage,
      undefined,
      null
    )
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendComplexList(datasetID, generateMoleculeId(data)));
};

export const removeComplex = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromComplexList(datasetID, generateMoleculeId(data)));
};

export const addSurface = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    loadObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateSurfaceObject(data, colourToggle, base_url)),
      stage,
      undefined,
      null
    )
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendSurfaceList(datasetID, generateMoleculeId(data)));
};

export const removeSurface = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateSurfaceObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromSurfaceList(datasetID, generateMoleculeId(data)));
};

export const addLigand = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    loadObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data, colourToggle)),
      stage,
      undefined,
      undefined
    )
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendLigandList(datasetID, generateMoleculeId(data)));
};

export const removeLigand = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data)), stage));
  dispatch(removeFromLigandList(datasetID, generateMoleculeId(data)));
};

export const loadDataSets = () => dispatch =>
  api({ url: `${base_url}/api/compound-sets/` }).then(response => {
    dispatch(setDataset(response.data.results.map(ds => ({ id: ds.id, title: ds.name }))));
  });

export const loadMoleculesOfDataSet = dataSetID => dispatch =>
  api({ url: `${base_url}/api/compound-molecules/?compound_set=${dataSetID}` }).then(response => {
    dispatch(addMoleculeList(dataSetID, response.data.results));
  });

export const loadCompoundScoresListOfDataSet = datasetID => dispatch =>
  api({ url: `${base_url}/api/compound-scores/?compound_set=${datasetID}` }).then(response => {
    dispatch(appendToScoreDatasetMap(datasetID, response.data.results));
    dispatch(
      updateFilterShowedScoreProperties({
        datasetID,
        scoreList: (response.data.results || []).slice(0, COUNT_OF_VISIBLE_SCORES)
      })
    );
    return Promise.all(
      response &&
        response.data &&
        response.data.results.map(score => dispatch(loadNumericalScoreListByScoreID(score.id)))
    );
  });

export const loadCompoundScoreList = (compoundID, onCancel) => dispatch =>
  api({ url: `${base_url}/api/numerical-scores/?compound=${compoundID}`, cancel: onCancel }).then(response => {
    dispatch(appendToScoreCompoundMap(compoundID, response.data.results));
  });

export const loadNumericalScoreListByScoreID = (scoreID, onCancel) => (dispatch, getState) =>
  api({ url: `${base_url}/api/numerical-scores/?score=${scoreID}`, cancel: onCancel }).then(response => {
    dispatch(appendToScoreCompoundMapByScoreCategory(response.data.results));
  });

export const selectScoreProperty = ({ isChecked, datasetID, scoreID }) => (dispatch, getState) => {
  const state = getState();
  const filteredScorePropertiesOfDataset = state.datasetsReducers.filteredScoreProperties[datasetID];
  const scoreDatasetMap = state.datasetsReducers.scoreDatasetMap[datasetID];

  if (isChecked === true) {
    if (filteredScorePropertiesOfDataset.length === COUNT_OF_VISIBLE_SCORES) {
      // 1. unselect first
      filteredScorePropertiesOfDataset.shift();
    }
    // 2. select new property
    filteredScorePropertiesOfDataset.push(scoreDatasetMap.find(item => item.id === scoreID));
    dispatch(
      updateFilterShowedScoreProperties({
        datasetID,
        scoreList: filteredScorePropertiesOfDataset
      })
    );
  } else {
    dispatch(
      updateFilterShowedScoreProperties({
        datasetID,
        scoreList: filteredScorePropertiesOfDataset.filter(item => item.id !== scoreID)
      })
    );
  }
};

// export const getFilteredMoleculesCount = (molecules, filter) => {
//   let count = 0;
//   for (let molecule of molecules) {
//     let add = true; // By default molecule passes filter
//     for (let attr of MOL_ATTRIBUTES) {
//       const lowAttr = attr.key.toLowerCase();
//       const attrValue = molecule[lowAttr];
//       if (attrValue < filter.filter[attr.key].minValue || attrValue > filter.filter[attr.key].maxValue) {
//         add = false;
//         break; // Do not loop over other attributes
//       }
//     }
//     if (add) {
//       count = count + 1;
//     }
//   }
//   return count;
// };
//
// export const getAttrDefinition = attr => {
//   return MOL_ATTRIBUTES.find(molAttr => molAttr.key === attr);
// };

export const filterDatasetMolecules = datasetID => (dispatch, getState) => {
  const state = getState();
  const filterSettingsMap = state.datasetsReducers.filterDatasetMap;
  const filterSettings = filterSettingsMap && datasetID && filterSettingsMap[datasetID];
  const filterPropertiesMap = state.datasetsReducers.filterPropertiesDatasetMap;
  const filterProperties = filterPropertiesMap && datasetID && filterPropertiesMap[datasetID];
  const scoreCompoundMap = state.datasetsReducers.scoreCompoundMap;

  const moleculeLists = state.datasetsReducers.moleculeLists;
  let datasetMoleculeList = moleculeLists[datasetID] || [];

  const scoreDatasetList = state.datasetsReducers.scoreDatasetMap[datasetID];

  // 1. Filter
  let filteredMolecules = [];
  Object.keys(scoreCompoundMap).forEach(moleculeID => {
    let add = true; // By default molecule passes filter
    for (let attr of scoreDatasetList) {
      const foundedMolecule = scoreCompoundMap[moleculeID].find(item => item.score.name === attr.name);
      if (
        foundedMolecule &&
        (foundedMolecule.value < filterProperties[attr.name].minValue ||
          foundedMolecule.value > filterProperties[attr.name].maxValue)
      ) {
        add = false;
        break; // Do not loop over other attributes
      }
    }
    if (add) {
      filteredMolecules.push(datasetMoleculeList.find(molecule => `${molecule.id}` === moleculeID));
    }
  });

  // 2. Sort
  let sortedAttributes = filterSettings.priorityOrder.map(attr => attr);

  const sorted = filteredMolecules.sort((a, b) => {
    for (let prioAttr of sortedAttributes) {
      const order = filterProperties[prioAttr].order;
      const attrLo = prioAttr.toLowerCase();
      let diff = order * (a[attrLo] - b[attrLo]);
      if (diff !== 0) {
        return diff;
      }
    }
  });

  return sorted;
};
