export const VIEWER_ENGINES = Object.freeze({
  NGL: 'ngl',
  MOORHEN: 'moorhen'
});

export const DEFAULT_VIEWER_ENGINE = VIEWER_ENGINES.NGL;
export const ENABLED_VIEWER_ENGINES = Object.freeze([VIEWER_ENGINES.NGL]);

const normalizeViewerEngine = viewerEngine =>
  typeof viewerEngine === 'string' ? viewerEngine.trim().toLowerCase() : '';

const getRuntimeViewerEngine = () => {
  if (typeof window === 'undefined' || !window.DJANGO_CONTEXT) {
    return undefined;
  }

  return window.DJANGO_CONTEXT.viewer_engine;
};

const getBuildViewerEngine = () => {
  if (typeof __FRAGALYSIS_VIEWER_ENGINE__ !== 'undefined' && __FRAGALYSIS_VIEWER_ENGINE__) {
    return __FRAGALYSIS_VIEWER_ENGINE__;
  }

  return typeof process !== 'undefined' && process.env ? process.env.VIEWER_ENGINE : undefined;
};

export const resolveViewerEngine = ({ runtimeViewerEngine, buildViewerEngine } = {}) => {
  const configuredViewerEngine =
    normalizeViewerEngine(runtimeViewerEngine) || normalizeViewerEngine(buildViewerEngine) || DEFAULT_VIEWER_ENGINE;
  const viewerEngine = ENABLED_VIEWER_ENGINES.includes(configuredViewerEngine)
    ? configuredViewerEngine
    : DEFAULT_VIEWER_ENGINE;

  return Object.freeze({
    configuredViewerEngine,
    viewerEngine,
    isFallback: configuredViewerEngine !== viewerEngine
  });
};

export const viewerEngineConfig = resolveViewerEngine({
  runtimeViewerEngine: getRuntimeViewerEngine(),
  buildViewerEngine: getBuildViewerEngine()
});

export const configuredViewerEngine = viewerEngineConfig.configuredViewerEngine;
export const viewerEngine = viewerEngineConfig.viewerEngine;
