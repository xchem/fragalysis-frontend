/** @jest-environment node */
import fs from 'fs';
import path from 'path';
import { runInNewContext } from 'vm';
import { once } from 'events';
import { Worker } from 'worker_threads';
import { execFileSync } from 'child_process';

const root = path.resolve(__dirname, '..');

// Babel's loader imports ESM dependencies; run the real build outside Jest's VM.
const bundleWorkerFactory = mode =>
  JSON.parse(
    execFileSync(process.execPath, [path.join(__dirname, 'fixtures/buildContactWorker.cjs'), mode], {
      cwd: root,
      env: { ...process.env, NODE_ENV: mode, BABEL_ENV: mode },
      encoding: 'utf8',
      timeout: 30000,
      maxBuffer: 4 * 1024 * 1024
    })
  );

describe('contact worker build integration', () => {
  it.each(['development', 'production'])(
    'bundles and executes the detector using the %s configuration',
    async mode => {
      expect.hasAssertions();
      const bundle = bundleWorkerFactory(mode);
      expect(bundle.diagnostics.errors).toStrictEqual([]);
      expect(bundle.diagnostics.warnings).toStrictEqual([]);

      let workerUrl;
      const module = { exports: {} };
      runInNewContext(bundle.source, {
        module,
        exports: module.exports,
        Blob,
        URL,
        Worker: class {
          constructor(url) {
            workerUrl = url;
          }
        }
      });
      const resource = module.exports.default();
      let thread;
      try {
        const workerSource = await (await fetch(workerUrl)).text();
        const bridge = `import { parentPort } from 'node:worker_threads';
        globalThis.self = { postMessage: (...args) => parentPort.postMessage(...args) };`;
        const tail = `parentPort.on('message', data => self.onmessage({ data }));`;
        thread = new Worker(
          new URL('data:text/javascript;base64,' + Buffer.from(bridge + workerSource + tail).toString('base64')),
          { stdout: true, stderr: true }
        );
        const reply = once(thread, 'message');
        const pdb = fs.readFileSync(path.join(root, 'js/viewer/contacts/fixtures/contact-types.pdb'), 'utf8');
        thread.postMessage({ id: 1, input: { pdb } });
        const [message] = await reply;
        expect(message.error).toBeUndefined();
        expect(message.id).toBe(1);
        expect(new Set(message.result.types)).toStrictEqual(new Set([1, 2, 3, 5, 7, 8]));
        expect(message.result.position1).toHaveLength(message.result.types.length * 3);
      } finally {
        await thread?.terminate();
        resource.release();
      }
    },
    30000
  );
});
