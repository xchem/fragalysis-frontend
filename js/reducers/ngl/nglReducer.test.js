import nglReducers, { INITIAL_STATE } from './nglReducers';
import * as nglActions from './nglActions';

describe("testing ngl reducer's actions", () => {
  let initialState = nglReducers(INITIAL_STATE, {});

  console.log();

  it('should increment and decrement count of pending ngl objects', () => {
    expect.hasAssertions();
    let result = nglReducers(initialState, nglActions.incrementCountOfPendingNglObjects());
    expect(result.countOfPendingNglObjects).toBe(1);
    result = nglReducers(initialState, nglActions.decrementCountOfPendingNglObjects());
    expect(result.countOfPendingNglObjects).toBe(0);
  });
});
