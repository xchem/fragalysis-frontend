import selectionReducer, { INITIAL_STATE } from './selectionReducers';
import * as selectionActions from './actions';

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

  it('should set initial full graph', () => {
    expect.hasAssertions();
    const item = {
      smiles: 'to_query',
      id: 'to_query_pk',
      sdf_info: 'to_query_sdf_info',
      prot_id: 'to_query_prot'
    };
    let result = selectionReducer(initialState, selectionActions.setInitialFullGraph(item));

    expect(result.to_query).toStrictEqual(item.smiles);
    expect(result.to_query_pk).toStrictEqual(item.id);
    expect(result.to_query_sdf_info).toStrictEqual(item.sdf_info);
    expect(result.to_query_prot).toStrictEqual(item.prot_id);
    expect(result.to_select).toStrictEqual({});
    expect(result.querying).toStrictEqual(true);
  });

  it('should update full graph', () => {
    expect.hasAssertions();
    const initialItem = {
      to_select: {},
      to_query_pk: 'to_query_pk',
      to_query_prot: 'to_query_prot',
      to_query_sdf_info: 'to_query_sdf_info',
      querying: true,
      to_query: 'to_query'
    };

    const item = {
      'Cc1cc([Xe])no1_2_REPLACE': {
        addition: [
          {
            end: 'Cc1cc(CN(C)C(C)C(N)=O)no1',
            change: 'CC(C(N)O)N(C)C[101Xe]'
          },
          {
            end: 'Cc1cc(C(=O)NN=CC(C)(C)C)no1',
            change: 'CC(C)(C)CNNC(O)[101Xe]'
          },
          {
            end: 'Cc1cc(NCC(C)(C)C)no1',
            change: 'CC(C)(C)CN[101Xe]'
          }
        ],
        vector: 'CC1CCC([101Xe])C1'
      }
    };

    let result = selectionReducer(Object.assign({}, initialState, initialItem), selectionActions.updateFullGraph(item));
    expect(result.to_select).toStrictEqual(item);
    expect(result.querying).toStrictEqual(false);

    const item2 = {
      'C[Xe].NC(=O)NCC[Xe]_2_LINKER': {
        addition: [
          {
            end: 'Cc1csc(CCNC(N)=O)n1',
            change: '[100Xe]C1CCC([101Xe])C1'
          }
        ],
        vector: 'C[100Xe].NC(O)NCC[101Xe]'
      }
    };

    result = selectionReducer(Object.assign({}, result), selectionActions.updateFullGraph(item2));

    expect(result.to_select).not.toStrictEqual(item);
    expect(result.to_select).toStrictEqual(item2);
    expect(result.querying).toStrictEqual(false);
  });

  it('should set bond color map', () => {
    expect.hasAssertions();
    const item = { a: 4, b: 'abe' };

    let result = selectionReducer(initialState, selectionActions.setBondColorMap(item));
    expect(result.bondColorMap).toStrictEqual(item);
  });

  it('should set to query', () => {
    expect.hasAssertions();
    const item = { a: 4, b: 'abe' };

    let result = selectionReducer(initialState, selectionActions.setToQuery(item));
    expect(result.to_query).toStrictEqual(item);
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
    const vectorKey = `${vectorId}_x34sgk&&40fk`;
    const vectorValue = 45;

    const initialData = {
      // symbol '_' is important there
      to_select: { [vectorKey]: vectorValue }
    };

    let result = selectionReducer(
      Object.assign({}, initialState, initialData),
      selectionActions.setCurrentVector(vectorId)
    );
    expect(result.this_vector_list).toStrictEqual({ [vectorKey]: vectorValue });
    expect(result.currentVector).toStrictEqual(vectorId);
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
    expect(result.currentVector).toBeUndefined();
  });

  it('should reload selection reducer', () => {
    expect.hasAssertions();
    const vectorKey = 'abc';
    const savedSelectionReducers = {
      to_select: {
        1: 'send_obj.index',
        [vectorKey]: 'send_obj.smiles',
        3: { a: 'ff', b: 69 }
      },
      currentVector: vectorKey,
      fragmentDisplayList: ['dfsd', 'dsgds', 12, 78],
      complexList: ['ffd', 556, '234'],
      vectorOnList: [67, 99]
    };

    let result = selectionReducer(
      Object.assign({}, initialState, { vectorOnList: ['aaaaa'], complexList: 'bbbb' }),
      selectionActions.reloadSelectionReducer(savedSelectionReducers)
    );

    expect(result.this_vector_list[result.currentVector]).toStrictEqual(
      savedSelectionReducers.to_select[savedSelectionReducers.currentVector]
    );

    expect(result.fragmentDisplayList).toStrictEqual(savedSelectionReducers.fragmentDisplayList);
    expect(result.complexList).toStrictEqual(savedSelectionReducers.complexList);
    expect(result.vectorOnList).toStrictEqual(savedSelectionReducers.vectorOnList);
  });

  it('should reset selection state', () => {
    expect.hasAssertions();
    const vectorKey = 'abc';
    const savedSelectionReducers = {
      to_select: {
        1: 'send_obj.index',
        [vectorKey]: 'send_obj.smiles',
        3: { a: 'ff', b: 69 }
      },
      currentVector: vectorKey,
      fragmentDisplayList: ['dfsd', 'dsgds', 12, 78],
      complexList: ['ffd', 556, '234'],
      vectorOnList: [67, 99]
    };

    let result = selectionReducer(
      Object.assign({}, initialState, { vectorOnList: ['aaaaa'], complexList: 'bbbb' }),
      selectionActions.resetSelectionState(savedSelectionReducers)
    );
    expect(result).toStrictEqual(INITIAL_STATE);
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
