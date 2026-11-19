const MOORHEN_WORKER_SCRIPT = 'CootWorker.js';
const MOORHEN_RUNTIME_SCRIPTS = ['moorhen64.js', 'moorhen.js'];

const removeTrailingSlash = value => value.replace(/\/+$/, '');

const replaceQuotedValue = (source, value, replacement) =>
  source.split(JSON.stringify(value)).join(JSON.stringify(replacement));

export const rewriteMoorhenWorkerSource = (source, { assetBaseUrl, runtimeScriptUrls }) => {
  let rewrittenSource = source;

  MOORHEN_RUNTIME_SCRIPTS.forEach(scriptName => {
    rewrittenSource = replaceQuotedValue(rewrittenSource, `./${scriptName}`, runtimeScriptUrls[scriptName]);
    rewrittenSource = replaceQuotedValue(rewrittenSource, scriptName, runtimeScriptUrls[scriptName]);
  });

  const moduleInitializationMarker = 'r({onRuntimeInitialized';
  if (!rewrittenSource.includes(moduleInitializationMarker)) {
    throw new Error('The installed Moorhen worker format is not supported by the cross-origin bridge');
  }

  return rewrittenSource.replace(
    moduleInitializationMarker,
    `r({locateFile:function(e){return new URL(e,${JSON.stringify(assetBaseUrl)}).href},onRuntimeInitialized`
  );
};

const fetchScript = async (url, fetchImpl) => {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Unable to load Moorhen worker dependency ${url}: HTTP ${response.status}`);
  }
  return response.text();
};

export const installMoorhenWorkerBridge = async ({
  assetUrl,
  globalObject = typeof window === 'undefined' ? undefined : window,
  fetchImpl = globalObject?.fetch?.bind(globalObject),
  BlobConstructor = globalObject?.Blob,
  URLConstructor = globalObject?.URL
} = {}) => {
  if (!globalObject?.location?.href || !globalObject.Worker || !URLConstructor) {
    throw new Error('Moorhen worker bridge requires browser Worker and URL support');
  }

  const pageUrl = new URLConstructor(globalObject.location.href);
  const assetBaseUrl = new URLConstructor(`${removeTrailingSlash(assetUrl)}/`, pageUrl).href;
  const workerScriptUrl = new URLConstructor(MOORHEN_WORKER_SCRIPT, assetBaseUrl).href;

  if (new URLConstructor(workerScriptUrl).origin === pageUrl.origin) {
    return () => {};
  }

  if (!fetchImpl || !BlobConstructor || typeof URLConstructor.createObjectURL !== 'function') {
    throw new Error('Moorhen cross-origin worker bridge is not supported by this browser');
  }

  const objectUrls = [];
  const createScriptUrl = source => {
    const objectUrl = URLConstructor.createObjectURL(new BlobConstructor([source], { type: 'text/javascript' }));
    objectUrls.push(objectUrl);
    return objectUrl;
  };

  try {
    const [workerSource, ...runtimeSources] = await Promise.all([
      fetchScript(workerScriptUrl, fetchImpl),
      ...MOORHEN_RUNTIME_SCRIPTS.map(scriptName =>
        fetchScript(new URLConstructor(scriptName, assetBaseUrl).href, fetchImpl)
      )
    ]);
    const runtimeScriptUrls = Object.fromEntries(
      MOORHEN_RUNTIME_SCRIPTS.map((scriptName, index) => [scriptName, createScriptUrl(runtimeSources[index])])
    );
    const bridgedWorkerUrl = createScriptUrl(
      rewriteMoorhenWorkerSource(workerSource, { assetBaseUrl, runtimeScriptUrls })
    );
    const NativeWorker = globalObject.Worker;

    function MoorhenWorker(scriptUrl, options) {
      const requestedUrl = new URLConstructor(String(scriptUrl), pageUrl).href;
      return new NativeWorker(requestedUrl === workerScriptUrl ? bridgedWorkerUrl : scriptUrl, options);
    }

    MoorhenWorker.prototype = NativeWorker.prototype;
    Object.setPrototypeOf(MoorhenWorker, NativeWorker);
    globalObject.Worker = MoorhenWorker;

    let cleanedUp = false;
    return () => {
      if (cleanedUp) return;
      cleanedUp = true;
      if (globalObject.Worker === MoorhenWorker) {
        globalObject.Worker = NativeWorker;
      }
      objectUrls.forEach(objectUrl => URLConstructor.revokeObjectURL(objectUrl));
    };
  } catch (error) {
    objectUrls.forEach(objectUrl => URLConstructor.revokeObjectURL(objectUrl));
    throw error;
  }
};
