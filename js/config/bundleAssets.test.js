import { resolveBundleBaseUrl } from './bundleAssets';

describe('bundle asset configuration', () => {
  it('derives the bundle directory from the running script', () => {
    expect(
      resolveBundleBaseUrl({
        scriptUrl: 'https://fragalysis.example/static/bundles/main-123.js',
        locationHref: 'https://fragalysis.example/viewer/react/landing/'
      })
    ).toBe('https://fragalysis.example/static/bundles/');
  });

  it('prefers an explicitly configured bundle base URL', () => {
    expect(
      resolveBundleBaseUrl({
        runtimeBaseUrl: '/frontend-assets',
        scriptUrl: 'https://fragalysis.example/static/bundles/main-123.js',
        locationHref: 'https://fragalysis.example/viewer/react/landing/'
      })
    ).toBe('https://fragalysis.example/frontend-assets/');
  });

  it('falls back to the standard bundle directory', () => {
    expect(resolveBundleBaseUrl({ locationHref: 'https://fragalysis.example/viewer/react/landing/' })).toBe(
      'https://fragalysis.example/bundles/'
    );
  });
});

