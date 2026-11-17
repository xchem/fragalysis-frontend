/** @jest-environment node */
const express = require('express');
const http = require('http');
const { once } = require('events');

jest.mock('webpack', () => () => ({ hooks: { compile: { tap: jest.fn() }, done: { tap: jest.fn() } } }));
jest.mock('./webpack.config-dev', () => ({ output: { publicPath: '/bundles/' } }));
jest.mock('./scripts/moorhen-assets', () => ({
  MOORHEN_ASSET_DIR: require('path').join(__dirname, 'js/viewer/contacts/fixtures'),
  MOORHEN_ASSET_URL: '/bundles/moorhen'
}));
jest.mock('webpack-dev-middleware', () => () => (req, res, next) => {
  if (req.path === '/bundles/main-test.js') return res.send('development bundle');
  next();
});
jest.mock('webpack-hot-middleware', () => () => (req, res, next) => {
  if (req.path === '/__webpack_hmr') return res.send('HMR connection');
  next();
});

describe('development page rate limiting', () => {
  it('blocks excess file requests while keeping assets, compilation checks and HMR available', async () => {
    expect.hasAssertions();
    let server;
    const listen = jest.spyOn(express.application, 'listen').mockImplementation(function() {
      server = http.createServer(this);
    });
    try {
      require('./server');
    } finally {
      listen.mockRestore();
    }
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const sendFile = jest.spyOn(express.response, 'sendFile').mockImplementation(function() {
      return this.send('page shell');
    });
    try {
      for (let i = 0; i < 60; i++) {
        const response = await fetch(`${baseUrl}/page-${i}`);
        expect(response.status).toBe(200);
        await response.text();
      }
      const blocked = await fetch(`${baseUrl}/another-page`);
      expect(blocked.status).toBe(429);
      expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
      expect(blocked.headers.get('ratelimit')).toContain('r=0');
      await blocked.text();
      expect(sendFile).toHaveBeenCalledTimes(60);

      for (const [route, status, text] of [
        ['/viewer/react/moorhen-proof', 503, 'still compiling'],
        ['/bundles/moorhen/contact-types.pdb', 200, 'HETATM'],
        ['/bundles/main-test.js', 200, 'development bundle'],
        ['/__webpack_hmr', 200, 'HMR connection']
      ]) {
        const response = await fetch(`${baseUrl}${route}`);
        expect(response.status).toBe(status);
        expect(await response.text()).toContain(text);
      }
      expect(sendFile).toHaveBeenCalledTimes(60);
    } finally {
      sendFile.mockRestore();
      await new Promise(resolve => server.close(resolve));
    }
  });
});
