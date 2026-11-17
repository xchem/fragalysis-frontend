import { createDisplayTreeModel } from './treeModel';
import { VIEWS } from '../../../../constants/constants';
import { SELECTION_TYPE } from '../../../nglView/constants';

const object = name => ({
  name,
  display_div: VIEWS.MAJOR_VIEW,
  representations: [
    { type: 'line', lastKnownID: 'z' },
    { type: 'ball+stick', lastKnownID: 'a' }
  ]
});

describe('display controls tree model', () => {
  it('preserves object sorting, representation keys and filtering without mutating Redux arrays', () => {
    expect.hasAssertions();
    const a = object('a');
    const before = [...a.representations];
    const tree = createDisplayTreeModel()({
      z: object('z'),
      a,
      vector: { ...object('vector'), selectionType: SELECTION_TYPE.VECTOR },
      other: { ...object('other'), display_div: 'secondary' }
    });
    expect(tree.items.map(item => item.id)).toStrictEqual(['a', 'z']);
    expect(tree.items[0].children.map(item => [item.id, item.representation.lastKnownID])).toStrictEqual([
      ['a___0', 'a'],
      ['a___1', 'z']
    ]);
    expect(a.representations).toStrictEqual(before);
  });

  it('retains unchanged models through additions, updates and removal, and rebases snapshot copies', () => {
    expect.hasAssertions();
    const build = createDisplayTreeModel();
    const a = object('a');
    const first = build({ a });
    expect(build({ a })).toBe(first);
    const second = build({ a, b: object('b') });
    expect(second.items[0]).toBe(first.items[0]);
    expect(build({ a }).items[0]).toBe(first.items[0]);
    const cloned = JSON.parse(JSON.stringify(a));
    expect(build({ a: cloned }).items[0]).not.toBe(first.items[0]);
    expect(build({ a: cloned }).byId.get('a___0').representation).toBe(cloned.representations[1]);
    expect(build({}).byId.size).toBe(0);
  });
});
