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
  setInspirationFragmentList,
  setIsOpenCrossReferenceDialog,
  setCrossReferenceCompoundName,
  setIsLoadingCrossReferenceScores,
  setSearchStringOfCompoundSet
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
import { colourList } from '../../preview/molecule/moleculeView';

export const initializeDatasetFilter = datasetID => (dispatch, getState) => {
  const initFilterSettings = getInitialDatasetFilterSettings(getState(), datasetID);
  const initFilterProperties = getInitialDatasetFilterProperties(getState(), datasetID);

  dispatch(setFilterSettings(datasetID, initFilterSettings));
  dispatch(setFilterProperties(datasetID, initFilterProperties));
};

export const addDatasetHitProtein = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateHitProteinObject(data, colourToggle, base_url)),
      stage,
      orientationMatrix: null
    })
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
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url)),
      stage,
      orientationMatrix: null
    })
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
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateSurfaceObject(data, colourToggle, base_url)),
      stage,
      orientationMatrix: null
    })
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
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data, colourToggle)),
      stage,
      markAsRightSideLigand: true
    })
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
          id: ds.name,
          title: ds.unique_name,
          url: ds.method_url,
          version: ds.spec_version,
          submitted_sdf: ds.submitted_sdf
        }))
      )
    );
    return response?.data?.results;
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
  // clear search
  dispatch(setSearchStringOfCompoundSet(null));
};

export const clickOnInspirations = ({ datasetID, currentID, computed_inspirations = [] }) => dispatch => {
  dispatch(setInspirationList(datasetID, [currentID]));
  dispatch(setInspirationFragmentList(computed_inspirations));
  dispatch(setIsOpenInspirationDialog(true));
};

export const resetCrossReferenceDialog = () => dispatch => {
  dispatch(setIsOpenCrossReferenceDialog(false));
  dispatch(setCrossReferenceCompoundName(null));
  dispatch(setIsLoadingCrossReferenceScores(false));
};

export const loadScoresOfCrossReferenceCompounds = (datasetIDList = []) => (dispatch, getState) => {
  dispatch(setIsLoadingCrossReferenceScores(true));
  Promise.all(datasetIDList.map(datasetID => dispatch(loadCompoundScoresListOfDataSet(datasetID)))).finally(() =>
    dispatch(setIsLoadingCrossReferenceScores(false))
  );
};

const addAllLigandsFromList = (moleculeList = [], stage) => dispatch => {
  moleculeList.forEach(molecule => {
    dispatch(
      addDatasetLigand(
        stage,
        molecule.molecule,
        colourList[molecule.molecule.id % colourList.length],
        molecule.datasetID
      )
    );
  });
};

const removeAllLigandsFromList = (moleculeList = [], stage) => dispatch => {
  moleculeList.forEach(molecule => {
    dispatch(
      addDatasetLigand(
        stage,
        molecule.molecule,
        colourList[molecule.molecule.id % colourList.length],
        molecule.datasetID
      )
    );
  });
};

export const handleAllLigandsOfCrossReferenceDialog = (areAllSelected, moleculeList = [], stage) => dispatch => {
  if (areAllSelected) {
    dispatch(removeAllLigandsFromList(moleculeList, stage));
  } else {
    dispatch(addAllLigandsFromList(moleculeList, stage));
  }
};

const addAllHitProteins = (moleculeList = [], stage) => dispatch => {
  moleculeList.forEach(molecule => {
    dispatch(
      addDatasetHitProtein(
        stage,
        molecule.molecule,
        colourList[molecule.molecule.id % colourList.length],
        molecule.datasetID
      )
    );
  });
};
const removeAllHitProteins = (moleculeList = [], stage) => dispatch => {
  moleculeList.forEach(molecule => {
    dispatch(
      removeDatasetHitProtein(
        stage,
        molecule.molecule,
        colourList[molecule.molecule.id % colourList.length],
        molecule.datasetID
      )
    );
  });
};

export const removeOrAddAllHitProteinsOfList = (areAllSelected, moleculeList = [], stage) => dispatch => {
  if (areAllSelected) {
    dispatch(removeAllHitProteins(moleculeList, stage));
  } else {
    dispatch(addAllHitProteins(moleculeList, stage));
  }
};

const addAllComplexes = (moleculeList = [], stage) => dispatch => {
  moleculeList.forEach(molecule => {
    dispatch(
      addDatasetComplex(
        stage,
        molecule.molecule,
        colourList[molecule.molecule.id % colourList.length],
        molecule.datasetID
      )
    );
  });
};

const removeAllComplexes = (moleculeList = [], stage) => dispatch => {
  moleculeList.forEach(molecule => {
    dispatch(
      removeDatasetComplex(
        stage,
        molecule.molecule,
        colourList[molecule.molecule.id % colourList.length],
        molecule.datasetID
      )
    );
  });
};

export const removeOrAddAllComplexesOfList = (areAllSelected, moleculeList = [], stage) => dispatch => {
  if (areAllSelected) {
    dispatch(removeAllComplexes(moleculeList, stage));
  } else {
    dispatch(addAllComplexes(moleculeList, stage));
  }
};

export const autoHideDatasetDialogsOnScroll = ({ inspirationDialogRef, crossReferenceDialogRef, scrollBarRef }) => (
  dispatch,
  getState
) => {
  const state = getState();
  const isOpenInspirationDialog = state.datasetsReducers.isOpenInspirationDialog;
  const isOpenCrossReferenceDialog = state.datasetsReducers.isOpenCrossReferenceDialog;

  const currentBoundingClientRectInspiration =
    (inspirationDialogRef.current && inspirationDialogRef.current.getBoundingClientRect()) || null;

  const currentBoundingClientRectCrossReference =
    (crossReferenceDialogRef.current && crossReferenceDialogRef.current.getBoundingClientRect()) || null;
  const scrollBarBoundingClientRect = (scrollBarRef.current && scrollBarRef.current.getBoundingClientRect()) || null;

  if (
    isOpenInspirationDialog &&
    currentBoundingClientRectInspiration !== null &&
    scrollBarBoundingClientRect !== null &&
    currentBoundingClientRectInspiration.x !== 0 &&
    currentBoundingClientRectInspiration.y !== 0
  ) {
    if (
      currentBoundingClientRectInspiration.top < scrollBarBoundingClientRect.top ||
      Math.abs(scrollBarBoundingClientRect.bottom - currentBoundingClientRectInspiration.top) < 42
    ) {
      dispatch(setIsOpenInspirationDialog(false));
    }
  }
  if (
    isOpenCrossReferenceDialog &&
    currentBoundingClientRectCrossReference !== null &&
    scrollBarBoundingClientRect !== null &&
    currentBoundingClientRectCrossReference.x !== 0 &&
    currentBoundingClientRectCrossReference.y !== 0
  ) {
    if (
      currentBoundingClientRectCrossReference.top < scrollBarBoundingClientRect.top ||
      Math.abs(scrollBarBoundingClientRect.bottom - currentBoundingClientRectCrossReference.top) < 42
    ) {
      dispatch(resetCrossReferenceDialog());
    }
  }
};
