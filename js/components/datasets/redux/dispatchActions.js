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
  appendToScoreCompoundMapByScoreCategory,
  updateFilterShowedScoreProperties,
  setFilterProperties,
  setIsLoadingInspirationListOfMolecules,
  appendToInspirationMoleculeDataList,
  appendToAllInspirationMoleculeDataList,
  setInspirationMoleculeDataList,
  setAllInspirationMoleculeDataList,
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
  generateMoleculeCompoundId,
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
import { appendMoleculeOrientation } from '../../../reducers/ngl/actions';
import { isAnyInspirationTurnedOnByType } from './selectors';
import {
  addVector,
  addHitProtein,
  addComplex,
  addSurface,
  addLigand,
  addDensity
} from '../../preview/molecule/redux/dispatchActions';
import { OBJECT_TYPE } from '../../nglView/constants';
import { getRepresentationsByType } from '../../nglView/generatingObjects';
import { setSelectedAllByType, setDeselectedAllByType } from './actions';

export const initializeDatasetFilter = datasetID => (dispatch, getState) => {
  const initFilterSettings = getInitialDatasetFilterSettings(getState(), datasetID);
  const initFilterProperties = getInitialDatasetFilterProperties(getState(), datasetID);

  dispatch(setFilterSettings(datasetID, initFilterSettings));
  dispatch(setFilterProperties(datasetID, initFilterProperties));
};

export const addDatasetHitProtein = (
  stage,
  data,
  colourToggle,
  datasetID,
  skipTracking = false,
  representations = undefined
) => dispatch => {
  dispatch(
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
  dispatch(appendProteinList(datasetID, generateMoleculeCompoundId(data), skipTracking));
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
) => dispatch => {
  dispatch(
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
  dispatch(appendComplexList(datasetID, generateMoleculeCompoundId(data), skipTracking));
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

export const addDatasetSurface = (stage, data, colourToggle, datasetID, representations = undefined) => dispatch => {
  dispatch(
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
  dispatch(appendSurfaceList(datasetID, generateMoleculeCompoundId(data)));
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
) => dispatch => {
  const currentOrientation = stage.viewerControls.getOrientation();
  dispatch(
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data, colourToggle, datasetID)),
      stage,
      previousRepresentations: representations,
      markAsRightSideLigand: true
    })
  ).finally(() => {
    const ligandOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, ligandOrientation));

    dispatch(appendMoleculeOrientation(getDatasetMoleculeID(datasetID, data?.id), ligandOrientation));

    // keep current orientation of NGL View
    stage.viewerControls.orient(currentOrientation);
  });
  dispatch(appendLigandList(datasetID, generateMoleculeCompoundId(data), skipTracking));
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

export const loadDataSets = targetId => dispatch =>
  api({ url: `${base_url}/api/compound-sets/?target=${targetId}` }).then(response => {
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

export const loadDatasetCompoundsWithScores = () => (dispatch, getState) => {
  const datasets = getState().datasetsReducers.datasets;
  return Promise.all(
    datasets.map(dataset =>
      // Hint for develop purposes add param &limit=20
      api({ url: `${base_url}/api/compound-mols-scores/?computed_set=${dataset.id}` }).then(response => {
        dispatch(
          addMoleculeList(
            dataset.id,
            response.data.results.sort((a, b) => a.id - b.id)
          )
        );

        return api({ url: `${base_url}/api/compound-scores/?computed_set=${dataset.id}` }).then(res => {
          const scores = res?.data?.results;
          let lastScore = scores.reduce((a, b) => ({ id: Math.max(a.id, b.id), name: '', description: '' }));
          scores.unshift({ id: lastScore.id + 1, name: '_id', description: 'id of the compound' });
          dispatch(
            updateFilterShowedScoreProperties({
              datasetID: dataset.id,
              scoreList: scores?.slice(0, COUNT_OF_VISIBLE_SCORES)
            })
          );
          scores?.map(item => {
            dispatch(appendToScoreDatasetMap(dataset.id, item));
          });
        });
      })
    )
  );
};

export const loadMoleculesOfDataSet = datasetID => dispatch =>
  // TODO remove limit
  api({ url: `${base_url}/api/compound-molecules/?compound_set=${datasetID}` }).then(response => {
    dispatch(addMoleculeList(datasetID, response.data.results));
    return Promise.all(
      response?.data?.results?.map(compoundMolecule => {
        return Promise.all([
          dispatch(loadCompoundNumericalScoreList(compoundMolecule?.compound, datasetID)),
          dispatch(loadCompoundTextScoreList(compoundMolecule?.compound, datasetID))
        ]);
      })
    );
  });

// TODO remove this method loadCompoundScoresListOfDataSet
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
        scoreList: [...scoreSet].slice(0, COUNT_OF_VISIBLE_SCORES)
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
        scoreList: [...scoreSet].slice(0, COUNT_OF_VISIBLE_SCORES)
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

  if (isChecked === true) {
    if (filteredScorePropertiesOfDataset.length === COUNT_OF_VISIBLE_SCORES) {
      // 1. unselect first
      filteredScorePropertiesOfDataset.shift();
    }
    // 2. select new property
    const selectedProperty = scoreDatasetMap[scoreName];
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
        scoreList: filteredScorePropertiesOfDataset.filter(item => item.name !== scoreName)
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
  dispatch(setSearchStringOfCompoundSet(null));
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
  // TODO fix
  // dispatch(setIsLoadingCrossReferenceScores(true));
  // Promise.all(datasetIDList.map(datasetID => dispatch(loadCompoundScoresListOfDataSet(datasetID)))).finally(() =>
  //   dispatch(setIsLoadingCrossReferenceScores(false))
  // );
};

const addAllLigandsFromList = (moleculeList = [], stage, skipTracking = false) => dispatch => {
  moleculeList.forEach(molecule => {
    dispatch(
      addDatasetLigand(
        stage,
        molecule.molecule,
        colourList[molecule.molecule.id % colourList.length],
        molecule.datasetID,
        skipTracking
      )
    );
  });
};

const removeAllLigandsFromList = (moleculeList = [], stage, skipTracking = false) => dispatch => {
  moleculeList.forEach(molecule => {
    dispatch(
      removeDatasetLigand(
        stage,
        molecule.molecule,
        colourList[molecule.molecule.id % colourList.length],
        molecule.datasetID,
        skipTracking
      )
    );
  });
};

export const handleAllLigandsOfCrossReferenceDialog = (areAllSelected, moleculeList = [], stage) => dispatch => {
  let type = 'ligand';
  if (areAllSelected) {
    let molecules = dispatch(getSelectedMoleculesByType(type, false, moleculeList));
    dispatch(setDeselectedAllByType(type, null, molecules, true));
    dispatch(removeAllLigandsFromList(moleculeList, stage, true));
  } else {
    let molecules = dispatch(getSelectedMoleculesByType(type, true, moleculeList));
    dispatch(setSelectedAllByType(type, null, molecules, true));
    dispatch(addAllLigandsFromList(moleculeList, stage, true));
  }
};

const addAllHitProteins = (moleculeList = [], stage, skipTracking = false) => dispatch => {
  moleculeList.forEach(molecule => {
    dispatch(
      addDatasetHitProtein(
        stage,
        molecule.molecule,
        colourList[molecule.molecule.id % colourList.length],
        molecule.datasetID,
        skipTracking
      )
    );
  });
};
const removeAllHitProteins = (moleculeList = [], stage, skipTracking = false) => dispatch => {
  moleculeList.forEach(molecule => {
    dispatch(
      removeDatasetHitProtein(
        stage,
        molecule.molecule,
        colourList[molecule.molecule.id % colourList.length],
        molecule.datasetID,
        skipTracking
      )
    );
  });
};

export const removeOrAddAllHitProteinsOfList = (areAllSelected, moleculeList = [], stage) => dispatch => {
  let type = 'protein';

  if (areAllSelected) {
    let molecules = dispatch(getSelectedMoleculesByType(type, false, moleculeList));
    dispatch(setDeselectedAllByType(type, null, molecules, true));
    dispatch(removeAllHitProteins(moleculeList, stage, true));
  } else {
    let molecules = dispatch(getSelectedMoleculesByType(type, true, moleculeList));
    dispatch(setSelectedAllByType(type, null, molecules, true));
    dispatch(addAllHitProteins(moleculeList, stage, true));
  }
};

const addAllComplexes = (moleculeList = [], stage, skipTracking = false) => dispatch => {
  moleculeList.forEach(molecule => {
    dispatch(
      addDatasetComplex(
        stage,
        molecule.molecule,
        colourList[molecule.molecule.id % colourList.length],
        molecule.datasetID,
        skipTracking
      )
    );
  });
};

const removeAllComplexes = (moleculeList = [], stage, skipTracking = false) => dispatch => {
  moleculeList.forEach(molecule => {
    dispatch(
      removeDatasetComplex(
        stage,
        molecule.molecule,
        colourList[molecule.molecule.id % colourList.length],
        molecule.datasetID,
        skipTracking
      )
    );
  });
};

export const removeOrAddAllComplexesOfList = (areAllSelected, moleculeList = [], stage) => dispatch => {
  let type = 'complex';

  if (areAllSelected) {
    let molecules = dispatch(getSelectedMoleculesByType(type, false, moleculeList));
    dispatch(setDeselectedAllByType(type, null, molecules, true));
    dispatch(removeAllComplexes(moleculeList, stage, true));
  } else {
    let molecules = dispatch(getSelectedMoleculesByType(type, true, moleculeList));
    dispatch(setSelectedAllByType(type, null, molecules, true));
    dispatch(addAllComplexes(moleculeList, stage, true));
  }
};

const getSelectedMoleculesByType = (type, isAdd, moleculeList, datasetID) => (dispatch, getState) => {
  const state = getState();

  const ligandList = state.datasetsReducers.ligandLists;
  const proteinList = state.datasetsReducers.proteinLists;
  const complexList = state.datasetsReducers.complexLists;

  switch (type) {
    case 'ligand':
      return isAdd ? getMoleculesToSelect(moleculeList, ligandList) : getMoleculesToDeselect(moleculeList, ligandList);
    case 'protein':
      return isAdd
        ? getMoleculesToSelect(moleculeList, proteinList)
        : getMoleculesToDeselect(moleculeList, proteinList);
    case 'complex':
      return isAdd
        ? getMoleculesToSelect(moleculeList, complexList)
        : getMoleculesToDeselect(moleculeList, complexList);
    default:
      return null;
  }
};

const getMoleculesToSelect = (moleculeList, list) => {
  let molecules = moleculeList.filter(m => !list[m.datasetID].includes(m.molecule.id));
  return molecules;
};

const getMoleculesToDeselect = (moleculeList, list) => {
  let molecules = moleculeList.filter(m => list[m.datasetID].includes(m.molecule.id));
  return molecules;
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

export const removeAllSelectedDatasetMolecules = (stage, skipTracking) => (dispatch, getState) => {
  const state = getState();
  const datasets = state.datasetsReducers.datasets;
  const currentMolecules = state.datasetsReducers.moleculeLists;
  if (datasets) {
    datasets.forEach(dataset => {
      let datasetID = dataset.id;
      const ligandList = state.datasetsReducers.ligandLists[datasetID];
      const proteinList = state.datasetsReducers.proteinLists[datasetID];
      const complexList = state.datasetsReducers.complexLists[datasetID];
      const surfaceList = state.datasetsReducers.surfaceLists[datasetID];

      let molecules = currentMolecules[datasetID];
      ligandList?.forEach(moleculeID => {
        const foundedMolecule = molecules?.find(mol => mol.id === moleculeID);
        dispatch(
          removeDatasetLigand(
            stage,
            foundedMolecule,
            colourList[foundedMolecule.id % colourList.length],
            datasetID,
            skipTracking
          )
        );
      });
      proteinList?.forEach(moleculeID => {
        const foundedMolecule = molecules?.find(mol => mol.id === moleculeID);
        dispatch(
          removeDatasetHitProtein(
            stage,
            foundedMolecule,
            colourList[foundedMolecule.id % colourList.length],
            datasetID,
            skipTracking
          )
        );
      });
      complexList?.forEach(moleculeID => {
        const foundedMolecule = molecules?.find(mol => mol.id === moleculeID);
        dispatch(
          removeDatasetComplex(
            stage,
            foundedMolecule,
            colourList[foundedMolecule.id % colourList.length],
            datasetID,
            skipTracking
          )
        );
      });
      surfaceList?.forEach(moleculeID => {
        const foundedMolecule = molecules?.find(mol => mol.id === moleculeID);
        dispatch(
          removeDatasetSurface(
            stage,
            foundedMolecule,
            colourList[foundedMolecule.id % colourList.length],
            datasetID,
            skipTracking
          )
        );
      });
    });
  }
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
  vectorOnListMolecule,
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
    let isAnyInspirationVectorOn = isAnyInspirationTurnedOnByType(computed_inspirations, vectorOnListMolecule);

    if (
      isAnyInspirationLigandOn ||
      isAnyInspirationProteinOn ||
      isAnyInspirationComplexOn ||
      isAnyInspirationSurfaceOn ||
      isAnyInspirationDensityOn ||
      isAnyInspirationVectorOn
    ) {
      // dispatch(loadInspirationMoleculesDataList(newItemData.computed_inspirations)).then(() => {
      dispatch(
        moveInspirations(
          stage,
          objectsInView,
          isAnyInspirationLigandOn,
          isAnyInspirationProteinOn,
          isAnyInspirationComplexOn,
          isAnyInspirationSurfaceOn,
          isAnyInspirationDensityOn,
          isAnyInspirationVectorOn,
          skipTracking
        )
      );
      // });
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
  isAnyInspirationVectorOn,
  skipTracking
) => (dispatch, getState) => {
  const state = getState();
  const molecules = state.datasetsReducers.inspirationMoleculeDataList;
  if (molecules) {
    molecules.forEach(molecule => {
      if (molecule) {
        if (isAnyInspirationLigandOn) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.LIGAND);
          dispatch(
            addLigand(
              stage,
              molecule,
              colourList[molecule.id % colourList.length],
              false,
              skipTracking,
              representations
            )
          );
        }
        if (isAnyInspirationProteinOn) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.HIT_PROTEIN);
          dispatch(
            addHitProtein(stage, molecule, colourList[molecule.id % colourList.length], skipTracking, representations)
          );
        }
        if (isAnyInspirationComplexOn) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.COMPLEX);
          dispatch(
            addComplex(stage, molecule, colourList[molecule.id % colourList.length], skipTracking, representations)
          );
        }
        if (isAnyInspirationSurfaceOn) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.SURFACE);
          dispatch(
            addSurface(stage, molecule, colourList[molecule.id % colourList.length], skipTracking, representations)
          );
        }
        if (isAnyInspirationDensityOn) {
          let representations = getRepresentationsByType(objectsInView, molecule, OBJECT_TYPE.DENSITY);
          dispatch(
            addDensity(stage, molecule, colourList[molecule.id % colourList.length], skipTracking, representations)
          );
        }
        if (isAnyInspirationVectorOn) {
          dispatch(addVector(stage, molecule, colourList[molecule.id % colourList.length], skipTracking));
        }
      }
    });
  }
};

export const getDatasetMoleculeID = (datasetID, moleculeID) => `datasetID-${datasetID}_moleculeID-${moleculeID}`;
