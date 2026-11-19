import { resolveMoorhenProofConfig } from './moorhenProof';

describe('Moorhen proof route configuration', () => {
  it('is enabled by default in development', () => {
    expect(resolveMoorhenProofConfig({ nodeEnv: 'development' }).enabled).toBe(true);
  });

  it('is disabled by default in production', () => {
    expect(resolveMoorhenProofConfig({ nodeEnv: 'production' }).enabled).toBe(false);
  });

  it('allows the runtime setting to override the build setting', () => {
    expect(
      resolveMoorhenProofConfig({ runtimeEnabled: false, buildEnabled: true, nodeEnv: 'development' }).enabled
    ).toBe(false);
  });

  it('accepts deployment-friendly true values', () => {
    expect(resolveMoorhenProofConfig({ runtimeEnabled: 'yes' }).enabled).toBe(true);
  });

  it('resolves Moorhen assets next to the frontend bundle by default', () => {
    expect(resolveMoorhenProofConfig({ bundleBaseUrl: 'https://example.test/static/bundles/' }).assetUrl).toBe(
      'https://example.test/static/bundles/moorhen'
    );
  });

  it('prefers a runtime Moorhen asset URL', () => {
    expect(
      resolveMoorhenProofConfig({
        runtimeAssetUrl: 'https://cdn.example.test/moorhen/',
        buildAssetUrl: '/bundles/moorhen'
      }).assetUrl
    ).toBe('https://cdn.example.test/moorhen');
  });
});

