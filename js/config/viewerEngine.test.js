import { DEFAULT_VIEWER_ENGINE, ENABLED_VIEWER_ENGINES, VIEWER_ENGINES, resolveViewerEngine } from './viewerEngine';

describe('viewer engine configuration', () => {
  it('defaults to NGL', () => {
    expect(resolveViewerEngine()).toEqual({
      configuredViewerEngine: VIEWER_ENGINES.NGL,
      viewerEngine: VIEWER_ENGINES.NGL,
      isFallback: false
    });
  });

  it('normalizes the configured value', () => {
    expect(resolveViewerEngine({ buildViewerEngine: ' NGL ' }).viewerEngine).toBe(VIEWER_ENGINES.NGL);
  });

  it('prefers a runtime setting over the build setting', () => {
    const config = resolveViewerEngine({
      runtimeViewerEngine: VIEWER_ENGINES.NGL,
      buildViewerEngine: VIEWER_ENGINES.MOORHEN
    });

    expect(config.configuredViewerEngine).toBe(VIEWER_ENGINES.NGL);
    expect(config.viewerEngine).toBe(VIEWER_ENGINES.NGL);
  });

  it('falls back to NGL while Moorhen is not enabled', () => {
    const config = resolveViewerEngine({ buildViewerEngine: VIEWER_ENGINES.MOORHEN });

    expect(config.configuredViewerEngine).toBe(VIEWER_ENGINES.MOORHEN);
    expect(config.viewerEngine).toBe(DEFAULT_VIEWER_ENGINE);
    expect(config.isFallback).toBe(true);
    expect(ENABLED_VIEWER_ENGINES).toEqual([VIEWER_ENGINES.NGL]);
  });

  it('falls back to NGL for an unknown viewer', () => {
    expect(resolveViewerEngine({ buildViewerEngine: 'unknown' })).toEqual({
      configuredViewerEngine: 'unknown',
      viewerEngine: VIEWER_ENGINES.NGL,
      isFallback: true
    });
  });
});
