import fs from 'fs';
import path from 'path';

const sourceRoot = path.resolve(__dirname);

const listSourceFiles = directory =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return listSourceFiles(entryPath);
    if (!/\.jsx?$/.test(entry.name) || /\.test\.jsx?$/.test(entry.name)) return [];

    return [entryPath];
  });

const sourceFiles = listSourceFiles(sourceRoot);

const deprecatedPatterns = [
  ['findDOMNode', /\bfindDOMNode\b/],
  ['legacy root API', /\bReactDOM\.(?:render|hydrate|unmountComponentAtNode)\b/],
  ['react-dom/test-utils', /react-dom\/test-utils/],
  ['legacy context', /\b(?:contextTypes|childContextTypes|getChildContext)\b/],
  ['string ref', /\bref\s*=\s*["'][^"']+["']/],
  ['createFactory', /\bcreateFactory\b/],
  ['defaultProps assignment', /(?:\.|\b)defaultProps\s*=/]
];

describe('React 19 compatibility boundary', () => {
  test.each(deprecatedPatterns)('application source does not use %s', (name, pattern) => {
    const matches = sourceFiles
      .filter(filename => pattern.test(fs.readFileSync(filename, 'utf8')))
      .map(filename => path.relative(sourceRoot, filename));

    expect(matches).toEqual([]);
  });

  it('uses the automatic JSX transform and createRoot API', () => {
    const babelConfig = fs.readFileSync(path.resolve(__dirname, '..', '.babelrc'), 'utf8');
    const entrypoint = fs.readFileSync(path.resolve(sourceRoot, 'index.js'), 'utf8');

    expect(babelConfig).toContain('"runtime": "automatic"');
    expect(entrypoint).toContain("from 'react-dom/client'");
  });

  it('does not spread known key-bearing prop getter results into JSX', () => {
    const keySpreadPattern = /\{\.\.\.(?:headerGroup\.getHeaderGroupProps\(\)|column\.getHeaderProps\(\)|row\.getRowProps\(\)|cell\.getCellProps\(\)|props\(\{ index \}\))\}/;
    const matches = sourceFiles
      .filter(filename => keySpreadPattern.test(fs.readFileSync(filename, 'utf8')))
      .map(filename => path.relative(sourceRoot, filename));

    expect(matches).toEqual([]);
  });
});
