import { selectionReducers as selectionReducer, INITIAL_STATE } from './selectionReducers';
import * as selectionActions from './actions';
import {
  DEFAULT_RHS_POSE_NAVIGATION_CONFIG,
  POSE_TRANSFER_CENTERING_MODES,
  POSE_TRANSFER_ORDERS,
  POSE_TRANSFER_SCHEDULING
} from '../../constants/poseNavigation';

describe("testing selection reducer's actions", () => {
  let initialState = selectionReducer(INITIAL_STATE, {});

  it('should append and remove item in to_buy_list', () => {
    expect.hasAssertions();
    const item = 'myItem';
    let result = selectionReducer(initialState, selectionActions.appendToBuyList(item));
    expect(result.to_buy_list).toContain(item);

    result = selectionReducer(initialState, selectionActions.removeFromToBuyList(item));
    expect(result.to_buy_list).not.toContain(item);
  });

  it('should set to_buy_list', () => {
    expect.hasAssertions();
    const to_buy_list = [30, 40, 50, 60];
    let result = selectionReducer(initialState, selectionActions.setToBuyList(to_buy_list));
    expect(result.to_buy_list).toStrictEqual(to_buy_list);
  });

  it('should set vector list', () => {
    expect.hasAssertions();
    const list = ['efg', 'rrgfd', 'ggg'];

    let result = selectionReducer(initialState, selectionActions.setVectorList(list));
    expect(result.vector_list).toStrictEqual(list);
  });

  it('should select vector', () => {
    expect.hasAssertions();
    const vectorId = 'tempVector123';

    let result = selectionReducer(initialState, selectionActions.setCurrentVector(vectorId));
    expect(result.currentVector).toStrictEqual(vectorId);
  });

  it('should update RHS pose navigation configuration incrementally', () => {
    expect.hasAssertions();

    const addFirstState = selectionReducer(
      initialState,
      selectionActions.setRhsPoseNavigationConfig({ transferOrder: POSE_TRANSFER_ORDERS.ADD_FIRST })
    );
    const configuredState = selectionReducer(
      addFirstState,
      selectionActions.setRhsPoseNavigationConfig({
        transferScheduling: POSE_TRANSFER_SCHEDULING.PHASED,
        postTransferCenteringMode: POSE_TRANSFER_CENTERING_MODES.VISIBLE_LIGAND_CENTROID
      })
    );

    expect(configuredState.rhsPoseNavigationConfig).toStrictEqual({
      transferOrder: POSE_TRANSFER_ORDERS.ADD_FIRST,
      transferScheduling: POSE_TRANSFER_SCHEDULING.PHASED,
      postTransferCenteringMode: POSE_TRANSFER_CENTERING_MODES.VISIBLE_LIGAND_CENTROID
    });
  });

  it('should set fragmentDisplayList', () => {
    expect.hasAssertions();
    const fragmentDisplayList = [30, 40, 50, 60];
    let result = selectionReducer(initialState, selectionActions.setFragmentDisplayList(fragmentDisplayList));
    expect(result.fragmentDisplayList).toStrictEqual(fragmentDisplayList);
  });

  it('should append and remove item in fragmentDisplayList', () => {
    expect.hasAssertions();
    const newItem = { id: 15 };
    let result = selectionReducer(initialState, selectionActions.appendFragmentDisplayList(newItem));
    expect(result.fragmentDisplayList).toContain(newItem.id);

    result = selectionReducer(initialState, selectionActions.removeFromFragmentDisplayList(newItem));
    expect(result.fragmentDisplayList).not.toContain(newItem.id);
  });

  it('should set complexList', () => {
    expect.hasAssertions();
    const complexList = [30, 40, 50, 60];
    let result = selectionReducer(initialState, selectionActions.setComplexList(complexList));
    expect(result.complexList).toStrictEqual(complexList);
  });

  it('should append and remove item in complexList', () => {
    expect.hasAssertions();
    const complexItem = { id: 10 };
    let result = selectionReducer(initialState, selectionActions.appendComplexList(complexItem));
    expect(result.complexList).toContain(complexItem.id);

    result = selectionReducer(initialState, selectionActions.removeFromComplexList(complexItem));
    expect(result.complexList).not.toContain(complexItem.id);
  });

  it('should append and remove item in artefactsChainList', () => {
    expect.hasAssertions();
    const artefactItem = { id: 11 };
    let result = selectionReducer(initialState, selectionActions.appendArtefactsChainList(artefactItem));
    expect(result.artefactsChainList).toContain(artefactItem.id);

    result = selectionReducer(initialState, selectionActions.removeFromArtefactsChainList(artefactItem));
    expect(result.artefactsChainList).not.toContain(artefactItem.id);
  });

  it('should store protein settings by molecule id', () => {
    expect.hasAssertions();
    const proteinSetting = { id: 12, protein: true, artefact: false };
    let result = selectionReducer(initialState, selectionActions.appendProteinSettings(proteinSetting));
    expect(result.proteinSettings).toContainEqual(proteinSetting);

    const updatedSetting = { id: 12, protein: false, artefact: true };
    result = selectionReducer(result, selectionActions.appendProteinSettings(updatedSetting));
    expect(result.proteinSettings).toStrictEqual([updatedSetting]);

    result = selectionReducer(result, selectionActions.removeProteinSettings(updatedSetting));
    expect(result.proteinSettings).toStrictEqual([]);
  });

  it('should set vectorOnList', () => {
    expect.hasAssertions();
    const vectorOnList = [30, 40, 50, 60];
    let result = selectionReducer(initialState, selectionActions.setVectorOnList(vectorOnList));
    expect(result.vectorOnList).toStrictEqual(vectorOnList);
  });

  it('should append and remove item in vectorOnList', () => {
    expect.hasAssertions();
    const newItem = { id: 16 };
    let result = selectionReducer(initialState, selectionActions.appendVectorOnList(newItem));
    expect(result.vectorOnList).toContain(newItem.id);

    result = selectionReducer(initialState, selectionActions.removeFromVectorOnList(newItem));
    expect(result.vectorOnList).not.toContain(newItem.id);
    expect(result.currentVector).toBeNull();
  });

  it('should reload selection reducer', () => {
    expect.hasAssertions();
    const vectorKey = 'abc';
    const savedSelectionReducers = {
      currentVector: vectorKey,
      fragmentDisplayList: ['dfsd', 'dsgds', 12, 78],
      proteinList: ['protein-1', 22],
      artefactsChainList: ['artefact-1', 22],
      complexList: ['ffd', 556, '234'],
      surfaceList: ['surface-1'],
      densityList: [{ id: 'density-1', type: 'event' }],
      proteinSettings: [{ id: 22, protein: true, artefact: false }],
      vectorOnList: [67, 99]
    };

    let result = selectionReducer(
      Object.assign({}, initialState, { vectorOnList: ['aaaaa'], complexList: 'bbbb' }),
      selectionActions.reloadSelectionReducer(savedSelectionReducers)
    );

    expect(result.currentVector).toStrictEqual(savedSelectionReducers.currentVector);
    expect(result.fragmentDisplayList).toStrictEqual(savedSelectionReducers.fragmentDisplayList);
    expect(result.proteinList).toStrictEqual(savedSelectionReducers.proteinList);
    expect(result.artefactsChainList).toStrictEqual(savedSelectionReducers.artefactsChainList);
    expect(result.complexList).toStrictEqual(savedSelectionReducers.complexList);
    expect(result.surfaceList).toStrictEqual(savedSelectionReducers.surfaceList);
    expect(result.densityList).toStrictEqual(savedSelectionReducers.densityList);
    expect(result.proteinSettings).toStrictEqual(savedSelectionReducers.proteinSettings);
    expect(result.vectorOnList).toStrictEqual(savedSelectionReducers.vectorOnList);
    expect(result.rhsPoseNavigationConfig).toStrictEqual(DEFAULT_RHS_POSE_NAVIGATION_CONFIG);
  });

  it('should reset selection state', () => {
    expect.hasAssertions();
    const currentState = {
      fragmentDisplayList: ['dfsd', 'dsgds', 12, 78],
      proteinList: ['protein-1'],
      artefactsChainList: ['artefact-1'],
      complexList: ['ffd', 556, '234'],
      surfaceList: ['surface-1'],
      densityList: [{ id: 'density-1', type: 'event' }],
      densityListType: [{ id: 'density-1', type: 'event' }],
      qualityList: ['quality-1'],
      vectorOnList: [67, 99],
      informationList: [14],
      moleculesToEdit: [123],
      proteinSettings: [{ id: 1, protein: true, artefact: true }]
    };

    let result = selectionReducer(
      Object.assign({}, initialState, currentState),
      selectionActions.resetSelectionState()
    );
    expect(result.fragmentDisplayList).toStrictEqual(currentState.fragmentDisplayList);
    expect(result.proteinList).toStrictEqual(currentState.proteinList);
    expect(result.artefactsChainList).toStrictEqual(currentState.artefactsChainList);
    expect(result.complexList).toStrictEqual(currentState.complexList);
    expect(result.surfaceList).toStrictEqual(currentState.surfaceList);
    expect(result.densityList).toStrictEqual(currentState.densityList);
    expect(result.densityListType).toStrictEqual(currentState.densityListType);
    expect(result.qualityList).toStrictEqual(currentState.qualityList);
    expect(result.vectorOnList).toStrictEqual(currentState.vectorOnList);
    expect(result.informationList).toStrictEqual(currentState.informationList);
    expect(result.moleculesToEdit).toStrictEqual(INITIAL_STATE.moleculesToEdit);
    expect(result.proteinSettings).toStrictEqual(INITIAL_STATE.proteinSettings);
  });

  it('should set molecule group selection', () => {
    expect.hasAssertions();
    const mol_group_selection = [30, 40, 50, 60];
    let result = selectionReducer(initialState, selectionActions.setMolGroupSelection(mol_group_selection));
    expect(result.mol_group_selection).toStrictEqual(mol_group_selection);
  });

  it('should set object selection', () => {
    expect.hasAssertions();
    const object_selection = [30, 40, 50, 60];
    let result = selectionReducer(initialState, selectionActions.setObjectSelection(object_selection));
    expect(result.object_selection).toStrictEqual(object_selection);
  });
});
