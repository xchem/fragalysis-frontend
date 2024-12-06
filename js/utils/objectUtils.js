import { deepMerge } from './merge';

export const setDeepValue = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const lastObj = keys.reduce((obj, key) => (obj[key] = obj[key] || {}), obj);
  lastObj[lastKey] = value;
};

export const getDeepValue = (obj, path) => {
  return path.split('.').reduce((obj, key) => obj[key], obj);
};

export const deepMergeOjects = (a, b) => {
  return deepMerge(a, b);
};

//returns deep value but path is preserved in resulting object shape
export const getDeepValueWithKeys = (obj, path) => {
  const keys = path.split('.');
  return keys.reduce((obj, key) => ({ [key]: obj[key] }), obj);
};

//but this is specific for snapshot so it's not quite universal - at least I think so
export const deepMergeWithPriority = (a, b) => {
  const merge = (a, b) => {
    const keys = Object.keys(b);
    keys.forEach(key => {
      if (a[key] && typeof a[key] === 'object' && b[key] && typeof b[key] === 'object') {
        if (Array.isArray(a[key]) && Array.isArray(b[key])) {
          //   a[key] = [...a[key], ...b[key]];
          a[key] = [...b[key]];
        } else {
          // a[key] = deepMerge(a[key], b[key]);
          if (Object.keys(b[key]).length === 0) {
            a[key] = b[key];
          } else {
            a[key] = merge(a[key], b[key]);
          }
        }
      } else {
        a[key] = b[key];
      }
    });
    return a;
  };

  return merge({ ...a }, b);
};

export const deepClone = obj => {
  return JSON.parse(JSON.stringify(obj));
};

export const deepMergeWithPriorityAndBlackList = (a, b, blackList) => {
  const isWholePathPresentIntoBlackList = (path, blackList) => {
    let partOfBlackList = blackList;
    for (let i = 0; i < path.length; i++) {
      const pathToCheck = path[i];
      if (partOfBlackList[pathToCheck]) {
        partOfBlackList = partOfBlackList[pathToCheck];
        if (i === path.length - 1 && Object.keys(partOfBlackList).length > 0) {
          // console.log(`isWholePathPresentIntoBlackList - path: ${JSON.stringify(path)} - false - not entire path`);
          return false;
        }
      } else {
        // console.log(`isWholePathPresentIntoBlackList - path: ${JSON.stringify(path)} - false`);
        return false;
      }
    }
    // console.log(`isWholePathPresentIntoBlackList - path: ${JSON.stringify(path)} - true`);
    return true;
  };
  const merge = (a, b, path) => {
    const keys = Object.keys(b);

    keys.forEach(key => {
      const currentPath = [...path, key];
      if (!isWholePathPresentIntoBlackList(currentPath, blackList)) {
        if (a[key] && typeof a[key] === 'object' && b[key] && typeof b[key] === 'object') {
          if (
            Array.isArray(a[key]) &&
            Array.isArray(b[key]) &&
            !isWholePathPresentIntoBlackList(currentPath, blackList)
          ) {
            a[key] = [...b[key]];
          } else {
            if (Object.keys(b[key]).length === 0 && !isWholePathPresentIntoBlackList(currentPath, blackList)) {
              a[key] = b[key];
            } else {
              a[key] = merge(a[key], b[key], currentPath);
            }
          }
        } else {
          if (!isWholePathPresentIntoBlackList(currentPath, blackList)) {
            a[key] = b[key];
          }
        }
      }
    });

    // currentPath.pop();
    return a;
  };

  return merge({ ...a }, b, []);
};

export const deepEqual = (obj1, obj2, path = '') => {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    console.log(`deepEqual - Mismatch found at ${path || 'root'}: ${obj1} !== ${obj2}`);
    return false;
  }

  if (Array.isArray(obj1) !== Array.isArray(obj2)) {
    console.log(`deepEqual - Type mismatch at ${path || 'root'}: One is array, the other is not`);
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    console.log(`deepEqual - Key length mismatch at ${path || 'root'}: ${keys1.length} !== ${keys2.length}`);
    return false;
  }

  for (const key of keys1) {
    const newPath = path ? `${path}.${key}` : key;
    if (!keys2.includes(key)) {
      console.log(`deepEqual - Key missing in second object at ${newPath}`);
      return false;
    }
    if (!deepEqual(obj1[key], obj2[key], newPath)) {
      return false;
    }
  }

  return true;
};
