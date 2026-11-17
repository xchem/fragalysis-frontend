const path = require('path');
const webpack = require('webpack');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const config = require('./webpack.config-dev');
const { MOORHEN_ASSET_DIR, MOORHEN_ASSET_URL } = require('./scripts/moorhen-assets');
const { setCrossOriginIsolationHeaders, setMoorhenAssetHeaders } = require('./serverHeaders');
const { MOORHEN_PROOF_PATHS, getMainBundleName, renderMoorhenProofPage } = require('./devProofPage');
const PORT = Number(process.env.DEV_SERVER_PORT || 3030);

const app = express();
const compiler = webpack(config);
let latestStats;

compiler.hooks.compile.tap('MoorhenProofPage', () => {
  latestStats = undefined;
});
compiler.hooks.done.tap('MoorhenProofPage', stats => {
  latestStats = stats;
});

app.use(setCrossOriginIsolationHeaders);

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(
  MOORHEN_ASSET_URL,
  express.static(MOORHEN_ASSET_DIR, {
    setHeaders: setMoorhenAssetHeaders
  })
);

app.use(
  require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath,
    stats: { colors: true }
  })
);

app.use(require('webpack-hot-middleware')(compiler));

app.get(MOORHEN_PROOF_PATHS, function(req, res, next) {
  try {
    if (!latestStats) {
      return res.status(503).send('The frontend bundle is still compiling.');
    }

    const mainBundleName = getMainBundleName(latestStats);
    return res.type('html').send(
      renderMoorhenProofPage({
        mainBundleUrl: `${config.output.publicPath}${mainBundleName}`,
        moorhenAssetUrl: MOORHEN_ASSET_URL
      })
    );
  } catch (error) {
    return next(error);
  }
});

const pageRequestLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false
});

app.get('*', pageRequestLimiter, function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, function(err) {
  if (err) {
    return console.error(err);
  }

  console.log(`Listening at http://localhost:${PORT}/`);
});
