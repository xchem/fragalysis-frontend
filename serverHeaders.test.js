const {
  CROSS_ORIGIN_ISOLATION_HEADERS,
  setCrossOriginIsolationHeaders,
  setMoorhenAssetHeaders
} = require('./serverHeaders');

describe('development server headers', () => {
  it('adds all cross-origin isolation headers', () => {
    const response = { setHeader: jest.fn() };
    const next = jest.fn();

    setCrossOriginIsolationHeaders({}, response, next);

    for (const [header, value] of Object.entries(CROSS_ORIGIN_ISOLATION_HEADERS)) {
      expect(response.setHeader).toHaveBeenCalledWith(header, value);
    }
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('serves WASM with its required MIME type and cross-origin resource policy', () => {
    const response = { setHeader: jest.fn() };

    setMoorhenAssetHeaders(response, 'C:\\assets\\moorhen.wasm');

    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/wasm');
    expect(response.setHeader).toHaveBeenCalledWith('Cross-Origin-Resource-Policy', 'cross-origin');
  });
});
