export const BACKGROUND_COLOR = {
  black: 'black',
  white: 'white'
};

export const NGL_PARAMS = {
  impostor: 'impostor',
  quality: 'quality',
  sampleLevel: 'sampleLevel',
  theme: 'theme',
  overview: 'overview',
  rotateSpeed: 'rotateSpeed',
  zoomSpeed: 'zoomSpeed',
  panSpeed: 'panSpeed',
  cameraFov: 'cameraFov',
  cameraType: 'cameraType',
  lightColor: 'lightColor',
  lightIntensity: 'lightIntensity',
  ambientColor: 'ambientColor',
  ambientIntensity: 'ambientIntensity',
  hoverTimeout: 'hoverTimeout',
  backgroundColor: 'backgroundColor',
  clipNear: 'clipNear',
  clipFar: 'clipFar',
  clipDist: 'clipDist',
  fogNear: 'fogNear',
  fogFar: 'fogFar',
  isolevel: 'isolevel',
  boxSize: 'boxSize',
  opacity: 'opacity',
  contour: 'contour'
};

// warning dont use underscore _ in constants!!!!!!
export const OBJECT_TYPE = {
  SPHERE: 'SPHERE',
  COMPLEX: 'COMPLEX',
  SURFACE: 'SURFACE',
  DENSITY: 'DENSITY',
  PROTEIN: 'PROTEIN',
  HIT_PROTEIN: 'HIT_PROTEIN',
  ARROW: 'ARROW',
  CYLINDER: 'CYLINDER',
  LINE: 'LINE',
  EVENTMAP: 'EVENTMAP',
  HOTSPOT: 'HOTSPOT',
  MOLECULE_GROUP: 'MOLECULE-GROUP',
  LIGAND: 'LIGAND'
};

export const SELECTION_TYPE = {
  HIT_PROTEIN: 'PROTEIN',
  COMPLEX: 'COMPLEX',
  SURFACE: 'SURFACE',
  DENSITY: 'DENSITY',
  LIGAND: 'LIGAND',
  VECTOR: 'VECTOR'
};

export const MOL_REPRESENTATION = {
  axes: 'axes',
  backbone: 'backbone',
  ballPlusStick: 'ball+stick',
  base: 'base',
  cartoon: 'cartoon',
  contact: 'contact',
  distance: 'distance',
  helixorient: 'helixorient',
  hyperball: 'hyperball',
  label: 'label',
  licorice: 'licorice',
  line: 'line',
  point: 'point',
  ribbon: 'ribbon',
  rocket: 'rocket',
  rope: 'rope',
  spacefill: 'spacefill',
  surface: 'surface',
  trace: 'trace',
  tube: 'tube',
  unitcell: 'unitcell',
  validation: 'validation'
};

export const MOL_REPRESENTATION_BUFFER = 'buffer';

export const NGL_VIEW_DEFAULT_VALUES = {
  [NGL_PARAMS.backgroundColor]: BACKGROUND_COLOR.black,
  [NGL_PARAMS.clipNear]: 42,
  [NGL_PARAMS.clipFar]: 100,
  [NGL_PARAMS.clipDist]: 10,
  [NGL_PARAMS.fogNear]: 50,
  [NGL_PARAMS.fogFar]: 62,
  [NGL_PARAMS.isolevel]: 1,
  [NGL_PARAMS.boxSize]: 0,
  [NGL_PARAMS.opacity]: 1,
  [NGL_PARAMS.contour]: false
};
