import { createPoseRowSelectionSelector, hasIdMembership, hasObservationMembership } from './selectionMembership';
import { isAnyObservationTurnedOnForCmp } from './selectors';
import { selectionReducers } from './selectionReducers';
import { appendFragmentDisplayList, removeFromFragmentDisplayList, setDensityList, setQualityList } from './actions';

const base = () => ({ selectionReducers: selectionReducers(undefined, {}) });
const reduce = (state, action) => ({ ...state, selectionReducers: selectionReducers(state.selectionReducers, action) });

describe('pose selection membership', () => {
  it('preserves primitive membership, density-object membership and strict numeric/string identity', () => {
    expect.hasAssertions();
    const observations = [{ id: 1 }, { id: '2' }];
    expect(hasObservationMembership([1], observations)).toBe(true);
    expect(hasObservationMembership(['1', 2], observations)).toBe(false);
    expect(hasObservationMembership([{ id: 1 }], observations)).toBe(false);
    expect(hasObservationMembership([{ id: 1, render_event: true }], observations, true)).toBe(true);
    expect(hasObservationMembership([1], observations, true)).toBe(false);
    expect(hasObservationMembership(undefined, observations)).toBe(false);
    expect(hasIdMembership([1], ['1'])).toBe(false);
  });

  it('changes only the affected selector through 930 real reducer acknowledgements', () => {
    expect.hasAssertions();
    let state = base();
    const observations = Array.from({ length: 930 }, (_, id) => [{ id }]);
    const selectors = observations.map(() => createPoseRowSelectionSelector());
    let previous = selectors.map((selector, i) => selector(state, observations[i]));
    for (let id = 0; id < 930; id++) {
      state = reduce(state, appendFragmentDisplayList({ id }));
      const currentState = state;
      const previousResults = previous;
      const next = selectors.map((selector, i) => selector(currentState, observations[i]));
      const changed = next.reduce((count, result, i) => count + Number(result !== previousResults[i]), 0);
      expect(changed).toBe(1);
      expect(next[id].ligands).toStrictEqual(observations[id]);
      previous = next;
    }
    expect(state.selectionReducers.fragmentDisplayList).toHaveLength(930);
  });

  it('keeps subsets stable on unrelated changes and updates removals and additional observations of the same pose', () => {
    expect.hasAssertions();
    const observations = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const selector = createPoseRowSelectionSelector();
    let state = reduce(base(), appendFragmentDisplayList({ id: 1 }));
    const first = selector(state, observations);
    state = reduce(state, appendFragmentDisplayList({ id: 99 }));
    expect(selector(state, observations)).toBe(first);
    state = reduce(state, appendFragmentDisplayList({ id: 2 }));
    const second = selector(state, observations);
    expect(second.ligands).toStrictEqual(observations.slice(0, 2));
    expect(second.proteins).toBe(first.proteins);
    state = reduce(state, removeFromFragmentDisplayList({ id: 1 }));
    expect(selector(state, observations).ligands).toStrictEqual([observations[1]]);
    state = reduce(state, setDensityList([{ id: 3, render_event: true }]));
    expect(selector(state, observations).densities).toStrictEqual([observations[2]]);
    state = reduce(state, setQualityList([2]));
    expect(selector(state, observations).quality).toStrictEqual([observations[1]]);
  });

  it('rebases onto cloned snapshot lists and new observation references without mutating input state', () => {
    expect.hasAssertions();
    const observation = Object.freeze({ id: 1, name: 'before' });
    const selector = createPoseRowSelectionSelector();
    const state = reduce(base(), appendFragmentDisplayList({ id: 1 }));
    const before = JSON.stringify(state);
    const first = selector(state, [observation]);
    const snapshot = JSON.parse(before);
    const replacement = { ...observation, name: 'after' };
    const next = selector(snapshot, [replacement]);
    expect(next.ligands[0]).toBe(replacement);
    expect(next).not.toBe(first);
    expect(selector({ ...snapshot, nglReducers: {} }, [replacement])).toBe(next);
    expect(JSON.stringify(state)).toBe(before);
  });

  it('retains the existing any-observation rules, including density records and exclusion of artefact/quality-only state', () => {
    expect.hasAssertions();
    const state = base();
    state.selectionReducers.artefactsChainList = [1];
    state.selectionReducers.qualityList = [1];
    expect(isAnyObservationTurnedOnForCmp(state, [1])).toBe(false);
    state.selectionReducers.densityList = [{ id: 2, render_diff: true }];
    expect(isAnyObservationTurnedOnForCmp(state, [1, 2])).toBe(true);
    expect(isAnyObservationTurnedOnForCmp(state, ['2'])).toBe(false);
    state.selectionReducers.vectorOnList = [3];
    expect(isAnyObservationTurnedOnForCmp(state, [3])).toBe(true);
  });
});
