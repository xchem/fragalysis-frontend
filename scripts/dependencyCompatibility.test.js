/** @jest-environment node */

const http = require('http');
const { createRequire } = require('module');
const fs = require('fs');
const os = require('os');
const path = require('path');

const withGlobFixture = async check => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'fragalysis-glob-'));
  const files = ['visible.js', 'visible.jsx', '.hidden.js', 'plain.txt', 'folder/inside.js', 'folder/ignore.js'];
  fs.mkdirSync(path.join(directory, 'folder'));
  try {
    files.forEach(file => fs.writeFileSync(path.join(directory, file), 'fixture'));
    await check(directory);
  } finally {
    files.forEach(file => fs.unlinkSync(path.join(directory, file)));
    fs.rmdirSync(path.join(directory, 'folder'));
    fs.rmdirSync(directory);
  }
};

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

  it.each([
    ['dist/cjs.js', 'target'],
    ['dist/cjs.js', 'source'],
    ['dist/cjs.js', 'nested'],
    ['dist/umd.js', 'target'],
    ['dist/umd.js', 'source'],
    ['dist/umd.js', 'nested']
  ])('prevents deepmerge prototype poisoning in %s through %s keys', (entry, input) => {
    expect.hasAssertions();
    const jestRequire = createRequire(require.resolve('jest-config'));
    const merge = require(path.join(path.dirname(jestRequire.resolve('deepmerge/package.json')), entry));
    const malicious = JSON.parse('{"__proto__":{"dependencyPoisoned":true},"value":7}');
    const result =
      input === 'target'
        ? merge(malicious, {})
        : input === 'source'
        ? merge(Object.create(null), malicious)
        : merge({}, { nested: malicious }).nested;

    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(result.dependencyPoisoned).toBeUndefined();
    expect(result.value).toBe(7);
    expect({}.dependencyPoisoned).toBeUndefined();
  });

  it('preserves Jest deepmerge array, symbol and custom merge behavior', () => {
    expect.hasAssertions();
    const jestRequire = createRequire(require.resolve('jest-config'));
    const merge = jestRequire('deepmerge');
    const symbol = Symbol('config');
    const left = { files: ['first'], nested: { left: true }, [symbol]: { left: true } };
    const right = { files: ['second'], nested: { right: true }, [symbol]: { right: true } };

    expect(merge(left, right)).toStrictEqual({
      files: ['first', 'second'],
      nested: { left: true, right: true },
      [symbol]: { left: true, right: true }
    });
    expect(merge(left, right, { arrayMerge: (target, source) => source }).files).toStrictEqual(['second']);
    expect(
      merge(left, right, { customMerge: key => key === 'nested' && (() => ({ custom: true })) }).nested
    ).toStrictEqual({ custom: true });
    expect(left.files).toStrictEqual(['first']);
  });

  it('supports legacy callable and modern named minimatch APIs', () => {
    expect.hasAssertions();
    const minimatch = require('minimatch');

    expect(typeof minimatch).toBe('function');
    expect(minimatch.minimatch).toBe(minimatch);
    expect(minimatch('src/ligand.jsx', '**/*.{js,jsx}')).toBe(true);
    expect(minimatch('.hidden.js', '*.js')).toBe(false);
    expect(minimatch('.hidden.js', '*.js', { dot: true })).toBe(true);
    expect(minimatch('src/view.test.js', '!**/*.test.js')).toBe(false);
    expect(minimatch.match(['ligand.js', 'protein.txt'], '*.js')).toStrictEqual(['ligand.js']);
    expect(new minimatch.Minimatch('*.js').match('ligand.js')).toBe(true);
    expect(minimatch.defaults({ dot: true })('.hidden.js', '*.js')).toBe(true);
  });

  it.each(['rimraf', 'protobufjs-cli', 'jest-config'])('preserves %s glob matching and ignores', async owner => {
    expect.hasAssertions();
    const ownerRequire = createRequire(require.resolve(`${owner}/package.json`));
    const glob = ownerRequire('glob');

    await withGlobFixture(async cwd => {
      const options = { cwd, ignore: '**/ignore.js', nodir: true };
      const expected = ['folder/inside.js', 'visible.js', 'visible.jsx'];
      const normalize = files => files.map(file => file.replace(/\\/g, '/')).sort();

      expect(normalize(glob.sync('**/*.{js,jsx}', options))).toStrictEqual(expected);
      expect(normalize(glob.sync('**/*.{js,jsx}', { ...options, dot: true }))).toStrictEqual([
        '.hidden.js',
        ...expected
      ]);
      const files =
        typeof glob === 'function'
          ? await new Promise((resolve, reject) =>
              glob('**/*.{js,jsx}', options, (error, matches) => (error ? reject(error) : resolve(matches)))
            )
          : await glob.glob('**/*.{js,jsx}', options);
      expect(normalize(files)).toStrictEqual(expected);
    });
  });

  it('retains ESLint override matching with the upgraded minimatch implementation', () => {
    expect.hasAssertions();
    const { CLIEngine } = require('eslint');
    const engine = new CLIEngine({
      useEslintrc: false,
      baseConfig: {
        parserOptions: { ecmaVersion: 2018 },
        overrides: [{ files: ['**/*.js'], rules: { semi: ['error', 'always'] } }]
      }
    });

    const result = engine.executeOnText('const value = 1', 'src/compatibility.js');

    expect(result.errorCount).toBe(1);
    expect(result.results[0].messages[0].ruleId).toBe('semi');
  });

  it.each(['forbidden/internal', 'allowed/public'])('enforces ESLint import patterns for %s', importPath => {
    expect.hasAssertions();
    const { CLIEngine } = require('eslint');
    const engine = new CLIEngine({
      useEslintrc: false,
      baseConfig: {
        parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
        plugins: ['import'],
        rules: { 'import/no-internal-modules': ['error', { forbid: ['forbidden/**'] }] }
      }
    });

    const result = engine.executeOnText(`import value from '${importPath}';`, 'src/compatibility.js');

    expect(result.results[0].messages.map(message => message.ruleId)).toStrictEqual(
      importPath.startsWith('forbidden/') ? ['import/no-internal-modules'] : []
    );
  });

  it('includes project source in coverage while excluding tests and outside paths', () => {
    expect.hasAssertions();
    const TestExclude = require('test-exclude');
    const cwd = path.resolve(__dirname, '..');
    const exclude = new TestExclude({ cwd, include: ['js/utils/*.js'] });

    expect(exclude.shouldInstrument(path.join(cwd, 'js/utils/api.js'))).toBe(true);
    expect(exclude.shouldInstrument(path.join(cwd, 'js/utils/api.test.js'))).toBe(false);
    expect(exclude.shouldInstrument(path.resolve(cwd, '../other-project/api.js'))).toBe(false);
    expect(exclude.shouldInstrument(path.join(cwd, 'node_modules/example/index.js'))).toBe(false);
  });

  it('retains synchronous and asynchronous coverage file discovery', async () => {
    expect.hasAssertions();
    const TestExclude = require('test-exclude');

    await withGlobFixture(async cwd => {
      const exclude = new TestExclude({ cwd, include: ['**/*.js'], exclude: ['**/ignore.js'], extension: ['.js'] });
      const normalize = files => files.map(file => file.replace(/\\/g, '/')).sort();
      const expected = ['.hidden.js', 'folder/inside.js', 'visible.js'];

      expect(normalize(exclude.globSync())).toStrictEqual(expected);
      expect(normalize(await exclude.glob())).toStrictEqual(expected);
    });
  });
});
