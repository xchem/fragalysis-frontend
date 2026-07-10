import ViewerAdapter from './ViewerAdapter';
import { Shape, Stage } from 'ngl';
import { nglObjectDictionary } from '../components/nglView/renderingObjects';
import { PREFIX } from '../constants/constants';

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

  loadObject(options) {
    const renderer = options?.target && nglObjectDictionary[options.target.OBJECT_TYPE];
    if (!renderer) {
      return Promise.reject(new Error(`Unsupported viewer object type: ${options?.target?.OBJECT_TYPE}`));
    }
    return renderer({ ...options, stage: this.stage });
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
      templateParams: representation.repr.parameters
    };
  }

  getRepresentation(component, representation) {
    return this.getRepresentations(component).find(
      item => item.uuid === representation.uuid || item.uuid === representation.lastKnownID
    );
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
    return representation.setParameters(parameters);
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

  setOrientation(orientation) {
    return this.stage.viewerControls.orient(orientation);
  }

  getOrientation() {
    return this.stage.viewerControls.getOrientation();
  }

  animateOrientation(orientation, duration) {
    return this.stage.animationControls.orient(orientation, duration);
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

  removeObject(component) {
    return this.stage.removeComponent(component);
  }

  removeAll() {
    return this.stage.removeAllComponents();
  }

  captureImage(options) {
    if (options && typeof options.capture === 'function') {
      return options.capture();
    }
    return this.stage.makeImage(options);
  }

  destroy() {
    Array.from(this.pickHandlers.keys()).forEach(handler => this.removePickHandler(handler));
    Array.from(this.clickHandlers.keys()).forEach(handler => this.removeClickHandler(handler));
    Array.from(this.orientationHandlers).forEach(handler => this.removeOrientationChangeHandler(handler));
    return this.stage.dispose();
  }
}

export default NglViewerAdapter;
