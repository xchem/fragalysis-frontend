import { comparePoseText, createPoseMembershipSelector, prependSelectedObservations } from './poseListPerformance';

const originalCompare = (a, b, ascending) =>
  ascending
    ? a?.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    : b?.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });

describe('pose list bulk calculations', () => {
  it('preserves selected-first ordering, strict IDs, first matches and caller-owned arrays', () => {
    expect.hasAssertions();
    const all = [{ id: 1 }, { id: '1' }, { id: 2 }, { id: 2, duplicate: true }, { id: 3 }];
    const original = Object.freeze([all[0]]);
    const next = prependSelectedObservations(original, [3, 2, 2, '1', 99], all);
    expect(next).toStrictEqual([all[4], all[2], all[1], all[0]]);
    const unchanged = prependSelectedObservations(original, [1], all);
    unchanged.push(all[2]);
    expect(original).toStrictEqual([all[0]]);
  });

  it('matches the original membership rules and retains results only while the actual poses agree', () => {
    expect.hasAssertions();
    const observations = [
      { id: 1, cmpd: 10 },
      { id: 2, cmpd: 20 }
    ];
    const poses = [
      { id: 'one', compound: 10, associatedObs: [observations[0]] },
      { id: 'independent-gates', compound: 20, associatedObs: [observations[0]] },
      { id: 'orphan', compound: 10, associatedObs: [{ id: 99 }] },
      { id: 'wrong-compound', compound: 99, associatedObs: [observations[1]] },
      { id: 'string-id', compound: 10, associatedObs: [{ id: '1' }] }
    ];
    const select = createPoseMembershipSelector();
    const first = select(poses, observations);
    expect(first).toStrictEqual(poses.slice(0, 2));
    expect(select([...poses], [...observations])).toBe(first);
    const replacement = { ...poses[0] };
    expect(select([replacement, ...poses.slice(1)], observations)[0]).toBe(replacement);
    expect(select(poses, [observations[0]])).toStrictEqual([poses[0]]);
    expect(select([...poses].reverse(), observations)).toStrictEqual([poses[1], poses[0]]);
  });

  it('indexes 930 observations with linear ID reads while retaining full table order', () => {
    expect.hasAssertions();
    let reads = 0;
    const observations = Array.from({ length: 930 }, (_, id) => ({
      get id() {
        reads++;
        return id;
      },
      cmpd: id
    }));
    const poses = observations.map((observation, id) => ({ id, compound: id, associatedObs: [{ id }] }));
    const select = createPoseMembershipSelector();
    expect(select(poses, observations)).toStrictEqual(poses);
    expect(reads).toBe(930);
    reads = 0;
    expect(
      prependSelectedObservations(
        observations,
        poses.map(pose => pose.id),
        observations
      )
    ).toStrictEqual(observations);
    expect(reads).toBeLessThanOrEqual(3720);
  });

  it('keeps numeric, case-insensitive, accented and missing-value sorting compatible', () => {
    expect.hasAssertions();
    const values = ['x10', 'x2', 'X1', 'é1', 'e1', '', undefined];
    for (const a of values)
      for (const b of values)
        for (const ascending of [true, false]) {
          const expected = originalCompare(a, b, ascending);
          expect(comparePoseText(a, b, ascending)).toBe(expected);
        }
  });
});
