import { createStructureOperationQueue } from './useStructureOperationQueue';

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((accept, fail) => { resolve = accept; reject = fail; });
  return { promise, resolve, reject };
};

describe('structure operation queue', () => {
  it('claims repeated effects once and orders load, remove and reload for one structure', async () => {
    expect.hasAssertions();
    const run = createStructureOperationQueue();
    const loading = deferred();
    const deleting = deferred();
    const item = { id: 1, type: 'LIGAND', display: true };
    const load = jest.fn(() => loading.promise);
    const remove = jest.fn(() => deleting.promise);
    const reload = jest.fn();
    const first = run(item, load);
    expect(run({ ...item }, load)).toBe(first);
    const removal = run({ ...item, display: false }, remove);
    expect(run({ ...item, display: false }, remove)).toBe(removal);
    const last = run(item, reload);
    await Promise.resolve();
    expect(remove).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
    loading.resolve();
    await first;
    await Promise.resolve();
    await Promise.resolve();
    expect(load).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(reload).not.toHaveBeenCalled();
    deleting.resolve();
    await last;
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('keeps other structures and datasets independent and allows retry after failure', async () => {
    expect.hasAssertions();
    const run = createStructureOperationQueue();
    const loading = deferred();
    const item = { id: 1, type: 'PROTEIN', datasetID: 3, display: true };
    const error = new Error('failed load');
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const first = run(item, () => loading.promise);
      expect(await run({ ...item, id: 2 }, () => 'other structure')).toBe('other structure');
      expect(await run({ ...item, datasetID: 4 }, () => 'other dataset')).toBe('other dataset');
      loading.reject(error);
      await expect(first).rejects.toBe(error);
      expect(await run(item, () => 'retry')).toBe('retry');
    } finally {
      log.mockRestore();
    }
  });
});
