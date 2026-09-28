/** @jest-environment node */
import fs from 'fs';
import { runInNewContext } from 'vm';
import ts from 'typescript';
import { vec3, mat3 } from 'gl-matrix';
import { getMoorhenRepresentationStyle } from './moorhenAdapterUtils';
import MoorhenViewerAdapter from './MoorhenViewerAdapter';
import reference from './contacts/fixtures/ngl-reference';
import * as viewerConfig from '../config/viewer';

jest.mock('moorhen', () => ({}));
jest.mock('./contacts/createContactWorker', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../config/viewer', () => ({ __esModule: true, USE_NGL_STYLE_INTERACTIONS: true }));

const installedRepresentation = () => {
  const bundle = fs.readFileSync(require.resolve('moorhen'), 'utf8');
  const marker = bundle.lastIndexOf('sourceMappingURL=data:');
  const sourceMap = JSON.parse(Buffer.from(bundle.slice(bundle.indexOf('base64,', marker) + 7), 'base64').toString());
  const load = (suffix, dependencies) => {
    const source = sourceMap.sourcesContent[sourceMap.sources.findIndex(name => name.endsWith(suffix))];
    const compiled = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 }
    });
    const exports = {};
    runInNewContext(compiled.outputText, { exports, require: name => dependencies[name] || {} });
    return exports;
  };
  const utils = load('/src/utils/utils.ts', { 'gl-matrix/vec3': vec3, 'gl-matrix/mat3': mat3 });
  return load('/src/utils/MoorhenMoleculeRepresentation.ts', { './utils': utils }).MoorhenMoleculeRepresentation;
};

describe('native interaction geometry', () => {
  it('uses the unmodified Coot detector and native purple geometry when NGL-style interactions are disabled', async () => {
    expect.hasAssertions();
    const setting = jest.replaceProperty(viewerConfig, 'USE_NGL_STYLE_INTERACTIONS', false);
    try {
      const representation = Object.create(installedRepresentation().prototype);
      const donor = { x: 1, y: 2, z: 3, serial: 1, name: 'N', element: 'N', altLoc: '' };
      const acceptor = { ...donor, x: 4, serial: 2, name: 'O', element: 'O' };
      const cootCommand = jest.fn(async () => ({ data: { result: { result: [{ donor, acceptor }] } } }));
      const molecule = { molNo: 7, getAtoms: jest.fn() };
      const adapter = Object.create(MoorhenViewerAdapter.prototype);
      Object.assign(adapter, { contactInputs: new WeakMap(), contactWorker: { calculate: jest.fn() } });
      Object.assign(representation, {
        style: getMoorhenRepresentationStyle('contact'),
        cid: '/*/*/*/*',
        parentMolecule: molecule,
        commandCentre: { current: { cootCommand } }
      });
      const nativeDetector = representation.getHBondBuffers;
      adapter.configureContactRepresentation(representation, { parentObject: molecule, params: { sele: '/0 or /1' } });
      expect(representation.getHBondBuffers).toBe(nativeDetector);
      const meshes = await representation.getBufferObjects();
      expect(cootCommand).toHaveBeenCalledWith(
        { command: 'get_h_bonds', returnType: 'vector_hbond', commandArgs: [7, '/*/*/*/*', false] },
        false
      );
      expect(meshes).toHaveLength(1);
      expect(meshes[0].instance_origins[0][0]).toStrictEqual([1, 2, 3]);
      expect(meshes[0].instance_sizes[0][0][2]).toBeCloseTo(3);
      expect(meshes[0].col_tri[0][0]).toStrictEqual([0.7, 0.2, 0.7, 1]);
      const error = new Error('Coot hydrogen-bond calculation failed');
      cootCommand.mockRejectedValueOnce(error);
      await expect(representation.getBufferObjects()).rejects.toBe(error);
      expect(adapter.contactWorker.calculate).not.toHaveBeenCalled();
      expect(molecule.getAtoms).not.toHaveBeenCalled();
    } finally {
      setting.restore();
    }
  });

  it('renders every contact type with its original endpoints, radius, colour and dashes', async () => {
    expect.hasAssertions();
    // The detector tests independently verify these NGL results. Here they
    // exercise the installed Moorhen mesh builder without a geometry mock.
    const records = reference.cases
      .filter(item => ['tutorial', 'types-all'].includes(item.name))
      .flatMap(item => item.records);
    const contacts = {
      types: Uint8Array.from(records, record => record[0]),
      position1: Float32Array.from(records.flatMap(record => record.slice(1, 4))),
      position2: Float32Array.from(records.flatMap(record => record.slice(4, 7))),
      color: Float32Array.from(records.flatMap(record => record.slice(7, 10))),
      radius: Float32Array.from(records, record => record[10])
    };
    const representation = Object.create(installedRepresentation().prototype);
    const molecule = { getAtoms: jest.fn(async () => 'PDB coordinates') };
    const adapter = Object.create(MoorhenViewerAdapter.prototype);
    Object.assign(adapter, {
      contactInputs: new WeakMap(),
      contactWorker: { calculate: jest.fn(async () => contacts) }
    });
    Object.assign(representation, { style: getMoorhenRepresentationStyle('contact'), parentMolecule: molecule });
    adapter.configureContactRepresentation(representation, { parentObject: molecule, params: { sele: '/0 or /1' } });
    const meshes = await representation.getBufferObjects();
    expect(adapter.contactWorker.calculate).toHaveBeenCalledWith({
      pdb: 'PDB coordinates',
      parameters: { sele: '/0 or /1' }
    });
    const types = [...new Set(contacts.types)];
    expect(types).toHaveLength(10);
    expect(meshes).toHaveLength(10);
    let longContacts = 0;
    meshes.forEach((mesh, groupIndex) => {
      const indices = Array.from(contacts.types, (type, i) => (type === types[groupIndex] ? i : -1)).filter(
        i => i >= 0
      );
      const origins = mesh.instance_origins[0][0];
      const sizes = mesh.instance_sizes[0][0];
      const orientations = mesh.instance_orientations[0][0];
      const colours = mesh.col_tri[0][0];
      expect(origins).toHaveLength(indices.length * 3);
      expect(colours).toHaveLength(indices.length * 4);
      indices.forEach((contactIndex, index) => {
        expect(colours.slice(index * 4, index * 4 + 4)).toStrictEqual([
          ...contacts.color.slice(contactIndex * 3, contactIndex * 3 + 3),
          1
        ]);
        expect(sizes[index * 3]).toBeCloseTo(contacts.radius[contactIndex]);
        expect(sizes[index * 3 + 1]).toBeCloseTo(contacts.radius[contactIndex]);
        if (sizes[index * 3 + 2] > 4) longContacts++;
        [0, 1, 2].forEach(axis => {
          expect(origins[index * 3 + axis]).toBeCloseTo(contacts.position1[contactIndex * 3 + axis], 5);
          const end = origins[index * 3 + axis] + orientations[index * 16 + 8 + axis] * sizes[index * 3 + 2];
          expect(end).toBeCloseTo(contacts.position2[contactIndex * 3 + axis], 4);
        });
      });
      const positions = mesh.vert_tri[0][0];
      const triangles = mesh.idx_tri[0][0];
      const intervals = [];
      for (let i = 0; i < triangles.length; i += 3) {
        const z = triangles.slice(i, i + 3).map(index => positions[index * 3 + 2]);
        intervals.push([Math.min(...z), Math.max(...z)]);
      }
      intervals.sort((a, b) => a[0] - b[0]);
      const dashes = [];
      intervals.forEach(([start, end]) => {
        const previous = dashes[dashes.length - 1];
        if (!previous || start > previous[1] + 1e-6) dashes.push([start, end]);
        else previous[1] = Math.max(previous[1], end);
      });
      expect(dashes.length).toBeGreaterThan(1);
      expect(dashes[0][0]).toBeCloseTo(0);
      expect(dashes[dashes.length - 1][1]).toBeCloseTo(1);
      expect(dashes.every(([start, end]) => end - start < 0.2)).toBe(true);
    });
    expect(longContacts).toBeGreaterThan(0);
  });
});
