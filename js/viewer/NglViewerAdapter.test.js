import { NglViewerAdapter } from './NglViewerAdapter';
import { asViewerAdapter } from './viewerAdapterFactory';

const { fn } = jest;

const createSignal = () => ({ add: fn(), remove: fn() });

const createStage = () => ({
  loadFile: fn(),
  addComponentFromObject: fn(),
  viewerControls: {
    orient: fn(),
    getOrientation: fn()
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

describe('NglViewerAdapter', () => {
  it('requires an NGL stage', () => {
    expect(() => new NglViewerAdapter()).toThrow('NglViewerAdapter requires an NGL stage');
  });

  it('returns a cached adapter for a legacy stage', () => {
    const stage = createStage();
    const adapter = asViewerAdapter(stage);

    expect(asViewerAdapter(stage)).toBe(adapter);
    expect(asViewerAdapter(adapter)).toBe(adapter);
    expect(adapter.getNativeViewer()).toBe(stage);
  });

  it('delegates molecule, map, surface and vector loading', () => {
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
    expect(adapter.getObjects('object-map')).toEqual([component]);
    expect(adapter.getObjectsByNameSuffix('map')).toEqual([component]);
    expect(adapter.getRepresentation(component, { uuid: firstRepresentation.uuid })).toBe(firstRepresentation);
    expect(adapter.getRepresentationsByType([component], 'surface')).toEqual([firstRepresentation]);
    expect(adapter.getRepresentationCount(component)).toBe(2);
    expect(adapter.getRepresentationParameter(firstRepresentation, 'visible')).toBe(true);
    expect(adapter.getVisibility(firstRepresentation)).toBe(true);

    const representationState = adapter.createRepresentation(component, 'surface', { visible: true }, 'legacy-id');
    expect(representationState).toEqual({
      lastKnownID: 'legacy-id',
      uuid: firstRepresentation.uuid,
      type: 'surface',
      params: { visible: true },
      templateParams: firstRepresentation.repr.parameters
    });

    adapter.setVisibility(firstRepresentation, false);
    adapter.setRepresentationParameters(firstRepresentation, { opacity: 0.5 });
    adapter.removeRepresentation(component, firstRepresentation);
    expect(firstRepresentation.setVisibility).toHaveBeenCalledWith(false);
    expect(firstRepresentation.setParameters).toHaveBeenCalledWith({ opacity: 0.5 });
    expect(component.removeRepresentation).toHaveBeenCalledWith(firstRepresentation);
  });

  it('delegates stage parameters, resize, task and animated orientation operations', () => {
    const stage = createStage();
    const adapter = new NglViewerAdapter(stage);
    const onComplete = fn();
    stage.tasks.count = 3;

    adapter.setParameters({ backgroundColor: 'black' });
    adapter.resize();
    expect(adapter.getRendererElement()).toBe(stage.viewer.renderer.domElement);
    expect(adapter.getTaskCount()).toBe(3);
    adapter.onTasksComplete(onComplete);
    adapter.animateOrientation([1, 2, 3], 2000);

    expect(stage.setParameters).toHaveBeenCalledWith({ backgroundColor: 'black' });
    expect(stage.handleResize).toHaveBeenCalledTimes(1);
    expect(stage.tasks.onZeroOnce).toHaveBeenCalledWith(onComplete);
    expect(stage.animationControls.orient).toHaveBeenCalledWith([1, 2, 3], 2000);
  });

  it('normalizes picks and manages viewer event handlers', () => {
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
    const stage = createStage();
    const adapter = new NglViewerAdapter(stage);
    const capture = fn(() => Promise.resolve('data:image/png;base64,image'));

    await expect(adapter.captureImage({ capture })).resolves.toBe('data:image/png;base64,image');
    expect(capture).toHaveBeenCalledTimes(1);
    expect(stage.makeImage).not.toHaveBeenCalled();
  });

  it('delegates orientation, removal, capture and lifecycle operations', () => {
    const stage = createStage();
    const adapter = new NglViewerAdapter(stage);
    const orientation = { elements: [1, 2, 3] };
    const component = { name: 'component' };
    const imageOptions = { factor: 2 };
    stage.viewerControls.getOrientation.mockReturnValue(orientation);

    adapter.setOrientation(orientation.elements);
    expect(adapter.getOrientation()).toBe(orientation);
    adapter.removeObject(component);
    adapter.removeAll();
    adapter.captureImage(imageOptions);
    adapter.destroy();

    expect(stage.viewerControls.orient).toHaveBeenCalledWith(orientation.elements);
    expect(stage.viewerControls.getOrientation).toHaveBeenCalledTimes(1);
    expect(stage.removeComponent).toHaveBeenCalledWith(component);
    expect(stage.removeAllComponents).toHaveBeenCalledTimes(1);
    expect(stage.makeImage).toHaveBeenCalledWith(imageOptions);
    expect(stage.dispose).toHaveBeenCalledTimes(1);
  });
});
