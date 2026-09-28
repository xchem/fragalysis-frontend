import ViewerAdapter from './ViewerAdapter';
import ContactWorkerClient from './contacts/ContactWorkerClient';
import { USE_NGL_STYLE_INTERACTIONS } from '../config/viewer';
import { getAbsoluteMapContour, readCcp4MapMetadata, transformCcp4MapMesh } from './moorhenMapUtils';
import {
  MoorhenMap,
  MoorhenMolecule,
  MoorhenMoleculeRepresentation,
  MoorhenReduxStore,
  addMap,
  addMolecule,
  addVector,
  hideMap,
  hideMolecule,
  removeMap,
  removeMolecule,
  removeVector,
  setActiveMap,
  setBackgroundColor,
  setClipEnd,
  setClipStart,
  setContourLevel,
  setFogEnd,
  setFogStart,
  setHeight,
  setMapAlpha,
  setMapColours,
  setMapRadius,
  setMapStyle,
  setNegativeMapColours,
  setOrigin,
  setPositiveMapColours,
  setQuat,
  setWidth,
  setZoom,
  setZoomWheelSensitivityFactor,
  showMap,
  showMolecule
} from 'moorhen';
import {
  createMoorhenVector,
  createSpherePdb,
  getMoorhenRepresentationStyle,
  getMoorhenRepresentationTemplate,
  getMoorhenLigandFocus,
  interpolateMoorhenQuaternion,
  nglSelectionToMoorhenCid,
  normaliseMoorhenColour,
  normaliseMoorhenOrientation
} from './moorhenAdapterUtils';

const STRUCTURE_OBJECT_TYPES = new Set(['PROTEIN', 'SURFACE']);
const VECTOR_OBJECT_TYPES = new Set(['ARROW', 'CYLINDER']);
const LIGAND_FOCUS_ZOOM_SCALE = 1.8;
const MOORHEN_FULL_MOLECULE_ZOOM_DIVISOR = 40;
const MOORHEN_SELECTION_ZOOM = 0.4;
const ZOOM_WHEEL_SENSITIVITY = 8;

const isFileLike = source => source && typeof source === 'object' && typeof source.name === 'string';
const isMolfileData = source =>
  typeof source === 'string' && /(?:V2000|V3000)/.test(source) && /(?:^|\r?\n)M {2}END[ \t]*(?:\r?\n|$)/.test(source);
const isUrl = source =>
  typeof source === 'string' &&
  !source.includes('\n') &&
  !source.includes('\r') &&
  !source.trimStart().startsWith('data_') &&
  !source.trimStart().startsWith('ATOM') &&
  !source.trimStart().startsWith('HETATM');

const getPdbRecordName = line => line.slice(0, 6).trim();
const getPdbResidueName = line =>
  line
    .slice(17, 20)
    .trim()
    .toUpperCase();
const getPdbAtomSerial = line => line.slice(6, 11).trim();

export const stripPdbLigandRecords = pdbData => {
  const lines = String(pdbData || '').split(/\r?\n/);
  const ligandSerials = new Set(
    lines
      .filter(line => ['ATOM', 'HETATM', 'ANISOU'].includes(getPdbRecordName(line)))
      .filter(line => getPdbResidueName(line) === 'LIG')
      .map(getPdbAtomSerial)
      .filter(Boolean)
  );

  if (ligandSerials.size === 0) return String(pdbData || '');

  return lines
    .filter(line => {
      const recordName = getPdbRecordName(line);
      if (
        ['ATOM', 'HETATM', 'ANISOU'].includes(recordName) &&
        (getPdbResidueName(line) === 'LIG' || ligandSerials.has(getPdbAtomSerial(line)))
      ) {
        return false;
      }
      if (recordName === 'LINK') {
        return (
          line
            .slice(17, 20)
            .trim()
            .toUpperCase() !== 'LIG' &&
          line
            .slice(47, 50)
            .trim()
            .toUpperCase() !== 'LIG'
        );
      }
      if (recordName === 'CONECT') {
        const connectedSerials = line.slice(6).match(/\d+/g) || [];
        return !connectedSerials.some(serial => ligandSerials.has(serial));
      }
      return true;
    })
    .join('\n');
};

const getObjectName = (source, options, fallback) => options?.name || source?.name || fallback;

const getRepresentationDefinition = (representation, fallbackType, fallbackParameters = {}) => ({
  type: representation?.type || fallbackType,
  params: { ...fallbackParameters, ...(representation?.params || {}) },
  lastKnownID: representation?.lastKnownID
});

const mapParametersForTarget = (target, mapKind) => {
  const suffix = mapKind === 'event' ? 'DENSITY' : `DENSITY_MAP_${mapKind}`;
  return {
    visible: true,
    color: target[`color_${suffix}`],
    colorValue: normaliseMoorhenColour(target[`color_${suffix}`], mapKind === 'event' ? '#ffa500' : '#0000ff').integer,
    isolevel: target[`isolevel_${suffix}`],
    boxSize: target[`boxSize_${suffix}`],
    opacity: target[`opacity_${suffix}`],
    contour: target[`contour_${suffix}`]
  };
};

export class MoorhenViewerAdapter extends ViewerAdapter {
  constructor({
    commandCentre,
    glRef,
    store = MoorhenReduxStore,
    monomerLibraryPath = './monomers',
    containerElement = null
  } = {}) {
    super();

    if (!commandCentre || !glRef || !store) {
      throw new TypeError('MoorhenViewerAdapter requires commandCentre, glRef and store');
    }

    this.commandCentre = commandCentre;
    this.glRef = glRef;
    this.store = store;
    this.monomerLibraryPath = monomerLibraryPath;
    this.containerElement = containerElement;
    this.objectsByName = new Map();
    this.objectOperations = new Map();
    this.objectRemovals = new WeakMap();
    this.mapRendering = new WeakMap();
    this.contactInputs = new WeakMap();
    this.contactWorker = new ContactWorkerClient();
    this.useNglStyleInteractions = USE_NGL_STYLE_INTERACTIONS;
    this.nativeContactBufferBuilders = new WeakMap();
    this.interactionStyleChange = Promise.resolve();
    this.pendingInteractionStyleChanges = 0;
    this.representationsByObject = new WeakMap();
    this.centerZoomScaleByObject = new WeakMap();
    this.pickHandlers = new Map();
    this.clickHandlers = new Map();
    this.orientationHandlers = new Map();
    this.taskCompletionHandlers = new Set();
    this.focusRequestSequence = 0;
    this.destroyed = false;
    this.orientationAnimation = null;
    this.nativeCameraSequence = 0;
    this.installCameraAnimationGuard();
    this.runtime = { commandCentre, glRef, store, containerElement, viewerAdapter: this };
    this.store.dispatch(setBackgroundColor([0, 0, 0, 1]));
    this.store.dispatch(setZoomWheelSensitivityFactor(ZOOM_WHEEL_SENSITIVITY));
  }

  getNativeViewer() {
    return this.runtime;
  }

  assertActive() {
    if (this.destroyed) {
      throw new Error('MoorhenViewerAdapter has been destroyed');
    }
    if (!this.commandCentre.current || !this.glRef.current) {
      throw new Error('Moorhen runtime is not ready');
    }
  }

  registerObject(object, requestedName, representations = []) {
    const name = requestedName || object.name || `${object.type}-${object.molNo}`;
    object.name = name;
    this.objectsByName.set(name, object);

    const handles = Array.isArray(representations) ? representations : [representations].filter(Boolean);
    this.representationsByObject.set(object, handles);
    return object;
  }

  // Registration happens after native loading. Keep loads and deletion ordered
  // by name so concurrent requests cannot overwrite an uncollected molecule.
  runObjectOperation(name, operation) {
    const previous = this.objectOperations.get(name);
    let resolve;
    let reject;
    const pending = new Promise((onResolve, onReject) => {
      resolve = onResolve;
      reject = onReject;
    });
    this.objectOperations.set(name, pending);
    const clear = () => {
      if (this.objectOperations.get(name) === pending) this.objectOperations.delete(name);
    };
    pending.then(clear, clear);
    const start = () => {
      try {
        resolve(operation());
      } catch (error) {
        reject(error);
      }
    };
    if (previous) previous.then(start, start);
    else start();
    return pending;
  }

  createRepresentationHandle(object, nativeRepresentation, type, parameters = {}, lastKnownID) {
    const representationType = type || nativeRepresentation?.style || 'CRs';
    const uuid =
      nativeRepresentation?.uniqueId ||
      `${object.uniqueId || object.molNo || object.name}-${representationType}-${
        this.getRepresentations(object).length
      }`;
    const colourValue = parameters.colorValue ?? parameters.color;
    // NGL line representations colour heteroatoms by element, including saved
    // sidechains that omit the scheme. Preserve an explicitly saved scheme.
    const params = {
      visible: true,
      opacity: 1,
      ...(representationType === 'line' ? { colorScheme: 'element' } : {}),
      ...parameters
    };
    if (colourValue != null) {
      params.colorValue = normaliseMoorhenColour(colourValue, '#ffffff').integer;
    }

    return {
      uuid,
      lastKnownID: lastKnownID || uuid,
      type: representationType,
      params,
      parameters: params,
      templateParams: getMoorhenRepresentationTemplate(representationType, object.type === 'map'),
      visible: params.visible !== false && nativeRepresentation?.visible !== false,
      nativeRepresentation,
      parentObject: object,
      ready: Promise.resolve(nativeRepresentation)
    };
  }

  async loadObject(options) {
    const target = options?.target || options?.input_dict;
    const objectType = target?.OBJECT_TYPE;

    if (STRUCTURE_OBJECT_TYPES.has(objectType)) {
      const source = target.prot_url;
      const representation = objectType === 'SURFACE' ? 'surface' : target.nglProtStyle || 'cartoon';
      const defaultRepresentations =
        objectType === 'SURFACE'
          ? [
              {
                type: 'surface',
                params: { sele: 'polymer', color: target.colour, opacity: 0.74, visible: true }
              }
            ]
          : undefined;
      const molecule = await this.loadMolecule(source, {
        name: options.object_name || target.name,
        representation,
        representations: options.representations || defaultRepresentations,
        color: target.colour,
        center: options.center
      });
      return this.getRepresentations(molecule);
    }

    if (objectType === 'HIT_PROTEIN' || objectType === 'ARTEFACTS') {
      const linewidth = objectType === 'ARTEFACTS' ? 1.2 : 2.4;
      const source = objectType === 'ARTEFACTS' ? target.artefacts_url : target.prot_url;
      const molecule = await this.loadMolecule(source, {
        name: options.object_name || target.name,
        fromString: true,
        stripLigand: true,
        fetchOptions: options.fetchOptions,
        representation: 'line',
        representations: options.representations || [
          {
            type: 'line',
            params: { color: target.colour, visible: true, sele: '/0', linewidth }
          }
        ],
        color: target.colour,
        center: options.center === true
      });
      return this.getRepresentations(molecule);
    }

    if (objectType === 'LIGAND') {
      const defaultRepresentations = [
        {
          type: options.markAsRightSideLigand ? 'licorice' : 'ball+stick',
          params: {
            color: target.colour,
            colorScheme: 'element',
            multipleBond: true,
            radiusSize: options.markAsRightSideLigand ? 0.11 : 0.22,
            radiusScale: options.markAsRightSideLigand ? undefined : 1.35,
            visible: true
          }
        }
      ];
      const molecule = await this.loadMolecule(target.sdf_info, {
        name: options.object_name || target.name,
        fromString: true,
        representation: options.markAsRightSideLigand ? 'licorice' : 'ball+stick',
        representations: options.representations || defaultRepresentations,
        color: target.colour,
        center: options.center === true,
        centerZoomScale: LIGAND_FOCUS_ZOOM_SCALE
      });
      return this.getRepresentations(molecule);
    }

    if (objectType === 'COMPLEX') {
      const molecule = await this.loadComplex(target, options);
      return this.getRepresentations(molecule);
    }

    if (objectType === 'DENSITY') {
      const mapRequests = [
        target.render_sigmaa && target.sigmaa_url
          ? {
              source: target.sigmaa_url,
              name: `${target.name}_MAP_sigmaa`,
              isDifference: false,
              parameters: mapParametersForTarget(target, 'sigmaa')
            }
          : null,
        target.render_diff && target.diff_url
          ? {
              source: target.diff_url,
              name: `${target.name}_MAP_diff`,
              isDifference: true,
              parameters: {
                ...mapParametersForTarget(target, 'diff'),
                negativeColor: target.color_DENSITY_MAP_diff_negate
              }
            }
          : null,
        target.render_event && target.event_url
          ? {
              source: target.event_url,
              name: target.name,
              isDifference: false,
              parameters: mapParametersForTarget(target, 'event')
            }
          : null
      ].filter(Boolean);
      const mapResults = await Promise.allSettled(
        mapRequests.map(request => this.loadMap(request.source, { ...request, ext: 'map' }))
      );
      const failedMap = mapResults.find(result => result.status === 'rejected');
      if (failedMap) {
        await Promise.all(
          mapResults.filter(result => result.status === 'fulfilled').map(result => this.removeObject(result.value))
        );
        throw failedMap.reason;
      }
      const maps = mapResults.map(result => result.value);

      return maps.map(map => ({ name: map.name, repr: this.getRepresentations(map) }));
    }

    if (VECTOR_OBJECT_TYPES.has(objectType)) {
      const vector = this.loadVector(
        createMoorhenVector({
          name: options.object_name || target.name,
          start: target.start,
          end: target.end,
          colour: target.colour || target.color,
          arrow: objectType === 'ARROW'
        })
      );
      return this.getRepresentations(vector);
    }

    if (objectType === 'SPHERE') {
      const sphere = await this.addSphere({
        name: options.object_name || target.name,
        center: target.coords,
        color: target.colour,
        radius: target.radius
      });
      return this.getRepresentations(sphere);
    }

    if (objectType === 'EVENTMAP') {
      const moleculeRepresentations = [
        { type: 'cartoon', params: { visible: true } },
        { type: 'contact', params: { sele: 'LIG', linewidth: 1, visible: true } },
        { type: 'ball+stick', params: { sele: 'LIG', multipleBond: true, visible: true } }
      ];
      const molecule = await this.loadMolecule(target.pdb_info, {
        name: options.object_name || target.name,
        fromString: true,
        representation: 'cartoon',
        representations: moleculeRepresentations,
        contactEnvironment: true,
        center: options.center
      });
      let map;
      try {
        map = await this.loadMap(target.map_info, {
          name: `${target.name}_EVENT_MAP`,
          isDifference: true,
          parameters: { color: 'mediumseagreen', negativeColor: 'tomato', isolevel: 3, boxSize: 10 }
        });
      } catch (error) {
        await this.removeObject(molecule);
        throw error;
      }
      molecule.linkedObjects = [map];
      this.representationsByObject.set(molecule, [
        ...this.getRepresentations(molecule),
        ...this.getRepresentations(map)
      ]);
      return this.getRepresentations(molecule);
    }

    if (objectType === 'HOTSPOT') {
      const map = await this.loadMap(target.hotUrl, {
        name: options.object_name || target.name,
        parameters: {
          color: target.map_type === 'AP' ? 'yellow' : target.map_type === 'DO' ? 'blue' : 'red',
          isolevel: target.isoLevel,
          opacity: target.opacity
        }
      });
      return this.getRepresentations(map);
    }

    throw new Error(`Unsupported Moorhen object type: ${objectType || 'unknown'}`);
  }

  async getPdbWithoutLigand(source, fetchOptions) {
    if (!source) throw new Error('Moorhen protein source is required');

    let pdbData;
    if (isUrl(source)) {
      const response = await fetch(source, { credentials: 'same-origin', ...fetchOptions });
      if (!response.ok) throw new Error(`Unable to load protein coordinates from ${source} (${response.status})`);
      pdbData = await response.text();
    } else {
      pdbData = source && typeof source.text === 'function' ? await source.text() : source;
    }
    return stripPdbLigandRecords(pdbData);
  }

  async createNativeMolecule(source, name, options = {}) {
    const molecule = new MoorhenMolecule(this.commandCentre, this.glRef, this.store, this.monomerLibraryPath);
    const sceneSettings = this.store.getState().sceneSettings || {};

    if (sceneSettings.backgroundColor && typeof molecule.setBackgroundColour === 'function') {
      molecule.setBackgroundColour(sceneSettings.backgroundColor);
    }
    if (sceneSettings.defaultBondSmoothness != null && molecule.defaultBondOptions) {
      molecule.defaultBondOptions.smoothness = sceneSettings.defaultBondSmoothness;
    }

    if (isUrl(source) && options.fromString !== true) {
      await molecule.loadToCootFromURL(source, name, options.fetchOptions);
    } else if (isFileLike(source) && typeof molecule.loadToCootFromFile === 'function') {
      await molecule.loadToCootFromFile(source);
    } else {
      const data = source && typeof source.text === 'function' ? await source.text() : source;
      if (isMolfileData(data) && typeof molecule.loadToCootFromFile === 'function') {
        const molfileName = `${name.replace(/\.(?:mol|sdf)$/i, '')}.mol`;
        await molecule.loadToCootFromFile(new File([data], molfileName, { type: 'chemical/x-mdl-molfile' }));
        this.contactInputs.set(molecule, { sdf: data });
      } else {
        await molecule.loadToCootFromString(data, name);
      }
    }

    if (molecule.molNo == null || molecule.molNo === -1) {
      throw new Error(`Moorhen failed to load molecule ${name}`);
    }
    return molecule;
  }

  initialiseMoleculeRepresentation(component, handle) {
    const initialise = async () => {
      if (!component.defaultColourRules) await component.fetchDefaultColourRules();
      const style = getMoorhenRepresentationStyle(handle.type);
      const cid = handle.type === 'contact' ? '/*/*/*/*' : nglSelectionToMoorhenCid(handle.params.sele);
      // addRepresentation() draws immediately with native defaults. Configure
      // an undrawn representation so its first mesh already has our appearance.
      const representation = new MoorhenMoleculeRepresentation(style, cid, this.commandCentre, this.glRef);
      representation.setParentMolecule(component);
      representation.buffers = [];
      handle.nativeRepresentation = representation;
      component.representations.push(representation);

      const buildBuffers = representation.buildBuffers;
      let preparing = true;
      representation.buildBuffers = function(...args) {
        buildBuffers.apply(this, args);
        // Native draw() publishes buffers before its asynchronous atom work
        // finishes. Keep only this new representation hidden until it is ready.
        if (preparing) this.hide();
        // Native meshes do not consume nonCustomOpacity during generation.
        // Apply it to every new buffer, including a later show of a hidden item.
        this.setNonCustomOpacity(this.nonCustomOpacity);
      };
      try {
        if (handle.type === 'contact') this.configureContactRepresentation(representation, handle);
        this.configureMoleculeRepresentationParameters(representation, handle.params);
        if (handle.params.visible !== false) {
          await representation.draw();
          await component.drawSymmetry(false);
          component.drawBiomolecule(false);
          await representation.show();
          this.glRef.current?.drawScene?.();
        }
        handle.visible = handle.params.visible !== false;
        return representation;
      } catch (error) {
        representation.deleteBuffers();
        component.representations = component.representations.filter(item => item !== representation);
        this.glRef.current?.drawScene?.();
        throw error;
      } finally {
        preparing = false;
      }
    };
    handle.ready = initialise();
    return handle.ready;
  }

  async loadMolecule(source, options = {}) {
    this.assertActive();
    if (!source) {
      throw new Error('Moorhen molecule source is required');
    }

    const focusRequestId = options.center === true ? ++this.focusRequestSequence : null;
    const name = getObjectName(source, options, `molecule-${this.objectsByName.size + 1}`);
    return this.runObjectOperation(name, () => this.loadMoleculeNow(source, options, name, focusRequestId));
  }

  async loadMoleculeNow(source, options, name, focusRequestId) {
    const existingObject = this.getObject(name);
    if (existingObject) {
      await this.removeObjectNow(existingObject);
    }

    const coordinates = options.stripLigand ? await this.getPdbWithoutLigand(source, options.fetchOptions) : source;
    const molecule = await this.createNativeMolecule(coordinates, name, options);
    if (options.contactEnvironment) this.contactInputs.set(molecule, { environment: true });
    this.store.dispatch(addMolecule(molecule));
    this.store.dispatch(showMolecule(molecule));
    const registeredMolecule = this.registerObject(molecule, name);
    const centerZoomScale = Number(options.centerZoomScale);
    if (Number.isFinite(centerZoomScale) && centerZoomScale > 0) {
      this.centerZoomScaleByObject.set(registeredMolecule, centerZoomScale);
    }
    try {
      const definitions =
        options.representations?.length > 0
          ? options.representations
          : [
              getRepresentationDefinition(null, options.representation || 'cartoon', {
                color: options.color,
                visible: true
              })
            ];
      const handles = [];

      for (const definition of definitions) {
        const representation = getRepresentationDefinition(
          definition,
          options.representation || 'cartoon',
          options.color ? { color: options.color } : {}
        );
        const handle = this.createRepresentationHandle(
          registeredMolecule,
          null,
          representation.type,
          representation.params,
          representation.lastKnownID
        );
        handles.push(handle);
        this.representationsByObject.set(registeredMolecule, handles);
        await this.initialiseMoleculeRepresentation(registeredMolecule, handle);
      }

      if (focusRequestId === this.focusRequestSequence) {
        await this.centerOn(registeredMolecule, options.selection);
      }
      return registeredMolecule;
    } catch (error) {
      await this.removeObjectNow(registeredMolecule);
      throw error;
    }
  }

  async loadComplex(target, options = {}) {
    return this.loadProteinLigandComposite(target, options, {
      source: target.prot_url,
      fallbackType: 'contact',
      fallbackParameters: {
        color: target.colour,
        visible: true,
        masterModelIndex: 0,
        weakHydrogenBond: true,
        maxHbondDonPlaneAngle: 35,
        sele: '/0 or /1'
      },
      centerSelection: '/*/*/(LIG)/*'
    });
  }

  async loadProteinLigandComposite(
    target,
    options = {},
    { source = target.prot_url, fallbackType = 'line', fallbackParameters = {}, linewidth, centerSelection } = {}
  ) {
    this.assertActive();
    const name = options.object_name || target.name;
    const focusRequestId = options.center === true ? ++this.focusRequestSequence : null;
    return this.runObjectOperation(name, () =>
      this.loadProteinLigandCompositeNow(
        target,
        options,
        { source, fallbackType, fallbackParameters, linewidth, centerSelection },
        name,
        focusRequestId
      )
    );
  }

  async loadProteinLigandCompositeNow(
    target,
    options,
    { source, fallbackType, fallbackParameters, linewidth, centerSelection },
    name,
    focusRequestId
  ) {
    const existingObject = this.getObject(name);
    if (existingObject) await this.removeObjectNow(existingObject);

    const protein = await this.createNativeMolecule(source, name);
    let ligand;
    try {
      ligand = await this.createNativeMolecule(target.sdf_info, `${name}-ligand`, { fromString: true });
      // Preserve the protein/SDF topology and model separation used by the old
      // contact detector. Only plain coordinates go to the computation worker.
      const pdb = await protein.getAtoms('pdb');
      await protein.mergeMolecules([ligand], false, false);
      const sdf = typeof target.sdf_info === 'string' ? target.sdf_info : await target.sdf_info.text();
      this.contactInputs.set(protein, { pdb, sdf });
      await ligand.delete();
      this.contactInputs.delete(ligand);
      ligand = null;
    } catch (error) {
      await Promise.allSettled([protein.delete(), ligand?.delete()]);
      throw error;
    }
    protein.name = name;
    this.store.dispatch(addMolecule(protein));
    this.store.dispatch(showMolecule(protein));
    this.registerObject(protein, name);

    try {
      const definitions =
        options.representations?.length > 0
          ? options.representations
          : [
              getRepresentationDefinition(null, fallbackType, {
                color: target.colour,
                visible: true,
                ...fallbackParameters,
                ...(linewidth == null ? {} : { sele: '/0', linewidth })
              })
            ];
      const handles = [];
      for (const definition of definitions) {
        const representation = getRepresentationDefinition(definition, fallbackType, {
          color: target.colour,
          ...fallbackParameters
        });
        const handle = this.createRepresentationHandle(
          protein,
          null,
          representation.type,
          representation.params,
          representation.lastKnownID
        );
        handles.push(handle);
        this.representationsByObject.set(protein, handles);
        await this.initialiseMoleculeRepresentation(protein, handle);
      }

      if (focusRequestId === this.focusRequestSequence) await this.centerOn(protein, centerSelection);
      return protein;
    } catch (error) {
      await this.removeObjectNow(protein);
      throw error;
    }
  }

  async loadMap(source, options = {}) {
    this.assertActive();
    if (!source) {
      throw new Error('Moorhen map source is required');
    }

    const name = getObjectName(source, options, `map-${this.objectsByName.size + 1}`);
    return this.runObjectOperation(name, () => this.loadMapNow(source, options, name));
  }

  async loadMapNow(source, options, name) {
    const existingObject = this.getObject(name);
    if (existingObject) {
      await this.removeObjectNow(existingObject);
    }
    const map = new MoorhenMap(this.commandCentre, this.glRef, this.store);
    const ext = (options.ext || '').toLowerCase();
    const isMtz = ext === 'mtz' || options.selectedColumns;
    let metadata = null;

    if (isMtz && isFileLike(source) && (!options.selectedColumns || options.autoRead === true)) {
      const maps = await MoorhenMap.autoReadMtz(source, this.commandCentre, this.glRef, this.store);
      if (!maps.length) {
        throw new Error(`Moorhen failed to auto-read map ${name}`);
      }
      try {
        for (const [index, loadedMap] of maps.entries()) {
          this.prepareMapRendering(loadedMap);
          this.store.dispatch(addMap(loadedMap));
          this.store.dispatch(showMap(loadedMap));
          if (index === 0) this.store.dispatch(setActiveMap(loadedMap));
          const mapName = loadedMap.name || `${name}-${index}`;
          const handle = this.createRepresentationHandle(
            loadedMap,
            null,
            'surface',
            options.parameters || {},
            options.lastKnownID
          );
          this.registerObject(loadedMap, mapName, [handle]);
          this.applyMapRepresentationParameters(handle, handle.params);
        }
        await Promise.all(maps.flatMap(loadedMap => this.getRepresentations(loadedMap).map(handle => handle.ready)));
        return maps[0];
      } catch (error) {
        await Promise.allSettled(maps.map(loadedMap => this.removeObjectNow(loadedMap)));
        throw error;
      }
    } else if (!isMtz) {
      let data;
      if (isUrl(source)) {
        const response = await fetch(source, { credentials: 'same-origin', ...options.fetchOptions });
        if (!response.ok) throw new Error(`Unable to load density map from ${source} (${response.status})`);
        data = new Uint8Array(await response.arrayBuffer());
      } else {
        const buffer = typeof source.arrayBuffer === 'function' ? await source.arrayBuffer() : source;
        data = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
      }
      if (options.decompress || (data[0] === 31 && data[1] === 139)) {
        data = new Uint8Array(
          await new Response(
            new Blob([data]).stream().pipeThrough(new window.DecompressionStream('gzip'))
          ).arrayBuffer()
        );
      }
      metadata = readCcp4MapMetadata(data);
      if (metadata) {
        // Keep the exact fractional ORIGIN for the contour mesh. Integer grid
        // starts cannot represent it without moving or resampling the density.
        data = new Uint8Array(data);
        const header = new DataView(data.buffer);
        [49, 50, 51].forEach(word => header.setFloat32(word * 4, 0, metadata.littleEndian));
      }
      await map.loadToCootFromMapData(data, name, options.isDifference === true);
    } else if (isUrl(source)) {
      await map.loadToCootFromMtzURL(source, name, options.selectedColumns, options.fetchOptions);
    } else if (isFileLike(source)) {
      await map.loadToCootFromMtzFile(source, options.selectedColumns);
    } else {
      const sourceData = source && typeof source.arrayBuffer === 'function' ? await source.arrayBuffer() : source;
      const data = sourceData instanceof ArrayBuffer ? new Uint8Array(sourceData) : sourceData;
      await map.loadToCootFromMtzData(data, name, options.selectedColumns);
    }

    if (map.molNo == null || map.molNo === -1) {
      throw new Error(`Moorhen failed to load map ${name}`);
    }

    this.prepareMapRendering(map, metadata);
    this.store.dispatch(addMap(map));
    this.store.dispatch(showMap(map));
    this.store.dispatch(setActiveMap(map));
    const handle = this.createRepresentationHandle(map, null, 'surface', options.parameters || {}, options.lastKnownID);
    const registeredMap = this.registerObject(map, name, [handle]);
    try {
      this.applyMapRepresentationParameters(handle, handle.params);
      await handle.ready;
      return registeredMap;
    } catch (error) {
      await this.removeObjectNow(map);
      throw error;
    }
  }

  prepareMapRendering(map, metadata = null) {
    // The native manager otherwise replaces application settings on mount with
    // EM-map suggestions (including a small radius around an unrelated peak).
    map.showOnLoad = false;
    map.isOriginLocked = false;
    if (metadata) map.mapCentre = metadata.centre.map((value, axis) => -value - metadata.origin[axis]);
    const rendering = { metadata, pending: Promise.resolve(), disposing: false, visible: true };
    this.mapRendering.set(map, rendering);
    const contour = map.doCootContour.bind(map);
    const setupBuffers = map.setupContourBuffers.bind(map);
    const hideContour = map.hideMapContour.bind(map);
    // Moorhen 0.22.7 updates its buffer store without repainting the canvas.
    // Draw after each buffer change so maps appear/disappear without a mouse move.
    map.hideMapContour = (...args) => {
      hideContour(...args);
      this.glRef.current?.drawScene?.();
    };
    map.setupContourBuffers = (objects, ...args) => {
      if (!rendering.disposing && rendering.visible) {
        setupBuffers(
          objects.map(mesh => transformCcp4MapMesh(mesh, metadata)),
          ...args
        );
        this.glRef.current?.drawScene?.();
      }
    };
    // Native managers can schedule redraws during edits and camera movement.
    // Serialize them and drain them before deletion, including delayed callbacks.
    map.doCootContour = (x, y, z, radius, level, style) => {
      if (rendering.disposing || !rendering.visible) return Promise.resolve();
      rendering.pending = rendering.pending
        .catch(() => undefined)
        .then(async () => {
          if (rendering.disposing || !rendering.visible) return;
          const parameters = this.getRepresentations(map)[0]?.params || {};
          const wholeMap = metadata && Number(parameters.boxSize) === 0;
          const centre = wholeMap
            ? metadata.centre
            : [x, y, z].map((value, axis) => value - (metadata?.origin[axis] || 0));
          const requestedRadius = Number(parameters.boxSize ?? parameters.radius);
          const nativeRadius = wholeMap ? metadata.radius + 0.001 : requestedRadius > 0 ? requestedRadius : radius;
          const nativeLevel = parameters.isolevel == null ? level : getAbsoluteMapContour(parameters, metadata, map);
          const nativeStyle =
            parameters.contour == null && parameters.wireframe == null
              ? style
              : (parameters.contour ?? parameters.wireframe) === false
              ? 'solid'
              : 'lines';
          await contour(...centre, nativeRadius, nativeLevel, nativeStyle);
        });
      return rendering.pending;
    };
  }

  configureContactRepresentation(representation, handle, enabled = this.useNglStyleInteractions) {
    if (!this.nativeContactBufferBuilders.has(representation)) {
      this.nativeContactBufferBuilders.set(representation, representation.getHBondBuffers);
    }
    if (!enabled) {
      representation.getHBondBuffers = this.nativeContactBufferBuilders.get(representation);
      return;
    }

    representation.getHBondBuffers = async () => {
      const molecule = handle.parentObject;
      let input = this.contactInputs.get(molecule);
      if (!input?.pdb && !input?.sdf) {
        input = { ...input, pdb: await molecule.getAtoms('pdb') };
        this.contactInputs.set(molecule, input);
      }
      const contacts = await this.contactWorker.calculate({ ...input, parameters: { ...handle.params } });
      return this.createContactBuffers(representation, contacts);
    };
  }

  setNglStyleInteractions(enabled) {
    this.assertActive();
    this.pendingInteractionStyleChanges++;
    const change = this.interactionStyleChange
      .catch(() => undefined)
      .then(async () => {
        this.assertActive();
        const previous = this.useNglStyleInteractions;
        const next = Boolean(enabled);
        if (previous === next) return next;
        this.useNglStyleInteractions = next;
        try {
          await this.refreshContactRepresentations(next);
          return next;
        } catch (error) {
          this.useNglStyleInteractions = previous;
          try {
            await this.refreshContactRepresentations(previous);
          } catch (rollbackError) {
            console.error('Unable to restore all interaction representations', rollbackError);
          }
          throw error;
        }
      })
      .finally(() => {
        this.pendingInteractionStyleChanges--;
      });
    this.interactionStyleChange = change;
    return change;
  }

  async refreshContactRepresentations(enabled) {
    const handles = new Set(Array.from(this.objectsByName.values()).flatMap(object => this.getRepresentations(object)));
    const updates = Array.from(handles)
      .filter(handle => handle.type === 'contact')
      .map(handle => {
        // Chain onto readiness so edits and deletion also wait for this redraw.
        // A failed redraw can be retried using its still-owned native object.
        handle.ready = Promise.resolve(handle.ready)
          .catch(() => handle.nativeRepresentation)
          .then(async representation => {
            const molecule = handle.parentObject;
            if (
              this.destroyed ||
              this.objectRemovals.has(molecule) ||
              !this.getRepresentations(molecule).includes(handle) ||
              !representation ||
              handle.nativeRepresentation !== representation
            ) {
              return representation;
            }
            this.configureContactRepresentation(representation, handle, enabled);
            if (handle.params.visible === false || representation.visible === false) {
              // Hidden buffers must not reappear in the old style on the next show.
              representation.deleteBuffers();
              representation.hide();
            } else {
              // Native redraw computes new geometry before replacing the old buffers.
              await representation.redraw();
              if (handle.params.visible === false || representation.visible === false) representation.hide();
            }
            this.glRef.current?.drawScene?.();
            return representation;
          });
        return handle.ready;
      });
    const results = await Promise.allSettled(updates);
    const failure = results.find(result => result.status === 'rejected');
    if (failure) throw failure.reason;
  }

  createContactBuffers(representation, contacts) {
    const groups = new Map();
    contacts.types.forEach((type, index) => {
      const start = Array.from(contacts.position1.slice(index * 3, index * 3 + 3));
      const end = Array.from(contacts.position2.slice(index * 3, index * 3 + 3));
      const distance = Math.hypot(...end.map((value, axis) => value - start[axis]));
      if (!Number.isFinite(distance) || distance < 1e-6) return;
      if (!groups.has(type))
        groups.set(type, {
          pairs: [],
          dimensions: [],
          colour: [...contacts.color.slice(index * 3, index * 3 + 3), 1]
        });
      const group = groups.get(type);
      // Native hydrogen-bond geometry filters distances to 1.9–4 Å. Build its
      // dashed template at 3 Å, then set the true length/radius for each contact
      // so longer ionic/aromatic contacts keep their calculated endpoints.
      const templateEnd = end.map((value, axis) => start[axis] + ((value - start[axis]) * 3) / distance);
      group.pairs.push([
        { x: start[0], y: start[1], z: start[2], serial: 2 * index },
        { x: templateEnd[0], y: templateEnd[1], z: templateEnd[2], serial: 2 * index + 1 }
      ]);
      group.dimensions.push([contacts.radius[index], contacts.radius[index], distance]);
    });
    return Array.from(groups.values(), ({ pairs, dimensions, colour }) => {
      const [mesh] = representation.getGemmiAtomPairsBuffers(pairs, colour, false);
      mesh.instance_sizes[0][0] = dimensions.flat();
      return mesh;
    });
  }

  configureMoleculeRepresentationParameters(nativeRepresentation, parameters = {}) {
    const opacity = Number(parameters.opacity);
    if (Number.isFinite(opacity) && typeof nativeRepresentation.setNonCustomOpacity === 'function') {
      nativeRepresentation.setNonCustomOpacity(Math.max(0, Math.min(1, opacity)));
    }

    const colourValue = parameters.colorValue ?? parameters.color;
    if (colourValue != null && typeof nativeRepresentation.addColourRule === 'function') {
      const colour = normaliseMoorhenColour(colourValue, '#ffffff');
      const cid = nglSelectionToMoorhenCid(parameters.sele);
      // Moorhen's setColourRules([]) restores defaults instead of clearing them.
      // Detach the rules before adding ours so other representations keep theirs.
      nativeRepresentation.colourRules = [];
      nativeRepresentation.setUseDefaultColourRules?.(false);
      nativeRepresentation.addColourRule(
        'chain',
        cid,
        colour.hex,
        [cid, colour.hex],
        false,
        parameters.colorScheme !== 'element'
      );
    }

    const width = Number(parameters.radiusSize ?? parameters.radius ?? parameters.bondRadius);
    const lineWidth = Number(parameters.linewidth);
    if (
      (Number.isFinite(width) || Number.isFinite(lineWidth)) &&
      typeof nativeRepresentation.setBondOptions === 'function'
    ) {
      nativeRepresentation.setBondOptions({
        ...(nativeRepresentation.bondOptions || {}),
        width: Number.isFinite(width) ? width : Math.max(0.02, lineWidth * 0.05)
      });
    }

    if (typeof nativeRepresentation.setM2tParams === 'function') {
      const m2tParams = { ...(nativeRepresentation.m2tParams || {}) };
      let m2tChanged = false;
      const sphereRadius = Number(parameters.sphereRadius);
      const radiusMultiplier = Number(parameters.radiusScale ?? parameters.scale);
      const probeRadius = Number(parameters.probeRadius);
      if (Number.isFinite(sphereRadius)) {
        m2tParams.ballsStyleRadiusMultiplier = Math.max(0.01, sphereRadius / 1.7);
        m2tChanged = true;
      } else if (Number.isFinite(radiusMultiplier)) {
        m2tParams.ballsStyleRadiusMultiplier = Math.max(0.01, radiusMultiplier);
        m2tChanged = true;
      }
      if (Number.isFinite(probeRadius)) {
        m2tParams.surfaceStyleProbeRadius = Math.max(0.01, probeRadius);
        m2tChanged = true;
      }
      if (m2tChanged) nativeRepresentation.setM2tParams(m2tParams);
    }
  }

  async applyMoleculeRepresentationParameters(handle, parameters = {}) {
    const nativeRepresentation = handle.nativeRepresentation || (await handle.ready);
    if (!nativeRepresentation) return handle;

    this.configureMoleculeRepresentationParameters(nativeRepresentation, parameters);
    if (
      (parameters.colorValue ?? parameters.color) != null &&
      typeof nativeRepresentation.applyColourRules === 'function'
    ) {
      await nativeRepresentation.applyColourRules();
    }

    if (parameters.visible === false) {
      nativeRepresentation.hide?.();
    } else {
      await nativeRepresentation.show?.();
    }

    if (typeof nativeRepresentation.redraw === 'function') {
      await nativeRepresentation.redraw();
    }
    handle.visible = parameters.visible !== false;
    return handle;
  }

  applyMapRepresentationParameters(handle, parameters = {}) {
    const map = handle.parentObject;
    const molNo = map.molNo;
    const metadata = this.mapRendering.get(map)?.metadata;
    const contourLevel = getAbsoluteMapContour(parameters, metadata, map);
    const requestedRadius = Number(parameters.boxSize ?? parameters.radius);
    const radius =
      metadata && requestedRadius === 0
        ? metadata.radius + 0.001
        : requestedRadius > 0
        ? requestedRadius
        : map.suggestedRadius || 15;
    const alpha = Number(parameters.opacity);

    if (Number.isFinite(contourLevel)) {
      this.store.dispatch(setContourLevel({ molNo, contourLevel }));
    }
    if (Number.isFinite(radius) && radius > 0) {
      this.store.dispatch(setMapRadius({ molNo, radius }));
    }
    if (Number.isFinite(alpha)) {
      this.store.dispatch(setMapAlpha({ molNo, alpha: Math.max(0, Math.min(1, alpha)) }));
    }
    if (parameters.contour != null || parameters.wireframe != null) {
      const lines = parameters.contour ?? parameters.wireframe;
      this.store.dispatch(setMapStyle({ molNo, style: lines === false ? 'solid' : 'lines' }));
    }

    const colourValue = parameters.colorValue ?? parameters.color;
    if (colourValue != null) {
      const colour = normaliseMoorhenColour(colourValue, '#0000ff').rgb;
      this.store.dispatch(
        (map.isDifference || parameters.negativeColor != null ? setPositiveMapColours : setMapColours)({
          molNo,
          rgb: colour
        })
      );
    }
    if (parameters.negativeColor != null) {
      const colour = normaliseMoorhenColour(parameters.negativeColor, '#ff6347').rgb;
      this.store.dispatch(setNegativeMapColours({ molNo, rgb: colour }));
    }

    const visible = parameters.visible !== false && alpha !== 0;
    const rendering = this.mapRendering.get(map);
    if (rendering) rendering.visible = visible;
    this.store.dispatch(visible ? showMap(map) : hideMap(map));
    handle.visible = visible;
    if (visible) {
      const origin = this.store.getState().glRef.origin || [0, 0, 0];
      const style = (parameters.contour ?? parameters.wireframe) === false ? 'solid' : 'lines';
      handle.ready = map.doCootContour(...origin.map(value => -value), radius, contourLevel, style);
    }
    return handle;
  }

  async loadSurface(source, options = {}) {
    if (source?.type === 'molecule') {
      const representation = this.createRepresentation(source, 'surface', options.parameters || options);
      await representation.ready;
      return source;
    }
    return this.loadMolecule(source, { ...options, representation: 'surface' });
  }

  loadVector(vector, options = {}) {
    this.assertActive();
    if (!vector?.uniqueId) throw new Error('Moorhen vector requires a uniqueId');

    const name = options.name || vector.labelText || vector.uniqueId;
    const existingObject = this.getObject(name);
    if (existingObject?.type === 'vector') {
      this.store.dispatch(removeVector(existingObject.vector));
      this.objectsByName.delete(name);
      this.representationsByObject.delete(existingObject);
    }

    const object = {
      type: 'vector',
      name,
      uniqueId: vector.uniqueId,
      vector,
      visible: true
    };
    const handle = this.createRepresentationHandle(object, vector, 'buffer', options.parameters || {});
    this.store.dispatch(addVector(vector));
    return this.registerObject(object, name, [handle]);
  }

  async addSphere({ name, center, color, radius, representation = 'spacefill', representationParameters = {} }) {
    const molecule = await this.loadMolecule(createSpherePdb(center), {
      name,
      fromString: true,
      representation,
      representations: [
        {
          type: representation,
          params: {
            ...representationParameters,
            sphereRadius: Number(radius),
            colorValue: normaliseMoorhenColour(color, '#00ff00').integer
          }
        }
      ],
      color,
      center: false
    });
    molecule.shapeType = 'sphere';
    return molecule;
  }

  setRepresentation(component, representation, parameters = {}) {
    return this.createRepresentation(component, representation, parameters);
  }

  async setVisibility(renderable, visible) {
    const representation = renderable?.parentObject ? renderable : null;
    const object = representation?.parentObject || renderable;

    if (object?.type === 'map') {
      const rendering = this.mapRendering.get(object);
      if (rendering) rendering.visible = visible;
      this.store.dispatch(visible ? showMap(object) : hideMap(object));
    } else if (object?.type === 'molecule') {
      if (representation) {
        const nativeRepresentation = representation.nativeRepresentation || (await representation.ready);
        await (visible ? nativeRepresentation?.show?.() : nativeRepresentation?.hide?.());
      } else if (visible) {
        await Promise.all((object.representations || []).map(item => item.show()));
        this.store.dispatch(showMolecule(object));
      } else {
        (object.representations || []).forEach(item => item.hide());
        this.store.dispatch(hideMolecule(object));
      }
    } else if (object?.type === 'vector') {
      this.store.dispatch(visible ? addVector(object.vector) : removeVector(object.vector));
      object.visible = visible;
    }

    if (representation) {
      representation.visible = visible;
      representation.params.visible = visible;
      representation.parameters.visible = visible;
    }
    return visible;
  }

  getVisibility(renderable) {
    if (renderable?.parentObject) {
      return renderable.visible !== false;
    }
    if (renderable?.type === 'map') {
      return this.store.getState().mapContourSettings.visibleMaps.includes(renderable.molNo);
    }
    if (renderable?.type === 'molecule') {
      return typeof renderable.isVisible === 'function'
        ? renderable.isVisible()
        : this.store.getState().molecules.visibleMolecules.includes(renderable.molNo);
    }
    if (renderable?.type === 'vector') return renderable.visible !== false;
    return false;
  }

  createRepresentation(component, type, parameters = {}, lastKnownID) {
    const handle = this.createRepresentationHandle(component, null, type, parameters, lastKnownID);
    this.representationsByObject.set(component, [...this.getRepresentations(component), handle]);
    if (component?.type === 'molecule') {
      handle.ready = this.initialiseMoleculeRepresentation(component, handle).catch(error => {
        handle.error = error;
        this.representationsByObject.set(
          component,
          this.getRepresentations(component).filter(representation => representation !== handle)
        );
        throw error;
      });
    } else if (component?.type === 'map') {
      this.applyMapRepresentationParameters(handle, handle.params);
    }
    return handle;
  }

  getRepresentation(component, representation) {
    const found = this.getRepresentations(component).find(
      item => item.uuid === representation?.uuid || item.uuid === representation?.lastKnownID
    );
    if (found) return found;
    for (const object of this.objectsByName.values()) {
      const match = this.getRepresentations(object).find(
        item => item.uuid === representation?.uuid || item.uuid === representation?.lastKnownID
      );
      if (match) return match;
    }
    return undefined;
  }

  getRepresentations(component) {
    return this.representationsByObject.get(component) || [];
  }

  getRepresentationsByType(components, type) {
    return (components || []).flatMap(component =>
      this.getRepresentations(component).filter(representation => representation.type === type)
    );
  }

  getRepresentationCount(component) {
    return this.getRepresentations(component).length;
  }

  getRepresentationParameter(representation, key) {
    return representation?.parameters?.[key] ?? representation?.params?.[key];
  }

  setRepresentationParameters(representation, parameters) {
    const normalizedParameters = { ...parameters };
    if (parameters.color != null && parameters.colorValue == null) {
      normalizedParameters.colorValue = normaliseMoorhenColour(parameters.color, '#ffffff').integer;
    }
    const previousSelection = representation.params?.sele;
    representation.params = { ...representation.params, ...normalizedParameters };
    representation.parameters = { ...representation.parameters, ...normalizedParameters };
    if (representation.parentObject?.type === 'map') {
      this.applyMapRepresentationParameters(representation, representation.params);
    } else if (representation.parentObject?.type === 'molecule') {
      if (parameters.sele != null && parameters.sele !== previousSelection) {
        representation.nativeRepresentation?.deleteBuffers?.();
        representation.nativeRepresentation = null;
        representation.ready = this.initialiseMoleculeRepresentation(representation.parentObject, representation).catch(
          error => {
            representation.error = error;
            throw error;
          }
        );
      } else {
        representation.ready = Promise.resolve(representation.ready)
          .then(() => this.applyMoleculeRepresentationParameters(representation, representation.params))
          .then(() => representation.nativeRepresentation)
          .catch(error => {
            representation.error = error;
            throw error;
          });
      }
    }
    return representation;
  }

  removeRepresentation(component, representation) {
    const parentObject = representation.parentObject || component;
    if (parentObject?.type === 'map') {
      this.store.dispatch(hideMap(parentObject));
    } else {
      Promise.resolve(representation.ready).then(
        nativeRepresentation => nativeRepresentation?.deleteBuffers?.(),
        () => undefined
      );
    }
    for (const object of new Set([...this.objectsByName.values(), component, parentObject])) {
      if (!object) continue;
      this.representationsByObject.set(
        object,
        this.getRepresentations(object).filter(item => item !== representation)
      );
    }
  }

  getObject(name) {
    return this.objectsByName.get(name);
  }

  getObjects(name) {
    const object = this.getObject(name);
    return object ? [object] : [];
  }

  getObjectsByNameSuffix(suffix) {
    return Array.from(this.objectsByName.entries())
      .filter(([name]) => name.endsWith(suffix))
      .map(([, object]) => object);
  }

  async getFittedMoleculeZoom(component, selection) {
    if (selection !== '/*/*/*/*' && selection !== '//') return MOORHEN_SELECTION_ZOOM;

    let moleculeDiameter = Number(component.moleculeDiameter);
    if (!Number.isFinite(moleculeDiameter) && typeof component.getMoleculeDiameter === 'function') {
      moleculeDiameter = Number(await component.getMoleculeDiameter());
      component.moleculeDiameter = moleculeDiameter;
    }
    return Number.isFinite(moleculeDiameter) ? moleculeDiameter / MOORHEN_FULL_MOLECULE_ZOOM_DIVISOR : null;
  }

  async centerOn(component, selection) {
    if (component?.type === 'map') {
      await component.centreOnMap();
      return;
    }
    if (component?.type === 'molecule') {
      const selectionCid = selection || '/*/*/*/*';
      const centerZoomScale = this.centerZoomScaleByObject.get(component);
      await component.centreOn(selectionCid, false, !centerZoomScale);
      if (centerZoomScale) {
        const fittedZoom = await this.getFittedMoleculeZoom(component, selectionCid);
        if (!Number.isFinite(fittedZoom)) return;
        this.store.dispatch(setZoom(fittedZoom * centerZoomScale));
      }
    }
  }

  async centerOnObjects(components = []) {
    const molecules = [...new Set(components.filter(component => component?.type === 'molecule'))];
    if (!molecules.length) return false;
    if (molecules.length === 1) {
      await this.centerOn(molecules[0]);
      return true;
    }

    const atoms = await Promise.all(molecules.map(molecule => molecule.gemmiAtomsForCid('/*/*/*/*')));
    const canvas = this.getRendererElement();
    const orientation = getMoorhenLigandFocus(atoms, this.getOrientation().quat4, canvas?.width / canvas?.height);
    if (!orientation) return false;
    this.setOrientation(orientation);
    return true;
  }

  setOrientation(orientation) {
    this.orientationAnimation?.finish('cancelled');
    const { origin, quat4, zoom } = normaliseMoorhenOrientation(orientation);

    if (origin) this.store.dispatch(setOrigin(origin));
    if (quat4) this.store.dispatch(setQuat(quat4));
    if (zoom != null) this.store.dispatch(setZoom(zoom));
  }

  getOrientation() {
    const glState = this.store.getState().glRef;
    const movingRenderer = this.orientationAnimation && this.glRef.current;
    const orientation = {
      origin: Array.from(movingRenderer?.origin || glState.origin || [0, 0, 0]),
      quat4: Array.from(movingRenderer?.myQuat || glState.quat || [0, 0, 0, -1]),
      zoom: movingRenderer?.zoom ?? glState.zoom
    };
    return { ...orientation, elements: [...orientation.quat4, ...orientation.origin, orientation.zoom] };
  }

  installCameraAnimationGuard() {
    const renderer = this.glRef.current;
    if (!renderer?.setOriginOrientationAndZoomAnimated || this.cameraAnimationGuard?.renderer === renderer) return;
    const animate = renderer.setOriginOrientationAndZoomAnimated;
    const frame = renderer.setOriginOrientationAndZoomFrame;
    // Moorhen does not retain a cancellable RAF id. Capture a generation in
    // each native run, so its already scheduled callbacks can become no-ops.
    renderer.setOriginOrientationAndZoomAnimated = (...args) => {
      if (this.destroyed || this.orientationAnimation || renderer.animating) return;
      const sequence = ++this.nativeCameraSequence;
      renderer.setOriginOrientationAndZoomFrame = (...frameArgs) => {
        if (this.destroyed || sequence !== this.nativeCameraSequence) return;
        return frame.apply(renderer, frameArgs);
      };
      return animate.apply(renderer, args);
    };
    this.cameraAnimationGuard = { renderer, animate, frame };
  }

  getRenderedOrientation() {
    const renderer = this.glRef.current;
    const stored = this.getOrientation();
    return {
      origin: Array.from(renderer?.origin || stored.origin),
      quat4: Array.from(renderer?.myQuat || stored.quat4),
      zoom: renderer?.zoom ?? stored.zoom
    };
  }

  animateOrientation(orientation, duration = 400, { signal } = {}) {
    this.orientationAnimation?.finish('cancelled');
    if (this.destroyed) return Promise.resolve({ status: 'destroyed' });
    if (signal?.aborted) return Promise.resolve({ status: 'cancelled' });
    this.installCameraAnimationGuard();
    const renderer = this.glRef.current;
    const start = this.getRenderedOrientation();
    const normalized = normaliseMoorhenOrientation(orientation);
    const destination = {
      origin: normalized.origin || start.origin,
      quat4: normalized.quat4 || start.quat4,
      // Legacy NGL matrices intentionally retain the fitted Moorhen zoom.
      zoom: normalized.zoom ?? start.zoom
    };
    const finalQuaternion = interpolateMoorhenQuaternion(start.quat4, destination.quat4, 1);
    const unchanged =
      start.origin.every((value, index) => Math.abs(value - destination.origin[index]) < 1e-6) &&
      start.quat4.every((value, index) => Math.abs(value - finalQuaternion[index]) < 1e-6) &&
      Math.abs(start.zoom - destination.zoom) < 1e-6;
    const animationDuration = unchanged ? 0 : duration;
    ++this.nativeCameraSequence;
    renderer.animating = true;
    const canvas = this.getRendererElement();

    return new Promise((resolve, reject) => {
      let frameId;
      let startTime;
      let finished = false;
      const interrupt = () => finish('interrupted');
      const abort = () => finish('cancelled');
      const finish = (status, error) => {
        if (finished) return;
        finished = true;
        cancelAnimationFrame(frameId);
        signal?.removeEventListener('abort', abort);
        ['pointerdown', 'wheel', 'keydown'].forEach(event => canvas?.removeEventListener(event, interrupt, true));
        try {
          if (status !== 'destroyed') {
            const actual = this.getRenderedOrientation();
            // Publish only once, after drawing, with detached arrays. In
            // particular, never put the mutable renderer quaternion in Redux.
            this.store.dispatch(setOrigin(actual.origin));
            this.store.dispatch(setQuat(actual.quat4));
            this.store.dispatch(setZoom(actual.zoom));
          }
          // Keep the native animator blocked until all three store values
          // match the displayed camera, even with synchronous subscribers.
          this.orientationAnimation = null;
          renderer.animating = false;
          if (status !== 'destroyed') {
            if (renderer.handleOriginUpdated) renderer.handleOriginUpdated(true);
            else this.orientationHandlers.forEach(({ wrappedHandler }) => wrappedHandler());
            // Moorhen uses this event to update zoom-dependent clipping/fog.
            if (typeof document !== 'undefined') {
              document.dispatchEvent(
                new CustomEvent('zoomChanged', { detail: { oldZoom: start.zoom, newZoom: renderer.zoom } })
              );
            }
          }
          if (error) reject(error);
          else resolve({ status });
        } catch (finishError) {
          this.orientationAnimation = null;
          renderer.animating = false;
          reject(error || finishError);
        }
      };
      const frame = timestamp => {
        if (finished) return;
        try {
          if (startTime == null) startTime = timestamp;
          const progress = animationDuration > 0 ? Math.min(1, (timestamp - startTime) / animationDuration) : 1;
          const eased = progress * progress * (3 - 2 * progress);
          renderer.origin = start.origin.map((value, index) => value + (destination.origin[index] - value) * eased);
          renderer.myQuat = new Float32Array(interpolateMoorhenQuaternion(start.quat4, destination.quat4, eased));
          renderer.zoom = start.zoom + (destination.zoom - start.zoom) * eased;
          renderer.drawScene();
          if (progress === 1) finish('completed');
          else frameId = requestAnimationFrame(frame);
        } catch (error) {
          finish('failed', error);
        }
      };
      this.orientationAnimation = { finish };
      signal?.addEventListener('abort', abort);
      ['pointerdown', 'wheel', 'keydown'].forEach(event => canvas?.addEventListener(event, interrupt, true));
      frameId = requestAnimationFrame(frame);
    });
  }

  // Only used before Preview reveals its first scene. MoorhenWebMG animates
  // store camera updates asynchronously, after the load promises have resolved.
  prepareInitialView() {
    const renderer = this.glRef.current;
    if (this.destroyed || !renderer || renderer.animating || this.objectOperations.size > 0 || this.getTaskCount() > 0) {
      return false;
    }

    const { origin, quat4, zoom } = this.getOrientation();
    const matches = (actual, expected) =>
      actual?.length === expected.length && expected.every((value, index) => Math.abs(actual[index] - value) < 1e-5);
    if (matches(renderer.origin, origin) && matches(renderer.myQuat, quat4) && Math.abs(renderer.zoom - zoom) < 1e-5) {
      return true;
    }

    // A new camera request can arrive during an earlier native animation, which
    // Moorhen ignores while animating. Apply the latest destination before reveal.
    renderer.setZoom(zoom, false);
    renderer.setOrigin(origin, false, false);
    renderer.setQuat(quat4);
    return false;
  }

  setParameters(parameters = {}) {
    if (parameters.backgroundColor != null) {
      const { rgb } = normaliseMoorhenColour(parameters.backgroundColor, '#000000');
      this.store.dispatch(setBackgroundColor([rgb.r / 255, rgb.g / 255, rgb.b / 255, 1]));
    }
    if (parameters.clipNear != null) this.store.dispatch(setClipStart(Number(parameters.clipNear)));
    if (parameters.clipFar != null) this.store.dispatch(setClipEnd(Number(parameters.clipFar)));
    if (parameters.fogNear != null) this.store.dispatch(setFogStart(Number(parameters.fogNear)));
    if (parameters.fogFar != null) this.store.dispatch(setFogEnd(Number(parameters.fogFar)));
    return parameters;
  }

  resize() {
    const element = this.containerElement?.current || this.containerElement;
    const width = element?.clientWidth;
    const height = element?.clientHeight;
    // A reverse portal may briefly be detached while the layout changes. Keep
    // its last usable size until it is attached to a visible panel again.
    if (!(width > 0 && height > 0) || !this.glRef.current?.resize) return;

    // The native host and 2D overlays read these dimensions from its own store.
    // Resizing only WebGL lets a later native render restore stale dimensions.
    const scene = this.store.getState().sceneSettings;
    if (scene.width !== width) this.store.dispatch(setWidth(width));
    if (scene.height !== height) this.store.dispatch(setHeight(height));
    this.glRef.current.resize(width, height);
    this.glRef.current.drawScene?.();
  }

  getRendererElement() {
    return this.glRef.current?.canvasRef?.current || this.glRef.current?.canvas;
  }

  getTaskCount() {
    return (
      (this.commandCentre.current?.activeMessages?.length || 0) +
      this.contactWorker.pending.size +
      this.pendingInteractionStyleChanges
    );
  }

  onTasksComplete(callback) {
    if (this.getTaskCount() === 0) {
      callback();
      return () => {};
    }
    const interval = setInterval(() => {
      if (this.getTaskCount() !== 0) return;
      clearInterval(interval);
      this.taskCompletionHandlers.delete(interval);
      callback();
    }, 50);
    this.taskCompletionHandlers.add(interval);
    return () => {
      clearInterval(interval);
      this.taskCompletionHandlers.delete(interval);
    };
  }

  normalizePick(event) {
    const atom = event?.detail?.atom;
    const buffer = event?.detail?.buffer;
    if (!atom) return null;
    const component = Array.from(this.objectsByName.values()).find(
      object => object.type === 'molecule' && object.buffersInclude?.(buffer)
    );
    return {
      kind: 'atom',
      position: { x: atom.x, y: atom.y, z: atom.z },
      componentName: component?.name
    };
  }

  addPickHandler(handler) {
    if (this.pickHandlers.has(handler) || typeof document === 'undefined') return;
    const wrappedHandler = event => handler(this, this.normalizePick(event));
    this.pickHandlers.set(handler, wrappedHandler);
    document.addEventListener('atomClicked', wrappedHandler);
  }

  removePickHandler(handler) {
    const wrappedHandler = this.pickHandlers.get(handler);
    if (!wrappedHandler || typeof document === 'undefined') return;
    document.removeEventListener('atomClicked', wrappedHandler);
    this.pickHandlers.delete(handler);
  }

  addOrientationChangeHandler(handler) {
    if (this.orientationHandlers.has(handler)) return;
    const wrappedHandler = () => handler();
    const canvas = this.getRendererElement();
    const documentObject = typeof document === 'undefined' ? null : document;
    this.orientationHandlers.set(handler, { wrappedHandler, canvas });
    documentObject?.addEventListener('originUpdate', wrappedHandler);
    documentObject?.addEventListener('zoomChanged', wrappedHandler);
    canvas?.addEventListener('pointerup', wrappedHandler);
    canvas?.addEventListener('wheel', wrappedHandler);
  }

  removeOrientationChangeHandler(handler) {
    const entry = this.orientationHandlers.get(handler);
    if (!entry) return;
    const documentObject = typeof document === 'undefined' ? null : document;
    documentObject?.removeEventListener('originUpdate', entry.wrappedHandler);
    documentObject?.removeEventListener('zoomChanged', entry.wrappedHandler);
    entry.canvas?.removeEventListener('pointerup', entry.wrappedHandler);
    entry.canvas?.removeEventListener('wheel', entry.wrappedHandler);
    this.orientationHandlers.delete(handler);
  }

  addClickHandler(handler) {
    if (this.clickHandlers.has(handler) || typeof document === 'undefined') return;
    const wrappedHandler = event => handler(this.normalizePick(event));
    this.clickHandlers.set(handler, wrappedHandler);
    document.addEventListener('atomClicked', wrappedHandler);
  }

  removeClickHandler(handler) {
    const wrappedHandler = this.clickHandlers.get(handler);
    if (!wrappedHandler || typeof document === 'undefined') return;
    document.removeEventListener('atomClicked', wrappedHandler);
    this.clickHandlers.delete(handler);
  }

  async removeObject(component) {
    component = await Promise.resolve(component);
    if (!component) return;
    return this.runObjectOperation(component.name, () => this.removeObjectNow(component));
  }

  removeObjects(name) {
    // Resolve the name after earlier loads finish, including loads that have not
    // registered yet. An empty registry at request time does not mean no work.
    return this.runObjectOperation(name, async () => {
      for (const object of this.getObjects(name)) await this.removeObjectNow(object);
    });
  }

  removeObjectNow(component) {
    if (this.objectRemovals.has(component)) return this.objectRemovals.get(component);
    const removal = this.disposeObject(component);
    this.objectRemovals.set(component, removal);
    removal.catch(() => this.objectRemovals.delete(component));
    return removal;
  }

  async disposeObject(component) {
    const mapRendering = this.mapRendering.get(component);
    if (mapRendering) {
      mapRendering.disposing = true;
      this.store.dispatch(hideMap(component));
      await Promise.allSettled([mapRendering.pending]);
    }
    // A late representation redraw can recreate buffers after native delete.
    // Finish pending representation work before deleting the molecule.
    await Promise.allSettled(this.getRepresentations(component).map(handle => handle.ready));
    if (component.linkedObjects) {
      for (const linkedObject of component.linkedObjects) await this.removeObjectNow(linkedObject);
    }
    if (component.type === 'vector') {
      if (component.visible !== false) this.store.dispatch(removeVector(component.vector));
    } else {
      await component.delete?.();
      this.store.dispatch(component.type === 'map' ? removeMap(component) : removeMolecule(component));
      if (component.type === 'map') this.glRef.current?.drawScene?.();
    }
    for (const [name, object] of this.objectsByName.entries()) {
      if (object === component) this.objectsByName.delete(name);
    }
    this.representationsByObject.delete(component);
    this.mapRendering.delete(component);
    this.contactInputs.delete(component);
  }

  async removeAll() {
    await Promise.allSettled([...this.objectOperations.values()]);
    for (const object of Array.from(new Set(this.objectsByName.values()))) {
      await this.removeObject(object);
    }
  }

  async captureImage(options) {
    // Moorhen does not preserve the WebGL drawing buffer. Encode the frame in
    // the same turn as drawing it, before asynchronous DOM cloning can yield.
    this.glRef.current?.drawScene?.();
    const image = this.getRendererElement()?.toDataURL('image/png');
    if (options && typeof options.capture === 'function') {
      return options.capture(image);
    }
    return image;
  }

  async destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.orientationAnimation?.finish('destroyed');
    ++this.nativeCameraSequence;
    if (this.cameraAnimationGuard) {
      const { renderer, animate, frame } = this.cameraAnimationGuard;
      renderer.setOriginOrientationAndZoomAnimated = animate;
      renderer.setOriginOrientationAndZoomFrame = frame;
      this.cameraAnimationGuard = null;
    }
    await this.interactionStyleChange.catch(() => undefined);
    await this.removeAll();
    this.contactWorker.dispose();
    Array.from(this.pickHandlers.keys()).forEach(handler => this.removePickHandler(handler));
    Array.from(this.clickHandlers.keys()).forEach(handler => this.removeClickHandler(handler));
    Array.from(this.orientationHandlers.keys()).forEach(handler => this.removeOrientationChangeHandler(handler));
    this.taskCompletionHandlers.forEach(interval => clearInterval(interval));
    this.taskCompletionHandlers.clear();
    if (this.runtime.viewerAdapter === this) {
      delete this.runtime.viewerAdapter;
    }
  }
}

export default MoorhenViewerAdapter;
