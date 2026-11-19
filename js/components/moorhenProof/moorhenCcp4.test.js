import {
  getMoorhenModuleVariants,
  initializeMoorhenCcp4Module,
  prepareMoorhenRuntimeScript,
  resetMoorhenCcp4ModuleForTests
} from './moorhenCcp4';

describe('Moorhen CCP4 module bootstrap', () => {
  afterEach(() => {
    resetMoorhenCcp4ModuleForTests();
  });

  it('prefers memory64 outside Chrome on Linux and keeps a 32-bit fallback', () => {
    expect(
      getMoorhenModuleVariants({
        webAssembly: { validate: () => true },
        navigatorObject: { appVersion: 'Windows Chrome' }
      })
    ).toEqual([
      { scriptName: 'moorhen64.js', factoryName: 'createCoot64Module' },
      { scriptName: 'moorhen.js', factoryName: 'createCootModule' }
    ]);
  });

  it('uses the 32-bit runtime when memory64 is unavailable', () => {
    expect(
      getMoorhenModuleVariants({
        webAssembly: { validate: () => false },
        navigatorObject: { appVersion: 'Windows Chrome' }
      })
    ).toEqual([{ scriptName: 'moorhen.js', factoryName: 'createCootModule' }]);
  });

  it('bridges a cross-origin runtime through a same-origin blob URL', async () => {
    class TestURL extends URL {}
    TestURL.createObjectURL = jest.fn(() => 'blob:http://127.0.0.1:8080/runtime');
    TestURL.revokeObjectURL = jest.fn();
    const fetchImpl = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('runtime source')
      })
    );

    const runtime = await prepareMoorhenRuntimeScript({
      src: 'http://localhost:3030/bundles/moorhen/moorhen.js',
      windowObject: {
        location: { href: 'http://127.0.0.1:8080/viewer/react/preview/' },
        Blob,
        URL: TestURL
      },
      fetchImpl
    });

    expect(fetchImpl).toHaveBeenCalledWith('http://localhost:3030/bundles/moorhen/moorhen.js');
    expect(runtime.src).toBe('blob:http://127.0.0.1:8080/runtime');
    runtime.cleanup();
    expect(TestURL.revokeObjectURL).toHaveBeenCalledWith(runtime.src);
  });

  it('loads and publishes the host-side CCP4 module', async () => {
    const module = { read_structure_from_string: jest.fn() };
    const windowObject = {
      createCootModule: jest.fn(() => Promise.resolve(module)),
      CustomEvent
    };
    const documentObject = { dispatchEvent: jest.fn() };
    const scriptLoader = jest.fn();

    await expect(
      initializeMoorhenCcp4Module({
        assetUrl: '/bundles/moorhen',
        windowObject,
        documentObject,
        webAssembly: { validate: () => false },
        navigatorObject: { appVersion: '' },
        scriptLoader
      })
    ).resolves.toBe(module);

    expect(scriptLoader).not.toHaveBeenCalled();
    expect(windowObject.CCP4Module).toBe(module);
    expect(windowObject.cootModule).toBe(module);
    expect(windowObject.createCootModule).toHaveBeenCalledWith(
      expect.objectContaining({
        mainScriptUrlOrBlob: '/bundles/moorhen/moorhen.js',
        locateFile: expect.any(Function)
      })
    );
    expect(documentObject.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'cootModuleAttached' }));
  });

  it('falls back to the 32-bit module when memory64 initialization fails', async () => {
    const module = { read_structure_from_string: jest.fn() };
    const windowObject = {
      createCoot64Module: jest.fn(() => Promise.reject(new Error('memory64 failed'))),
      createCootModule: jest.fn(() => Promise.resolve(module))
    };

    await expect(
      initializeMoorhenCcp4Module({
        assetUrl: '/bundles/moorhen',
        windowObject,
        documentObject: {},
        webAssembly: { validate: () => true },
        navigatorObject: { appVersion: 'Windows Chrome' },
        scriptLoader: jest.fn()
      })
    ).resolves.toBe(module);

    expect(windowObject.createCoot64Module).toHaveBeenCalledTimes(1);
    expect(windowObject.createCootModule).toHaveBeenCalledTimes(1);
  });

  it('reports a missing module factory', async () => {
    await expect(
      initializeMoorhenCcp4Module({
        assetUrl: '/bundles/moorhen',
        windowObject: {},
        documentObject: {},
        webAssembly: { validate: () => false },
        navigatorObject: { appVersion: '' },
        scriptLoader: jest.fn(() => Promise.resolve())
      })
    ).rejects.toThrow('createCootModule was not registered');
  });
});
