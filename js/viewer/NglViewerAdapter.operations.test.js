import { autoLoad, Counter } from 'ngl';
import NglViewerAdapter from './NglViewerAdapter';
import { DENSITY_MAPS, OBJECT_TYPE } from '../components/nglView/constants';
import { getRepresentationsForDensities } from '../components/nglView/generatingObjects';

jest.mock('../components/nglView/renderingFile', () => ({ getPdb: source => async () => source }));

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
const flush = async () => {
  for (let i = 0; i < 12; i++) await Promise.resolve();
};
const createStage = () => {
  let serial = 0;
  const stage = {
    compList: [],
    tasks: { count: 0, onZeroOnce: jest.fn() },
    dispose: jest.fn(),
    getComponentsByName: name => ({ list: stage.compList.filter(comp => comp.name === name) }),
    removeComponent: jest.fn(comp => {
      stage.compList = stage.compList.filter(item => item !== comp);
      comp.buffers = null;
    }),
    removeAllComponents: jest.fn(() => stage.compList.slice().forEach(comp => stage.removeComponent(comp)))
  };
  stage.component = (name, structure) => {
    const comp = { name, structure, reprList: [], buffers: new Float32Array(64) };
    comp.addRepresentation = (type, params) => {
      const rep = {
        uuid: `rep-${++serial}`,
        repr: { type, parameters: { opacity: { type: 'number' } }, tasks: comp.taskCounter || new Counter() },
        getParameters: () => ({ ...params }),
        parentObject: comp
      };
      rep.nativeRepresentation = rep;
      comp.reprList.push(rep);
      return rep;
    };
    jest.spyOn(comp, 'addRepresentation');
    stage.compList.push(comp);
    return comp;
  };
  stage.loadFile = async (source, options) => stage.component(options.name || 'temporary');
  jest.spyOn(stage, 'loadFile');
  stage.addComponentFromObject = structure => stage.component(structure.name, structure);
  jest.spyOn(stage, 'addComponentFromObject');
  return stage;
};
const options = (name, type = OBJECT_TYPE.LIGAND, input = {}) => ({
  target: { OBJECT_TYPE: type },
  object_name: name,
  input_dict: { sdf_info: 'SDF', colour: '#123456', ...input },
  dispatch: thunk => thunk()
});

describe('ngl loading through the current display queue contract', () => {
  it('renders a downloaded ligand while another native load remains pending', async () => {
    expect.hasAssertions();
    const stage = createStage();
    stage.tasks = new Counter();
    stage.tasks.increment();
    const adapter = new NglViewerAdapter(stage);
    const delayedCoordinates = deferred();
    stage.loadFile.mockImplementationOnce(() => delayedCoordinates.promise);
    const slow = adapter.loadObject(options('slow-ligand'));
    await flush();
    const fast = adapter.loadObject(options('downloaded-ligand'));
    await flush();
    expect(stage.loadFile).toHaveBeenCalledTimes(2);
    const records = await fast;
    expect(records).toHaveLength(1);
    expect(stage.tasks.count).toBe(1);
    const completed = stage.compList.find(comp => comp.name === 'downloaded-ligand');
    expect(completed.buffers).toBeInstanceOf(Float32Array);
    await adapter.removeObjects('downloaded-ligand');
    expect(completed.buffers).toBeNull();
    expect(stage.tasks.count).toBe(1);
    delayedCoordinates.resolve(stage.component('slow-ligand'));
    await slow;
    stage.tasks.decrement();
    await adapter.destroy();
  });

  it('acknowledges its own representation build and drains hidden measurement redraws before deletion', async () => {
    expect.hasAssertions();
    const stage = createStage();
    stage.tasks = new Counter();
    stage.tasks.increment();
    const adapter = new NglViewerAdapter(stage);
    const component = stage.component('ligand');
    component.taskCounter = new Counter();
    component.taskCounter.increment();
    const representation = adapter.createRepresentation(component, 'ball+stick', {});
    let rendered = false;
    representation.ready.then(() => {
      rendered = true;
    });
    await flush();
    expect(rendered).toBe(false);
    component.taskCounter.decrement();
    await representation.ready;
    expect(rendered).toBe(true);
    expect(stage.tasks.count).toBe(1);

    const measurementTasks = new Counter();
    measurementTasks.increment();
    component.measureRepresentations = { list: [{ repr: { tasks: measurementTasks } }] };
    const removal = adapter.removeObjects('ligand');
    await flush();
    expect(component.buffers).toBeInstanceOf(Float32Array);
    measurementTasks.decrement();
    await removal;
    expect(component.buffers).toBeNull();
    expect(stage.tasks.count).toBe(1);
    stage.tasks.decrement();
    await adapter.destroy();
  });

  it('cleans up failed representations and allows a later retry', async () => {
    expect.hasAssertions();
    const stage = createStage();
    const adapter = new NglViewerAdapter(stage);
    let failedComponent;
    stage.loadFile.mockImplementationOnce(async () => {
      failedComponent = stage.component('ligand');
      failedComponent.addRepresentation.mockImplementation(() => {
        throw new Error('representation failure');
      });
      return failedComponent;
    });
    await expect(adapter.loadObject(options('ligand'))).rejects.toThrow('representation failure');
    expect(stage.compList).toHaveLength(0);
    expect(failedComponent.buffers).toBeNull();
    expect(await adapter.loadObject(options('ligand'))).toHaveLength(1);
    expect(stage.compList).toHaveLength(1);
    await adapter.destroy();
  });

  it('waits for redraws added to the same object while an earlier redraw is draining', async () => {
    expect.hasAssertions();
    const stage = createStage();
    const adapter = new NglViewerAdapter(stage);
    const component = stage.component('ligand');
    component.taskCounter = new Counter();
    component.taskCounter.increment();
    adapter.createRepresentation(component, 'ball+stick', {});
    const removal = adapter.removeObjects('ligand');
    await flush();
    const lateTasks = new Counter();
    lateTasks.increment();
    component.measureRepresentations = { list: [{ repr: { tasks: lateTasks } }] };
    component.taskCounter.decrement();
    await flush();
    expect(component.buffers).toBeInstanceOf(Float32Array);
    lateTasks.decrement();
    await removal;
    expect(component.buffers).toBeNull();
    await adapter.destroy();
  });

  it('orders delayed same-name load, removal and reload, and acknowledges representation builds before returning', async () => {
    expect.hasAssertions();
    const stage = createStage();
    const adapter = new NglViewerAdapter(stage);
    const coordinates = deferred();
    stage.loadFile.mockImplementationOnce(() => coordinates.promise);
    const first = adapter.loadObject(options('ligand'));
    const removal = adapter.removeObjects('ligand');
    const reload = adapter.loadObject(options('ligand'));
    await flush();
    expect(stage.loadFile).toHaveBeenCalledTimes(1);
    const old = stage.component('ligand');
    old.taskCounter = new Counter();
    old.taskCounter.increment();
    stage.tasks.count = 1;
    coordinates.resolve(old);
    await flush();
    expect(stage.removeComponent).not.toHaveBeenCalled();
    expect(stage.loadFile).toHaveBeenCalledTimes(1);
    stage.tasks.count = 0;
    old.taskCounter.decrement();
    await first;
    await removal;
    const records = await reload;
    expect(stage.removeComponent).toHaveBeenCalledTimes(1);
    expect(old.buffers).toBeNull();
    expect(stage.compList).toHaveLength(1);
    expect(records[0]).toStrictEqual({
      lastKnownID: 'rep-2',
      uuid: 'rep-2',
      type: 'ball+stick',
      params: { colorScheme: 'element', colorValue: '#123456', multipleBond: true, radiusSize: undefined },
      templateParams: { opacity: { type: 'number' } }
    });
    expect(JSON.stringify(records)).not.toContain('parentObject');
    await adapter.destroy();
    await adapter.destroy();
    expect(stage.dispose).toHaveBeenCalledTimes(1);
    expect(stage.compList).toHaveLength(0);
  });

  it('loads each difference map once with both contours and removes it while its load is pending', async () => {
    expect.hasAssertions();
    const stage = createStage();
    const adapter = new NglViewerAdapter(stage);
    const coordinates = deferred();
    stage.loadFile.mockImplementationOnce(() => coordinates.promise);
    const loading = adapter.loadObject(
      options('density', OBJECT_TYPE.DENSITY, { diff_url: '/diff.map', render_diff: true })
    );
    const removal = adapter.removeObjects('density' + DENSITY_MAPS.DIFF);
    await flush();
    expect(stage.loadFile).toHaveBeenCalledTimes(1);
    const map = stage.component('density' + DENSITY_MAPS.DIFF);
    coordinates.resolve(map);
    const records = await loading;
    expect(map.addRepresentation).toHaveBeenCalledTimes(2);
    expect(records).toHaveLength(1);
    expect(records[0].repr.map(rep => rep.params.negateIsolevel)).toStrictEqual([false, true]);
    await removal;
    await adapter.removeObjects(map.name);
    expect(stage.removeComponent).toHaveBeenCalledTimes(1);
    expect(stage.compList).toHaveLength(0);
    expect(map.buffers).toBeNull();
  });

  it('transfers exact per-map NGL settings and still accepts legacy untagged density settings', async () => {
    expect.hasAssertions();
    const rep = opacity => ({ type: 'surface', params: { opacity } });
    const source = {
      hit_DENSITY: { representations: [rep(0.1)] },
      hit_DENSITY_MAP_diff: { representations: [rep(0.2), rep(0.3)] },
      hit2_DENSITY: { representations: [rep(1)] }
    };
    const representations = getRepresentationsForDensities(source, { virtual_name: 'hit' });
    const adapter = new NglViewerAdapter(createStage());
    const maps = options('destination', OBJECT_TYPE.DENSITY, {
      event_url: '/event.map', render_event: true, diff_url: '/diff.map', render_diff: true,
      sigmaa_url: '/sigma.map', render_sigmaa: true, opacity_DENSITY_MAP_sigmaa: 0.75
    });
    const load = async reps => Object.fromEntries((await adapter.loadObject({ ...maps, representations: reps }))
      .map(({ name, repr }) => [name, repr.map(item => item.params.opacity)]));
    expect(await load(representations)).toStrictEqual({
      destination: [0.1], destination_MAP_diff: [0.2, 0.3], destination_MAP_sigmaa: [0.75]
    });
    expect(await load([rep(0.5)])).toStrictEqual({
      destination: [0.5], destination_MAP_diff: [0.5], destination_MAP_sigmaa: [0.5]
    });
  });

  it('waits for late parallel coordinate loads before cleaning up a failed composite', async () => {
    expect.hasAssertions();
    const stage = createStage();
    const adapter = new NglViewerAdapter(stage);
    const late = deferred();
    stage.loadFile.mockImplementationOnce(() => Promise.reject(new Error('coordinate failure')));
    stage.loadFile.mockImplementationOnce(() => late.promise);
    const pending = adapter.loadObject(options('event', OBJECT_TYPE.EVENTMAP));
    const failed = pending.catch(error => error);
    await flush();
    const map = stage.component('event');
    late.resolve(map);
    expect(await failed).toStrictEqual(expect.objectContaining({ message: 'coordinate failure' }));
    expect(map.buffers).toBeNull();
    expect(stage.compList).toHaveLength(0);
    expect(adapter.objectOperations.size).toBe(0);
  });

  it('drains in-flight loads on teardown and rejects further loading', async () => {
    expect.hasAssertions();
    const stage = createStage();
    const adapter = new NglViewerAdapter(stage);
    const late = deferred();
    stage.loadFile.mockImplementationOnce(() => late.promise);
    const loading = adapter.loadObject(options('ligand'));
    await flush();
    const cleanup = adapter.destroy();
    expect(stage.dispose).not.toHaveBeenCalled();
    const comp = stage.component('ligand');
    late.resolve(comp);
    await loading;
    await cleanup;
    expect(comp.buffers).toBeNull();
    expect(stage.compList).toHaveLength(0);
    await expect(adapter.loadObject(options('new'))).rejects.toThrow('destroyed');
  });

  it.each([OBJECT_TYPE.HIT_PROTEIN, OBJECT_TYPE.ARTEFACTS])(
    'preserves coordinates and strips bound LIG from %s, disposing the temporary source component',
    async type => {
      expect.hasAssertions();
      const pdb = new Blob(
        [
          'ATOM      1  CA  ALA A   1      11.000  22.000  33.000  1.00 20.00           C\n' +
            'HETATM    2  C1  LIG B   2      12.000  23.000  34.000  1.00 20.00           C\nEND\n'
        ],
        { type: 'text/plain' }
      );
      const stage = createStage();
      stage.loadFile.mockImplementation(async (source, opts) =>
        stage.component('temporary', await autoLoad(source, opts))
      );
      const adapter = new NglViewerAdapter(stage);
      await adapter.loadObject(options('protein', type, { prot_url: pdb, artefacts_url: pdb }));
      expect(stage.loadFile).toHaveBeenCalledTimes(1);
      expect(stage.compList).toHaveLength(1);
      expect(stage.compList[0].name).toBe('protein');
      const atoms = [];
      stage.compList[0].structure.eachAtom(atom => atoms.push([atom.resname, atom.x, atom.y, atom.z]));
      expect(atoms).toStrictEqual([['ALA', 11, 22, 33]]);
      expect(stage.removeComponent).toHaveBeenCalledTimes(1);
      await adapter.removeObjects('protein');
      expect(stage.compList).toHaveLength(0);
    }
  );
});
