/** @jest-environment node */
import fs from 'fs';
import path from 'path';
import { Worker as Thread } from 'worker_threads';
import { once } from 'events';
import createContactWorker from './createContactWorker';

// Match Webpack's asset/source treatment, including the real generated module.
jest.mock('./vendor/detector.mjs', () =>
  require('fs').readFileSync(require('path').join(__dirname, 'vendor/detector.mjs'), 'utf8')
);

describe('self-contained contact worker module', () => {
  it('runs the shipped worker source off-thread and transfers typed results after a failed request', async () => {
    expect.hasAssertions();
    const originalWorker = global.Worker;
    // Node has no browser Worker constructor to spy on.
    // eslint-disable-next-line jest/prefer-spy-on
    global.Worker = jest.fn(() => ({}));
    let thread;
    let resource;
    try {
      resource = createContactWorker();
      const [url, options] = global.Worker.mock.calls[0];
      expect(options.type).toBe('module');
      const source = await (await fetch(url)).text();
      expect(source).not.toMatch(/from\s+['"](?:https?:|\.\/)/);
      const bridge = `import { parentPort } from 'node:worker_threads';
        globalThis.self = { postMessage: (...args) => parentPort.postMessage(...args) };`;
      const tail = `parentPort.on('message', data => self.onmessage({ data }));`;
      thread = new Thread(
        new URL('data:text/javascript;base64,' + Buffer.from(bridge + source + tail).toString('base64')),
        { stdout: true, stderr: true }
      );
      const pdb = fs.readFileSync(path.join(__dirname, 'fixtures/contact-types.pdb'), 'utf8');
      const failed = once(thread, 'message');
      thread.postMessage({ id: 1, input: { pdb, parameters: { sele: '/invalid' } } });
      expect((await failed)[0]).toStrictEqual({ id: 1, error: expect.stringContaining('Invalid contact selection') });
      const completed = once(thread, 'message');
      thread.postMessage({ id: 2, input: { pdb } });
      const [message] = await completed;
      expect(message.id).toBe(2);
      expect(message.result.types).toBeInstanceOf(Uint8Array);
      expect(new Set(message.result.types)).toStrictEqual(new Set([1, 2, 3, 5, 7, 8]));
      expect(ArrayBuffer.isView(message.result.position1)).toBe(true);
      expect(message.result.position1.constructor.name).toBe('Float32Array');
      expect(message.result.position1).toHaveLength(message.result.types.length * 3);
      resource.release();
      resource = null;
      await expect(fetch(url)).rejects.toThrow('fetch failed');
    } finally {
      await thread?.terminate();
      resource?.release();
      global.Worker = originalWorker;
    }
  });

  it('revokes the module URL if browser worker creation fails', () => {
    expect.hasAssertions();
    const originalWorker = global.Worker;
    const revoke = jest.spyOn(URL, 'revokeObjectURL');
    // Node has no browser Worker constructor to spy on.
    // eslint-disable-next-line jest/prefer-spy-on
    global.Worker = jest.fn(() => {
      throw new Error('Worker unavailable');
    });
    try {
      expect(createContactWorker).toThrow('Worker unavailable');
      expect(revoke).toHaveBeenCalledWith(global.Worker.mock.calls[0][0]);
    } finally {
      global.Worker = originalWorker;
      revoke.mockRestore();
    }
  });
});
