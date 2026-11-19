const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const MOORHEN_PUBLIC_DIR = path.join(PROJECT_ROOT, 'node_modules', 'moorhen', 'public');
const MOORHEN_ASSET_DIR = path.join(PROJECT_ROOT, 'bundles', 'moorhen');
const MOORHEN_ASSET_URL = '/bundles/moorhen';
const REQUIRED_ASSETS = Object.freeze([
  'CootWorker.js',
  'moorhen.js',
  'moorhen.wasm',
  'moorhen64.js',
  'moorhen64.wasm',
  path.join('baby-gru', 'monomers', 'a', 'ALA.cif')
]);

const collectAssets = rootDir => {
  if (!fs.existsSync(rootDir) || !fs.statSync(rootDir).isDirectory()) {
    throw new Error(`Moorhen asset directory does not exist: ${rootDir}`);
  }

  const assets = [];
  const visit = currentDir => {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        visit(absolutePath);
      } else if (entry.isFile()) {
        assets.push({
          path: path.relative(rootDir, absolutePath),
          size: fs.statSync(absolutePath).size,
          sha256: crypto.createHash('sha256').update(fs.readFileSync(absolutePath)).digest('hex')
        });
      }
    }
  };

  visit(rootDir);
  return assets.sort((left, right) => left.path.localeCompare(right.path));
};

const verifyRequiredAssets = destinationDir => {
  for (const relativePath of REQUIRED_ASSETS) {
    const assetPath = path.join(destinationDir, relativePath);
    if (!fs.existsSync(assetPath) || !fs.statSync(assetPath).isFile() || fs.statSync(assetPath).size === 0) {
      throw new Error(`Required Moorhen asset is missing or empty: ${assetPath}`);
    }
  }
};

const verifyMoorhenAssets = ({ sourceDir = MOORHEN_PUBLIC_DIR, destinationDir = MOORHEN_ASSET_DIR } = {}) => {
  const sourceAssets = collectAssets(sourceDir);
  const destinationAssets = collectAssets(destinationDir);

  if (sourceAssets.length !== destinationAssets.length) {
    throw new Error(
      `Moorhen asset count mismatch: expected ${sourceAssets.length}, received ${destinationAssets.length}`
    );
  }

  for (let index = 0; index < sourceAssets.length; index += 1) {
    const sourceAsset = sourceAssets[index];
    const destinationAsset = destinationAssets[index];
    if (
      sourceAsset.path !== destinationAsset.path ||
      sourceAsset.size !== destinationAsset.size ||
      sourceAsset.sha256 !== destinationAsset.sha256
    ) {
      throw new Error(
        `Moorhen asset mismatch: expected ${sourceAsset.path} (${sourceAsset.size} bytes), ` +
          `received ${destinationAsset.path} (${destinationAsset.size} bytes)`
      );
    }
  }

  verifyRequiredAssets(destinationDir);
  return {
    files: destinationAssets.length,
    bytes: destinationAssets.reduce((total, asset) => total + asset.size, 0)
  };
};

const assertSafeCopyPaths = (sourceDir, destinationDir) => {
  const sourcePath = path.resolve(sourceDir);
  const destinationPath = path.resolve(destinationDir);
  const destinationRoot = path.parse(destinationPath).root;

  if (
    sourcePath === destinationPath ||
    destinationPath === destinationRoot ||
    destinationPath === PROJECT_ROOT ||
    sourcePath.startsWith(`${destinationPath}${path.sep}`)
  ) {
    throw new Error(`Refusing unsafe Moorhen asset destination: ${destinationPath}`);
  }
};

const copyMoorhenAssets = ({ sourceDir = MOORHEN_PUBLIC_DIR, destinationDir = MOORHEN_ASSET_DIR } = {}) => {
  collectAssets(sourceDir);
  assertSafeCopyPaths(sourceDir, destinationDir);
  fs.rmSync(destinationDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(destinationDir), { recursive: true });
  fs.cpSync(sourceDir, destinationDir, { recursive: true });
  return verifyMoorhenAssets({ sourceDir, destinationDir });
};

module.exports = {
  MOORHEN_ASSET_DIR,
  MOORHEN_ASSET_URL,
  MOORHEN_PUBLIC_DIR,
  REQUIRED_ASSETS,
  collectAssets,
  copyMoorhenAssets,
  verifyMoorhenAssets
};
