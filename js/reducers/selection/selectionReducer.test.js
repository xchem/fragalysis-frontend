import selectionReducer from './selectionReducers';
import * as selectionActions from './selectionActions';

describe("testing selection reducer's actions", () => {
  let initialState = selectionReducer(undefined, {});

  it('should append and remove item in complexList', () => {
    expect.hasAssertions();
    const complexItem = { id: 10 };
    let result = selectionReducer(initialState, selectionActions.appendComplexList(complexItem));
    expect(result.complexList).toContain(complexItem.id);

    result = selectionReducer(initialState, selectionActions.removeFromComplexList(complexItem));
    expect(result.complexList).not.toContain(complexItem.id);
  });

  it('should append and remove item in fragmentDisplayList', () => {
    expect.hasAssertions();
    const newItem = { id: 15 };
    let result = selectionReducer(initialState, selectionActions.appendFragmentDisplayList(newItem));
    expect(result.fragmentDisplayList).toContain(newItem.id);

    result = selectionReducer(initialState, selectionActions.removeFromFragmentDisplayList(newItem));
    expect(result.fragmentDisplayList).not.toContain(newItem.id);
  });

  it('should append and remove item in vectorOnList', () => {
    expect.hasAssertions();
    const newItem = { id: 16 };
    let result = selectionReducer(initialState, selectionActions.appendVectorOnList(newItem));
    expect(result.vectorOnList).toContain(newItem.id);

    result = selectionReducer(initialState, selectionActions.removeFromVectorOnList(newItem));
    expect(result.vectorOnList).not.toContain(newItem.id);
  });
});
