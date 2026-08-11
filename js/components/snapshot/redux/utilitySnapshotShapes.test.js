import {
  createSnapshotStateForSaving,
  mergeSnapshotStateWithCurrentData,
  prepareSwitchingSnapshotRenderState
} from './utilitySnapshotShapes';
import {
  DEFAULT_RHS_POSE_NAVIGATION_CONFIG,
  POSE_TRANSFER_CENTERING_MODES,
  POSE_TRANSFER_ORDERS,
  POSE_TRANSFER_SCHEDULING
} from '../../../constants/poseNavigation';

const createBaseState = () => ({
  apiReducers: {
    target_id_list: [{ id: 7 }],
    all_mol_lists: [{ id: 101, code: 'LHS-101' }],
    rhs_compounds_list: [{ id: 'rhs-pose-1' }],
    lhs_compounds_list: [{ id: 'lhs-pose-1' }],
    lhs_extra_columns: [{ name: 'IC50' }],
    cached_mol_lists: { 1: [{ id: 101 }] },
    moleculeTags: [{ id: 5 }],
    tagList: [{ id: 6 }],
    categoryList: [{ id: 7 }],
    noTagsReceived: false,
    lhsDataIsLoaded: true,
    rhsDataIsLoaded: true,
    lhsDataIsLoading: false,
    rhsDataIsLoading: false,
    proteinIsLoaded: true,
    proteinIsLoading: false,
    compound_identifiers: [{ id: 1 }],
    quality_statuses: [{ id: 2 }],
    ligandData: [{ obsId: 101 }],
    dataAreDownloading: false,
    errorOccuredDuringDownload: false,
    dataAreDownloaded: true,
    targetDataLoaded: true,
    all_data_loaded: true,
    isSnapshot: false,
    snapshotLoadingInProgress: false
  },
  nglReducers: {
    nglOrientations: {
      major_view: {
        elements: [1, 2, 3]
      }
    },
    objectsInView: { ligand: { id: 1 } },
    objectsInViewStash: { stash: { id: 2 } },
    pdbCache: { pdb: 'cached' },
    qualityCache: { quality: 'cached' },
    countOfRemainingMoleculeGroups: 3,
    proteinsHasLoaded: true,
    countOfPendingNglObjects: { major_view: 1 },
    nglViewFromSnapshotRendered: true,
    snapshotOrientationApplied: true,
    objectsInSnapshotToBeRendered: 0,
    isSnapshotRendering: false,
    isNGLQueueEmpty: true
  },
  selectionReducers: {
    fragmentDisplayList: [101],
    proteinList: [102],
    complexList: [103],
    surfaceList: [104],
    densityList: [{ id: 105, sigma: '2fofc' }],
    densityListCustom: [105],
    densityListType: [{ id: 105, sigma: '2fofc' }],
    qualityList: [106],
    vectorOnList: [107],
    isScrollFiredForLHS: true,
    lhsIsFullyRendered: true,
    rhsIsFullyRendered: true,
    toBeDisplayedList: [{ id: 101, type: 'ligand', center: true, rendered: true }],
    filter: { active: true },
    rhsPoseNavigationConfig: {
      transferOrder: POSE_TRANSFER_ORDERS.ADD_FIRST,
      transferScheduling: POSE_TRANSFER_SCHEDULING.PHASED,
      postTransferCenteringMode: POSE_TRANSFER_CENTERING_MODES.VISIBLE_LIGAND_CENTROID
    }
  },
  datasetsReducers: {
    datasets: [{ id: 'dataset-1' }],
    moleculeLists: { 'dataset-1': [{ id: 501 }] },
    isLoadingMoleculeList: false,
    scoreDatasetMap: { 'dataset-1': [{ id: 'score-1' }] },
    scoreCompoundMap: { 501: [{ value: 10 }] },
    filterPropertiesDatasetMap: { 'dataset-1': [{ name: 'dock_score' }] },
    filteredScoreProperties: { 'dataset-1': [{ name: 'dock_score' }] },
    allInspirations: { 'dataset-1': { 501: [{ id: 101 }] } },
    ligandLists: { 'dataset-1': [501] },
    proteinLists: { 'dataset-1': [502] },
    complexLists: { 'dataset-1': [503] },
    surfaceLists: { 'dataset-1': [504] },
    toBeDisplayedList: {
      'dataset-1': [{ id: 501, type: 'ligand', center: true, rendered: true }]
    }
  },
  snapshotReducers: {
    openSavingDialog: true,
    isSnapshotDirty: true,
    listOfSnapshots: [{ id: 11 }],
    snapshotsCreatedThisSession: [11]
  },
  previewReducers: {
    molecule: {
      imageCache: { 101: 'svg' }
    }
  },
  projectReducers: {
    isProjectModalLoading: true
  }
});

describe('utilitySnapshotShapes', () => {
  it('removes downloaded data from saved snapshots and normalizes render flags', () => {
    expect.hasAssertions();

    const snapshotState = createSnapshotStateForSaving(createBaseState());

    expect(snapshotState.apiReducers.target_id_list).toStrictEqual([{ id: 7 }]);
    expect(snapshotState.apiReducers.all_mol_lists).toStrictEqual([]);
    expect(snapshotState.apiReducers.lhs_compounds_list).toStrictEqual([]);
    expect(snapshotState.apiReducers.rhs_compounds_list).toStrictEqual([]);
    expect(snapshotState.apiReducers.lhs_extra_columns).toStrictEqual([]);
    expect(snapshotState.apiReducers.noTagsReceived).toBe(true);
    expect(snapshotState.datasetsReducers.datasets).toStrictEqual([]);
    expect(snapshotState.datasetsReducers.moleculeLists).toStrictEqual({});
    expect(snapshotState.datasetsReducers.scoreDatasetMap).toStrictEqual({});
    expect(snapshotState.datasetsReducers.scoreCompoundMap).toStrictEqual({});
    expect(snapshotState.datasetsReducers.filteredScoreProperties).toStrictEqual({
      'dataset-1': [{ name: 'dock_score' }]
    });
    expect(snapshotState.selectionReducers.fragmentDisplayList).toStrictEqual([]);
    expect(snapshotState.selectionReducers.proteinList).toStrictEqual([]);
    expect(snapshotState.selectionReducers.complexList).toStrictEqual([]);
    expect(snapshotState.selectionReducers.surfaceList).toStrictEqual([]);
    expect(snapshotState.selectionReducers.densityList).toStrictEqual([]);
    expect(snapshotState.selectionReducers.densityListCustom).toStrictEqual([]);
    expect(snapshotState.selectionReducers.densityListType).toStrictEqual([]);
    expect(snapshotState.selectionReducers.qualityList).toStrictEqual([]);
    expect(snapshotState.selectionReducers.vectorOnList).toStrictEqual([]);
    expect(snapshotState.selectionReducers.lhsIsFullyRendered).toBe(false);
    expect(snapshotState.selectionReducers.rhsIsFullyRendered).toBe(false);
    expect(snapshotState.selectionReducers.rhsPoseNavigationConfig).toStrictEqual({
      transferOrder: POSE_TRANSFER_ORDERS.ADD_FIRST,
      transferScheduling: POSE_TRANSFER_SCHEDULING.PHASED,
      postTransferCenteringMode: POSE_TRANSFER_CENTERING_MODES.VISIBLE_LIGAND_CENTROID
    });
    expect(snapshotState.datasetsReducers.ligandLists).toStrictEqual({});
    expect(snapshotState.datasetsReducers.proteinLists).toStrictEqual({});
    expect(snapshotState.datasetsReducers.complexLists).toStrictEqual({});
    expect(snapshotState.datasetsReducers.surfaceLists).toStrictEqual({});
    expect(snapshotState.selectionReducers.toBeDisplayedList).toStrictEqual([
      { id: 101, type: 'ligand', center: false, rendered: false }
    ]);
    expect(snapshotState.datasetsReducers.toBeDisplayedList).toStrictEqual({
      'dataset-1': [{ id: 501, type: 'ligand', center: false, rendered: false }]
    });
    expect(snapshotState.nglReducers.objectsInView).toStrictEqual({});
    expect(snapshotState.nglReducers.objectsInSnapshotToBeRendered).toBe(2);
    expect(snapshotState.nglReducers.isSnapshotRendering).toBe(true);
    expect(snapshotState.nglReducers.isNGLQueueEmpty).toBe(false);
  });

  it('keeps current downloaded data when switching snapshots inside the same target', () => {
    expect.hasAssertions();

    const currentState = createBaseState();
    const snapshotSourceState = {
      ...createBaseState(),
      apiReducers: {
        ...createBaseState().apiReducers,
        all_mol_lists: [],
        lhs_compounds_list: [],
        rhs_compounds_list: [],
        lhsDataIsLoaded: false,
        rhsDataIsLoaded: false,
        all_data_loaded: false
      },
      selectionReducers: {
        ...createBaseState().selectionReducers,
        filter: { active: false },
        fragmentDisplayList: [999],
        proteinList: [888],
        complexList: [887],
        surfaceList: [886],
        densityList: [{ id: 885, sigma: 'fofc' }],
        densityListCustom: [885],
        densityListType: [{ id: 885, sigma: 'fofc' }],
        qualityList: [884],
        vectorOnList: [883],
        rhsPoseNavigationConfig: { ...DEFAULT_RHS_POSE_NAVIGATION_CONFIG },
        toBeDisplayedList: [{ id: 999, type: 'ligand', center: true, rendered: true }]
      },
      datasetsReducers: {
        ...createBaseState().datasetsReducers,
        datasets: [],
        moleculeLists: {},
        filteredScoreProperties: { 'dataset-1': [{ name: 'IC50' }] },
        ligandLists: { 'dataset-1': [777] },
        proteinLists: { 'dataset-1': [776] },
        complexLists: { 'dataset-1': [775] },
        surfaceLists: { 'dataset-1': [774] },
        toBeDisplayedList: {
          'dataset-1': [{ id: 777, type: 'ligand', center: true, rendered: true }]
        }
      }
    };
    const snapshotState = createSnapshotStateForSaving(snapshotSourceState);

    const mergedState = mergeSnapshotStateWithCurrentData(currentState, snapshotState);

    expect(mergedState.apiReducers.all_mol_lists).toStrictEqual([{ id: 101, code: 'LHS-101' }]);
    expect(mergedState.apiReducers.lhs_compounds_list).toStrictEqual([{ id: 'lhs-pose-1' }]);
    expect(mergedState.apiReducers.rhs_compounds_list).toStrictEqual([{ id: 'rhs-pose-1' }]);
    expect(mergedState.apiReducers.lhsDataIsLoaded).toBe(true);
    expect(mergedState.apiReducers.rhsDataIsLoaded).toBe(true);
    expect(mergedState.nglReducers.objectsInView).toStrictEqual({ ligand: { id: 1 } });
    expect(mergedState.nglReducers.pdbCache).toStrictEqual({ pdb: 'cached' });
    expect(mergedState.datasetsReducers.datasets).toStrictEqual([{ id: 'dataset-1' }]);
    expect(mergedState.datasetsReducers.moleculeLists).toStrictEqual({ 'dataset-1': [{ id: 501 }] });
    expect(mergedState.selectionReducers.fragmentDisplayList).toStrictEqual([101]);
    expect(mergedState.selectionReducers.proteinList).toStrictEqual([102]);
    expect(mergedState.selectionReducers.complexList).toStrictEqual([103]);
    expect(mergedState.selectionReducers.surfaceList).toStrictEqual([104]);
    expect(mergedState.selectionReducers.densityList).toStrictEqual([{ id: 105, sigma: '2fofc' }]);
    expect(mergedState.selectionReducers.densityListCustom).toStrictEqual([105]);
    expect(mergedState.selectionReducers.densityListType).toStrictEqual([{ id: 105, sigma: '2fofc' }]);
    expect(mergedState.selectionReducers.qualityList).toStrictEqual([106]);
    expect(mergedState.selectionReducers.vectorOnList).toStrictEqual([107]);
    expect(mergedState.selectionReducers.lhsIsFullyRendered).toBe(true);
    expect(mergedState.selectionReducers.rhsIsFullyRendered).toBe(true);
    expect(mergedState.selectionReducers.filter).toStrictEqual({ active: false });
    expect(mergedState.selectionReducers.rhsPoseNavigationConfig).toStrictEqual(
      DEFAULT_RHS_POSE_NAVIGATION_CONFIG
    );
    expect(mergedState.datasetsReducers.ligandLists).toStrictEqual({ 'dataset-1': [501] });
    expect(mergedState.datasetsReducers.proteinLists).toStrictEqual({ 'dataset-1': [502] });
    expect(mergedState.datasetsReducers.complexLists).toStrictEqual({ 'dataset-1': [503] });
    expect(mergedState.datasetsReducers.surfaceLists).toStrictEqual({ 'dataset-1': [504] });
    expect(mergedState.datasetsReducers.filteredScoreProperties).toStrictEqual({
      'dataset-1': [{ name: 'IC50' }]
    });
    expect(mergedState.selectionReducers.toBeDisplayedList).toStrictEqual([
      { id: 999, type: 'ligand', center: false, rendered: false }
    ]);
    expect(mergedState.datasetsReducers.toBeDisplayedList).toStrictEqual({
      'dataset-1': [{ id: 777, type: 'ligand', center: false, rendered: false }]
    });
  });

  it('uses navigation defaults when restoring a legacy snapshot without configuration', () => {
    expect.hasAssertions();
    const currentState = createBaseState();
    const legacySnapshotState = createBaseState();
    delete legacySnapshotState.selectionReducers.rhsPoseNavigationConfig;

    const mergedState = mergeSnapshotStateWithCurrentData(currentState, legacySnapshotState);

    expect(currentState.selectionReducers.rhsPoseNavigationConfig).not.toStrictEqual(
      DEFAULT_RHS_POSE_NAVIGATION_CONFIG
    );
    expect(mergedState.selectionReducers.rhsPoseNavigationConfig).toStrictEqual(
      DEFAULT_RHS_POSE_NAVIGATION_CONFIG
    );
  });

  it.each([
    [true, POSE_TRANSFER_CENTERING_MODES.DESIGN_LIGAND],
    [false, POSE_TRANSFER_CENTERING_MODES.NONE]
  ])('migrates legacy snapshot centering value %s', (legacyValue, expectedMode) => {
    expect.hasAssertions();
    const currentState = createBaseState();
    const legacySnapshotState = createBaseState();
    legacySnapshotState.selectionReducers.rhsPoseNavigationConfig = {
      transferOrder: POSE_TRANSFER_ORDERS.REMOVE_FIRST,
      transferScheduling: POSE_TRANSFER_SCHEDULING.OVERLAPPED,
      centerOnDestinationLigandAfterTransfer: legacyValue
    };

    const mergedState = mergeSnapshotStateWithCurrentData(currentState, legacySnapshotState);

    expect(mergedState.selectionReducers.rhsPoseNavigationConfig).toStrictEqual({
      transferOrder: POSE_TRANSFER_ORDERS.REMOVE_FIRST,
      transferScheduling: POSE_TRANSFER_SCHEDULING.OVERLAPPED,
      postTransferCenteringMode: expectedMode
    });
  });

  it('counts only actual new render work during in-place snapshot switches', () => {
    expect.hasAssertions();

    const currentState = createBaseState();
    const switchingState = {
      ...createBaseState(),
      selectionReducers: {
        ...createBaseState().selectionReducers,
        toBeDisplayedList: [
          { id: 101, type: 'LIGAND', display: true, center: true, rendered: true },
          { id: 102, type: 'PROTEIN', display: false, center: true, rendered: true },
          { id: 999, type: 'COMPLEX', display: true, center: true, rendered: true }
        ]
      },
      datasetsReducers: {
        ...createBaseState().datasetsReducers,
        toBeDisplayedList: {
          'dataset-1': [
            { id: 501, type: 'LIGAND', datasetID: 'dataset-1', display: true, center: true, rendered: true },
            { id: 777, type: 'PROTEIN', datasetID: 'dataset-1', display: true, center: true, rendered: true },
            { id: 888, type: 'SURFACE', datasetID: 'dataset-1', display: false, center: true, rendered: true }
          ]
        }
      },
      nglReducers: {
        ...createBaseState().nglReducers,
        objectsInSnapshotToBeRendered: 99,
        isSnapshotRendering: true,
        isNGLQueueEmpty: false
      }
    };

    const preparedState = prepareSwitchingSnapshotRenderState(currentState, switchingState);

    expect(preparedState.selectionReducers.toBeDisplayedList).toStrictEqual([
      { id: 101, type: 'LIGAND', display: true, center: true, rendered: true },
      { id: 102, type: 'PROTEIN', display: false, center: false, rendered: true },
      { id: 999, type: 'COMPLEX', display: true, center: true, rendered: false }
    ]);
    expect(preparedState.datasetsReducers.toBeDisplayedList).toStrictEqual({
      'dataset-1': [
        { id: 501, type: 'LIGAND', datasetID: 'dataset-1', display: true, center: true, rendered: true },
        { id: 777, type: 'PROTEIN', datasetID: 'dataset-1', display: true, center: true, rendered: false },
        { id: 888, type: 'SURFACE', datasetID: 'dataset-1', display: false, center: false, rendered: true }
      ]
    });
    expect(preparedState.nglReducers.objectsInSnapshotToBeRendered).toBe(2);
    expect(preparedState.nglReducers.isSnapshotRendering).toBe(true);
    expect(preparedState.nglReducers.isNGLQueueEmpty).toBe(false);
  });
});
