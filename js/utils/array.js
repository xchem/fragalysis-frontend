const observationCompareFn = (a, b) => {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
};

export const areArraysSame = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const sortedArr1 = arr1.sort(observationCompareFn);
  const sortedArr2 = arr2.sort(observationCompareFn);

  for (let i = 0; i < sortedArr1.length; i++) {
    if (typeof sortedArr1[i] !== typeof sortedArr2[i]) {
      return false;
    }
    if (typeof sortedArr1[i] === 'object') {
      if (!areObjectsSame(sortedArr1[i], sortedArr2[i])) {
        return false;
      }
    }
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false;
    }
  }

  return true;
};

export const areObjectsSame = (obj1, obj2) => {
  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }

  for (const key in obj1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
};
