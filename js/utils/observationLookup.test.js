import { createObservationLookup } from './observationLookup';

describe('observation membership lookup', () => {
  it('matches full-list filtering with duplicate, missing and mixed-type IDs in source order', () => {
    expect.hasAssertions();
    const observations = Object.freeze([{ id: 2 }, { id: 1 }, { id: '1' }, { id: 2, duplicate: true }, { id: NaN }]);
    const lookup = createObservationLookup(observations);
    for (const ids of [[1, 2, 2, 99], ['1'], [NaN], [], [2, '1', 1]]) {
      const result = lookup(Object.freeze(ids));
      const expected = observations.filter(observation => ids.includes(observation.id));
      expect(result).toStrictEqual(expected);
      result.forEach((observation, index) => expect(observation).toBe(expected[index]));
    }
    const first = lookup([1]);
    first.push({ id: 99 });
    expect(lookup([1])).toStrictEqual([observations[1]]);
    expect(lookup(undefined)).toStrictEqual([]);
  });

  it('reads observation IDs once when preparing many independent subsets', () => {
    expect.hasAssertions();
    let reads = 0;
    const observations = Array.from({ length: 930 }, (_, id) => ({
      get id() {
        reads++;
        return id;
      }
    }));
    const lookup = createObservationLookup(observations);
    observations.forEach((observation, id) => expect(lookup([id])[0]).toBe(observation));
    expect(reads).toBeLessThanOrEqual(observations.length * 2);
  });
});
