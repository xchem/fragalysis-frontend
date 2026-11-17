import { NglViewerAdapter } from './NglViewerAdapter';
import { asViewerAdapter } from './viewerAdapterFactory';
import { Matrix4, Quaternion, Vector3 } from 'ngl';

const { fn } = jest;

const createSignal = () => ({ add: fn(), remove: fn() });

const createStage = () => ({
  loadFile: fn(),
  addComponentFromObject: fn(),
  viewerControls: {
    orient: fn(),
    getOrientation: fn(() => new Matrix4())
  },
  animationControls: {
    orient: fn()
  },
  getComponentsByName: fn(() => ({ first: undefined, list: [] })),
  compList: [],
  setParameters: fn(),
  handleResize: fn(),
  viewer: { renderer: { domElement: {} } },
  tasks: { count: 0, onZeroOnce: fn() },
  mouseControls: { add: fn(), remove: fn() },
  mouseObserver: {
    signals: {
      scrolled: createSignal(),
      dropped: createSignal(),
      dragged: createSignal()
    }
  },
  signals: { clicked: createSignal() },
  removeComponent: fn(),
  removeAllComponents: fn(),
  makeImage: fn(),
  dispose: fn()
});

describe('ngl viewer adapter', () => {
  it('requires an NGL stage', () => {
    expect.hasAssertions();
    expect(() => new NglViewerAdapter()).toThrow('NglViewerAdapter requires an NGL stage');
  });

  it('returns a cached adapter for a legacy stage', () => {
    expect.hasAssertions();
    const stage = createStage();
    expect(() => asViewerAdapter(stage)).toThrow('not registered');
    const adapter = new NglViewerAdapter(stage);

    expect(asViewerAdapter(stage)).toBe(adapter);
    expect(asViewerAdapter(adapter)).toBe(adapter);
    expect(adapter.getNativeViewer()).toBe(stage);
  });

  it('delegates molecule, map, surface and vector loading', () => {
    expect.hasAssertions();
    const stage = createStage();
    const adapter = new NglViewerAdapter(stage);
    const molecule = { name: 'molecule' };
    const map = { name: 'map' };
    const surface = { name: 'surface' };
    const vector = { name: 'vector' };

    adapter.loadMolecule(molecule, { ext: 'pdb' });
    adapter.loadMap(map, { ext: 'ccp4' });
    adapter.loadSurface(surface, { isShape: true });
    adapter.loadVector(vector, { isShape: true });

    expect(stage.loadFile).toHaveBeenNthCalledWith(1, molecule, { ext: 'pdb' });
    expect(stage.loadFile).toHaveBeenNthCalledWith(2, map, { ext: 'ccp4' });
    expect(stage.addComponentFromObject).toHaveBeenNthCalledWith(1, surface, { isShape: true });
    expect(stage.addComponentFromObject).toHaveBeenNthCalledWith(2, vector, { isShape: true });
  });

  it('delegates representation, visibility and centering operations', () => {
    expect.hasAssertions();
    const adapter = new NglViewerAdapter(createStage());
    const component = {
      addRepresentation: fn(),
      autoView: fn()
    };
    const representation = { setVisibility: fn() };

    adapter.setRepresentation(component, 'cartoon', { color: 'blue' });
    adapter.setVisibility(representation, false);
    adapter.centerOn(component, 'ligand');
    adapter.centerOn(component);

    expect(component.addRepresentation).toHaveBeenCalledWith('cartoon', { color: 'blue' });
    expect(representation.setVisibility).toHaveBeenCalledWith(false);
    expect(component.autoView).toHaveBeenNthCalledWith(1, 'ligand');
    expect(component.autoView).toHaveBeenNthCalledWith(2);
  });

  it('provides viewer-independent object and representation access', () => {
    expect.hasAssertions();
    const stage = createStage();
    const firstRepresentation = {
      uuid: 'representation-1',
      parameters: { visible: true },
      repr: { type: 'surface', parameters: { opacity: { min: 0, max: 1 } } },
      getParameters: fn(() => ({ visible: true })),
      getVisibility: fn(() => true),
      setVisibility: fn(),
      setParameters: fn()
    };
    const secondRepresentation = {
      uuid: 'representation-2',
      parameters: {},
      repr: { type: 'cartoon', parameters: {} }
    };
    const component = {
      name: 'object-map',
      reprList: [firstRepresentation, secondRepresentation],
      addRepresentation: fn(() => firstRepresentation),
      removeRepresentation: fn()
    };
    stage.getComponentsByName.mockReturnValue({ first: component, list: [component] });
    stage.compList = [component, { name: 'other-object', reprList: [] }];
    const adapter = new NglViewerAdapter(stage);

    expect(adapter.getObject('object-map')).toBe(component);
    expect(adapter.getObjects('object-map')).toStrictEqual([component]);
    expect(adapter.getObjectsByNameSuffix('map')).toStrictEqual([component]);
    expect(adapter.getRepresentation(component, { uuid: firstRepresentation.uuid })).toBe(firstRepresentation);
    expect(adapter.getRepresentationsByType([component], 'surface')).toStrictEqual([firstRepresentation]);
    expect(adapter.getRepresentationCount(component)).toBe(2);
    expect(adapter.getRepresentationParameter(firstRepresentation, 'visible')).toBe(true);
    expect(adapter.getVisibility(firstRepresentation)).toBe(true);

    const representationState = adapter.createRepresentation(component, 'surface', { visible: true }, 'legacy-id');
    expect(representationState).toStrictEqual({
      lastKnownID: 'legacy-id',
      uuid: firstRepresentation.uuid,
      type: 'surface',
      params: { visible: true },
      templateParams: firstRepresentation.repr.parameters,
      ready: expect.any(Promise)
    });

    adapter.setVisibility(firstRepresentation, false);
    adapter.setRepresentationParameters(firstRepresentation, { opacity: 0.5 });
    adapter.removeRepresentation(component, firstRepresentation);
    expect(firstRepresentation.setVisibility).toHaveBeenCalledWith(false);
    expect(firstRepresentation.setParameters).toHaveBeenCalledWith({ opacity: 0.5 });
    expect(component.removeRepresentation).toHaveBeenCalledWith(firstRepresentation);
    const qualityRepresentation = { uuid: 'quality-representation' };
    stage.getComponentsByName.mockReturnValue({
      first: component,
      list: [component, { name: component.name, reprList: [qualityRepresentation] }]
    });
    expect(adapter.getRepresentation(component, { uuid: 'quality-representation' })).toBe(qualityRepresentation);
    expect(adapter.getRepresentation(undefined, { uuid: 'quality-representation' })).toBeUndefined();
  });

  it('delegates stage parameters, resize, task and animated orientation operations', () => {
    expect.hasAssertions();
    const stage = createStage();
    const adapter = new NglViewerAdapter(stage);
    const onComplete = fn();
    stage.tasks.count = 3;

    adapter.setParameters({ backgroundColor: 'black' });
    adapter.resize();
    expect(adapter.getRendererElement()).toBe(stage.viewer.renderer.domElement);
    expect(adapter.getTaskCount()).toBe(3);
    adapter.onTasksComplete(onComplete);

    expect(stage.setParameters).toHaveBeenCalledWith({ backgroundColor: 'black' });
    expect(stage.handleResize).toHaveBeenCalledTimes(1);
    expect(stage.tasks.onZeroOnce).toHaveBeenCalledWith(onComplete);
  });

  it('normalizes picks and manages viewer event handlers', () => {
    expect.hasAssertions();
    const stage = createStage();
    const adapter = new NglViewerAdapter(stage);
    const pickHandler = fn();
    const clickHandler = fn();
    const orientationHandler = fn();
    const bondPick = {
      bond: true,
      position: { x: 1, y: 2, z: 3 },
      object: {
        atom1: { structure: { name: 'COMPLEXLOAD_42' } },
        atom2: { resname: 'HET' },
        center1: { toArray: () => [1, 2, 3] },
        center2: { toArray: () => [4, 5, 6] }
      }
    };
    bondPick.object.atom1 = {
      ...bondPick.object.atom1,
      atomname: 'CA',
      resname: 'ALA',
      chainname: 'A',
      resno: 7
    };

    adapter.addPickHandler(pickHandler);
    adapter.addPickHandler(pickHandler);
    const registeredPickHandler = stage.mouseControls.add.mock.calls[0][1];
    registeredPickHandler(stage, bondPick);

    expect(pickHandler).toHaveBeenCalledWith(adapter, {
      kind: 'bond',
      position: { x: 1, y: 2, z: 3 },
      interaction: { interaction: 'A_ALA_7_CA', complex_id: 42 },
      start: [1, 2, 3],
      end: [4, 5, 6]
    });
    expect(stage.mouseControls.add).toHaveBeenCalledTimes(1);

    adapter.addClickHandler(clickHandler);
    const registeredClickHandler = stage.signals.clicked.add.mock.calls[0][0];
    registeredClickHandler({ component: { object: { name: 'VECTOR_example' } } });
    expect(clickHandler).toHaveBeenCalledWith({
      kind: 'component',
      position: undefined,
      componentName: 'VECTOR_example'
    });

    adapter.addOrientationChangeHandler(orientationHandler);
    adapter.addOrientationChangeHandler(orientationHandler);
    expect(stage.mouseObserver.signals.scrolled.add).toHaveBeenCalledTimes(1);

    adapter.removePickHandler(pickHandler);
    adapter.removeClickHandler(clickHandler);
    adapter.removeOrientationChangeHandler(orientationHandler);
    expect(stage.mouseControls.remove).toHaveBeenCalledWith('clickPick-left', registeredPickHandler);
    expect(stage.signals.clicked.remove).toHaveBeenCalledWith(registeredClickHandler);
    expect(stage.mouseObserver.signals.scrolled.remove).toHaveBeenCalledWith(orientationHandler);
  });

  it('uses a supplied screenshot strategy without changing current image output', async () => {
    expect.hasAssertions();
    const stage = createStage();
    const adapter = new NglViewerAdapter(stage);
    const capture = fn(() => Promise.resolve('data:image/png;base64,image'));

    expect(await adapter.captureImage({ capture })).toBe('data:image/png;base64,image');
    expect(capture).toHaveBeenCalledTimes(1);
    expect(stage.makeImage).not.toHaveBeenCalled();
  });

  it('delegates orientation, removal, capture and lifecycle operations', async () => {
    expect.hasAssertions();
    const stage = createStage();
    const adapter = new NglViewerAdapter(stage);
    const orientation = new Matrix4();
    const component = { name: 'component' };
    const imageOptions = { factor: 2 };
    stage.viewerControls.getOrientation.mockReturnValue(orientation);

    adapter.setOrientation(orientation.elements);
    expect(adapter.getOrientation()).toBe(orientation);
    await adapter.removeObject(component);
    adapter.captureImage(imageOptions);
    await adapter.destroy();

    expect(stage.viewerControls.orient).toHaveBeenCalledWith(orientation.elements);
    expect(stage.viewerControls.getOrientation).toHaveBeenCalledTimes(1);
    expect(stage.removeComponent).toHaveBeenCalledWith(component);
    expect(stage.removeAllComponents).toHaveBeenCalledTimes(1);
    expect(stage.makeImage).toHaveBeenCalledWith(imageOptions);
    expect(stage.dispose).toHaveBeenCalledTimes(1);
  });

  it('converts Moorhen snapshots into an NGL camera matrix without copying zoom into camera distance', () => {
    expect.hasAssertions();
    const stage = createStage();
    const adapter = new NglViewerAdapter(stage);
    const moorhen = [0, 0, 0, 1, -10, -20, -30, 0.5];
    adapter.setOrientation(moorhen);
    const result = new Matrix4().fromArray(stage.viewerControls.orient.mock.calls[0][0]);
    const position = new Vector3();
    const rotation = new Quaternion();
    const scale = new Vector3();
    result.decompose(position, rotation, scale);
    expect(position.toArray()).toStrictEqual([-10, -20, -30]);
    expect(rotation.toArray()).toStrictEqual([0, 0, 0, 1]);
    expect(scale.z).toBeCloseTo(12 / Math.tan(Math.PI / 9));
  });

  it('centers ligands with equal weight and aligns their widest separation horizontally', () => {
    expect.hasAssertions();
    const stage = createStage();
    stage.getZoomForBox = () => -100;
    const adapter = new NglViewerAdapter(stage);
    const molecule = atoms => ({ structure: { eachAtom: callback => atoms.forEach(callback) } });
    expect(
      adapter.centerOnObjects([
        molecule([
          { x: -3, y: 0, z: 0 },
          { x: 3, y: 0, z: 0 }
        ]),
        molecule([{ x: 0, y: 20, z: 0 }])
      ])
    ).toBe(true);
    const matrix = new Matrix4().fromArray(stage.viewerControls.orient.mock.calls[0][0]);
    const position = new Vector3();
    const rotation = new Quaternion();
    const scale = new Vector3();
    matrix.decompose(position, rotation, scale);
    expect(position.distanceTo(new Vector3(0, -10, 0))).toBeCloseTo(0);
    const separation = new Vector3(0, 20, 0).applyQuaternion(rotation);
    expect(separation.x).toBeCloseTo(20);
    expect(separation.y).toBeCloseTo(0);
    expect(separation.z).toBeCloseTo(0);
    scale.toArray().forEach(value => expect(value).toBeCloseTo(100));
    expect(adapter.centerOnObjects([])).toBe(false);
  });

  it('animates by elapsed time and cancels on manual input, supersession, abort and destruction', async () => {
    expect.hasAssertions();
    const frames = new Map();
    let nextFrame = 0;
    const request = jest.spyOn(global, 'requestAnimationFrame').mockImplementation(callback => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    });
    const cancel = jest.spyOn(global, 'cancelAnimationFrame').mockImplementation(id => frames.delete(id));
    const frame = time => {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach(callback => callback(time));
    };
    const stage = createStage();
    stage.viewer.renderer.domElement = document.createElement('canvas');
    stage.viewerControls.orient.mockImplementation(elements => {
      stage.viewerControls.getOrientation.mockReturnValue(new Matrix4().fromArray(elements));
    });
    stage.animationControls.clear = fn();
    const adapter = new NglViewerAdapter(stage);
    const destination = new Matrix4().makeTranslation(20, 0, 0).elements;
    try {
      const complete = adapter.animateOrientation(destination, 400);
      frame(100);
      frame(200);
      expect(adapter.getOrientation().elements[12]).toBeCloseTo(3.125);
      frame(500);
      expect(await complete).toStrictEqual({ status: 'completed' });
      const interrupted = adapter.animateOrientation(new Matrix4().elements);
      frame(600);
      frame(800);
      const actual = adapter.getOrientation().elements.slice();
      stage.viewer.renderer.domElement.dispatchEvent(new Event('wheel'));
      expect(await interrupted).toStrictEqual({ status: 'interrupted' });
      frame(1000);
      expect(adapter.getOrientation().elements).toStrictEqual(actual);
      const controller = new AbortController();
      const aborted = adapter.animateOrientation(destination, 400, { signal: controller.signal });
      controller.abort();
      expect(await aborted).toStrictEqual({ status: 'cancelled' });
      const old = adapter.animateOrientation(destination);
      const newer = adapter.animateOrientation(new Matrix4().elements);
      expect(await old).toStrictEqual({ status: 'cancelled' });
      const cleanup = adapter.destroy();
      expect(await newer).toStrictEqual({ status: 'destroyed' });
      await cleanup;
      expect(stage.animationControls.clear).toHaveBeenCalledWith();
      expect(frames.size).toBe(0);
    } finally {
      request.mockRestore();
      cancel.mockRestore();
    }
  });
});
