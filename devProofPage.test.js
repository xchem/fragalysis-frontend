const { MOORHEN_PROOF_PATHS, getMainBundleName, renderMoorhenProofPage } = require('./devProofPage');

describe('Moorhen proof development page', () => {
  it('is limited to the hidden proof route', () => {
    expect(MOORHEN_PROOF_PATHS).toEqual(['/viewer/react/moorhen-proof', '/viewer/react/moorhen-proof/']);
  });

  it('selects the main bundle without selecting a hot update', () => {
    const stats = {
      compilation: {
        chunks: [{ name: 'main', files: new Set(['main-123.js', 'main.older.hot-update.js']) }]
      }
    };

    expect(getMainBundleName(stats)).toBe('main-123.js');
  });

  it('fails clearly while no main bundle is available', () => {
    const stats = { compilation: { chunks: [] } };

    expect(() => getMainBundleName(stats)).toThrow('did not emit a main JavaScript bundle');
  });

  it('renders a same-origin Moorhen configuration', () => {
    const page = renderMoorhenProofPage({
      mainBundleUrl: 'http://localhost:3031/bundles/main-123.js',
      moorhenAssetUrl: '/bundles/moorhen'
    });

    expect(page).toContain("moorhen_asset_url: '/bundles/moorhen'");
    expect(page).toContain('src="http://localhost:3031/bundles/main-123.js"');
    expect(page).toContain('href="/bundles/moorhen/baby-gru/favicon.ico"');
    expect(page).toContain('id="app"');
  });
});
