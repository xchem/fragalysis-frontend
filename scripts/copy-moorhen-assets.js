const { copyMoorhenAssets, verifyMoorhenAssets } = require('./moorhen-assets');

try {
  const verifyOnly = process.argv.includes('--verify');
  const summary = verifyOnly ? verifyMoorhenAssets() : copyMoorhenAssets();
  const action = verifyOnly ? 'Verified' : 'Copied and verified';
  console.log(`${action} ${summary.files} Moorhen assets (${summary.bytes} bytes).`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
