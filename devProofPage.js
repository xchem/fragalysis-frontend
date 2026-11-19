const MOORHEN_PROOF_PATHS = ['/viewer/react/moorhen-proof', '/viewer/react/moorhen-proof/'];

const getMainBundleName = stats => {
  const mainChunk = Array.from(stats.compilation.chunks).find(chunk => chunk.name === 'main');
  const assetNames = mainChunk ? Array.from(mainChunk.files) : [];
  const mainBundleName = assetNames.find(
    name => typeof name === 'string' && name.endsWith('.js') && !name.includes('.hot-update.')
  );

  if (!mainBundleName) {
    throw new Error('The development compiler did not emit a main JavaScript bundle');
  }

  return mainBundleName;
};

const renderMoorhenProofPage = ({ mainBundleUrl, moorhenAssetUrl }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="data:text/css," />
    <link rel="icon" href="${moorhenAssetUrl}/baby-gru/favicon.ico" />
    <title>Fragalysis Moorhen Proof</title>
  </head>
  <body>
    <div id="app"></div>
    <script>
      window.DJANGO_CONTEXT = {
        username: 'NOT_LOGGED_IN',
        pk: null,
        discourse_host: '',
        target_warning_message: '',
        moorhen_proof_enabled: true,
        moorhen_asset_url: '${moorhenAssetUrl}'
      };
    </script>
    <script crossorigin="anonymous" src="${mainBundleUrl}"></script>
  </body>
</html>`;

module.exports = { MOORHEN_PROOF_PATHS, getMainBundleName, renderMoorhenProofPage };
