const fs = require('fs');
const os = require('os');
const path = require('path');
const { copyMoorhenAssets, verifyMoorhenAssets } = require('./moorhen-assets');

const REQUIRED_FIXTURES = [
  'CootWorker.js',
  'moorhen.js',
  'moorhen.wasm',
  'moorhen64.js',
  'moorhen64.wasm',
  path.join('baby-gru', 'monomers', 'a', 'ALA.cif')
];

describe('Moorhen asset copy', () => {
  let tempDir;
  let sourceDir;
  let destinationDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fragalysis-moorhen-assets-'));
    sourceDir = path.join(tempDir, 'source');
    destinationDir = path.join(tempDir, 'destination');

    for (const fixture of REQUIRED_FIXTURES) {
      const fixturePath = path.join(sourceDir, fixture);
      fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
      fs.writeFileSync(fixturePath, `fixture:${fixture}`);
    }
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('replaces the destination and verifies every copied asset', () => {
    fs.mkdirSync(destinationDir, { recursive: true });
    fs.writeFileSync(path.join(destinationDir, 'stale.txt'), 'stale');

    const summary = copyMoorhenAssets({ sourceDir, destinationDir });

    expect(summary.files).toBe(REQUIRED_FIXTURES.length);
    expect(fs.existsSync(path.join(destinationDir, 'stale.txt'))).toBe(false);
    expect(fs.readFileSync(path.join(destinationDir, 'moorhen.wasm'), 'utf8')).toBe('fixture:moorhen.wasm');
  });

  it('rejects changed destination content even when its size is unchanged', () => {
    copyMoorhenAssets({ sourceDir, destinationDir });
    fs.writeFileSync(path.join(destinationDir, 'moorhen.wasm'), 'changed:moorhen.wasm');

    expect(() => verifyMoorhenAssets({ sourceDir, destinationDir })).toThrow('Moorhen asset mismatch');
  });
});
