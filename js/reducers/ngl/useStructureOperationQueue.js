import { useMemo } from 'react';

export const createStructureOperationQueue = () => {
  const operations = new Map();
  return (item, operation) => {
    const key = `${item.datasetID ?? ''}:${item.type}:${item.id}`;
    const previous = operations.get(key);
    // Effects can run again while coordinates are still being fetched, before
    // the display list acknowledges the load. Claim that work synchronously.
    if (previous && previous.display === item.display) return previous.promise;
    const entry = { display: item.display };
    entry.promise = Promise.resolve(previous?.promise).catch(() => undefined).then(() => operation(item));
    operations.set(key, entry);
    const clear = () => {
      if (operations.get(key) === entry) operations.delete(key);
    };
    entry.promise.then(clear, error => {
      clear();
      console.error('Unable to update displayed structure', error);
    });
    return entry.promise;
  };
};

export const useStructureOperationQueue = () => useMemo(createStructureOperationQueue, []);
