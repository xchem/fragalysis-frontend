const notImplemented = methodName => {
  throw new Error(`${methodName} must be implemented by a viewer adapter`);
};

/**
 * Viewer-independent operations used by Fragalysis. Concrete adapters may
 * temporarily accept engine-native object handles while migration is in progress.
 */
export class ViewerAdapter {
  getNativeViewer() {
    return notImplemented('getNativeViewer');
  }

  loadObject() {
    return notImplemented('loadObject');
  }

  loadMolecule() {
    return notImplemented('loadMolecule');
  }

  loadMap() {
    return notImplemented('loadMap');
  }

  loadSurface() {
    return notImplemented('loadSurface');
  }

  loadVector() {
    return notImplemented('loadVector');
  }

  addSphere() {
    return notImplemented('addSphere');
  }

  setRepresentation() {
    return notImplemented('setRepresentation');
  }

  setVisibility() {
    return notImplemented('setVisibility');
  }

  getVisibility() {
    return notImplemented('getVisibility');
  }

  createRepresentation() {
    return notImplemented('createRepresentation');
  }

  getRepresentation() {
    return notImplemented('getRepresentation');
  }

  getRepresentations() {
    return notImplemented('getRepresentations');
  }

  getRepresentationsByType() {
    return notImplemented('getRepresentationsByType');
  }

  getRepresentationCount() {
    return notImplemented('getRepresentationCount');
  }

  getRepresentationParameter() {
    return notImplemented('getRepresentationParameter');
  }

  setRepresentationParameters() {
    return notImplemented('setRepresentationParameters');
  }

  removeRepresentation() {
    return notImplemented('removeRepresentation');
  }

  getObject() {
    return notImplemented('getObject');
  }

  getObjects() {
    return notImplemented('getObjects');
  }

  getObjectsByNameSuffix() {
    return notImplemented('getObjectsByNameSuffix');
  }

  centerOn() {
    return notImplemented('centerOn');
  }

  setOrientation() {
    return notImplemented('setOrientation');
  }

  getOrientation() {
    return notImplemented('getOrientation');
  }

  animateOrientation() {
    return notImplemented('animateOrientation');
  }

  setParameters() {
    return notImplemented('setParameters');
  }

  resize() {
    return notImplemented('resize');
  }

  getRendererElement() {
    return notImplemented('getRendererElement');
  }

  getTaskCount() {
    return notImplemented('getTaskCount');
  }

  onTasksComplete() {
    return notImplemented('onTasksComplete');
  }

  addPickHandler() {
    return notImplemented('addPickHandler');
  }

  removePickHandler() {
    return notImplemented('removePickHandler');
  }

  addOrientationChangeHandler() {
    return notImplemented('addOrientationChangeHandler');
  }

  removeOrientationChangeHandler() {
    return notImplemented('removeOrientationChangeHandler');
  }

  addClickHandler() {
    return notImplemented('addClickHandler');
  }

  removeClickHandler() {
    return notImplemented('removeClickHandler');
  }

  removeObject() {
    return notImplemented('removeObject');
  }

  removeAll() {
    return notImplemented('removeAll');
  }

  captureImage() {
    return notImplemented('captureImage');
  }

  destroy() {
    return notImplemented('destroy');
  }
}

export default ViewerAdapter;
