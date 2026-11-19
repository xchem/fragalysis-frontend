import ContactWorkerClient from './ContactWorkerClient';
jest.mock('./createContactWorker', () => ({ __esModule: true, default: jest.fn() }));

const setup = () => {
  const resource = { worker: { postMessage: jest.fn(), terminate: jest.fn() }, release: jest.fn() };
  const factory = jest.fn(() => resource);
  return { resource, factory, client: new ContactWorkerClient(factory) };
};

describe('contact calculation worker ownership', () => {
  it('keeps independent requests pending until their matching replies arrive', async () => {
    expect.hasAssertions();
    const { client, resource, factory } = setup();
    const first = client.calculate({ pdb: 'first' });
    const second = client.calculate({ pdb: 'second' });
    expect(factory).toHaveBeenCalledTimes(1);
    expect(client.pending.size).toBe(2);
    resource.worker.onmessage({ data: { id: 2, result: { types: new Uint8Array([2]) } } });
    expect((await second).types).toStrictEqual(new Uint8Array([2]));
    expect(client.pending.size).toBe(1);
    resource.worker.onmessage({ data: { id: 1, result: { types: new Uint8Array([1]) } } });
    expect((await first).types).toStrictEqual(new Uint8Array([1]));
    client.dispose();
    expect(resource.worker.terminate).toHaveBeenCalledTimes(1);
    expect(resource.release).toHaveBeenCalledTimes(1);
  });

  it('propagates a calculation error without failing another request', async () => {
    expect.hasAssertions();
    const { client, resource } = setup();
    const failed = client.calculate({ pdb: 'bad' }).catch(error => error);
    const other = client.calculate({ pdb: 'good' });
    resource.worker.onmessage({ data: { id: 1, error: 'Invalid contact selection' } });
    expect((await failed).message).toBe('Invalid contact selection');
    resource.worker.onmessage({ data: { id: 2, result: { types: [] } } });
    expect(await other).toStrictEqual({ types: [] });
    client.dispose();
  });

  it('rejects all pending work and releases the worker after a runtime failure', async () => {
    expect.hasAssertions();
    const { client, resource } = setup();
    const pending = [client.calculate({}), client.calculate({})].map(promise => promise.catch(error => error.message));
    resource.worker.onerror({ message: 'Worker failed' });
    expect(await Promise.all(pending)).toStrictEqual(['Worker failed', 'Worker failed']);
    expect(client.pending.size).toBe(0);
    expect(resource.worker.terminate).toHaveBeenCalledTimes(1);
    expect(resource.release).toHaveBeenCalledTimes(1);
    client.dispose();
    expect(resource.worker.terminate).toHaveBeenCalledTimes(1);
  });

  it('disposes pending jobs idempotently and ignores late replies', async () => {
    expect.hasAssertions();
    const { client, resource } = setup();
    const pending = client.calculate({}).catch(error => error.message);
    client.dispose();
    client.dispose();
    resource.worker.onmessage({ data: { id: 1, result: {} } });
    expect(await pending).toBe('Contact worker has been disposed');
    const later = await client.calculate({}).catch(error => error.message);
    expect(later).toBe('Contact worker has been disposed');
    expect(resource.release).toHaveBeenCalledTimes(1);
  });
});
