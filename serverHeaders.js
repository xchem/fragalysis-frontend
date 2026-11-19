const path = require('path');

const CROSS_ORIGIN_ISOLATION_HEADERS = Object.freeze({
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'cross-origin'
});

const setCrossOriginIsolationHeaders = (req, res, next) => {
  for (const [header, value] of Object.entries(CROSS_ORIGIN_ISOLATION_HEADERS)) {
    res.setHeader(header, value);
  }
  next();
};

const setMoorhenAssetHeaders = (res, filePath) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  if (path.extname(filePath).toLowerCase() === '.wasm') {
    res.setHeader('Content-Type', 'application/wasm');
  }
};

module.exports = {
  CROSS_ORIGIN_ISOLATION_HEADERS,
  setCrossOriginIsolationHeaders,
  setMoorhenAssetHeaders
};
