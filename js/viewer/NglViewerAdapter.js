import ViewerAdapter from './ViewerAdapter';
import { Box3, Matrix4, Quaternion, Shape, Stage, Vector3 } from 'ngl';
import { nglObjectDictionary } from '../components/nglView/renderingObjects';
import { DENSITY_MAPS, OBJECT_TYPE } from '../components/nglView/constants';
import { PREFIX } from '../constants/constants';
import { copyRepresentationState } from './representationState';
import { getMoorhenLigandFocus } from './moorhenAdapterUtils';

const adaptersByStage = new WeakMap();

const toCoordinateArray = value => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value && typeof value.toArray === 'function') {
    return value.toArray();
  }
  return value && [value.x, value.y, value.z];
};

export class NglViewerAdapter extends ViewerAdapter {
  constructor(stage) {
    super();

    if (!stage) {
      throw new TypeError('NglViewerAdapter requires an NGL stage');
    }

    this.stage = stage;
    this.pickHandlers = new Map();
    this.clickHandlers = new Map();
    this.orientationHandlers = new Set();
    this.objectOperations = new Map();
    this.objectOwners = new Map();
    this.componentsByOwner = new Map();
    this.disposedComponents = new WeakSet();
    this.destroyed = false;
    stage.viewerAdapter = this;
    adaptersByStage.set(stage, this);
  }

  static create(containerId) {
    return new NglViewerAdapter(new Stage(containerId));
  }

  static forStage(stage) {
    return adaptersByStage.get(stage) || new NglViewerAdapter(stage);
  }

  getNativeViewer() {
    return this.stage;
  }

  enqueueObject(name, operation) {
    const previous = this.objectOperations.get(name);
    const pending = Promise.resolve(previous)
      .catch(() => undefined)
      .then(operation);
    this.objectOperations.set(name, pending);
    const clear = () => {
      if (this.objectOperations.get(name) === pending) this.objectOperations.delete(name);
    };
    pending.then(clear, clear);
    return pending;
  }

  waitForTasks(counter = this.stage.tasks) {
    return counter?.count > 0 ? new Promise(resolve => counter.onZeroOnce(resolve)) : Promise.resolve();
  }

  async waitForComponents(components) {
    // The stage counter includes unrelated coordinate loads and representations.
    // Waiting for it here prevents downloaded ligands from appearing incrementally.
    // Include NGL's hidden measurement representations when draining an object.
    const objects = Array.from(components);
    while (true) {
      const counters = new Set(
        objects
          .flatMap(component => [...(component.reprList || []), ...(component.measureRepresentations?.list || [])])
          .map(representation => representation.repr?.tasks)
          .filter(counter => counter?.count > 0)
      );
      if (counters.size === 0) return;
      await Promise.all(Array.from(counters, counter => this.waitForTasks(counter)));
    }
  }

  loadObject(options) {
    const renderer = options?.target && nglObjectDictionary[options.target.OBJECT_TYPE];
    if (!renderer) {
      return Promise.reject(new Error(`Unsupported viewer object type: ${options?.target?.OBJECT_TYPE}`));
    }
    if (this.destroyed) return Promise.reject(new Error('The NGL viewer has been destroyed'));
    const name = options.object_name;
    if (options.target.OBJECT_TYPE === OBJECT_TYPE.DENSITY) {
      [DENSITY_MAPS.SIGMAA, DENSITY_MAPS.DIFF].forEach(suffix => this.objectOwners.set(name + suffix, name));
    }
    return this.enqueueObject(name, async () => {
      await this.disposeOwnedObjects(name);
      const owned = new Set();
      this.componentsByOwner.set(name, owned);
      // Track temporary protein/ligand components as well as all maps and quality
      // shapes. A logical removal must drain loads before disposing their buffers.
      const stage = Object.create(this.stage);
      stage.pendingLoads = [];
      stage.loadFile = async (...args) => {
        const pending = this.stage.loadFile(...args).then(component => {
          owned.add(component);
          return component;
        });
        stage.pendingLoads.push(pending);
        return pending;
      };
      stage.addComponentFromObject = (...args) => {
        const component = this.stage.addComponentFromObject(...args);
        owned.add(component);
        return component;
      };
      try {
        const representations = await renderer({ ...options, stage });
        await this.waitForComponents(owned);
        for (const component of owned) {
          if (component.name !== name && this.objectOwners.get(component.name) !== name) {
            this.disposeComponent(component);
            owned.delete(component);
          }
        }
        return options.target.OBJECT_TYPE === OBJECT_TYPE.DENSITY
          ? representations.map(item => ({ name: item.name, repr: item.repr.map(copyRepresentationState) }))
          : representations?.map(copyRepresentationState);
      } catch (error) {
        // Parallel coordinate loads may still finish after one rejects.
        await Promise.allSettled(Array.from(stage.pendingLoads || []));
        await this.disposeOwnedObjects(name);
        throw error;
      }
    });
  }

  loadMolecule(source, options) {
    return this.stage.loadFile(source, options);
  }

  loadMap(source, options) {
    return this.stage.loadFile(source, options);
  }

  loadSurface(surface, options) {
    return this.stage.addComponentFromObject(surface, options);
  }

  loadVector(vector, options) {
    return this.stage.addComponentFromObject(vector, options);
  }

  addSphere({ name, center, color, radius, representation = 'buffer', representationParameters = {} }) {
    const shape = new Shape(name);
    shape.addSphere(toCoordinateArray(center), color, radius);
    const component = this.loadSurface(shape);
    this.setRepresentation(component, representation, representationParameters);
    return component;
  }

  setRepresentation(component, representation, parameters) {
    return component.addRepresentation(representation, parameters);
  }

  setVisibility(renderable, visible) {
    return renderable.setVisibility(visible);
  }

  getVisibility(renderable) {
    return renderable.getVisibility();
  }

  createRepresentation(component, type, parameters, lastKnownID) {
    const representation = this.setRepresentation(component, type, parameters || {});
    return {
      lastKnownID: lastKnownID || representation.uuid,
      uuid: representation.uuid,
      type,
      params: representation.getParameters(),
      templateParams: representation.repr.parameters,
      ready: this.waitForTasks(representation.repr?.tasks || null)
    };
  }

  getRepresentation(component, representation) {
    if (!component) return undefined;
    return [...new Set([component, ...this.getObjects(component.name)])]
      .flatMap(item => this.getRepresentations(item))
      .find(item => item.uuid === representation.uuid || item.uuid === representation.lastKnownID);
  }

  getRepresentations(component) {
    return component?.reprList || [];
  }

  getRepresentationsByType(components, type) {
    return (components || []).flatMap(component =>
      this.getRepresentations(component).filter(representation => representation.repr.type === type)
    );
  }

  getRepresentationCount(component) {
    return this.getRepresentations(component).length;
  }

  getRepresentationParameter(representation, key) {
    return representation?.parameters?.[key];
  }

  setRepresentationParameters(representation, parameters) {
    representation.setParameters(parameters);
    return { ready: this.waitForTasks(representation.repr?.tasks || null) };
  }

  removeRepresentation(component, representation) {
    return component.removeRepresentation(representation);
  }

  getObject(name) {
    return this.stage.getComponentsByName(name).first;
  }

  getObjects(name) {
    return this.stage.getComponentsByName(name).list || [];
  }

  getObjectsByNameSuffix(suffix) {
    return (this.stage.compList || []).filter(component => component.name.endsWith(suffix));
  }

  centerOn(component, selection) {
    return selection === undefined ? component.autoView() : component.autoView(selection);
  }

  centerOnObjects(components = []) {
    const groups = [...new Set(components)]
      .map(component => {
        const atoms = [];
        component.structure?.eachAtom(atom => atoms.push({ x: atom.x, y: atom.y, z: atom.z }));
        return atoms;
      })
      .filter(atoms => atoms.length);
    if (!groups.length) return false;
    const current = new Matrix4().fromArray(this.getOrientation().elements);
    const position = new Vector3();
    const rotation = new Quaternion();
    const scale = new Vector3();
    current.decompose(position, rotation, scale);
    const focus = getMoorhenLigandFocus(groups, rotation.toArray());
    const center = new Vector3().fromArray(focus.origin).negate();
    const radius = Math.max(...groups.flat().map(atom => new Vector3(atom.x, atom.y, atom.z).distanceTo(center)), 1);
    const bounds = new Box3(center.clone().addScalar(-radius), center.clone().addScalar(radius));
    const distance = -this.stage.getZoomForBox(bounds);
    const matrix = new Matrix4().compose(
      center.negate(),
      new Quaternion().fromArray(focus.quat4),
      new Vector3(distance, distance, distance)
    );
    this.setOrientation(matrix.elements);
    return true;
  }

  normaliseOrientation(orientation) {
    const elements = orientation?.elements || orientation;
    if (elements?.length === 16) return new Matrix4().fromArray(elements);
    if (elements?.length === 8 || orientation?.quat4) {
      const quat = orientation.quat4 || Array.from(elements).slice(0, 4);
      const origin = orientation.origin || Array.from(elements).slice(4, 7);
      const zoom = orientation.zoom ?? elements[7];
      // Match Moorhen's 48-Angstrom orthographic view height to NGL's
      // perspective field of view; a Moorhen zoom is never a camera distance.
      const fov = this.stage.viewer?.perspectiveCamera?.fov || 40;
      const distance = (24 * zoom) / Math.tan((fov * Math.PI) / 360);
      return new Matrix4().compose(
        new Vector3().fromArray(origin),
        new Quaternion().fromArray(quat),
        new Vector3(distance, distance, distance)
      );
    }
    throw new TypeError('Unsupported viewer orientation');
  }

  setOrientation(orientation) {
    this.orientationAnimation?.finish('cancelled');
    this.stage.animationControls.clear?.();
    return this.stage.viewerControls.orient(this.normaliseOrientation(orientation).elements);
  }

  getOrientation() {
    return this.stage.viewerControls.getOrientation();
  }

  animateOrientation(orientation, duration = 400, { signal } = {}) {
    this.orientationAnimation?.finish('cancelled');
    if (this.destroyed) return Promise.resolve({ status: 'destroyed' });
    if (signal?.aborted) return Promise.resolve({ status: 'cancelled' });
    const startPosition = new Vector3();
    const startRotation = new Quaternion();
    const startScale = new Vector3();
    new Matrix4().fromArray(this.getOrientation().elements).decompose(startPosition, startRotation, startScale);
    const endPosition = new Vector3();
    const endRotation = new Quaternion();
    const endScale = new Vector3();
    const destination = this.normaliseOrientation(orientation);
    destination.decompose(endPosition, endRotation, endScale);
    const unchanged = this.getOrientation().elements.every(
      (value, i) => Math.abs(value - destination.elements[i]) < 1e-6
    );
    this.stage.animationControls.clear?.();
    const canvas = this.getRendererElement();
    return new Promise((resolve, reject) => {
      let frameId;
      let startTime;
      let finished = false;
      const abort = () => finish('cancelled');
      const interrupt = () => finish('interrupted');
      const finish = (status, error) => {
        if (finished) return;
        finished = true;
        cancelAnimationFrame(frameId);
        signal?.removeEventListener('abort', abort);
        ['pointerdown', 'wheel', 'keydown'].forEach(event => canvas?.removeEventListener?.(event, interrupt, true));
        this.orientationAnimation = null;
        if (error) reject(error);
        else resolve({ status });
      };
      const frame = time => {
        if (finished) return;
        try {
          if (startTime == null) startTime = time;
          const progress = unchanged || duration <= 0 ? 1 : Math.min(1, (time - startTime) / duration);
          const eased = progress * progress * (3 - 2 * progress);
          const matrix = new Matrix4().compose(
            startPosition.clone().lerp(endPosition, eased),
            startRotation.clone().slerp(endRotation, eased),
            startScale.clone().lerp(endScale, eased)
          );
          this.stage.viewerControls.orient(matrix.elements);
          if (progress === 1) finish('completed');
          else frameId = requestAnimationFrame(frame);
        } catch (error) {
          finish('failed', error);
        }
      };
      this.orientationAnimation = { finish };
      signal?.addEventListener('abort', abort);
      ['pointerdown', 'wheel', 'keydown'].forEach(event => canvas?.addEventListener?.(event, interrupt, true));
      frameId = requestAnimationFrame(frame);
    });
  }

  prepareInitialView() {
    return (
      !this.destroyed && !this.orientationAnimation && this.objectOperations.size === 0 && this.getTaskCount() === 0
    );
  }

  setParameters(parameters) {
    return this.stage.setParameters(parameters);
  }

  resize() {
    return this.stage.handleResize();
  }

  getRendererElement() {
    return this.stage.viewer?.renderer?.domElement;
  }

  getTaskCount() {
    return this.stage.tasks?.count || 0;
  }

  onTasksComplete(callback) {
    return this.stage.tasks.onZeroOnce(callback);
  }

  normalizePick(pickingProxy) {
    if (!pickingProxy) {
      return null;
    }

    const position = pickingProxy.position && {
      x: pickingProxy.position.x,
      y: pickingProxy.position.y,
      z: pickingProxy.position.z
    };

    if (pickingProxy.bond) {
      const atomId = pickingProxy.object.atom2.resname === 'HET' ? 'atom1' : 'atom2';
      const atom = pickingProxy.object[atomId];
      const interaction = `${atom.chainname}_${atom.resname}_${atom.resno.toString()}_${atom.atomname}`;
      const complexId = parseInt(pickingProxy.object.atom1.structure.name.split(PREFIX.COMPLEX_LOAD)[1]);

      return {
        kind: 'bond',
        position,
        interaction: { interaction, complex_id: complexId },
        start: toCoordinateArray(pickingProxy.object.center1),
        end: toCoordinateArray(pickingProxy.object.center2)
      };
    }

    return {
      kind: pickingProxy.atom ? 'atom' : 'component',
      position,
      componentName: pickingProxy.component?.object?.name
    };
  }

  addPickHandler(handler) {
    if (this.pickHandlers.has(handler)) {
      return;
    }
    const wrappedHandler = (stage, pickingProxy) => handler(this, this.normalizePick(pickingProxy));
    this.pickHandlers.set(handler, wrappedHandler);
    this.stage.mouseControls.add('clickPick-left', wrappedHandler);
  }

  removePickHandler(handler) {
    const wrappedHandler = this.pickHandlers.get(handler);
    if (wrappedHandler) {
      this.stage.mouseControls.remove('clickPick-left', wrappedHandler);
      this.pickHandlers.delete(handler);
    }
  }

  addOrientationChangeHandler(handler) {
    if (this.orientationHandlers.has(handler)) {
      return;
    }
    this.orientationHandlers.add(handler);
    this.stage.mouseObserver.signals.scrolled.add(handler);
    this.stage.mouseObserver.signals.dropped.add(handler);
    this.stage.mouseObserver.signals.dragged.add(handler);
  }

  removeOrientationChangeHandler(handler) {
    if (!this.orientationHandlers.has(handler)) {
      return;
    }
    this.orientationHandlers.delete(handler);
    this.stage.mouseObserver.signals.scrolled.remove(handler);
    this.stage.mouseObserver.signals.dropped.remove(handler);
    this.stage.mouseObserver.signals.dragged.remove(handler);
  }

  addClickHandler(handler) {
    if (this.clickHandlers.has(handler)) {
      return;
    }
    const wrappedHandler = pickingProxy => handler(this.normalizePick(pickingProxy));
    this.clickHandlers.set(handler, wrappedHandler);
    this.stage.signals.clicked.add(wrappedHandler);
  }

  removeClickHandler(handler) {
    const wrappedHandler = this.clickHandlers.get(handler);
    if (wrappedHandler) {
      this.stage.signals.clicked.remove(wrappedHandler);
      this.clickHandlers.delete(handler);
    }
  }

  disposeComponent(component) {
    if (!component || this.disposedComponents.has(component)) return;
    this.disposedComponents.add(component);
    this.stage.removeComponent(component);
  }

  async disposeOwnedObjects(name) {
    const objects = new Set([...(this.componentsByOwner.get(name) || []), ...this.getObjects(name)]);
    await this.waitForComponents(objects);
    objects.forEach(component => this.disposeComponent(component));
    this.componentsByOwner.delete(name);
  }

  removeObject(component) {
    return this.enqueueObject(this.objectOwners.get(component.name) || component.name, async () => {
      await this.waitForComponents([component]);
      this.disposeComponent(component);
      this.componentsByOwner.forEach(owned => owned.delete(component));
    });
  }

  removeObjects(name) {
    const owner = this.objectOwners.get(name) || name;
    return this.enqueueObject(owner, async () => {
      if (owner === name) await this.disposeOwnedObjects(name);
      else {
        const components = this.getObjects(name);
        await this.waitForComponents(components);
        components.forEach(component => {
          this.disposeComponent(component);
          this.componentsByOwner.get(owner)?.delete(component);
        });
      }
    });
  }

  async removeAll() {
    await Promise.allSettled(Array.from(this.objectOperations.values()));
    await this.waitForTasks();
    this.stage.removeAllComponents();
    this.componentsByOwner.clear();
    this.objectOwners.clear();
  }

  captureImage(options) {
    if (options && typeof options.capture === 'function') {
      return options.capture();
    }
    return this.stage.makeImage(options);
  }

  destroy() {
    if (this.destroyPromise) return this.destroyPromise;
    this.destroyed = true;
    this.orientationAnimation?.finish('destroyed');
    Array.from(this.pickHandlers.keys()).forEach(handler => this.removePickHandler(handler));
    Array.from(this.clickHandlers.keys()).forEach(handler => this.removeClickHandler(handler));
    Array.from(this.orientationHandlers).forEach(handler => this.removeOrientationChangeHandler(handler));
    this.destroyPromise = this.removeAll().then(() => {
      delete this.stage.viewerAdapter;
      adaptersByStage.delete(this.stage);
      this.stage.dispose();
    });
    return this.destroyPromise;
  }
}

export default NglViewerAdapter;
