/** @jest-environment node */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { runInNewContext } from 'vm';
import ts from 'typescript';
import reference from './fixtures/ngl-reference';

const source = fs.readFileSync(path.join(__dirname, 'vendor/detector.mjs'), 'utf8');
const exports = {};
runInNewContext(
  ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 }
  }).outputText + '\nexports.generateUUID = _Math.generateUUID;',
  { exports, console, crypto: crypto.webcrypto }
);
const { detectContacts } = exports;
const canonical = data =>
  Array.from(data.types, (type, i) =>
    [
      type,
      ...data.position1.slice(i * 3, i * 3 + 3),
      ...data.position2.slice(i * 3, i * 3 + 3),
      ...data.color.slice(i * 3, i * 3 + 3),
      data.radius[i]
    ].map(value => Number(value.toFixed(5)))
  ).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

describe('contact detector compatibility with NGL 2.0.0-dev.37', () => {
  it.each([
    [0, '00000000-0000-4000-8000-000000000000'],
    [0xffffffff, 'FFFFFFFF-FFFF-4FFF-BFFF-FFFFFFFFFFFF']
  ])('uses Web Crypto entropy while retaining the uppercase UUID v4 format (%i)', (word, uuid) => {
    expect.hasAssertions();
    const entropy = jest.spyOn(crypto.webcrypto, 'getRandomValues').mockImplementation(values => values.fill(word));
    try {
      expect(exports.generateUUID()).toBe(uuid);
      expect(entropy).toHaveBeenCalledTimes(1);
      expect(entropy.mock.calls[0][0].constructor.name).toBe('Uint32Array');
      expect(entropy.mock.calls[0][0]).toHaveLength(4);
    } finally {
      entropy.mockRestore();
    }
  });

  it('does not fall back to weak UUID entropy if Web Crypto fails', () => {
    expect.hasAssertions();
    const entropy = jest.spyOn(crypto.webcrypto, 'getRandomValues').mockImplementation(() => {
      throw new Error('Entropy unavailable');
    });
    try {
      expect(() => exports.generateUUID()).toThrow('Entropy unavailable');
    } finally {
      entropy.mockRestore();
    }
  });

  it.each(reference.cases)('matches independently generated NGL contacts: $name', async fixture => {
    expect.hasAssertions();
    const pdb = fs.readFileSync(path.resolve(__dirname, '../../..', fixture.file), 'utf8');
    expect(
      crypto
        .createHash('sha256')
        .update(pdb)
        .digest('hex')
    ).toBe(fixture.pdbSha256);
    const sdf = fixture.sdfFile
      ? fs.readFileSync(path.resolve(__dirname, '../../..', fixture.sdfFile), 'utf8')
      : undefined;
    if (sdf)
      expect(
        crypto
          .createHash('sha256')
          .update(sdf)
          .digest('hex')
      ).toBe(fixture.sdfSha256);
    const data = await detectContacts({ pdb, sdf, parameters: fixture.parameters, environment: fixture.environment });
    expect(canonical(data)).toStrictEqual(fixture.records);
  });

  it('covers every NGL contact category across the reference fixtures', () => {
    expect.hasAssertions();
    const types = new Set(reference.cases.flatMap(fixture => fixture.records.map(record => record[0])));
    expect([...types].sort((a, b) => a - b)).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('retains V3000 coordinates, bond orders and formal charges, including non-sequential IDs and continuation lines', async () => {
    expect.hasAssertions();
    const fixture = reference.cases.find(item => item.name === 'complex-paired');
    const pdb = fs.readFileSync(path.join(__dirname, 'fixtures/complex-protein.pdb'), 'utf8');
    const sdf = fs.readFileSync(path.join(__dirname, 'fixtures/complex-ligand-v3000.sdf'), 'utf8');
    const data = await detectContacts({ pdb, sdf, parameters: fixture.parameters });
    expect(canonical(data)).toStrictEqual(fixture.records);
    expect(new Set(data.types)).toStrictEqual(new Set([1, 3, 5]));
    const shifted = await detectContacts({
      pdb,
      sdf: sdf.replaceAll('4.4 0', '4.412345 0'),
      parameters: fixture.parameters
    });
    const ringIndex = shifted.types.indexOf(3);
    const height = Math.max(shifted.position1[ringIndex * 3 + 2], shifted.position2[ringIndex * 3 + 2]);
    expect(height).toBeCloseTo(4.412345, 5);
  });

  it('rejects malformed selections and remains usable after a failed calculation', async () => {
    expect.hasAssertions();
    const pdb = fs.readFileSync(path.join(__dirname, 'fixtures/contact-types.pdb'), 'utf8');
    const error = await detectContacts({ pdb, parameters: { sele: '/invalid' } }).catch(reason => reason);
    expect(error.message).toContain('Invalid contact selection');
    const result = await detectContacts({ pdb });
    expect(result.types.length).toBeGreaterThan(0);
  });

  it('keeps the computation bundle free of viewer modules and verifies its provenance', () => {
    expect.hasAssertions();
    const provenance = JSON.parse(fs.readFileSync(path.join(__dirname, 'vendor/provenance.json'), 'utf8'));
    expect(
      crypto
        .createHash('sha256')
        .update(source)
        .digest('hex')
    ).toBe(provenance.sha256);
    expect(
      provenance.inputs.filter(input =>
        /ngl\/src\/(viewer|stage|component|representation|buffer|color|worker)\//.test(input.source)
      )
    ).toStrictEqual([]);
    expect(source).not.toMatch(/WebGLRenderer|class Stage|class Viewer|new WebGL/);
  });
});
