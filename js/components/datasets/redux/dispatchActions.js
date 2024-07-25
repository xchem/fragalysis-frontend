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
  addDataset,
  appendToScoreDatasetMap,
  appendToScoreCompoundMapByScoreCategory,
  updateFilterShowedScoreProperties,
  setFilterShowedScoreProperties,
  setFilterProperties,
  setIsLoadingInspirationListOfMolecules,
  appendToInspirationMoleculeDataList,
  appendToAllInspirationMoleculeDataList,
  setInspirationMoleculeDataList,
  setAllInspirationMoleculeDataList,
  setInspirationList,
  setIsOpenInspirationDialog,
  clearScoreCompoundMap,
  setIsOpenCrossReferenceDialog,
  setCrossReferenceCompoundName,
  setIsLoadingCrossReferenceScores,
  setSearchStringOfCompoundSet,
  dragDropStarted,
  setDragDropState,
  dragDropFinished,
  disableDatasetMoleculeNglControlButton,
  enableDatasetMoleculeNglControlButton,
  setArrowUpDown,
  removeDataset,
  appendCompoundToSelectedCompoundsByDataset,
  setDatasetIterator,
  setSelectedCompoundsIterator
} from './actions';
import { base_url } from '../../routes/constants';
import {
  generateMoleculeCompoundId,
  generateHitProteinObject,
  generateComplexObject,
  generateSurfaceObject,
  generateMoleculeObject
} from '../../nglView/generatingObjects';
import { VIEWS } from '../../../constants/constants';
import { addMoleculeList } from './actions';
import { api, METHOD } from '../../../utils/api';
import {
  getInitialDatasetFilterProperties,
  getInitialDatasetFilterSettings,
  getJoinedMoleculeLists
} from './selectors';
import { COUNT_OF_VISIBLE_SCORES, DEFAULT_COUNT_OF_VISIBLE_SCORES } from './constants';
import { colourList } from '../../preview/molecule/utils/color';
import { appendMoleculeOrientation } from '../../../reducers/ngl/actions';
import { isAnyInspirationTurnedOnByType } from './selectors';
import {
  addVector,
  addHitProtein,
  addComplex,
  addSurface,
  addQuality,
  addLigand,
  addDensity,
  addDensityCustomView,
  hideAllSelectedMolecules,
  removeHitProtein,
  removeComplex,
  removeSurface
} from '../../preview/molecule/redux/dispatchActions';
import { OBJECT_TYPE } from '../../nglView/constants';
import { getRepresentationsByType } from '../../nglView/generatingObjects';
import { selectAllMoleculeList } from '../../preview/molecule/redux/selectors';
import { getCompoundById } from '../../../reducers/tracking/dispatchActionsSwitchSnapshot';
import { getRandomColor } from '../../preview/molecule/utils/color';
import { BreakfastDiningOutlined } from '@mui/icons-material';
import { isCompoundFromVectorSelector } from '../../preview/compounds/redux/dispatchActions';

export const initializeDatasetFilter = datasetID => (dispatch, getState) => {
  const state = getState();

  const filterSettings = state.datasetsReducers.filterDatasetMap[datasetID];
  const filterProperties = state.datasetsReducers.filterPropertiesDatasetMap[datasetID];

  const initFilterSettings = getInitialDatasetFilterSettings(getState(), datasetID);
  const initFilterProperties = getInitialDatasetFilterProperties(getState(), datasetID);

  if (!filterSettings) {
    dispatch(setFilterSettings(datasetID, initFilterSettings));
  }
  if (!filterProperties) {
    dispatch(setFilterProperties(datasetID, initFilterProperties));
  }
};

export const addDatasetHitProtein = (
  stage,
  data,
  colourToggle,
  datasetID,
  skipTracking = false,
  representations = undefined
) => async dispatch => {
  dispatch(appendProteinList(datasetID, generateMoleculeCompoundId(data), skipTracking));
  return dispatch(
    loadObject({
      target: Object.assign(
        { display_div: VIEWS.MAJOR_VIEW },
        generateHitProteinObject(data, colourToggle, base_url, datasetID)
      ),
      stage,
      previousRepresentations: representations,
      orientationMatrix: null
    })
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
};

export const removeDatasetHitProtein = (stage, data, colourToggle, datasetID, skipTracking = false) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign(
        { display_div: VIEWS.MAJOR_VIEW },
        generateHitProteinObject(data, colourToggle, base_url, datasetID)
      ),
      stage
    )
  );
  dispatch(removeFromProteinList(datasetID, generateMoleculeCompoundId(data), skipTracking));
};

export const addDatasetComplex = (
  stage,
  data,
  colourToggle,
  datasetID,
  skipTracking = false,
  representations = undefined
) => async dispatch => {
  dispatch(appendComplexList(datasetID, generateMoleculeCompoundId(data), skipTracking));
  return dispatch(
    loadObject({
      target: Object.assign(
        { display_div: VIEWS.MAJOR_VIEW },
        generateComplexObject(data, colourToggle, base_url, datasetID)
      ),
      stage,
      previousRepresentations: representations,
      orientationMatrix: null
    })
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
};

export const removeDatasetComplex = (stage, data, colourToggle, datasetID, skipTracking = false) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url, datasetID)),
      stage
    )
  );
  dispatch(removeFromComplexList(datasetID, generateMoleculeCompoundId(data), skipTracking));
};

export const addDatasetSurface = (
  stage,
  data,
  colourToggle,
  datasetID,
  representations = undefined
) => async dispatch => {
  dispatch(appendSurfaceList(datasetID, generateMoleculeCompoundId(data)));
  return dispatch(
    loadObject({
      target: Object.assign(
        { display_div: VIEWS.MAJOR_VIEW },
        generateSurfaceObject(data, colourToggle, base_url, datasetID)
      ),
      stage,
      previousRepresentations: representations,
      orientationMatrix: null
    })
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
};

export const removeDatasetSurface = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateSurfaceObject(data, colourToggle, base_url, datasetID)),
      stage
    )
  );
  dispatch(removeFromSurfaceList(datasetID, generateMoleculeCompoundId(data)));
};

export const addDatasetLigand = (
  stage,
  data,
  colourToggle,
  datasetID,
  skipTracking = false,
  representations = undefined
) => async (dispatch, getState) => {
  dispatch(appendLigandList(datasetID, generateMoleculeCompoundId(data), skipTracking));
  console.count(`Grabbed orientation before loading dataset ligand`);
  const currentOrientation = stage.viewerControls.getOrientation();
  return dispatch(
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data, colourToggle, datasetID)),
      stage,
      previousRepresentations: representations,
      markAsRightSideLigand: true
    })
  ).finally(() => {
    const state = getState();
    const skipOrientation = state.trackingReducers.skipOrientationChange;
    if (!skipOrientation) {
      const ligandOrientation = stage.viewerControls.getOrientation();
      dispatch(setOrientation(VIEWS.MAJOR_VIEW, ligandOrientation));

      dispatch(appendMoleculeOrientation(getDatasetMoleculeID(datasetID, data?.id), ligandOrientation));

      // keep current orientation of NGL View
      if (!skipOrientation) {
        console.count(`Before applying orientation after loading dataset ligand.`);
        stage.viewerControls.orient(currentOrientation);
        console.count(`After applying orientation after loading dataset ligand.`);
      }
    }
  });
};

export const removeDatasetLigand = (stage, data, colourToggle, datasetID, skipTracking = false) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data, undefined, datasetID)),
      stage
    )
  );
  dispatch(removeFromLigandList(datasetID, generateMoleculeCompoundId(data), skipTracking));
};

export const loadDataSets = targetId => async dispatch => {
  console.log('loadDataSets');
  return api({ url: `${base_url}/api/compound-sets/?target=${targetId}` }).then(response => {
    console.log('loadDataSets - data received');
    dispatch(
      setDataset(
        response.data.results.map(ds => ({
          id: ds.name,
          title: ds.name, // previously unique_name ($submitter-$method format)
          url: ds.method_url,
          version: ds.spec_version,
          submitted_sdf: ds.submitted_sdf
        }))
      )
    );
    return response?.data?.results;
  });
};

export const loadNewDataSets = targetId => async (dispatch, getState) => {
  return api({ url: `${base_url}/api/compound-sets/?target=${targetId}` }).then(response => {
    const state = getState();
    const currentDatasets = state.datasetsReducers.datasets;
    const addedDatasets = [];
    response.data.results.forEach(ds => {
      const found = currentDatasets.find(cs => cs.id === ds.name);
      if (!found) {
        const dataset = {
          id: ds.name,
          title: ds.name, // previously unique_name ($submitter-$method format)
          url: ds.method_url,
          version: ds.spec_version,
          submitted_sdf: ds.submitted_sdf
        };
        addedDatasets.push(dataset);
        dispatch(addDataset(dataset));
      }
    });
    return addedDatasets;
  });
};

export const loadDatasetCompoundsWithScores = (datasetsToLoad = null) => (dispatch, getState) => {
  const datasets = datasetsToLoad ? datasetsToLoad : getState().datasetsReducers.datasets;
  return Promise.all(
    datasets.map(dataset =>
      // Hint for develop purposes add param &limit=20
      api({ url: `${base_url}/api/compound-mols-scores/?computed_set=${dataset.id}` })
        .then(async response => {
          // -----> add 'site_observation_code' to molecules whereas '/compound-molecules' has more molecule info so far, can be removed later
          const compondMolecules = await api({ url: `${base_url}/api/compound-molecules/?compound_set=${dataset.id}` });
          const compondMoleculesMap = {};
          compondMolecules.data.results.forEach(
            molecule =>
              (compondMoleculesMap[molecule.name] = {
                site_observation_code: molecule.site_observation_code,
                pdb_info: molecule.pdb_info
              })
          );
          response.data.results.forEach(molecule => {
            if (compondMoleculesMap.hasOwnProperty(molecule.name)) {
              molecule['site_observation_code'] = compondMoleculesMap[molecule.name].site_observation_code;
              molecule['pdb_info'] = compondMoleculesMap[molecule.name].pdb_info;
              molecule['isCustomPdb'] = !!!compondMoleculesMap[molecule.name].site_observation_code;
            }
          });
          // <-----
          dispatch(
            addMoleculeList(
              dataset.id,
              response.data.results.sort((a, b) => a.id - b.id)
            )
          );

          return api({ url: `${base_url}/api/compound-scores/?computed_set=${dataset.id}` }).then(res => {
            if (res && res.data && res.data.results && res.data.results.length > 0) {
              const scores = res?.data?.results;
              let lastScore = scores.reduce((a, b) => ({ id: Math.max(a.id, b.id), name: '', description: '' }));
              scores.unshift({ id: lastScore.id + 1, name: '_id', description: 'id of the compound' });
              dispatch(
                updateFilterShowedScoreProperties({
                  datasetID: dataset.id,
                  scoreList: scores?.slice(0, DEFAULT_COUNT_OF_VISIBLE_SCORES)
                })
              );
              scores?.map(item => {
                dispatch(appendToScoreDatasetMap(dataset.id, item));
              });
            }
          });
        })
        .catch(err => {
          console.log(`failed to load compounds for ${dataset}`, err);
        })
    )
  );
};

export const loadNewDatasetsAndCompounds = targetId => async (dispatch, getState) => {
  const newDatasets = await dispatch(loadNewDataSets(targetId));
  console.log(newDatasets);
  dispatch(loadDatasetCompoundsWithScores(newDatasets));
};

export const loadDatasetsAndCompounds = targetId => async dispatch => {
  await dispatch(loadDataSets(targetId));
  dispatch(loadDatasetCompoundsWithScores());
};

export const loadMoleculesOfDataSet = datasetID => dispatch =>
  // TODO: remove limit
  api({ url: `${base_url}/api/compound-molecules/?compound_set=${datasetID}` })
    .then(response => {
      dispatch(addMoleculeList(datasetID, response.data.results));
      return Promise.all(
        response?.data?.results?.map(compoundMolecule => {
          return Promise.all([
            dispatch(loadCompoundNumericalScoreList(compoundMolecule?.compound, datasetID)),
            dispatch(loadCompoundTextScoreList(compoundMolecule?.compound, datasetID))
          ]);
        })
      );
    })
    .catch(err => {
      console.log(`failed to load compounds for ${datasetID}`, err);
    });

// TODO: remove this method loadCompoundScoresListOfDataSet
// export const loadCompoundScoresListOfDataSet = datasetID => dispatch =>
//   api({ url: `${base_url}/api/compound-scores/?compound_set=${datasetID}` }).then(response => {
//     debugger;
//     dispatch(appendToScoreDatasetMap(datasetID, response.data.results));
//     dispatch(
//       updateFilterShowedScoreProperties({
//         datasetID,
//         scoreList: (response.data.results || []).slice(0, COUNT_OF_VISIBLE_SCORES)
//       })
//     );
//     return Promise.all([
//       ...response?.data?.results?.map(score => dispatch(loadNumericalScoreListByScoreID(score.id))),
//       ...response?.data?.results?.map(score => dispatch(loadTextScoreListByScoreID(score.id)))
//     ]);
//   });

export const loadCompoundNumericalScoreList = (compoundID, datasetID) => (dispatch, getState) =>
  api({ url: `${base_url}/api/numerical-scores/?compound=${compoundID}` }).then(response => {
    const scores = response?.data?.results;
    dispatch(appendToScoreCompoundMapByScoreCategory(scores));
    const filteredScoreProperties = getState().datasetsReducers.filteredScoreProperties;
    let scoreSet = new Set();
    if (filteredScoreProperties && Array.isArray(filteredScoreProperties)) {
      filteredScoreProperties.forEach(item => scoreSet.add(item));
    }
    scores.map(item => {
      dispatch(appendToScoreDatasetMap(datasetID, item.score));
      scoreSet.add(item.score);
    });

    dispatch(
      updateFilterShowedScoreProperties({
        datasetID,
        scoreList: [...scoreSet].slice(0, DEFAULT_COUNT_OF_VISIBLE_SCORES)
      })
    );
  });
export const loadCompoundTextScoreList = (compoundID, datasetID) => (dispatch, getState) =>
  api({ url: `${base_url}/api/text-scores/?compound=${compoundID}` }).then(response => {
    const scores = response?.data?.results;
    dispatch(appendToScoreCompoundMapByScoreCategory(scores));
    const filteredScoreProperties = getState().datasetsReducers.filteredScoreProperties;
    let scoreSet = new Set();
    if (filteredScoreProperties && Array.isArray(filteredScoreProperties)) {
      filteredScoreProperties.forEach(item => scoreSet.add(item));
    }
    scores.map(item => {
      dispatch(appendToScoreDatasetMap(datasetID, item.score));
      scoreSet.add(item.score);
    });

    dispatch(
      updateFilterShowedScoreProperties({
        datasetID,
        scoreList: [...scoreSet].slice(0, DEFAULT_COUNT_OF_VISIBLE_SCORES)
      })
    );
  });
//
// export const loadNumericalScoreListByScoreID = (scoreID, onCancel) => (dispatch, getState) =>
//   api({ url: `${base_url}/api/numerical-scores/?score=${scoreID}`, cancel: onCancel }).then(response => {
//     dispatch(appendToScoreCompoundMapByScoreCategory(response.data.results));
//   });
//
// export const loadTextScoreListByScoreID = (scoreID, onCancel) => (dispatch, getState) =>
//   api({ url: `${base_url}/api/text-scores/?score=${scoreID}`, cancel: onCancel }).then(response => {
//     dispatch(appendToScoreCompoundMapByScoreCategory(response.data.results));
//   });

export const selectScoreProperty = ({ isChecked, datasetID, scoreName }) => (dispatch, getState) => {
  const state = getState();
  const filteredScorePropertiesOfDataset = state.datasetsReducers.filteredScoreProperties[datasetID];
  const scoreDatasetMap = state.datasetsReducers.scoreDatasetMap[datasetID];
  let scoreList = [];
  let oldScoreList = [...filteredScorePropertiesOfDataset];

  if (isChecked === true) {
    if (filteredScorePropertiesOfDataset.length === COUNT_OF_VISIBLE_SCORES) {
      // 1. unselect first
      filteredScorePropertiesOfDataset.shift();
    }
    // 2. select new property
    const selectedProperty = scoreDatasetMap[scoreName];
    filteredScorePropertiesOfDataset.push(selectedProperty);
    scoreList = filteredScorePropertiesOfDataset;
    dispatch(
      updateFilterShowedScoreProperties({
        datasetID,
        scoreList: filteredScorePropertiesOfDataset
      })
    );
  } else {
    scoreList = filteredScorePropertiesOfDataset.filter(item => item.name !== scoreName);
    dispatch(
      updateFilterShowedScoreProperties({
        datasetID,
        scoreList: filteredScorePropertiesOfDataset.filter(item => item.name !== scoreName)
      })
    );
  }

  dispatch(setFilterShowedScoreProperties({ datasetID, scoreList, oldScoreList, isChecked, scoreName }));
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
          dispatch(appendToAllInspirationMoleculeDataList(response.data));
        })
      )
    ).finally(() => {
      dispatch(setIsLoadingInspirationListOfMolecules(false));
    });
  }
  return Promise.resolve();
};

export const clearAllInspirationsOfDataset = () => dispatch => {
  // clear inspirations
  dispatch(setAllInspirationMoleculeDataList([]));
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
  dispatch(setSearchStringOfCompoundSet(null, null, true));
};

export const clickOnInspirations = ({ datasetID, currentID, computed_inspirations = [] }) => dispatch => {
  dispatch(setInspirationList(datasetID, [currentID]));
  dispatch(setInspirationMoleculeDataList(computed_inspirations));
  dispatch(setIsOpenInspirationDialog(true));
};

export const resetCrossReferenceDialog = () => dispatch => {
  dispatch(setIsOpenCrossReferenceDialog(false));
  dispatch(setCrossReferenceCompoundName(null));
  dispatch(setIsLoadingCrossReferenceScores(false));
};

export const loadScoresOfCrossReferenceCompounds = (datasetIDList = []) => (dispatch, getState) => {
  // TODO: fix
  // dispatch(setIsLoadingCrossReferenceScores(true));
  // Promise.all(datasetIDList.map(datasetID => dispatch(loadCompoundScoresListOfDataSet(datasetID)))).finally(() =>
  //   dispatch(setIsLoadingCrossReferenceScores(false))
  // );
};

export const autoHideDatasetDialogsOnScroll = ({ inspirationDialogRef, crossReferenceDialogRef, scrollBarRef }) => (
  dispatch,
  getState
) => {
  const state = getState();
  const isOpenInspirationDialog = state.datasetsReducers.isOpenInspirationDialog;
  const isOpenCrossReferenceDialog = state.datasetsReducers.isOpenCrossReferenceDialog;
  const isActionRestoring = state.trackingReducers.isActionRestoring;

  const currentBoundingClientRectInspiration =
    (inspirationDialogRef.current && inspirationDialogRef.current.getBoundingClientRect()) || null;

  const currentBoundingClientRectCrossReference =
    (crossReferenceDialogRef.current && crossReferenceDialogRef.current.getBoundingClientRect()) || null;
  const scrollBarBoundingClientRect = (scrollBarRef.current && scrollBarRef.current.getBoundingClientRect()) || null;

  if (
    !isActionRestoring &&
    isOpenInspirationDialog &&
    currentBoundingClientRectInspiration !== null &&
    scrollBarBoundingClientRect !== null &&
    currentBoundingClientRectInspiration.x !== 0 &&
    currentBoundingClientRectInspiration.y !== 0
  ) {
    if (
      Math.round(currentBoundingClientRectInspiration.top) < Math.round(scrollBarBoundingClientRect.top) ||
      Math.abs(scrollBarBoundingClientRect.bottom - currentBoundingClientRectInspiration.top) < 42
    ) {
      // dispatch(setIsOpenInspirationDialog(false));
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
      Math.round(currentBoundingClientRectCrossReference.top) < Math.round(scrollBarBoundingClientRect.top) ||
      Math.abs(scrollBarBoundingClientRect.bottom - currentBoundingClientRectCrossReference.top) < 42
    ) {
      dispatch(resetCrossReferenceDialog());
    }
  }
};

export const getObservationForLHSReference = rhsCompound => (dispatch, getState) => {
  let result = null;

  if (!rhsCompound?.isCustomPdb && rhsCompound.site_observation_code) {
    const state = getState();
    const allLHSMols = state.apiReducers.all_mol_lists;
    result = allLHSMols.find(mol => mol.code === rhsCompound.site_observation_code);
  }

  return result;
};

export const getRHSCmpReferencingLHSObservation = (obsId, obsReferenceToSkip = null) => (dispatch, getState) => {
  let result = { obs: null, cmp: null };

  const state = getState();
  const lhsObservations = state.apiReducers.all_mol_lists;
  const obs = lhsObservations.find(mol => mol.id === obsId);

  if (obs?.code !== obsReferenceToSkip) {
    const currentMolecules = state.datasetsReducers.moleculeLists;
    const datasetIds = Object.keys(currentMolecules);
    for (let i = 0; i < datasetIds.length; i++) {
      const datasetID = datasetIds[i];
      const molecules = currentMolecules[datasetID];
      const found = molecules.find(mol => mol.site_observation_code === obs.code);
      if (found) {
        result = { obs: obs, cmp: found };
        break;
      }
    }
  }

  return result;
};

export const clearCompoundView = (cmp, datasetID, stage, skipTracking) => (dispatch, getState) => {
  const state = getState();

  let dataToUse = null;

  let ligandList = state.datasetsReducers.ligandLists[datasetID];
  let proteinList = [];
  let complexList = [];
  let surfaceList = [];

  if (cmp.isCustomPdb) {
    dataToUse = cmp;

    proteinList = state.datasetsReducers.proteinLists[datasetID];
    complexList = state.datasetsReducers.complexLists[datasetID];
    surfaceList = state.datasetsReducers.surfaceLists[datasetID];
  } else {
    dataToUse = dispatch(getObservationForLHSReference(cmp));

    proteinList = state.selectionReducers.proteinList;
    complexList = state.selectionReducers.complexList;
    surfaceList = state.selectionReducers.surfaceList;
  }

  if (ligandList?.includes(dataToUse.id)) {
    dispatch(removeDatasetLigand(stage, cmp, getRandomColor(cmp), datasetID, skipTracking));
  }

  if (proteinList?.includes(dataToUse.id)) {
    if (dataToUse.isCustomPdb) {
      dispatch(removeDatasetHitProtein(stage, cmp, getRandomColor(cmp), datasetID, skipTracking));
    } else {
      dispatch(removeHitProtein(stage, dataToUse, getRandomColor(cmp), skipTracking));
    }
  }

  if (complexList?.includes(dataToUse.id)) {
    if (dataToUse.isCustomPdb) {
      dispatch(removeDatasetComplex(stage, cmp, getRandomColor(cmp), datasetID, skipTracking));
    } else {
      dispatch(removeComplex(stage, dataToUse, getRandomColor(cmp), skipTracking));
    }
  }

  if (surfaceList?.includes(dataToUse.id)) {
    if (dataToUse.isCustomPdb) {
      dispatch(removeDatasetSurface(stage, cmp, getRandomColor(cmp), datasetID, skipTracking));
    } else {
      dispatch(removeSurface(stage, dataToUse, getRandomColor(cmp)));
    }
  }
};

export const removeSelectedDatasetMolecules = (stage, skipTracking, currentCmp = null, skipMolecules = {}) => (
  dispatch,
  getState
) => {
  const state = getState();
  const datasets = state.datasetsReducers.datasets;
  const currentMolecules = state.datasetsReducers.moleculeLists;
  if (datasets) {
    let proteinList = [];
    let complexList = [];
    let surfaceList = [];
    datasets.forEach(dataset => {
      const datasetID = dataset.id;
      const ligandList = state.datasetsReducers.ligandLists[datasetID];
      proteinList = state.datasetsReducers.proteinLists[datasetID];
      complexList = state.datasetsReducers.complexLists[datasetID];
      surfaceList = state.datasetsReducers.surfaceLists[datasetID];

      const molecules = currentMolecules[datasetID].filter(molecule => {
        return !skipMolecules[datasetID]?.includes(molecule.id);
      });

      ligandList?.forEach(moleculeID => {
        const foundedMolecule = molecules?.find(mol => mol.id === moleculeID);
        if (foundedMolecule) {
          dispatch(
            removeDatasetLigand(stage, foundedMolecule, getRandomColor(foundedMolecule), datasetID, skipTracking)
          );
        }
      });
      proteinList?.forEach(moleculeID => {
        const foundedMolecule = molecules?.find(mol => mol.id === moleculeID);
        if (foundedMolecule) {
          dispatch(
            removeDatasetHitProtein(stage, foundedMolecule, getRandomColor(foundedMolecule), datasetID, skipTracking)
          );
        }
      });
      complexList?.forEach(moleculeID => {
        const foundedMolecule = molecules?.find(mol => mol.id === moleculeID);
        if (foundedMolecule) {
          dispatch(
            removeDatasetComplex(stage, foundedMolecule, getRandomColor(foundedMolecule), datasetID, skipTracking)
          );
        }
      });
      surfaceList?.forEach(moleculeID => {
        const foundedMolecule = molecules?.find(mol => mol.id === moleculeID);
        if (foundedMolecule) {
          dispatch(
            removeDatasetSurface(stage, foundedMolecule, getRandomColor(foundedMolecule), datasetID, skipTracking)
          );
        }
      });
    });

    proteinList = state.selectionReducers.proteinList;
    complexList = state.selectionReducers.complexList;
    surfaceList = state.selectionReducers.surfaceList;

    const obsReferenceToSkip = currentCmp ? currentCmp.site_observation_code : '';

    proteinList.forEach(obsId => {
      const { obs, cmp } = dispatch(getRHSCmpReferencingLHSObservation(obsId, obsReferenceToSkip));
      if (obs) {
        dispatch(removeHitProtein(stage, obs, getRandomColor(cmp), skipTracking));
      }
    });

    complexList.forEach(obsId => {
      const { obs, cmp } = dispatch(getRHSCmpReferencingLHSObservation(obsId, obsReferenceToSkip));
      if (obs) {
        dispatch(removeComplex(stage, obs, getRandomColor(cmp), skipTracking));
      }
    });

    surfaceList.forEach(obsId => {
      const { obs, cmp } = dispatch(getRHSCmpReferencingLHSObservation(obsId, obsReferenceToSkip));
      if (obs) {
        dispatch(removeSurface(stage, obs, getRandomColor(cmp)));
      }
    });
  }
};

const flattenInspirationsList = (inspirations, skipMolecules) => {
  const result = [];

  const inspirationsToSkip = [];
  skipMolecules.forEach(molecule => {
    molecule.computed_inspirations.forEach(molId => {
      if (!inspirationsToSkip.hasOwnProperty(molId)) {
        inspirationsToSkip[molId] = molId;
      }
    });
  });

  Object.keys(inspirations).forEach(molId => {
    const molecules = inspirations[molId];
    molecules.forEach(molecule => {
      if (
        !inspirationsToSkip.hasOwnProperty(molecule.id) &&
        !result.some(mol => {
          if (mol.id === molecule.id) {
            return true;
          }
        })
      ) {
        result.push(molecule);
      }
    });
  });

  return result;
};

/**
 *  * Performance optimization for datasetMoleculeView. Have a look at the comment at moveDatasetMoleculeUpDown.
 */
const removeSelectedTypesOfDatasetInspirations = (skipMolecules, stage, skipTracking, datasetID) => (
  dispatch,
  getState
) => {
  const state = getState();
  const inspirationMoleculeDataList = flattenInspirationsList(
    state.datasetsReducers.allInspirations[datasetID],
    skipMolecules
  );
  dispatch(hideAllSelectedMolecules(stage, [...inspirationMoleculeDataList], false, skipTracking));
};

/**
 *  * Performance optimization for datasetMoleculeView. Have a look at the comment at moveDatasetMoleculeUpDown.
 */
const moveSelectedDatasetMoleculeInspirationsSettings = (data, newItemData, stage, skipTracking) => (
  dispatch,
  getState
) => {
  const state = getState();

  const objectsInView = state.nglReducers.objectsInView || {};
  const proteinListMolecule = state.selectionReducers.proteinList;
  const complexListMolecule = state.selectionReducers.complexList;
  const fragmentDisplayListMolecule = state.selectionReducers.fragmentDisplayList;
  const surfaceListMolecule = state.selectionReducers.surfaceList;
  const densityListMolecule = state.selectionReducers.densityList;
  const densityListCustomMolecule = state.selectionReducers.densityListCustom;
  const vectorOnListMolecule = state.selectionReducers.vectorOnList;
  const qualityListMolecule = state.selectionReducers.qualityList;

  return dispatch(
    moveMoleculeInspirationsSettings(
      data,
      newItemData,
      stage,
      objectsInView,
      fragmentDisplayListMolecule,
      proteinListMolecule,
      complexListMolecule,
      surfaceListMolecule,
      densityListMolecule,
      densityListCustomMolecule,
      vectorOnListMolecule,
      qualityListMolecule,
      skipTracking
    )
  );
};

export const lockSelectedCompounds = (selectedCompounds, skipCmp = null) => (dispatch, getState) => {
  let filteredCompounds = [...selectedCompounds];
  if (skipCmp) {
    filteredCompounds = selectedCompounds.filter(item => {
      let result = true;
      if (item.molecule.id === skipCmp.molecule.id && item.datasetID === skipCmp.datasetID) {
        result = false;
      }
      return result;
    });
  }

  filteredCompounds?.forEach(item => {
    const datasetID = item.datasetID;
    const molecule = item.molecule;
    const moleculeID = molecule.id;
    const moleculeName = molecule.name;
    dispatch(appendCompoundToSelectedCompoundsByDataset(datasetID, moleculeID, moleculeName));
  });
};

export const lockCompounds = (datasetID, compoundsToLock, skipCmp = null) => (dispatch, getState) => {
  const state = getState();
  const compounds = state.datasetsReducers.moleculeLists[datasetID];

  let filteredCompounds = [...compoundsToLock];
  if (skipCmp) {
    filteredCompounds = compoundsToLock.filter(item => item.id !== skipCmp.id);
  }

  filteredCompounds?.forEach(compound => {
    const filteredCmps = compounds.filter(cmp => cmp.id === compound.id);
    let molName = '';
    if (filteredCmps && filteredCmps.length > 0) {
      molName = filteredCmps[0].name;
    }
    dispatch(appendCompoundToSelectedCompoundsByDataset(datasetID, compound.id, molName));
  });
};

const mergeCompoundIdsList = (compoundIdsList, subList) => {
  const result = [...compoundIdsList];
  subList.forEach(item => {
    if (!result.includes(item)) {
      result.push(item);
    }
  });
  return result;
};

export const isCompoundLocked = (datasetID, compound) => (dispatch, getState) => {
  const state = getState();
  const lockedCompounds = state.datasetsReducers.selectedCompoundsByDataset[datasetID] || [];
  return lockedCompounds.includes(compound.id);
};

export const getAllVisibleButNotLockedSelectedCompounds = (skipDatasetID = '', skipCmpId = 0) => (
  dispatch,
  getState
) => {
  let result = [];

  const state = getState();
  const selectedCompounds = state.datasetsReducers.selectedCompounds || [];

  selectedCompounds.forEach(item => {
    const datasetID = item.datasetID;
    const molecule = item.molecule;
    if (datasetID !== skipDatasetID || skipCmpId !== molecule.id) {
      const isLocked = dispatch(isCompoundLocked(datasetID, molecule));
      if (!isLocked) {
        let isVisible = dispatch(isCompoundVisible(item));

        if (isVisible) {
          result.push(item);
        }
      }
    }
  });

  return result;
};

export const isCompoundVisible = cmp => (dispatch, getState) => {
  let isVisible = false;

  const state = getState();

  const datasetID = cmp.datasetID;
  const compoundId = cmp.molecule.id;
  const isCustomPdb = cmp.molecule.isCustomPdb;

  let itemIdToUse = isCustomPdb ? cmp.molecule.id : dispatch(getObservationForLHSReference(cmp.molecule))?.id;

  isVisible |= state.datasetsReducers.ligandLists[datasetID]?.includes(compoundId);
  isVisible |= isCustomPdb
    ? state.datasetsReducers.proteinLists[datasetID]?.includes(itemIdToUse)
    : state.selectionReducers.proteinList.includes(itemIdToUse);
  isVisible |= isCustomPdb
    ? state.datasetsReducers.complexLists[datasetID]?.includes(itemIdToUse)
    : state.selectionReducers.complexList.includes(itemIdToUse);
  isVisible |= isCustomPdb
    ? state.datasetsReducers.surfaceLists[datasetID]?.includes(itemIdToUse)
    : state.selectionReducers.surfaceList.includes(itemIdToUse);

  return isVisible;
};

export const getAllVisibleButNotLockedCompounds = (datasetID, skipCmpId = 0) => (dispatch, getState) => {
  let result = [];

  const state = getState();
  // const lockedCmps = state.datasetsReducers.selectedCompoundsByDataset[datasetID] || [];
  const datasetCmps = state.datasetsReducers.moleculeLists[datasetID];

  datasetCmps.forEach(cmp => {
    if (skipCmpId !== cmp.id) {
      const isLocked = dispatch(isCompoundLocked(datasetID, cmp));
      if (!isLocked) {
        let isVisible = dispatch(isCompoundVisible({ datasetID, molecule: cmp }));

        if (isVisible) {
          result.push(cmp);
        }
      }
    }
  });

  // result = mergeCompoundIdsList(result, state.datasetsReducers.ligandLists[datasetID]);
  // result = mergeCompoundIdsList(result, state.datasetsReducers.proteinLists[datasetID]);
  // result = mergeCompoundIdsList(result, state.datasetsReducers.complexLists[datasetID]);
  // result = mergeCompoundIdsList(result, state.datasetsReducers.surfaceLists[datasetID]);

  // result = result.filter(item => !lockedCmps.includes(item));
  // if (skipCmpId) {
  //   result = result.filter(item => item !== skipCmpId);
  // }

  return result;
};

export const isDatasetCompoundLocked = (datasetID, compoundID) => (dispatch, getState) => {
  const state = getState();

  const lockedCompounds = state.datasetsReducers.selectedCompoundsByDataset[datasetID];
  const isLocked = lockedCompounds && lockedCompounds.includes(compoundID);

  return isLocked;
};

export const getFirstUnlockedCompoundAfter = (datasetID, compoundID) => (dispatch, getState) => {
  const state = getState();

  const lockedCompounds = state.datasetsReducers.selectedCompoundsByDataset[datasetID];
  const compounds = state.datasetsReducers.moleculeLists[datasetID];

  const firstUnlockedCompound = compounds.find(compound => {
    return !lockedCompounds.includes(compound.id) && compound.id > compoundID;
  });

  return firstUnlockedCompound;
};

export const getFirstUnlockedSelectedCompoundAfter = (datasetID, compoundID) => (dispatch, getState) => {
  const state = getState();

  const compounds = state.datasetsReducers.selectedCompounds;
  const currentItemIndex = compounds.findIndex(item => item.datasetID === datasetID && item.molecule.id === compoundID);

  let firstUnlockedCompound = null;
  for (let i = currentItemIndex + 1; i < compounds.length; i++) {
    const compound = compounds[i];
    if (
      !dispatch(isCompoundLocked(compound.datasetID, compound.molecule)) &&
      !isCompoundFromVectorSelector(compound.molecule)
    ) {
      firstUnlockedCompound = compound;
      break;
    } else {
      continue;
    }
  }

  return firstUnlockedCompound;
};

export const getFirstUnlockedSelectedCompoundBefore = (datasetID, compoundID) => (dispatch, getState) => {
  const state = getState();

  const compounds = state.datasetsReducers.selectedCompounds;
  const currentItemIndex = compounds.findIndex(item => item.datasetID === datasetID && item.molecule.id === compoundID);

  let firstUnlockedCompound = null;
  for (let i = currentItemIndex - 1; i >= 0; i--) {
    const compound = compounds[i];
    if (
      !dispatch(isCompoundLocked(compound.datasetID, compound.molecule)) &&
      !isCompoundFromVectorSelector(compound.molecule)
    ) {
      firstUnlockedCompound = compound;
      break;
    } else {
      continue;
    }
  }

  return firstUnlockedCompound;
};

export const getFirstUnlockedCompoundBefore = (datasetID, compoundID) => (dispatch, getState) => {
  const state = getState();

  const lockedCompounds = state.datasetsReducers.selectedCompoundsByDataset[datasetID];
  const compounds = state.datasetsReducers.moleculeLists[datasetID];

  const reversedCompounds = [...compounds].reverse();

  const firstUnlockedCompound = reversedCompounds.find(compound => {
    return !lockedCompounds.includes(compound.id) && compound.id < compoundID;
  });

  return firstUnlockedCompound;
};

export const moveSelectedDatasetMoleculeUpDown = (
  stage,
  datasetID,
  item,
  newItemDatasetID,
  newItem,
  data,
  direction
) => async (dispatch, getState) => {
  const state = getState();
  const allInspirations = state.datasetsReducers.allInspirations;
  const objectsInView = state.nglReducers.objectsInView;
  const selectedCompounds = state.datasetsReducers.selectedCompounds;
  let lockedCompounds = {};
  selectedCompounds.forEach(item => {
    if (dispatch(isCompoundLocked(item.datasetID, item.molecule))) {
      if (lockedCompounds.hasOwnProperty(item.datasetID)) {
        lockedCompounds[item.datasetID].push(item.molecule.id);
      } else {
        lockedCompounds[item.datasetID] = [item.molecule.id];
      }
    }
  });

  //also skip next item
  if (lockedCompounds.hasOwnProperty(newItemDatasetID)) {
    lockedCompounds[newItemDatasetID].push(newItem.id);
  } else {
    lockedCompounds[newItemDatasetID] = [newItem.id];
  }
  const dataValue = { ...data, objectsInView };

  // ????
  // dispatch(setArrowUpDown(datasetID, item, newItem, direction, dataValue));

  const inspirations = getInspirationsForMol(allInspirations, datasetID, newItem.id);
  dispatch(setInspirationMoleculeDataList(inspirations));
  dispatch(clearCompoundView(newItem, datasetID, stage, false));
  await Promise.all([
    dispatch(moveSelectedMoleculeSettings(stage, item, newItem, newItemDatasetID, datasetID, dataValue, false)),
    dispatch(moveSelectedDatasetMoleculeInspirationsSettings(item, newItem, stage, false))
  ]);

  dispatch(removeSelectedDatasetMolecules(stage, false, newItem, { ...lockedCompounds }));
  dispatch(removeSelectedTypesOfDatasetInspirations([newItem], stage, false, datasetID));

  dispatch(setSelectedCompoundsIterator(newItemDatasetID, newItem));
};

/**
 * Performance optimization for datasetMoleculeView. Gets objectsInView and passes it to further dispatch requests.
 * It wouldnt do anything else in moleculeView. Also this chains the above 3 methods which were before passed to
 * datasetMoleculeView. Since they were completely filled only in datasetMoleculeList, it was moved here and arrow keys
 * were disabled elsewhere where datasetMoleculeView is used.
 */
export const moveDatasetMoleculeUpDown = (stage, datasetID, item, newItemDatasetID, newItem, data, direction) => async (
  dispatch,
  getState
) => {
  const state = getState();
  const allInspirations = state.datasetsReducers.allInspirations;
  const objectsInView = state.nglReducers.objectsInView;
  let lockedCompounds = state.datasetsReducers.selectedCompoundsByDataset[datasetID] ?? [];

  const dataValue = { ...data, objectsInView };

  // dispatch(setArrowUpDown(datasetID, item, newItem, direction, dataValue));

  const inspirations = getInspirationsForMol(allInspirations, datasetID, newItem.id);
  dispatch(setInspirationMoleculeDataList(inspirations));
  dispatch(clearCompoundView(newItem, datasetID, stage, false));
  console.log('moveDatasetMoleculeUpDown - compounds cleared');
  await Promise.all([
    dispatch(moveSelectedMoleculeSettings(stage, item, newItem, newItemDatasetID, datasetID, dataValue, false)),
    dispatch(moveSelectedDatasetMoleculeInspirationsSettings(item, newItem, stage, false))
  ]);

  dispatch(
    removeSelectedDatasetMolecules(stage, false, newItem, { [newItemDatasetID]: [newItem.id, ...lockedCompounds] })
  );
  dispatch(removeSelectedTypesOfDatasetInspirations([newItem], stage, false, datasetID));

  dispatch(setDatasetIterator(newItemDatasetID, newItem));
};

export const getInspirationsForMol = (allInspirations, datasetId, molId) => {
  let inspirations = [];

  if (
    allInspirations &&
    allInspirations.hasOwnProperty(datasetId) &&
    allInspirations[datasetId].hasOwnProperty(molId)
  ) {
    inspirations = allInspirations[datasetId][molId];
  }

  return inspirations;
};

export const moveMoleculeInspirationsSettings = (
  data,
  newItemData,
  stage,
  objectsInView,
  fragmentDisplayListMolecule,
  proteinListMolecule,
  complexListMolecule,
  surfaceListMolecule,
  densityListMolecule,
  densityCustomListMolecule,
  vectorOnListMolecule,
  qualityListMolecule,
  skipTracking
) => (dispatch, getState) => {
  dispatch(clearAllInspirationsOfDataset());
  if (newItemData) {
    let computed_inspirations = (data && data.computed_inspirations) || [];
    let isAnyInspirationLigandOn = isAnyInspirationTurnedOnByType(computed_inspirations, fragmentDisplayListMolecule);
    let isAnyInspirationProteinOn = isAnyInspirationTurnedOnByType(computed_inspirations, proteinListMolecule);
    let isAnyInspirationComplexOn = isAnyInspirationTurnedOnByType(computed_inspirations, complexListMolecule);
    let isAnyInspirationSurfaceOn = isAnyInspirationTurnedOnByType(computed_inspirations, surfaceListMolecule);
    let isAnyInspirationDensityOn = isAnyInspirationTurnedOnByType(computed_inspirations, densityListMolecule);
    let isAnyInspirationDensityOnCustom = isAnyInspirationTurnedOnByType(
      computed_inspirations,
      densityCustomListMolecule
    );
    let isAnyInspirationVectorOn = isAnyInspirationTurnedOnByType(computed_inspirations, vectorOnListMolecule);
    let isAnyInspirationQualityOn = isAnyInspirationTurnedOnByType(computed_inspirations, qualityListMolecule);

    if (
      isAnyInspirationLigandOn ||
      isAnyInspirationProteinOn ||
      isAnyInspirationComplexOn ||
      isAnyInspirationSurfaceOn ||
      isAnyInspirationDensityOn ||
      isAnyInspirationDensityOnCustom ||
      isAnyInspirationVectorOn ||
      isAnyInspirationQualityOn
    ) {
      return dispatch(
        moveInspirations(
          stage,
          objectsInView,
          isAnyInspirationLigandOn,
          isAnyInspirationProteinOn,
          isAnyInspirationComplexOn,
          isAnyInspirationSurfaceOn,
          isAnyInspirationDensityOn,
          isAnyInspirationDensityOnCustom,
          isAnyInspirationVectorOn,
          isAnyInspirationQualityOn,
          skipTracking
        )
      );
    }
  }
};

const moveInspirations = (
  stage,
  objectsInView,
  isAnyInspirationLigandOn,
  isAnyInspirationProteinOn,
  isAnyInspirationComplexOn,
  isAnyInspirationSurfaceOn,
  isAnyInspirationDensityOn,
  isAnyInspirationDensityOnCustom,
  isAnyInspirationVectorOn,
  isAnyInspirationQualityOn,
  skipTracking
) => (dispatch, getState) => {
  const state = getState();
  const molecules = state.datasetsReducers.inspirationMoleculeDataList;
  const promises = [];
  if (molecules) {
    molecules.forEach(molecule => {
      if (molecule) {
        if (isAnyInspirationLigandOn) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.LIGAND);
          promises.push(
            dispatch(
              addLigand(
                stage,
                molecule,
                colourList[molecule.id % colourList.length],
                false,
                isAnyInspirationQualityOn,
                skipTracking,
                representations
              )
            )
          );
        }
        if (isAnyInspirationProteinOn) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.HIT_PROTEIN);
          promises.push(
            dispatch(
              addHitProtein(stage, molecule, colourList[molecule.id % colourList.length], skipTracking, representations)
            )
          );
        }
        if (isAnyInspirationComplexOn) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.COMPLEX);
          promises.push(
            dispatch(
              addComplex(stage, molecule, colourList[molecule.id % colourList.length], skipTracking, representations)
            )
          );
        }
        if (isAnyInspirationSurfaceOn) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.SURFACE);
          promises.push(
            dispatch(
              addSurface(stage, molecule, colourList[molecule.id % colourList.length], skipTracking, representations)
            )
          );
        }
        if (isAnyInspirationQualityOn) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.QUALITY);
          promises.push(
            dispatch(
              addQuality(stage, molecule, colourList[molecule.id % colourList.length], skipTracking, representations)
            )
          );
        }
        if (isAnyInspirationDensityOn) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.DENSITY);
          promises.push(
            dispatch(
              addDensity(
                stage,
                molecule,
                colourList[molecule.id % colourList.length],
                false,
                skipTracking,
                representations
              )
            )
          );
        }
        if (isAnyInspirationDensityOnCustom) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.DENSITY);
          promises.push(
            dispatch(
              addDensityCustomView(
                stage,
                molecule,
                colourList[molecule.id % colourList.length],
                false,
                skipTracking,
                representations
              )
            )
          );
        }
        if (isAnyInspirationVectorOn) {
          promises.push(
            dispatch(addVector(stage, molecule, colourList[molecule.id % colourList.length], skipTracking))
          );
        }
      }
    });
  }
  return Promise.all(promises);
};

export const moveSelectedInspirations = (
  stage,
  objectsInView,
  fragmentDisplayListMolecule,
  proteinListMolecule,
  complexListMolecule,
  surfaceListMolecule,
  densityListMolecule,
  densityListCustomMolecule,
  vectorOnListMolecule,
  qualityListMolecule,
  skipTracking
) => (dispatch, getState) => {
  const state = getState();
  const molecules = state.datasetsReducers.inspirationMoleculeDataList;
  if (molecules) {
    molecules.forEach(molecule => {
      if (molecule) {
        if (fragmentDisplayListMolecule.includes(molecule.id)) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.LIGAND);
          dispatch(
            addLigand(
              stage,
              molecule,
              colourList[molecule.id % colourList.length],
              false,
              true,
              skipTracking,
              representations
            )
          );
        }
        if (proteinListMolecule.includes(molecule.id)) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.HIT_PROTEIN);
          dispatch(
            addHitProtein(stage, molecule, colourList[molecule.id % colourList.length], skipTracking, representations)
          );
        }
        if (complexListMolecule.includes(molecule.id)) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.COMPLEX);
          dispatch(
            addComplex(stage, molecule, colourList[molecule.id % colourList.length], skipTracking, representations)
          );
        }
        if (surfaceListMolecule.includes(molecule.id)) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.SURFACE);
          dispatch(
            addSurface(stage, molecule, colourList[molecule.id % colourList.length], skipTracking, representations)
          );
        }
        if (qualityListMolecule.includes(molecule.id)) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.QUALITY);
          dispatch(
            addQuality(stage, molecule, colourList[molecule.id % colourList.length], skipTracking, representations)
          );
        }
        if (densityListMolecule.includes(molecule.id)) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.DENSITY);
          dispatch(
            addDensity(
              stage,
              molecule,
              colourList[molecule.id % colourList.length],
              false,
              skipTracking,
              representations
            )
          );
        }
        if (densityListCustomMolecule.includes(molecule.id)) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.DENSITY);
          dispatch(
            addDensityCustomView(
              stage,
              molecule,
              colourList[molecule.id % colourList.length],
              false,
              skipTracking,
              representations
            )
          );
        }
        if (vectorOnListMolecule.includes(molecule.id)) {
          dispatch(addVector(stage, molecule, colourList[molecule.id % colourList.length], skipTracking));
        }
      }
    });
  }
};

export const moveSelectedMoleculeSettings = (
  stage,
  item,
  newItem,
  datasetIdOfMolecule,
  datasetID,
  data,
  skipTracking
) => (dispatch, getState) => {
  const promises = [];
  if (newItem && data) {
    let customPdbData = null;
    if (!newItem.isCustomPdb) {
      customPdbData = dispatch(getObservationForLHSReference(newItem));
    }
    if (data.isLigandOn) {
      let representations = getRepresentationsByType(data.objectsInView, newItem, OBJECT_TYPE.LIGAND, datasetID);
      promises.push(
        dispatch(
          addDatasetLigand(stage, newItem, getRandomColor(newItem), datasetIdOfMolecule, skipTracking, representations)
        )
      );
    }
    if (data.isProteinOn) {
      let representations = getRepresentationsByType(data.objectsInView, newItem, OBJECT_TYPE.PROTEIN, datasetID);
      if (newItem.isCustomPdb) {
        promises.push(
          dispatch(
            addDatasetHitProtein(
              stage,
              newItem,
              getRandomColor(newItem),
              datasetIdOfMolecule,
              skipTracking,
              representations
            )
          )
        );
      } else {
        promises.push(
          dispatch(
            addHitProtein(stage, customPdbData, getRandomColor(newItem), true, skipTracking, representations, true)
          )
        );
      }
    }
    if (data.isComplexOn) {
      let representations = getRepresentationsByType(data.objectsInView, newItem, OBJECT_TYPE.COMPLEX, datasetID);
      if (newItem.isCustomPdb) {
        promises.push(
          dispatch(
            addDatasetComplex(
              stage,
              newItem,
              getRandomColor(newItem),
              datasetIdOfMolecule,
              skipTracking,
              representations
            )
          )
        );
      } else {
        promises.push(
          dispatch(addComplex(stage, customPdbData, getRandomColor(newItem), skipTracking, representations, true))
        );
      }
    }
    if (data.isSurfaceOn) {
      let representations = getRepresentationsByType(data.objectsInView, newItem, OBJECT_TYPE.SURFACE, datasetID);
      if (newItem.isCustomPdb) {
        promises.push(
          dispatch(addDatasetSurface(stage, newItem, getRandomColor(newItem), datasetIdOfMolecule, representations))
        );
      } else {
        promises.push(
          dispatch(addSurface(stage, customPdbData, getRandomColor(newItem), false, representations, true))
        );
      }
    }
  }
  return Promise.all(promises);
};

export const getDatasetMoleculeID = (datasetID, moleculeID) => `datasetID-${datasetID}_moleculeID-${moleculeID}`;

export const dragDropMoleculeStarted = (datasetID, dragIndex) => (dispatch, getState) => {
  const state = getState();
  const { dragDropStatus } = state.datasetsReducers;

  if (!dragDropStatus.inProgress) {
    dispatch(dragDropStarted(datasetID, dragIndex));
  }
};

export const dragDropMoleculeInProgress = (datasetID, moleculeList, dragIndex, hoverIndex) => (dispatch, getState) => {
  const movedMoleculeList = [...moleculeList];
  const draggedElement = movedMoleculeList[dragIndex];

  movedMoleculeList.splice(dragIndex, 1);
  movedMoleculeList.splice(hoverIndex, 0, draggedElement);

  const dragDropState = Object.fromEntries(movedMoleculeList.map((molecule, index) => [molecule.name, index]));

  dispatch(setDragDropState(datasetID, dragDropState));
};

export const dragDropMoleculeFinished = (datasetID, draggedMolecule, destinationIndex) => (dispatch, getState) => {
  const state = getState();
  const { dragDropStatus } = state.datasetsReducers;

  if (dragDropStatus.startingIndex !== destinationIndex) {
    dispatch(dragDropFinished(datasetID, draggedMolecule, destinationIndex));
  }
};

export const moveDatasetMolecule = (datasetID, dragIndex, hoverIndex) => (dispatch, getState) => {
  const joinedMoleculeLists = getJoinedMoleculeLists(datasetID, getState());
  dispatch(dragDropMoleculeInProgress(datasetID, joinedMoleculeLists, dragIndex, hoverIndex));
};

export const withDisabledDatasetMoleculeNglControlButton = (
  datasetId,
  moleculeId,
  type,
  callback
) => async dispatch => {
  dispatch(disableDatasetMoleculeNglControlButton(datasetId, moleculeId, type));
  await callback();
  dispatch(enableDatasetMoleculeNglControlButton(datasetId, moleculeId, type));
};

export const withDisabledDatasetMoleculesNglControlButtons = (
  datasetIds,
  moleculeIds,
  type,
  callback
) => async dispatch => {
  datasetIds.forEach(datasetId => {
    moleculeIds.forEach(moleculeId => {
      dispatch(disableDatasetMoleculeNglControlButton(datasetId, moleculeId, type));
    });
  });

  await callback();

  datasetIds.forEach(datasetId => {
    moleculeIds.forEach(moleculeId => {
      dispatch(enableDatasetMoleculeNglControlButton(datasetId, moleculeId, type));
    });
  });
};

/**
 * 1. Function first removes everything visible in the ngl view
 * 2. Removes every mention of the dataset from the redux store (state.datasetsReducers)
 * 3. Calls the backend api/compound-sets/ DELETE endpoint to remove the dataset from the database
 * @param {*} datasetID
 * @returns
 */
export const deleteDataset = (datasetID, stage) => async (dispatch, getState) => {
  const state = getState();

  //remove ligands
  const ligandsListOfDataset = state.datasetsReducers.ligandLists[datasetID];
  ligandsListOfDataset &&
    ligandsListOfDataset.forEach(cmpId => {
      const cmp = dispatch(getCompoundById(cmpId, datasetID));
      if (cmp) {
        //I think we can leave it to execute asynchronously
        dispatch(removeDatasetLigand(stage, cmp, getRandomColor(cmp), datasetID, true));
      }
    });
  //remove proteins
  const proteinListOfDataset = state.datasetsReducers.proteinLists[datasetID];
  proteinListOfDataset &&
    proteinListOfDataset.forEach(cmpId => {
      const cmp = dispatch(getCompoundById(cmpId, datasetID));
      if (cmp) {
        dispatch(removeDatasetHitProtein(stage, cmp, getRandomColor(cmp), datasetID, true));
      }
    });
  //remove complexes
  const complexListOfDataset = state.datasetsReducers.complexLists[datasetID];
  complexListOfDataset &&
    complexListOfDataset.forEach(cmpId => {
      const cmp = dispatch(getCompoundById(cmpId, datasetID));
      if (cmp) {
        dispatch(removeDatasetComplex(stage, cmp, getRandomColor(cmp), datasetID, true));
      }
    });
  //remove surfaces
  const surfaceListOfDataset = state.datasetsReducers.surfaceLists[datasetID];
  surfaceListOfDataset &&
    surfaceListOfDataset.forEach(cmpId => {
      const cmp = dispatch(getCompoundById(cmpId, datasetID));
      if (cmp) {
        dispatch(removeDatasetSurface(stage, cmp, getRandomColor(cmp), datasetID, true));
      }
    });

  await api({ url: `${base_url}/api/compound-sets/${datasetID}/`, method: METHOD.DELETE });

  //remove dataset from redux store
  dispatch(removeDataset(datasetID));
  console.log('dataset removed from redux store');
};

export const getCurrentDatasetIterator = datasetID => (dispatch, getState) => {
  let result = null;

  const state = getState();
  const datasetIterators = state.datasetsReducers.iteratorDatasets;
  if (datasetIterators.hasOwnProperty(datasetID)) {
    result = datasetIterators[datasetID];
  }

  return result;
};

export const getCurrentSelectedCompoundIterator = () => (dispatch, getState) => {
  let result = null;

  const state = getState();
  result = state.datasetsReducers.iteratorSelectedCompounds;

  return result;
};

export const resetDatasetIterator = datasetID => (dispatch, getState) => {
  dispatch(setDatasetIterator(datasetID, null));
};

export const resetSelectedCompoundIterator = () => (dispatch, getState) => {
  dispatch(setSelectedCompoundsIterator(null, null));
};
