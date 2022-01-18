import { constants } from './constants';

export const addDataset = dataset => ({ type: constants.ADD_DATASET, payload: dataset });

// datasetList has to contain follow structure
//[{ id: 0, title: 'First dataset' },...]
export const setDataset = datasetList => ({
  type: constants.SET_DATASET,
  payload: datasetList.map(ds => ({
    id: ds.id,
    title: ds.title,
    url: ds.url,
    version: ds.version,
    submitted_sdf: ds.submitted_sdf
  }))
});

export const addMoleculeList = (datasetID, moleculeList) => ({
  type: constants.ADD_MOLECULELIST,
  payload: { datasetID, moleculeList }
});
export const removeMoleculeList = datasetID => ({ type: constants.REMOVE_MOLECULELIST, payload: datasetID });

export const setMoleculeListIsLoading = isLoading => ({
  type: constants.SET_IS_LOADING_MOLECULE_LIST,
  payload: isLoading
});

export const setSelectedDatasetIndex = (oldValue, tabValue, tabName, oldName, skipTracking = false) => ({
  type: constants.SET_SELECTED_DATASET_INDEX,
  payload: { oldValue: oldValue, value: tabValue, name: tabName, oldName: oldName },
  skipTracking: skipTracking
});

export const setTabValue = (oldValue, tabValue, tabName, oldName) => ({
  type: constants.SET_TAB_VALUE,
  payload: { oldValue: oldValue, value: tabValue, name: tabName, oldName: oldName }
});

export const replaceAllMoleculeLists = allMoleculeLists => ({
  type: constants.REPLACE_ALL_MOLECULELISTS,
  payload: allMoleculeLists
});

export const setFilterSettings = (datasetID, filter) => ({
  type: constants.SET_FILTER_SETTINGS,
  payload: { datasetID, filter }
});

export const setFilterProperties = (datasetID, properties) => ({
  type: constants.SET_FILTER_PROPERTIES,
  payload: { datasetID, properties }
});

export const setDatasetFilter = (datasetID, properties, settings, key, dragDropState) => ({
  type: constants.SET_DATASET_FILTER,
  payload: { datasetID, properties, settings, key, dragDropState }
});

export const setFilterDialogOpen = filterDialogOpen => ({
  type: constants.SET_FILTER_DIALOG_OPEN,
  payload: filterDialogOpen
});

export const setLigandList = function(datsetID, ligandList) {
  return {
    type: constants.SET_LIGAND_LIST,
    payload: {
      datasetID: datsetID,
      ligandList: ligandList
    }
  };
};
export const appendLigandList = function(datsetID, item, skipTracking = false) {
  return {
    type: constants.APPEND_LIGAND_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    },
    skipTracking: skipTracking
  };
};
export const removeFromLigandList = function(datsetID, item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_LIGAND_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    },
    skipTracking: skipTracking
  };
};

export const setProteinList = function(datsetID, proteinList) {
  return {
    type: constants.SET_PROTEIN_LIST,
    payload: {
      datasetID: datsetID,
      proteinList: proteinList
    }
  };
};
export const appendProteinList = function(datsetID, item, skipTracking = false) {
  return {
    type: constants.APPEND_PROTEIN_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    },
    skipTracking: skipTracking
  };
};
export const removeFromProteinList = function(datsetID, item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_PROTEIN_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    },
    skipTracking: skipTracking
  };
};

export const setComplexList = function(datsetID, complexList) {
  return {
    type: constants.SET_COMPLEX_LIST,
    payload: {
      datasetID: datsetID,
      complexList: complexList
    }
  };
};
export const appendComplexList = function(datsetID, item, skipTracking = false) {
  return {
    type: constants.APPEND_COMPLEX_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    },
    skipTracking: skipTracking
  };
};
export const removeFromComplexList = function(datsetID, item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_COMPLEX_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    },
    skipTracking: skipTracking
  };
};

export const setSurfaceList = function(datsetID, surfaceList) {
  return {
    type: constants.SET_SURFACE_LIST,
    payload: {
      datasetID: datsetID,
      surfaceList: surfaceList
    }
  };
};
export const appendSurfaceList = function(datsetID, item) {
  return {
    type: constants.APPEND_SURFACE_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    }
  };
};
export const removeFromSurfaceList = function(datsetID, item) {
  return {
    type: constants.REMOVE_FROM_SURFACE_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    }
  };
};

export const setInspirationList = function(datasetID, inspirationList) {
  return {
    type: constants.SET_INSPIRATION_LIST,
    payload: {
      datasetID,
      inspirationList
    }
  };
};
export const appendInspirationList = function(datasetID, itemID) {
  return {
    type: constants.APPEND_INSPIRATION_LIST,
    payload: {
      datasetID,
      itemID
    }
  };
};
export const removeFromInspirationList = function(datasetID, itemID) {
  return {
    type: constants.REMOVE_FROM_INSPIRATION_LIST,
    payload: {
      datasetID,
      itemID
    }
  };
};

export const setInspirationFragmentList = (moleculeList = []) => ({
  type: constants.SET_INSPIRATION_FRAGMENT_LIST,
  payload: moleculeList
});

export const removeFromInspirationFragmentList = item => ({
  type: constants.REMOVE_FROM_INSPIRATION_FRAGMENT_LIST,
  payload: item
});

export const appendToScoreDatasetMap = (datasetID, score) => ({
  type: constants.APPEND_TO_SCORE_DATASET_MAP,
  payload: { datasetID, score }
});

export const removeFromScoreDatasetMap = datasetID => ({
  type: constants.REMOVE_FROM_SCORE_DATASET_MAP,
  payload: datasetID
});

export const appendToScoreCompoundMapByScoreCategory = scoreListCategories => ({
  type: constants.APPEND_TO_SCORE_COMPOUND_MAP_BY_SCORE_CATEGORY,
  payload: scoreListCategories
});

export const appendToScoreCompoundMap = (compoundID, scoreList) => ({
  type: constants.APPEND_TO_SCORE_COMPOUND_MAP,
  payload: { key: compoundID, value: scoreList }
});

export const removeFromScoreCompoundMap = compoundID => ({
  type: constants.REMOVE_FROM_SCORE_COMPOUND_MAP,
  payload: compoundID
});

export const clearScoreCompoundMap = () => ({ type: constants.CLEAR_SCORE_COMPOUND_MAP });

export const updateFilterShowedScoreProperties = ({ datasetID, scoreList = [] }) => ({
  type: constants.UPDATE_FILTER_SHOWED_SCORE_PROPERTIES,
  payload: { datasetID, scoreList }
});

export const setFilterShowedScoreProperties = ({ datasetID, scoreList = [], oldScoreList, isChecked, scoreName }) => ({
  type: constants.SET_FILTER_SHOWED_SCORE_PROPERTIES,
  payload: { datasetID, scoreList, isChecked, scoreName, oldScoreList }
});

export const removeFromFilterShowedScoreProperties = datasetID => ({
  type: constants.REMOVE_FROM_FILTER_SHOWED_SCORE_PROPERTIES,
  payload: datasetID
});

export const setSearchStringOfCompoundSet = searchString => ({
  type: constants.SET_SEARCH_STRING,
  payload: searchString
});

export const setIsLoadingInspirationListOfMolecules = isLoading => ({
  type: constants.SET_IS_LOADING_INSPIRATION_LIST_OF_MOLECULES,
  payload: isLoading
});

export const setInspirationMoleculeDataList = (moleculeList = []) => ({
  type: constants.SET_INSPIRATION_MOLECULE_DATA_LIST,
  payload: moleculeList
});

export const setAllInspirations = allInspirationsMap => ({
  type: constants.SET_ALL_INSPIRATIONS,
  payload: allInspirationsMap
});

export const setAllInspirationMoleculeDataList = (moleculeList = []) => ({
  type: constants.SET_ALL_INSPIRATION_MOLECULE_DATA_LIST,
  payload: moleculeList
});

export const appendToInspirationMoleculeDataList = molecule => ({
  type: constants.APPEND_TO_INSPIRATION_MOLECULE_DATA_LIST,
  payload: molecule
});

export const appendToAllInspirationMoleculeDataList = molecule => ({
  type: constants.APPEND_TO_ALL_INSPIRATION_MOLECULE_DATA_LIST,
  payload: molecule
});

export const removeFromInspirationMoleculeDataList = moleculeID => ({
  type: constants.REMOVE_FROM_INSPIRATION_MOLECULE_DATA_LIST,
  payload: moleculeID
});

export const setIsOpenInspirationDialog = isOpen => ({
  type: constants.SET_IS_OPEN_INSPIRATION_DIALOG,
  payload: isOpen
});

export const setIsOpenCrossReferenceDialog = isOpen => ({
  type: constants.SET_IS_OPEN_CROSS_REFERENCE_DIALOG,
  payload: isOpen
});

export const setCrossReferenceCompoundName = name => ({
  type: constants.SET_CROSS_REFERENCE_COMPOUND_NAME,
  payload: name
});

export const setIsLoadingCrossReferenceScores = isLoading => ({
  type: constants.SET_IS_LOADING_CROSS_REFERENCE_SCORES,
  payload: isLoading
});

export const setFilterWithInspirations = isChecked => ({
  type: constants.SET_FILTER_WITH_INSPIRATIONS,
  payload: isChecked
});

export const appendMoleculeToCompoundsOfDatasetToBuy = (
  datasetID,
  moleculeID,
  moleculeTitle,
  skipTracking = false
) => ({
  type: constants.APPEND_MOLECULE_TO_COMPOUNDS_TO_BUY_OF_DATASET,
  payload: { datasetID, moleculeID, moleculeTitle },
  skipTracking: skipTracking
});

export const removeMoleculeFromCompoundsOfDatasetToBuy = (
  datasetID,
  moleculeID,
  moleculeTitle,
  skipTracking = false
) => ({
  type: constants.REMOVE_MOLECULE_FROM_COMPOUNDS_TO_BUY_OF_DATASET,
  payload: { datasetID, moleculeID, moleculeTitle },
  skipTracking: skipTracking
});

export const reloadDatasetsReducer = savedDatasetsReducers => {
  return {
    type: constants.RELOAD_DATASETS_REDUCER,
    payload: savedDatasetsReducers
  };
};

export const resetDatasetsState = () => {
  return {
    type: constants.RESET_DATASETS_STATE
  };
};

export const setSelectedAll = (datsetID, item, isLigand, isProtein, isComplex) => ({
  type: constants.SET_SELECTED_ALL,
  payload: {
    datasetID: datsetID,
    item: item,
    isLigand: isLigand,
    isProtein: isProtein,
    isComplex: isComplex
  }
});

export const setDeselectedAll = (datsetID, item, isLigand, isProtein, isComplex) => ({
  type: constants.SET_DESELECTED_ALL,
  payload: {
    datasetID: datsetID,
    item: item,
    isLigand: isLigand,
    isProtein: isProtein,
    isComplex: isComplex
  }
});

export const setSelectedAllByType = (type, datsetID, items, isCrossReference) => ({
  type: constants.SET_SELECTED_ALL_BY_TYPE,
  payload: {
    type: type,
    datasetID: datsetID,
    items: items,
    isCrossReference: isCrossReference
  }
});

export const setDeselectedAllByType = (type, datsetID, items, isCrossReference) => ({
  type: constants.SET_DESELECTED_ALL_BY_TYPE,
  payload: {
    type: type,
    datasetID: datsetID,
    items: items,
    isCrossReference: isCrossReference
  }
});

export const setArrowUpDown = (datasetID, item, newItem, arrowType, data) => ({
  type: constants.SET_ARROW_UP_DOWN,
  payload: {
    datasetID,
    item: item,
    newItem: newItem,
    arrowType: arrowType,
    data
  }
});

export const setDragDropState = (datasetID, dragDropState) => ({
  type: constants.SET_DRAG_DROP_STATE,
  payload: { datasetID, dragDropState }
});

export const dragDropStarted = (datasetID, startIndex) => ({
  type: constants.DRAG_DROP_STARTED,
  payload: { datasetID, startIndex }
});

export const dragDropFinished = (datasetID, molecule, index) => ({
  type: constants.DRAG_DROP_FINISHED,
  payload: { datasetID, molecule, index }
});

export const disableDatasetMoleculeNglControlButton = (datasetId, moleculeId, type) => ({
  type: constants.DISABLE_DATASET_NGL_CONTROL_BUTTON,
  payload: { datasetId, moleculeId, type }
});

export const enableDatasetMoleculeNglControlButton = (datasetId, moleculeId, type) => ({
  type: constants.ENABLE_DATASET_NGL_CONTROL_BUTTON,
  payload: { datasetId, moleculeId, type }
});
