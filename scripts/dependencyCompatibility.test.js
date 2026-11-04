/** @jest-environment node */

const http = require('http');
const { createRequire } = require('module');

describe('security dependency overrides', () => {
  it('preserves BioJS callback reads with the maintained request fork', async () => {
    expect.hasAssertions();
    const parserRequire = createRequire(require.resolve('biojs-io-parser'));
    const request = parserRequire('request');
    const server = http.createServer((req, res) => {
      res.setHeader('Set-Cookie', 'sequence=example; Path=/');
      res.end('>example\nACGT\n');
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

    try {
      const jar = request.jar();
      const url = `http://127.0.0.1:${server.address().port}/sequence.fasta`;
      const result = await new Promise((resolve, reject) => {
        request({ url, jar, proxy: null }, (error, response, body) => {
          if (error) reject(error);
          else resolve({ response, body });
        });
      });

      expect(parserRequire('request/package.json').name).toBe('@cypress/request');
      expect(result.response.statusCode).toBe(200);
      expect(result.body).toBe('>example\nACGT\n');
      expect(jar.getCookieString(url)).toBe('sequence=example');
    } finally {
      await new Promise(resolve => server.close(resolve));
    }
  });

  it('retains the CommonJS UUID functions used by socket and request dependencies', () => {
    expect.hasAssertions();
    const uuid = require('uuid');
    const value = uuid.v4();

    expect(uuid.validate(value)).toBe(true);
    expect(uuid.version(value)).toBe(4);
  });

  it('retains circular cache round trips with the patched flatted release', () => {
    expect.hasAssertions();
    const flatted = require('flatted');
    const source = { value: 7 };
    source.self = source;

    const restored = flatted.parse(flatted.stringify(source));

    expect(restored.value).toBe(7);
    expect(restored.self).toBe(restored);
  });
});
