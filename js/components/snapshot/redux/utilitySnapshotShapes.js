import { deepClone, deepMergeWithPriority, deepMergeWithPriorityAndBlackList } from '../../../utils/objectUtils';
import { NGL_OBJECTS } from '../../../reducers/ngl/constants';

const BLACKLIST_FLAG = true;
const BLACKLIST_COUNTER = 1;

const SNAPSHOT_API_DATA_TO_DELETE = {
  legacy_target_id_list: [],
  cached_mol_lists: {},
  all_mol_lists: [],
  allMolecules: [],
  moleculeTags: [],
  tagList: [],
  categoryList: [],
  lhs_compounds_list: [],
  rhs_compounds_list: [],
  lhs_extra_columns: [],
  noTagsReceived: true,
  lhsDataIsLoading: false,
  lhsDataIsLoaded: false,
  rhsDataIsLoading: false,
  rhsDataIsLoaded: false,
  proteinIsLoading: false,
  proteinIsLoaded: false,
  compound_identifiers: [],
  quality_statuses: [],
  ligandData: [],
  all_data_loaded: false,
  dataAreDownloading: false,
  errorOccuredDuringDownload: false,
  dataAreDownloaded: false,
  targetDataLoaded: false
};

const SNAPSHOT_API_DATA_TO_PRESERVE_WHEN_SWITCHING = {
  target_id_list: [],
  ...SNAPSHOT_API_DATA_TO_DELETE,
  lhsDataIsLoading: BLACKLIST_FLAG,
  lhsDataIsLoaded: BLACKLIST_FLAG,
  rhsDataIsLoading: BLACKLIST_FLAG,
  rhsDataIsLoaded: BLACKLIST_FLAG,
  proteinIsLoading: BLACKLIST_FLAG,
  proteinIsLoaded: BLACKLIST_FLAG,
  noTagsReceived: BLACKLIST_FLAG,
  all_data_loaded: BLACKLIST_FLAG,
  dataAreDownloading: BLACKLIST_FLAG,
  errorOccuredDuringDownload: BLACKLIST_FLAG,
  dataAreDownloaded: BLACKLIST_FLAG,
  targetDataLoaded: BLACKLIST_FLAG
};

const SNAPSHOT_NGL_TRANSIENT_STATE_TO_DELETE = {
  objectsInView: {},
  objectsInViewStash: {},
  pdbCache: {},
  qualityCache: {},
  countOfRemainingMoleculeGroups: null,
  proteinsHasLoaded: null,
  countOfPendingNglObjects: {},
  nglViewFromSnapshotRendered: false,
  snapshotOrientationApplied: false
};

const SNAPSHOT_NGL_TRANSIENT_STATE_TO_PRESERVE_WHEN_SWITCHING = {
  objectsInView: {},
  objectsInViewStash: {},
  pdbCache: {},
  qualityCache: {},
  countOfRemainingMoleculeGroups: BLACKLIST_COUNTER,
  proteinsHasLoaded: BLACKLIST_FLAG,
  countOfPendingNglObjects: {},
  nglViewFromSnapshotRendered: BLACKLIST_FLAG,
  snapshotOrientationApplied: BLACKLIST_FLAG
};

const SNAPSHOT_DATASETS_DATA_TO_DELETE = {
  datasets: [],
  moleculeLists: {},
  isLoadingMoleculeList: false,
  scoreDatasetMap: {},
  scoreCompoundMap: {},
  filterPropertiesDatasetMap: {},
  allInspirations: {}
};

const SNAPSHOT_DATASETS_DATA_TO_PRESERVE_WHEN_SWITCHING = {
  datasets: [],
  moleculeLists: {},
  isLoadingMoleculeList: BLACKLIST_FLAG,
  scoreDatasetMap: {},
  scoreCompoundMap: {},
  filterPropertiesDatasetMap: {},
  allInspirations: {}
};

const SNAPSHOT_SELECTION_TRANSIENT_STATE = {
  isScrollFiredForLHS: false,
  lhsIsFullyRendered: false,
  rhsIsFullyRendered: false
};

const SNAPSHOT_TRANSIENT_UI_STATE = {
  snapshotReducers: {
    openSavingDialog: false,
    isSnapshotDirty: false,
    listOfSnapshots: null,
    snapshotsCreatedThisSession: [],
    switchingSnapshotWithinProject: false
  },
  previewReducers: {
    molecule: {
      imageCache: {}
    }
  },
  projectReducers: {
    isProjectModalLoading: false
  }
};

export const SNAPSHOT_VALUES_TO_BE_DELETED = {
  apiReducers: {
    ...SNAPSHOT_API_DATA_TO_DELETE
  },
  nglReducers: {
    ...SNAPSHOT_NGL_TRANSIENT_STATE_TO_DELETE
  },
  selectionReducers: {
    fragmentDisplayList: [],
    proteinList: [],
    complexList: [],
    surfaceList: [],
    densityList: [],
    densityListCustom: [],
    densityListType: [],
    qualityList: [],
    vectorOnList: [],
    artefactsChainList: [],
    ...SNAPSHOT_SELECTION_TRANSIENT_STATE
  },
  datasetsReducers: {
    ...SNAPSHOT_DATASETS_DATA_TO_DELETE,
    ligandLists: {},
    proteinLists: {},
    complexLists: {},
    surfaceLists: {},
    datasetScrolledMap: {},
    isSelectedDatasetScrolled: false
  },
  ...SNAPSHOT_TRANSIENT_UI_STATE
};

// These values must stay from the current application state when switching between snapshots
// for the same target, because they are fetched data or live NGL/runtime caches.
export const SNAPSHOT_VALUES_NOT_TO_BE_DELETED_SWITCHING_TARGETS = {
  apiReducers: {
    ...SNAPSHOT_API_DATA_TO_PRESERVE_WHEN_SWITCHING
  },
  nglReducers: {
    ...SNAPSHOT_NGL_TRANSIENT_STATE_TO_PRESERVE_WHEN_SWITCHING
  },
  datasetsReducers: {
    ...SNAPSHOT_DATASETS_DATA_TO_PRESERVE_WHEN_SWITCHING
  },
  projectReducers: {
    currentSnapshot: {},
    currentSnapshotList: [],
    currentSnapshotTree: {},
    currentProject: {}
  },
  snapshotReducers: {
    listOfSnapshots: [],
    snapshotsCreatedThisSession: []
  }
};

const SNAPSHOT_RUNTIME_STATE_TO_PRESERVE_WHEN_SWITCHING = {
  selectionReducers: {
    isScrollFiredForLHS: BLACKLIST_FLAG,
    lhsIsFullyRendered: BLACKLIST_FLAG,
    rhsIsFullyRendered: BLACKLIST_FLAG,
    fragmentDisplayList: [],
    proteinList: [],
    complexList: [],
    surfaceList: [],
    densityList: [],
    densityListCustom: [],
    densityListType: [],
    qualityList: [],
    vectorOnList: [],
    artefactsChainList: [],
    vector_list: [],
    compoundsOfVectors: {},
    bondColorMapOfVectors: {},
    currentVector: BLACKLIST_FLAG
  },
  datasetsReducers: {
    ligandLists: {},
    proteinLists: {},
    complexLists: {},
    surfaceLists: {},
    inspirationLists: {}
  },
  targetReducers: {}
};

const SNAPSHOT_VALUES_TO_PRESERVE_WHEN_SWITCHING_SNAPSHOTS = deepMergeWithPriority(
  deepClone(SNAPSHOT_VALUES_NOT_TO_BE_DELETED_SWITCHING_TARGETS),
  SNAPSHOT_RUNTIME_STATE_TO_PRESERVE_WHEN_SWITCHING
);

export const SNAPSHOT_VALUES_TO_BE_DELETED_SWITCHING_SNAPSHOTS = deepClone(
  SNAPSHOT_VALUES_NOT_TO_BE_DELETED_SWITCHING_TARGETS
);

const normalizeObjectsToBeDisplayed = list =>
  (list || []).map(item => ({
    ...item,
    center: false,
    rendered: false
  }));

const normalizeObjectsToBeDisplayedByDataset = datasetsToBeDisplayed => {
  const normalized = {};

  Object.entries(datasetsToBeDisplayed || {}).forEach(([datasetID, items]) => {
    normalized[datasetID] = normalizeObjectsToBeDisplayed(items);
  });

  return normalized;
};

const countObjectsToBeRenderedByDataset = datasetsToBeDisplayed =>
  Object.values(datasetsToBeDisplayed || {}).reduce((count, items) => count + (items?.length || 0), 0);

export const normalizeSnapshotRenderState = snapshotState => {
  const normalizedSnapshotState = deepClone(snapshotState);

  normalizedSnapshotState.selectionReducers = normalizedSnapshotState.selectionReducers || {};
  normalizedSnapshotState.datasetsReducers = normalizedSnapshotState.datasetsReducers || {};
  normalizedSnapshotState.nglReducers = normalizedSnapshotState.nglReducers || {};

  const normalizedLhsObjects = normalizeObjectsToBeDisplayed(normalizedSnapshotState.selectionReducers.toBeDisplayedList);
  const normalizedRhsObjects = normalizeObjectsToBeDisplayedByDataset(
    normalizedSnapshotState.datasetsReducers.toBeDisplayedList
  );

  normalizedSnapshotState.selectionReducers.toBeDisplayedList = normalizedLhsObjects;
  normalizedSnapshotState.datasetsReducers.toBeDisplayedList = normalizedRhsObjects;
  normalizedSnapshotState.nglReducers.snapshotNglOrientation = {
    ...(normalizedSnapshotState.nglReducers.nglOrientations || {})
  };
  normalizedSnapshotState.nglReducers.objectsInSnapshotToBeRendered =
    normalizedLhsObjects.length + countObjectsToBeRenderedByDataset(normalizedRhsObjects);
  normalizedSnapshotState.nglReducers.isSnapshotRendering = true;
  normalizedSnapshotState.nglReducers.nglViewFromSnapshotRendered = false;
  normalizedSnapshotState.nglReducers.isNGLQueueEmpty = false;

  return normalizedSnapshotState;
};

const includesId = (list = [], itemId) => list.some(item => (typeof item === 'object' ? item?.id === itemId : item === itemId));

const isLhsItemDisplayed = (selectionReducers = {}, item) => {
  switch (item.type) {
    case NGL_OBJECTS.LIGAND:
      return includesId(selectionReducers.fragmentDisplayList, item.id);
    case NGL_OBJECTS.PROTEIN:
      return includesId(selectionReducers.proteinList, item.id);
    case NGL_OBJECTS.ARTEFACTS:
      return includesId(selectionReducers.artefactsChainList, item.id);
    case NGL_OBJECTS.COMPLEX:
      return includesId(selectionReducers.complexList, item.id);
    case NGL_OBJECTS.SURFACE:
      return includesId(selectionReducers.surfaceList, item.id);
    case NGL_OBJECTS.DENSITY:
    case NGL_OBJECTS.DENSITY_CUSTOM:
      return includesId(selectionReducers.densityList, item.id) || includesId(selectionReducers.densityListCustom, item.id);
    case NGL_OBJECTS.VECTOR:
      return includesId(selectionReducers.vectorOnList, item.id);
    case NGL_OBJECTS.QUALITY:
      return includesId(selectionReducers.qualityList, item.id);
    default:
      return false;
  }
};

const isRhsItemDisplayed = (datasetsReducers = {}, datasetID, item) => {
  switch (item.type) {
    case NGL_OBJECTS.LIGAND:
      return includesId(datasetsReducers.ligandLists?.[datasetID], item.id);
    case NGL_OBJECTS.PROTEIN:
      return includesId(datasetsReducers.proteinLists?.[datasetID], item.id);
    case NGL_OBJECTS.COMPLEX:
      return includesId(datasetsReducers.complexLists?.[datasetID], item.id);
    case NGL_OBJECTS.SURFACE:
      return includesId(datasetsReducers.surfaceLists?.[datasetID], item.id);
    default:
      return false;
  }
};

export const prepareSwitchingSnapshotRenderState = (currentState, snapshotState) => {
  const preparedSnapshotState = deepClone(snapshotState);

  preparedSnapshotState.selectionReducers = preparedSnapshotState.selectionReducers || {};
  preparedSnapshotState.datasetsReducers = preparedSnapshotState.datasetsReducers || {};
  preparedSnapshotState.nglReducers = preparedSnapshotState.nglReducers || {};

  let pendingItemsToRender = 0;

  preparedSnapshotState.selectionReducers.toBeDisplayedList = (
    preparedSnapshotState.selectionReducers.toBeDisplayedList || []
  ).map(item => {
    const alreadyDisplayed = isLhsItemDisplayed(currentState.selectionReducers, item);

    if (item.display !== false && !alreadyDisplayed) {
      pendingItemsToRender += 1;
    }

    return {
      ...item,
      center: item.display === false ? false : !!item.center,
      rendered: item.display === false || alreadyDisplayed
    };
  });

  preparedSnapshotState.datasetsReducers.toBeDisplayedList = Object.fromEntries(
    Object.entries(preparedSnapshotState.datasetsReducers.toBeDisplayedList || {}).map(([datasetID, items]) => [
      datasetID,
      (items || []).map(item => {
        const alreadyDisplayed = isRhsItemDisplayed(currentState.datasetsReducers, datasetID, item);

        if (item.display !== false && !alreadyDisplayed) {
          pendingItemsToRender += 1;
        }

        return {
          ...item,
          datasetID: item.datasetID || datasetID,
          center: item.display === false ? false : !!item.center,
          rendered: item.display === false || alreadyDisplayed
        };
      })
    ])
  );

  preparedSnapshotState.nglReducers.objectsInSnapshotToBeRendered = pendingItemsToRender;
  preparedSnapshotState.nglReducers.isSnapshotRendering = pendingItemsToRender > 0;
  preparedSnapshotState.nglReducers.isNGLQueueEmpty = pendingItemsToRender === 0;

  return preparedSnapshotState;
};

export const createSnapshotStateForSaving = state => {
  let downloadedStateBlacklist = deepClone(SNAPSHOT_VALUES_NOT_TO_BE_DELETED_SWITCHING_TARGETS);

  // Preserve the target list in saved snapshots for compatibility with the existing restore flow.
  delete downloadedStateBlacklist.apiReducers.target_id_list;

  let snapshotData = deepMergeWithPriorityAndBlackList({}, state, downloadedStateBlacklist);
  snapshotData = deepClone(snapshotData);
  snapshotData = deepMergeWithPriority(snapshotData, downloadedStateBlacklist);
  snapshotData = deepMergeWithPriority(snapshotData, SNAPSHOT_VALUES_TO_BE_DELETED);

  return normalizeSnapshotRenderState(snapshotData);
};

export const mergeSnapshotStateWithCurrentData = (currentState, snapshotState) => {
  const currentStateClone = deepClone(currentState);
  const normalizedSnapshotState = normalizeSnapshotRenderState(snapshotState);

  return deepMergeWithPriorityAndBlackList(
    currentStateClone,
    normalizedSnapshotState,
    SNAPSHOT_VALUES_TO_PRESERVE_WHEN_SWITCHING_SNAPSHOTS
  );
};
