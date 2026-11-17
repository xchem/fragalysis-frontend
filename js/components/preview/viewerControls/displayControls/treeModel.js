import { VIEWS } from '../../../../constants/constants';
import { SELECTION_TYPE } from '../../../nglView/constants';

const sameProps = (a, b) =>
  Object.keys(a).length === Object.keys(b).length && Object.keys(a).every(key => Object.is(a[key], b[key]));
const sameElement = (a, b) =>
  a === b ||
  Boolean(a && b && a.props && b.props && a.type === b.type && a.key === b.key && sameProps(a.props, b.props));

// RichTreeView regenerates wrapper elements during model updates. Compare their
// actual props, not the newly allocated JSX/children arrays, before redoing the
// unchanged TreeItem's styled slots. Its own focus/expansion subscriptions remain live.
export const sameDisplayTreeItemProps = (a, b) =>
  Object.keys(a).length === Object.keys(b).length &&
  Object.keys(a).every(key => {
    if (key === 'label') return sameElement(a[key], b[key]);
    if (key === 'children') {
      const before = a.children || [];
      const after = b.children || [];
      return before.length === after.length && before.every((child, index) => sameElement(child, after[index]));
    }
    return Object.is(a[key], b[key]);
  });

// Cache detached display records only. Native viewer handles never enter this model.
export const createDisplayTreeModel = () => {
  let cache = new Map();
  let previous = { items: [], byId: new Map() };
  return objects => {
    const nextCache = new Map();
    const byId = new Map();
    const items = Object.keys(objects)
      .filter(
        key => objects[key].display_div === VIEWS.MAJOR_VIEW && objects[key].selectionType !== SELECTION_TYPE.VECTOR
      )
      .sort((a, b) => a.localeCompare(b))
      .map(key => {
        const object = objects[key];
        let entry = cache.get(key);
        if (entry?.object !== object) {
          const children = [...(object.representations || [])]
            .sort((a, b) => (a.lastKnownID > b.lastKnownID ? 1 : -1))
            .map((representation, index) => ({
              id: `${object.name}___${index}`,
              label: representation.type,
              parentKey: key,
              representationIndex: index,
              representation
            }));
          entry = { object, item: { id: object.name, label: object.name, parentKey: key, children } };
        }
        nextCache.set(key, entry);
        byId.set(entry.item.id, entry.item);
        entry.item.children.forEach(child => byId.set(child.id, child));
        return entry.item;
      });
    cache = nextCache;
    if (items.length !== previous.items.length || items.some((item, index) => item !== previous.items[index])) {
      previous = { items, byId };
    }
    return previous;
  };
};
