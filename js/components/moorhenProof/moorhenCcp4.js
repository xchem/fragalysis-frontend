const MEMORY64_PROBE = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 5, 3, 1, 4, 1]);

const MODULE_VARIANTS = Object.freeze({
  memory32: Object.freeze({ scriptName: 'moorhen.js', factoryName: 'createCootModule' }),
  memory64: Object.freeze({ scriptName: 'moorhen64.js', factoryName: 'createCoot64Module' })
});

let ccp4ModulePromise;

export const getMoorhenModuleVariants = ({ webAssembly = WebAssembly, navigatorObject = navigator } = {}) => {
  const supportsMemory64 = webAssembly.validate(MEMORY64_PROBE);
  const appVersion = navigatorObject && navigatorObject.appVersion ? navigatorObject.appVersion : '';
  const isChromeLinux = appVersion.includes('Linux') && appVersion.includes('Chrome');

  return supportsMemory64 && !isChromeLinux
    ? [MODULE_VARIANTS.memory64, MODULE_VARIANTS.memory32]
    : [MODULE_VARIANTS.memory32];
};

export const loadMoorhenModuleScript = ({ src, documentObject = document }) =>
  new Promise((resolve, reject) => {
    const script = documentObject.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve(src);
    script.onerror = () => reject(new Error(`Failed to load Moorhen runtime script: ${src}`));
    documentObject.head.appendChild(script);
  });

export const prepareMoorhenRuntimeScript = async ({
  src,
  windowObject = window,
  fetchImpl = windowObject.fetch?.bind(windowObject),
  BlobConstructor = windowObject.Blob,
  URLConstructor = windowObject.URL
}) => {
  if (!windowObject.location?.href || !URLConstructor) {
    return { src, cleanup: () => {} };
  }

  const pageUrl = new URLConstructor(windowObject.location.href);
  const scriptUrl = new URLConstructor(src, pageUrl);
  if (scriptUrl.origin === pageUrl.origin) {
    return { src: scriptUrl.href, cleanup: () => {} };
  }

  if (!fetchImpl || !BlobConstructor || typeof URLConstructor.createObjectURL !== 'function') {
    throw new Error('This browser cannot bridge the cross-origin Moorhen runtime script');
  }

  const response = await fetchImpl(scriptUrl.href);
  if (!response.ok) {
    throw new Error(`Unable to load Moorhen runtime script ${scriptUrl.href}: HTTP ${response.status}`);
  }

  const objectUrl = URLConstructor.createObjectURL(
    new BlobConstructor([await response.text()], { type: 'text/javascript' })
  );
  return {
    src: objectUrl,
    cleanup: () => URLConstructor.revokeObjectURL(objectUrl)
  };
};

const createMoorhenModule = async ({
  assetUrl,
  variant,
  windowObject,
  documentObject,
  scriptLoader,
  runtimeScriptLoader
}) => {
  const scriptUrl = `${assetUrl}/${variant.scriptName}`;
  const runtimeScript = await runtimeScriptLoader({ src: scriptUrl, windowObject });

  try {
    if (typeof windowObject[variant.factoryName] !== 'function') {
      await scriptLoader({ src: runtimeScript.src, documentObject });
    }

    const moduleFactory = windowObject[variant.factoryName];

    if (typeof moduleFactory !== 'function') {
      throw new Error(`${variant.factoryName} was not registered by ${variant.scriptName}`);
    }

    const module = await moduleFactory({
      mainScriptUrlOrBlob: runtimeScript.src,
      locateFile: fileName => `${assetUrl}/${fileName}`,
      print: () => {},
      printErr: message => console.warn('[Moorhen WASM]', message)
    });

    if (!module || typeof module.read_structure_from_string !== 'function') {
      throw new Error(`${variant.scriptName} did not initialize the CCP4 structure API`);
    }

    return module;
  } finally {
    runtimeScript.cleanup();
  }
};

export const initializeMoorhenCcp4Module = ({
  assetUrl,
  windowObject = window,
  documentObject = document,
  webAssembly = WebAssembly,
  navigatorObject = navigator,
  scriptLoader = loadMoorhenModuleScript,
  runtimeScriptLoader = prepareMoorhenRuntimeScript
}) => {
  if (windowObject.CCP4Module && typeof windowObject.CCP4Module.read_structure_from_string === 'function') {
    return Promise.resolve(windowObject.CCP4Module);
  }

  if (!ccp4ModulePromise) {
    ccp4ModulePromise = (async () => {
      const variants = getMoorhenModuleVariants({ webAssembly, navigatorObject });
      let lastError;

      for (const variant of variants) {
        try {
          const module = await createMoorhenModule({
            assetUrl,
            variant,
            windowObject,
            documentObject,
            scriptLoader,
            runtimeScriptLoader
          });
          windowObject.cootModule = module;
          windowObject.CCP4Module = module;

          if (typeof windowObject.CustomEvent === 'function') {
            documentObject.dispatchEvent(new windowObject.CustomEvent('cootModuleAttached'));
          }

          return module;
        } catch (error) {
          lastError = error;
        }
      }

      throw new Error(`Unable to initialize Moorhen's CCP4 module: ${lastError ? lastError.message : 'unknown error'}`);
    })().catch(error => {
      ccp4ModulePromise = undefined;
      throw error;
    });
  }

  return ccp4ModulePromise;
};

export const resetMoorhenCcp4ModuleForTests = () => {
  ccp4ModulePromise = undefined;
};
