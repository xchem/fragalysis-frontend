import fs from 'fs';
import { runInNewContext } from 'vm';
import ts from 'typescript';
import { hexToRgb } from '@mui/material';
import { MoorhenMoleculeRepresentation } from 'moorhen';
import MoorhenViewerAdapter from './MoorhenViewerAdapter';
import * as viewerConfig from '../config/viewer';
jest.mock('./contacts/createContactWorker', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../config/viewer', () => ({ __esModule: true, USE_NGL_STYLE_INTERACTIONS: true }));

jest.mock('moorhen', () => {
  const action = type => payload => ({ type, payload });
  return {
    MoorhenMoleculeRepresentation: jest.fn(),
    addMolecule: action('addMolecule'),
    showMolecule: action('showMolecule'),
    removeMolecule: action('removeMolecule'),
    setBackgroundColor: action('setBackgroundColor'),
    setZoomWheelSensitivityFactor: action('setZoomWheelSensitivityFactor')
  };
});

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject };
};

// Execute the installed constructors and draw/build/show/hide lifecycle. Only
// mesh generation, atom fetching and GPU allocation are replaced by fixtures.
const installedRepresentation = () => {
  const bundle = fs.readFileSync(require.resolve('moorhen'), 'utf8');
  const marker = bundle.lastIndexOf('sourceMappingURL=data:');
  const sourceMap = JSON.parse(Buffer.from(bundle.slice(bundle.indexOf('base64,', marker) + 7), 'base64').toString());
  const load = (suffix, dependencies = {}) => {
    const source = sourceMap.sourcesContent[sourceMap.sources.findIndex(name => name.endsWith(suffix))];
    const compiled = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 }
    });
    const exports = {};
    runInNewContext(compiled.outputText, { exports, require: name => dependencies[name] || {} });
    return exports;
  };
  let id = 0;
  const utils = { guid: () => `native-${++id}`, centreOnGemmiAtoms: () => [0, 0, 0] };
  const colour = load('/src/utils/MoorhenColourRule.tsx', { './utils': utils, '@mui/material': { hexToRgb } });
  const representation = load('/src/utils/MoorhenMoleculeRepresentation.ts', {
    './utils': utils,
    './MoorhenColourRule': colour,
    './enums': load('/src/utils/enums.ts'),
    'react-redux': { batch: callback => callback() },
    '../store/glRefSlice': Object.fromEntries(
      ['setDisplayBuffers', 'setLabelBuffers', 'setRequestDrawScene'].map(type => [
        type,
        payload => ({ type, payload })
      ])
    ),
    '../WebGLgComponents/buildBuffers': {
      buildBuffers: () => {},
      appendOtherData: object => [{ ...object, visible: true, clearBuffers: () => {} }]
    }
  }).MoorhenMoleculeRepresentation;
  return representation;
};

const NativeRepresentation = installedRepresentation();

describe('representation appearance before first presentation', () => {
  const setup = (calculateContacts, nativeContacts = false) => {
    jest.clearAllMocks();
    const atoms = deferred();
    const built = deferred();
    const existingBuffer = { visible: true, name: 'already-visible-protein' };
    const state = {
      glRef: { displayBuffers: [existingBuffer], labelBuffers: [] },
      sceneSettings: { backgroundColor: [0, 0, 0, 1], defaultBondSmoothness: 2 }
    };
    const store = {
      getState: () => state,
      dispatch: action => {
        if (action.type === 'setDisplayBuffers') state.glRef.displayBuffers = action.payload;
        if (action.type === 'setLabelBuffers') state.glRef.labelBuffers = action.payload;
        if (action.type === 'setRequestDrawScene' && action.payload) glRef.current.drawScene();
      }
    };
    const commandCentre = { current: { activeMessages: [], cootCommand: jest.fn(async () => ({})) } };
    const frames = [];
    const glRef = {
      current: {
        drawScene: jest.fn(() => {
          frames.push(
            state.glRef.displayBuffers.filter(buffer => buffer.visible).map(buffer => buffer.name || buffer.style)
          );
        })
      }
    };
    const adapter = new MoorhenViewerAdapter({ commandCentre, glRef, store });
    if (calculateContacts) {
      jest.spyOn(adapter.contactWorker, 'calculate').mockImplementation(calculateContacts);
      // Geometry is checked against the installed native builder separately.
      // Keep the real asynchronous draw/build/show/delete lifecycle here.
      jest
        .spyOn(adapter, 'createContactBuffers')
        .mockImplementation((representation, contacts) =>
          contacts.colours.map(colour => ({ style: representation.style, triangleColours: [new Float32Array(colour)] }))
        );
    }
    const molecule = {
      type: 'molecule',
      molNo: 1,
      name: 'new-molecule',
      representations: [],
      store,
      defaultColourRules: [],
      defaultBondOptions: { width: 0.1, smoothness: 2 },
      defaultM2tParams: { ballsStyleRadiusMultiplier: 1, surfaceStyleProbeRadius: 1.4 },
      defaultResidueEnvironmentOptions: {},
      gemmiAtomsForCid: jest.fn(() => {
        built.resolve();
        return atoms.promise;
      }),
      drawSymmetry: jest.fn(async () => {}),
      drawBiomolecule: jest.fn(),
      mergeMolecules: jest.fn(async () => {}),
      getAtoms: jest.fn(async () => 'ATOM\n'),
      delete: jest.fn(async () => molecule.representations.forEach(representation => representation.deleteBuffers()))
    };
    jest.spyOn(adapter, 'createNativeMolecule').mockResolvedValue(molecule);
    const generatedMeshes = [];
    MoorhenMoleculeRepresentation.mockImplementation((...args) => {
      const representation = new NativeRepresentation(...args);
      if (nativeContacts) {
        jest
          .spyOn(representation, 'getGemmiAtomPairsBuffers')
          .mockImplementation((_pairs, colour) => [
            { style: representation.style, triangleColours: [new Float32Array(colour)] }
          ]);
      }
      jest.spyOn(representation, 'getBufferObjects').mockImplementation(async function() {
        if ((calculateContacts || nativeContacts) && this.style === 'allHBonds') {
          const meshes = await this.getHBondBuffers(this.cid);
          generatedMeshes.push(...meshes);
          return meshes;
        }
        const mesh = {
          style: this.style,
          colour: this.colourRules[0]?.color,
          width: this.bondOptions.width,
          radiusScale: this.m2tParams.ballsStyleRadiusMultiplier,
          triangleColours: [new Float32Array([1, 0, 1, 1])]
        };
        generatedMeshes.push(mesh);
        return [mesh];
      });
      return representation;
    });
    return { adapter, molecule, atoms, built, generatedMeshes, existingBuffer, state, glRef, frames, commandCentre };
  };

  it.each([
    ['LHS ligand', { OBJECT_TYPE: 'LIGAND', sdf_info: 'sdf' }, {}, 'ligands', 0.22, 1.35, 1],
    ['RHS ligand', { OBJECT_TYPE: 'LIGAND', sdf_info: 'sdf' }, { markAsRightSideLigand: true }, 'CBs', 0.11, 1, 1],
    ['protein', { OBJECT_TYPE: 'PROTEIN', prot_url: 'ATOM\n' }, {}, 'CRs', 0.1, 1, 1],
    ['sidechains', { OBJECT_TYPE: 'HIT_PROTEIN', prot_url: 'ATOM\n' }, {}, 'CBs', 0.12, 1, 1],
    ['artefacts', { OBJECT_TYPE: 'ARTEFACTS', artefacts_url: 'ATOM\n' }, {}, 'CBs', 0.06, 1, 1],
    ['complex', { OBJECT_TYPE: 'COMPLEX', prot_url: 'ATOM\n', sdf_info: 'sdf' }, {}, 'allHBonds', 0.1, 1, 1],
    ['sphere', { OBJECT_TYPE: 'SPHERE', coords: [1, 2, 3], radius: 3.4 }, {}, 'VdwSpheres', 0.1, 2, 1],
    ['surface', { OBJECT_TYPE: 'SURFACE', prot_url: 'protein.pdb' }, {}, 'MolecularSurface', 0.1, 1, 0.74],
    [
      'saved surface',
      { OBJECT_TYPE: 'SURFACE', prot_url: 'protein.pdb' },
      {
        representations: [{ type: 'surface', params: { colorValue: 0xff00ff, opacity: 0.4 } }]
      },
      'MolecularSurface',
      0.1,
      1,
      0.4
    ]
  ])(
    'builds %s in its requested appearance and waits for completion before showing it',
    async (label, target, options, style, width, radiusScale, opacity) => {
      expect.hasAssertions();
      const { adapter, molecule, atoms, built, generatedMeshes, existingBuffer, state, frames } = setup();
      const ligand = { delete: jest.fn(async () => {}) };
      if (target.OBJECT_TYPE === 'COMPLEX') {
        adapter.createNativeMolecule.mockResolvedValueOnce(molecule).mockResolvedValueOnce(ligand);
      }
      const loading = adapter.loadObject({
        target: { ...target, name: 'new-molecule', colour: '#ff00ff' },
        ...options
      });
      await built.promise;
      const handle = adapter.getRepresentations(molecule)[0];
      const ready = handle.ready;
      let acknowledged = false;
      ready.then(() => {
        acknowledged = true;
      });
      expect(generatedMeshes).toHaveLength(1);
      expect(generatedMeshes[0]).toStrictEqual(
        expect.objectContaining({ style, colour: '#ff00ff', width, radiusScale })
      );
      expect(state.glRef.displayBuffers.filter(buffer => buffer.visible)).toStrictEqual([existingBuffer]);
      expect(handle.nativeRepresentation.buffers[0].triangleColours[0][3]).toBeCloseTo(opacity);
      expect(acknowledged).toBe(false);
      expect(frames.every(frame => frame.length === 1 && frame[0] === existingBuffer.name)).toBe(true);
      expect(molecule.defaultColourRules).toStrictEqual([]);
      if (target.OBJECT_TYPE === 'COMPLEX') {
        expect(molecule.mergeMolecules).toHaveBeenCalledWith([ligand], false, false);
        expect(ligand.delete).toHaveBeenCalledTimes(1);
      }
      atoms.resolve([]);
      await loading;
      expect(handle.ready).toBe(ready);
      expect(acknowledged).toBe(true);
      expect(state.glRef.displayBuffers.filter(buffer => buffer.visible)).toHaveLength(2);
      expect(frames[frames.length - 1]).toStrictEqual([existingBuffer.name, style]);
      expect(generatedMeshes).toHaveLength(1);
      expect(molecule.drawSymmetry).toHaveBeenCalledWith(false);
      expect(molecule.drawBiomolecule).toHaveBeenCalledWith(false);
    }
  );

  it('waits for classified contacts and final opacity before exposing any contact buffer', async () => {
    expect.hasAssertions();
    const calculation = deferred();
    const started = deferred();
    const { adapter, molecule, atoms, built, existingBuffer, state, generatedMeshes } = setup(input => {
      started.resolve(input);
      return calculation.promise;
    });
    const ligand = { delete: jest.fn(async () => {}) };
    adapter.createNativeMolecule.mockResolvedValueOnce(molecule).mockResolvedValueOnce(ligand);
    const loading = adapter.loadObject({
      target: { OBJECT_TYPE: 'COMPLEX', name: 'contacts', prot_url: 'protein', sdf_info: 'bonded SDF' },
      representations: [{ type: 'contact', params: { sele: '/0 or /1', opacity: 0.4 } }]
    });
    expect(await started.promise).toStrictEqual({
      pdb: 'ATOM\n',
      sdf: 'bonded SDF',
      parameters: expect.objectContaining({ sele: '/0 or /1', opacity: 0.4 })
    });
    expect(molecule.getAtoms.mock.invocationCallOrder[0]).toBeLessThan(
      molecule.mergeMolecules.mock.invocationCallOrder[0]
    );
    expect(state.glRef.displayBuffers).toStrictEqual([existingBuffer]);
    const colours = [
      [0.1686, 0.5137, 0.7294, 1],
      [1, 0.5, 0, 1],
      [0.55, 0.7, 0.4, 1]
    ];
    calculation.resolve({ colours });
    await built.promise;
    expect(generatedMeshes).toHaveLength(3);
    generatedMeshes.forEach((mesh, index) => {
      expect(mesh.triangleColours[0][0]).toBeCloseTo(colours[index][0]);
      expect(mesh.triangleColours[0][3]).toBeCloseTo(0.4);
    });
    expect(state.glRef.displayBuffers.filter(buffer => buffer.visible)).toStrictEqual([existingBuffer]);
    atoms.resolve([]);
    const [handle] = await loading;
    expect(state.glRef.displayBuffers.filter(buffer => buffer.visible)).toHaveLength(4);
    expect(handle.nativeRepresentation.buffers).toHaveLength(3);
    await adapter.removeObjects('contacts');
    expect(state.glRef.displayBuffers).toStrictEqual([existingBuffer]);
    expect(adapter.contactInputs.has(molecule)).toBe(false);
  });

  it('waits for native hydrogen bonds and opacity before showing them, then removes every buffer', async () => {
    expect.hasAssertions();
    const setting = jest.replaceProperty(viewerConfig, 'USE_NGL_STYLE_INTERACTIONS', false);
    try {
      const calculation = deferred();
      const started = deferred();
      const { adapter, molecule, atoms, built, state, existingBuffer, commandCentre } = setup(undefined, true);
      const calculateContacts = jest.spyOn(adapter.contactWorker, 'calculate');
      commandCentre.current.cootCommand.mockImplementation(async request => {
        if (request.command !== 'get_h_bonds') return {};
        started.resolve();
        return calculation.promise;
      });
      const loading = adapter.loadMolecule('protein', {
        name: 'native-contacts',
        representations: [{ type: 'contact', params: { opacity: 0.4 } }]
      });
      await started.promise;
      expect(state.glRef.displayBuffers).toStrictEqual([existingBuffer]);
      calculation.resolve({
        data: { result: { result: [{ donor: { x: 0, y: 0, z: 0 }, acceptor: { x: 3, y: 0, z: 0 } }] } }
      });
      await built.promise;
      const handle = adapter.getRepresentations(molecule)[0];
      expect(state.glRef.displayBuffers.filter(buffer => buffer.visible)).toStrictEqual([existingBuffer]);
      expect(handle.nativeRepresentation.buffers[0].triangleColours[0][3]).toBeCloseTo(0.4);
      atoms.resolve([]);
      await loading;
      expect(state.glRef.displayBuffers.filter(buffer => buffer.visible)).toHaveLength(2);
      expect(calculateContacts).not.toHaveBeenCalled();
      expect(adapter.contactWorker.resource).toBeUndefined();
      await adapter.removeObjects('native-contacts');
      expect(state.glRef.displayBuffers).toStrictEqual([existingBuffer]);
      expect(adapter.getObjects('native-contacts')).toStrictEqual([]);
    } finally {
      setting.restore();
    }
  });

  it.each([
    ['ngl', false],
    ['ngl', true],
    ['moorhen', false],
    ['moorhen', true]
  ])('cleans %s contacts removed during a pending calculation (failure: %s)', async (mode, fail) => {
    expect.hasAssertions();
    const setting = jest.replaceProperty(viewerConfig, 'USE_NGL_STYLE_INTERACTIONS', mode === 'ngl');
    try {
      const calculation = deferred();
      const started = deferred();
      const calculate = () => {
        started.resolve();
        return calculation.promise;
      };
      const { adapter, molecule, atoms, state, existingBuffer, commandCentre } = setup(calculate, mode === 'moorhen');
      commandCentre.current.cootCommand.mockImplementation(async request => {
        if (request.command !== 'get_h_bonds') return {};
        await calculate();
        return {
          data: { result: { result: [{ donor: { x: 0, y: 0, z: 0 }, acceptor: { x: 3, y: 0, z: 0 } }] } }
        };
      });
      atoms.resolve([]);
      const loading = adapter
        .loadMolecule('protein', {
          name: 'pending-contacts',
          representation: 'contact'
        })
        .catch(error => error);
      await started.promise;
      const removal = adapter.removeObjects('pending-contacts');
      expect(molecule.delete).not.toHaveBeenCalled();
      expect(state.glRef.displayBuffers).toStrictEqual([existingBuffer]);
      const error = new Error('Contact worker failed');
      if (fail) calculation.reject(error);
      else
        calculation.resolve({
          colours: [
            [0.1, 0.5, 0.7, 1],
            [1, 0.5, 0, 1]
          ]
        });
      const result = await loading;
      await removal;
      if (fail) expect(result).toBe(error);
      expect(molecule.delete).toHaveBeenCalledTimes(1);
      expect(state.glRef.displayBuffers).toStrictEqual([existingBuffer]);
      expect(adapter.getObjects('pending-contacts')).toStrictEqual([]);
      expect(adapter.contactInputs.has(molecule)).toBe(false);
      expect(adapter.contactWorker.calculate).toHaveBeenCalledTimes(mode === 'ngl' ? 1 : 0);
    } finally {
      setting.restore();
    }
  });

  it('applies sphere opacity and radius before its first visible frame', async () => {
    expect.hasAssertions();
    const { adapter, atoms, built, generatedMeshes, existingBuffer, state } = setup();
    const loading = adapter.addSphere({
      name: 'translucent-sphere',
      center: [1, 2, 3],
      radius: 5.1,
      color: '#ff00ff',
      representationParameters: { opacity: 0.35 }
    });
    await built.promise;
    const buffer = state.glRef.displayBuffers[1];
    expect(buffer.radiusScale).toBe(3);
    expect(buffer.triangleColours[0][3]).toBeCloseTo(0.35);
    expect(state.glRef.displayBuffers.filter(item => item.visible)).toStrictEqual([existingBuffer]);
    atoms.resolve([]);
    const sphere = await loading;
    expect(sphere.shapeType).toBe('sphere');
    expect(buffer.visible).toBe(true);
    expect(generatedMeshes).toHaveLength(1);
  });

  it.each([
    ['new sidechains', 'HIT_PROTEIN', undefined, false],
    ['new artefacts', 'ARTEFACTS', undefined, false],
    ['saved sidechains without a scheme', 'HIT_PROTEIN', { colorValue: 0xff00ff }, false],
    ['saved uniform sidechains', 'HIT_PROTEIN', { colorValue: 0xff00ff, colorScheme: 'uniform' }, true]
  ])('preserves the intended element colouring for %s on the first draw', async (label, type, params, uniform) => {
    expect.hasAssertions();
    const { adapter, atoms, built, commandCentre, existingBuffer, state } = setup();
    const loading = adapter.loadObject({
      target: { OBJECT_TYPE: type, name: 'sidechains', prot_url: 'ATOM\n', artefacts_url: 'ATOM\n', colour: '#ff00ff' },
      representations: params ? [{ type: 'line', params }] : undefined
    });
    await built.promise;
    const command = commandCentre.current.cootCommand.mock.calls.find(
      ([request]) => request.command === 'shim_set_bond_colours'
    )[0];
    expect(command.commandArgs).toStrictEqual([
      1,
      [{ cid: '/*/*/*/*', rgba: [1, 0, 1, 1], applyColourToNonCarbonAtoms: uniform }],
      uniform
    ]);
    expect(state.glRef.displayBuffers.filter(buffer => buffer.visible)).toStrictEqual([existingBuffer]);
    atoms.resolve([]);
    const [handle] = await loading;
    expect(handle.params.colorScheme).toBe(uniform ? 'uniform' : 'element');
  });

  it('keeps a saved hidden representation undrawn, then uses its appearance when explicitly shown', async () => {
    expect.hasAssertions();
    const { adapter, molecule, atoms, generatedMeshes, existingBuffer, state } = setup();
    atoms.resolve([]);
    const [handle] = await adapter.loadObject({
      target: { OBJECT_TYPE: 'SURFACE', prot_url: 'protein.pdb', name: 'new-molecule' },
      representations: [{ type: 'surface', params: { color: '#ff00ff', opacity: 0.4, visible: false } }]
    });
    expect(generatedMeshes).toStrictEqual([]);
    expect(handle.nativeRepresentation.visible).toBe(false);
    expect(state.glRef.displayBuffers).toStrictEqual([existingBuffer]);
    await adapter.setVisibility(handle, true);
    expect(generatedMeshes).toHaveLength(1);
    expect(handle.nativeRepresentation.buffers[0].triangleColours[0][3]).toBeCloseTo(0.4);
    expect(handle.nativeRepresentation.buffers[0].visible).toBe(true);
    expect(molecule.defaultColourRules).toStrictEqual([]);
  });

  it('disposes partially built buffers on failure without removing the existing scene', async () => {
    expect.hasAssertions();
    const { adapter, molecule, atoms, built, existingBuffer, state } = setup();
    const error = new Error('atom buffers failed');
    const loading = adapter.loadObject({
      target: {
        OBJECT_TYPE: 'SURFACE',
        prot_url: 'protein.pdb',
        name: 'new-molecule',
        colour: '#ff00ff'
      }
    });
    const rejected = loading.catch(loadError => loadError);
    await built.promise;
    expect(state.glRef.displayBuffers.filter(buffer => buffer.visible)).toStrictEqual([existingBuffer]);
    atoms.reject(error);
    expect(await rejected).toBe(error);
    expect(state.glRef.displayBuffers).toStrictEqual([existingBuffer]);
    expect(molecule.representations).toStrictEqual([]);
    expect(molecule.delete).toHaveBeenCalledTimes(1);
    expect(adapter.getObjects('new-molecule')).toStrictEqual([]);
  });

  it('waits for a pending representation before deleting its molecule and all new buffers', async () => {
    expect.hasAssertions();
    const { adapter, molecule, atoms, built, existingBuffer, state } = setup();
    const loading = adapter.loadObject({
      target: {
        OBJECT_TYPE: 'LIGAND',
        sdf_info: 'sdf',
        name: 'new-molecule',
        colour: '#ff00ff'
      }
    });
    await built.promise;
    const removal = adapter.removeObjects('new-molecule');
    expect(molecule.delete).not.toHaveBeenCalled();
    atoms.resolve([]);
    await Promise.all([loading, removal]);
    expect(molecule.delete).toHaveBeenCalledTimes(1);
    expect(state.glRef.displayBuffers).toStrictEqual([existingBuffer]);
    expect(adapter.getObjects('new-molecule')).toStrictEqual([]);
  });

  it('removes a failed added representation while retaining its molecule and the existing scene', async () => {
    expect.hasAssertions();
    const { adapter, molecule, atoms, built, existingBuffer, state } = setup();
    adapter.registerObject(molecule, molecule.name);
    const handle = adapter.createRepresentation(molecule, 'surface', { color: '#ff00ff', opacity: 0.4 });
    const error = new Error('new surface failed');
    const rejected = handle.ready.catch(renderError => renderError);
    await built.promise;
    atoms.reject(error);
    expect(await rejected).toBe(error);
    expect(handle.error).toBe(error);
    expect(state.glRef.displayBuffers).toStrictEqual([existingBuffer]);
    expect(adapter.getObjects(molecule.name)).toStrictEqual([molecule]);
    expect(adapter.getRepresentations(molecule)).toStrictEqual([]);
    expect(molecule.representations).toStrictEqual([]);
    expect(molecule.delete).not.toHaveBeenCalled();
  });
});
