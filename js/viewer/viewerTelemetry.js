export const VIEWER_TELEMETRY_EVENT = 'fragalysis:viewer-telemetry';
export const VIEWER_TELEMETRY_HISTORY_KEY = '__FRAGALYSIS_VIEWER_TELEMETRY__';

const HISTORY_LIMIT = 100;

const getGlobalObject = () => (typeof window === 'undefined' ? undefined : window);
const getPerformanceObject = () => (typeof performance === 'undefined' ? undefined : performance);

const normalizeError = error => {
  if (!error) return undefined;
  return {
    name: error.name || 'Error',
    message: error.message || String(error)
  };
};

const getLogMethod = type => {
  if (type.endsWith('.failed')) return 'error';
  return 'info';
};

const getPerformanceMarkName = record =>
  ['fragalysis-viewer', record.engine, record.viewId, record.type]
    .filter(Boolean)
    .join(':')
    .replace(/[^a-z0-9:._-]/gi, '_');

export const emitViewerTelemetry = (
  type,
  details = {},
  {
    globalObject = getGlobalObject(),
    logger = typeof console === 'undefined' ? undefined : console,
    performanceObject = getPerformanceObject(),
    timestamp = () => new Date().toISOString()
  } = {}
) => {
  const { error, ...safeDetails } = details;
  const record = Object.freeze({
    type,
    timestamp: timestamp(),
    ...safeDetails,
    ...(error ? { error: normalizeError(error) } : {})
  });

  const logMethod = getLogMethod(type);
  logger?.[logMethod]?.('[viewer-telemetry]', record);
  performanceObject?.mark?.(getPerformanceMarkName(record));

  if (globalObject) {
    const history = Array.isArray(globalObject[VIEWER_TELEMETRY_HISTORY_KEY])
      ? globalObject[VIEWER_TELEMETRY_HISTORY_KEY]
      : [];
    globalObject[VIEWER_TELEMETRY_HISTORY_KEY] = [...history, record].slice(-HISTORY_LIMIT);

    if (typeof globalObject.dispatchEvent === 'function' && typeof globalObject.CustomEvent === 'function') {
      globalObject.dispatchEvent(new globalObject.CustomEvent(VIEWER_TELEMETRY_EVENT, { detail: record }));
    }
  }

  return record;
};

export const createViewerInitializationTelemetry = ({
  engine,
  viewId,
  role,
  viewerConfig,
  now = () => getPerformanceObject()?.now?.() ?? Date.now(),
  ...emitOptions
}) => {
  let startedAt;
  let finished = false;
  const baseDetails = {
    engine,
    viewId,
    role,
    selectionSource: viewerConfig?.selectionSource
  };

  return {
    started(extraDetails = {}) {
      if (startedAt != null) return undefined;
      startedAt = now();
      return emitViewerTelemetry('viewer.initialization.started', { ...baseDetails, ...extraDetails }, emitOptions);
    },
    ready(extraDetails = {}) {
      if (finished) return undefined;
      if (startedAt == null) startedAt = now();
      finished = true;
      return emitViewerTelemetry(
        'viewer.initialization.ready',
        { ...baseDetails, ...extraDetails, durationMs: Math.max(0, Math.round(now() - startedAt)) },
        emitOptions
      );
    },
    failed(error, extraDetails = {}) {
      if (finished) return undefined;
      if (startedAt == null) startedAt = now();
      finished = true;
      return emitViewerTelemetry(
        'viewer.initialization.failed',
        { ...baseDetails, ...extraDetails, durationMs: Math.max(0, Math.round(now() - startedAt)), error },
        emitOptions
      );
    }
  };
};

export const reportViewerSelection = (viewerConfig, emitOptions) =>
  emitViewerTelemetry(
    'viewer.engine.selected',
    {
      engine: viewerConfig.viewerEngine,
      selectionSource: viewerConfig.selectionSource
    },
    emitOptions
  );
