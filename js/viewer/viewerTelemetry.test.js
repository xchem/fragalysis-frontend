import {
  VIEWER_TELEMETRY_EVENT,
  VIEWER_TELEMETRY_HISTORY_KEY,
  createViewerInitializationTelemetry,
  emitViewerTelemetry,
  reportViewerSelection
} from './viewerTelemetry';

const createSinks = () => {
  const globalObject = {
    CustomEvent: class CustomEvent {
      constructor(type, options) {
        this.type = type;
        this.detail = options.detail;
      }
    },
    dispatchEvent: jest.fn()
  };
  const logger = { error: jest.fn(), info: jest.fn(), warn: jest.fn() };
  const performanceObject = { mark: jest.fn() };
  const timestamp = () => '2026-07-15T12:00:00.000Z';
  return { globalObject, logger, performanceObject, timestamp };
};

describe('viewer rollout telemetry', () => {
  it('records and broadcasts the selected viewer without external telemetry services', () => {
    const sinks = createSinks();
    const record = reportViewerSelection(
      {
        viewerEngine: 'moorhen',
        selectionSource: 'fixed'
      },
      sinks
    );

    expect(record).toEqual(
      expect.objectContaining({ type: 'viewer.engine.selected', engine: 'moorhen', selectionSource: 'fixed' })
    );
    expect(sinks.logger.info).toHaveBeenCalledWith('[viewer-telemetry]', record);
    expect(sinks.globalObject[VIEWER_TELEMETRY_HISTORY_KEY]).toEqual([record]);
    expect(sinks.globalObject.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: VIEWER_TELEMETRY_EVENT, detail: record })
    );
  });

  it('measures successful viewer initialization once', () => {
    const sinks = createSinks();
    const times = [100, 146];
    const telemetry = createViewerInitializationTelemetry({
      engine: 'moorhen',
      viewId: 'major-view',
      role: 'main',
      viewerConfig: { selectionSource: 'fixed' },
      now: () => times.shift(),
      ...sinks
    });

    telemetry.started();
    const ready = telemetry.ready({ moleculeCount: 1 });

    expect(ready).toEqual(expect.objectContaining({ durationMs: 46, moleculeCount: 1 }));
    expect(telemetry.ready()).toBeUndefined();
    expect(sinks.performanceObject.mark).toHaveBeenCalledTimes(2);
  });

  it('records sanitized failures', () => {
    const sinks = createSinks();
    const error = new TypeError('WASM failed');
    const telemetry = createViewerInitializationTelemetry({
      engine: 'moorhen',
      viewId: 'major-view',
      now: () => 10,
      ...sinks
    });

    telemetry.started();
    const failure = telemetry.failed(error, { phase: 'ccp4' });
    expect(failure.error).toEqual({ name: 'TypeError', message: 'WASM failed' });
    expect(sinks.logger.error).toHaveBeenCalledWith('[viewer-telemetry]', failure);
  });

  it('keeps only the most recent one hundred records', () => {
    const sinks = createSinks();
    for (let index = 0; index < 105; index += 1) {
      emitViewerTelemetry('viewer.test', { index }, sinks);
    }

    const history = sinks.globalObject[VIEWER_TELEMETRY_HISTORY_KEY];
    expect(history).toHaveLength(100);
    expect(history[0].index).toBe(5);
    expect(history[99].index).toBe(104);
  });
});
