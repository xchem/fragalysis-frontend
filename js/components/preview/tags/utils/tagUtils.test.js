import { compareTagsByCategoryAndName } from './tagUtils';

describe('tag name sorting', () => {
  it('preserves category-first sorting and numeric, case-insensitive, accented and prefixed names', () => {
    expect.hasAssertions();
    const tags = ['x10', 'x2', 'X1', 'é1', 'e1', ''].flatMap(tag => [
      { category: 1, tag },
      { category: 2, tag },
      { category: 1, tag, tag_prefix: '2' },
      { category: 1, tag, tag_prefix: '10' }
    ]);
    for (const a of tags)
      for (const b of tags)
        for (const ascending of [true, false]) {
          const aName = a.tag_prefix ? `${a.tag_prefix} - ${a.tag}` : a.tag;
          const bName = b.tag_prefix ? `${b.tag_prefix} - ${b.tag}` : b.tag;
          const expected =
            a.category < b.category
              ? -1
              : a.category > b.category
              ? 1
              : (ascending ? aName : bName).localeCompare(ascending ? bName : aName, undefined, {
                  numeric: true,
                  sensitivity: 'base'
                });
          expect(Math.sign(compareTagsByCategoryAndName(a, b, ascending))).toBe(Math.sign(expected));
        }
  });
});
