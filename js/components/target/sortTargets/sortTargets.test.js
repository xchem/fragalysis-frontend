import {
  compareTargetAccessStringAsc,
  compareTargetAccessStringDesc,
  getTargetAccessStringDisplayValue
} from './sortTargets';

describe('target access string display value', () => {
  it('uses project alias before falling back to target access string', () => {
    expect.hasAssertions();

    expect(
      getTargetAccessStringDisplayValue({
        project: { alias: 'Friendly TAS', target_access_string: 'raw-tas' }
      })
    ).toBe('Friendly TAS');

    expect(
      getTargetAccessStringDisplayValue({
        project: { alias: '', target_access_string: 'raw-tas' }
      })
    ).toBe('raw-tas');

    expect(getTargetAccessStringDisplayValue({ project: null })).toBe('');
  });

  it('sorts target access strings by the displayed alias fallback value', () => {
    expect.hasAssertions();

    const aliasedTarget = {
      id: 1,
      project: { alias: 'aaa-alias', target_access_string: 'zzz-raw-tas' }
    };
    const fallbackTarget = {
      id: 2,
      project: { alias: null, target_access_string: 'bbb-raw-tas' }
    };

    expect([fallbackTarget, aliasedTarget].sort(compareTargetAccessStringAsc).map(target => target.id)).toStrictEqual([
      1,
      2
    ]);
    expect([aliasedTarget, fallbackTarget].sort(compareTargetAccessStringDesc).map(target => target.id)).toStrictEqual([
      2,
      1
    ]);
  });
});
