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
  setFilterProperties,
  setIsLoadingInspirationListOfMolecules,
  appendToInspirationMoleculeDataList,
  setInspirationMoleculeDataList,
  setInspirationList,
  setIsOpenInspirationDialog,
  clearScoreCompoundMap,
  appendInspirationList,
  setInspirationFragmentList,
  removeFromInspirationList,
  removeFromInspirationFragmentList
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

export const initializeDatasetFilter = datasetID => (dispatch, getState) => {
  const initFilterSettings = getInitialDatasetFilterSettings(getState(), datasetID);
  const initFilterProperties = getInitialDatasetFilterProperties(getState(), datasetID);

  dispatch(setFilterSettings(datasetID, initFilterSettings));
  dispatch(setFilterProperties(datasetID, initFilterProperties));
};

export const addDatasetHitProtein = (stage, data, colourToggle, datasetID) => dispatch => {
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

export const removeDatasetHitProtein = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateHitProteinObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromProteinList(datasetID, generateMoleculeId(data)));
};

export const addDatasetComplex = (stage, data, colourToggle, datasetID) => dispatch => {
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

export const removeDatasetComplex = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromComplexList(datasetID, generateMoleculeId(data)));
};

export const addDatasetSurface = (stage, data, colourToggle, datasetID) => dispatch => {
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

export const removeDatasetSurface = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateSurfaceObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromSurfaceList(datasetID, generateMoleculeId(data)));
};

export const addDatasetLigand = (stage, data, colourToggle, datasetID) => dispatch => {
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

export const removeDatasetLigand = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data)), stage));
  dispatch(removeFromLigandList(datasetID, generateMoleculeId(data)));
};

export const loadDataSets = () => dispatch =>
  api({ url: `${base_url}/api/compound-sets/` }).then(response => {
    dispatch(
      setDataset(
        response.data.results.map(ds => ({
          id: ds.id,
          title: ds.name,
          url: ds.method_url,
          version: ds.spec_version,
          submitted_sdf: ds.submitted_sdf
        }))
      )
    );
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
    const selectedProperty = scoreDatasetMap.find(item => item.id === scoreID);
    filteredScorePropertiesOfDataset.push(selectedProperty);
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

export const loadInspirationMoleculesDataList = (inspirationList = []) => (dispatch, getState) => {
  if (inspirationList && inspirationList.length > 0) {
    dispatch(setIsLoadingInspirationListOfMolecules(true));
    const arrayOfInspirationListSet = [...new Set(inspirationList)];
    dispatch(setInspirationMoleculeDataList([]));

    return Promise.all(
      arrayOfInspirationListSet.map(moleculeID =>
        api({ url: `${base_url}/api/molecules/${moleculeID}/` }).then(response => {
          dispatch(appendToInspirationMoleculeDataList(response.data));
        })
      )
    ).finally(() => {
      dispatch(setIsLoadingInspirationListOfMolecules(false));
    });
  }
  return Promise.resolve();
};

export const clearInspirationsOfDataset = datasetID => dispatch => {
  // clear inspirations
  dispatch(setInspirationList(datasetID, []));
  dispatch(setInspirationMoleculeDataList([]));
  dispatch(setIsOpenInspirationDialog(false));
};

export const clearDatasetSettings = datasetID => dispatch => {
  if (datasetID) {
    dispatch(clearScoreCompoundMap());

    // clear inspirations
    dispatch(clearInspirationsOfDataset(datasetID));
  }
};

export const clickOnInspirations = (datasetID, currentID, inspiration_frags) => (dispatch, getState) => {
  const inspirationLists = getState().datasetsReducers.inspirationLists[datasetID];
  const isInspirationOn = (currentID && inspirationLists.includes(currentID)) || false;

  if (isInspirationOn === false) {
    dispatch(setInspirationList(datasetID, [currentID]));
    if (inspiration_frags) {
      dispatch(setInspirationFragmentList(inspiration_frags));
    }
    dispatch(setIsOpenInspirationDialog(true));
  } else {
    dispatch(removeFromInspirationList(datasetID, currentID));
    if (inspiration_frags) {
      inspiration_frags.forEach(item => {
        dispatch(removeFromInspirationFragmentList(item));
      });
    }
    dispatch(setIsOpenInspirationDialog(false));
  }
};
