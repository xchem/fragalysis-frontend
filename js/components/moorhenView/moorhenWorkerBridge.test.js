import fs from 'fs';
import path from 'path';
import { installMoorhenWorkerBridge, rewriteMoorhenWorkerSource } from './moorhenWorkerBridge';

const createBrowser = ({ pageUrl = 'http://127.0.0.1:8080/viewer/react/preview/' } = {}) => {
  const blobs = [];
  class TestBlob {
    constructor(parts, options) {
      this.source = parts.join('');
      this.type = options.type;
      blobs.push(this);
    }
  }
  class TestURL extends URL {}
  TestURL.createObjectURL = jest.fn(() => `blob:test-${blobs.length}`);
  TestURL.revokeObjectURL = jest.fn();
  const createdWorkers = [];
  function NativeWorker(scriptUrl, options) {
    this.scriptUrl = scriptUrl;
    this.options = options;
    createdWorkers.push(this);
  }
  const globalObject = {
    Blob: TestBlob,
    URL: TestURL,
    Worker: NativeWorker,
    location: { href: pageUrl }
  };
  return { blobs, createdWorkers, globalObject, NativeWorker, TestURL };
};

describe('Moorhen worker bridge', () => {
  it('does nothing when the worker is already same-origin', async () => {
    const browser = createBrowser({ pageUrl: 'http://localhost:3030/viewer/react/moorhen-proof/' });
    const fetchImpl = jest.fn();
    const cleanup = await installMoorhenWorkerBridge({
      assetUrl: 'http://localhost:3030/bundles/moorhen',
      globalObject: browser.globalObject,
      fetchImpl
    });

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(browser.globalObject.Worker).toBe(browser.NativeWorker);
    cleanup();
  });

  it('rewrites runtime scripts and the WASM location in the worker source', () => {
    const source =
      'importScripts("./moorhen64.js"),a="moorhen64.js";importScripts("./moorhen.js"),a="moorhen.js";r({onRuntimeInitialized:function(){}})';
    const rewritten = rewriteMoorhenWorkerSource(source, {
      assetBaseUrl: 'http://localhost:3030/bundles/moorhen/',
      runtimeScriptUrls: { 'moorhen64.js': 'blob:64', 'moorhen.js': 'blob:32' }
    });

    expect(rewritten).toContain('importScripts("blob:64")');
    expect(rewritten).toContain('a="blob:32"');
    expect(rewritten).toContain(
      'locateFile:function(e){return new URL(e,"http://localhost:3030/bundles/moorhen/").href}'
    );
  });

  it('supports the worker shipped by the installed Moorhen package', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../../node_modules/moorhen/public/CootWorker.js'),
      'utf8'
    );
    const rewritten = rewriteMoorhenWorkerSource(source, {
      assetBaseUrl: 'http://localhost:3030/bundles/moorhen/',
      runtimeScriptUrls: { 'moorhen64.js': 'blob:64', 'moorhen.js': 'blob:32' }
    });

    expect(rewritten).toContain('importScripts("blob:64")');
    expect(rewritten).toContain('importScripts("blob:32")');
    expect(rewritten).toContain('locateFile:function(e)');
  });

  it('intercepts only the cross-origin Coot worker and restores Worker during cleanup', async () => {
    const browser = createBrowser();
    const scripts = {
      'CootWorker.js':
        'importScripts("./moorhen64.js"),a="moorhen64.js";importScripts("./moorhen.js"),a="moorhen.js";r({onRuntimeInitialized:function(){}})',
      'moorhen64.js': 'self.runtime = 64;',
      'moorhen.js': 'self.runtime = 32;'
    };
    const fetchImpl = jest.fn(async url => ({
      ok: true,
      status: 200,
      text: async () => scripts[url.split('/').pop()]
    }));

    const cleanup = await installMoorhenWorkerBridge({
      assetUrl: 'http://localhost:3030/bundles/moorhen',
      globalObject: browser.globalObject,
      fetchImpl
    });
    const worker = new browser.globalObject.Worker('http://localhost:3030/bundles/moorhen/CootWorker.js', {
      name: 'coot'
    });
    const unrelatedWorker = new browser.globalObject.Worker('/other-worker.js');

    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(worker.scriptUrl).toBe('blob:test-3');
    expect(unrelatedWorker.scriptUrl).toBe('/other-worker.js');
    expect(browser.blobs[2].source).toContain('blob:test-1');

    cleanup();
    cleanup();
    expect(browser.globalObject.Worker).toBe(browser.NativeWorker);
    expect(browser.TestURL.revokeObjectURL).toHaveBeenCalledTimes(3);
  });
});
