import { MAP_TYPE } from '../../../reducers/ngl/constants';

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
  isolevel_DENSITY: 'isolevel' + MAP_TYPE.event,
  boxSize_DENSITY: 'boxSize' + MAP_TYPE.event,
  opacity_DENSITY: 'opacity' + MAP_TYPE.event,
  contour_DENSITY: 'contour' + MAP_TYPE.event,
  isolevel_DENSITY_MAP_sigmaa: 'isolevel' + MAP_TYPE.sigmaa,
  boxSize_DENSITY_MAP_sigmaa: 'boxSize' + MAP_TYPE.sigmaa,
  opacity_DENSITY_MAP_sigmaa: 'opacity' + MAP_TYPE.sigmaa,
  contour_DENSITY_MAP_sigmaa: 'contour' + MAP_TYPE.sigmaa,
  isolevel_DENSITY_MAP_diff: 'isolevel' + MAP_TYPE.diff,
  boxSize_DENSITY_MAP_diff: 'boxSize' + MAP_TYPE.diff,
  opacity_DENSITY_MAP_diff: 'opacity' + MAP_TYPE.diff,
  contour_DENSITY_MAP_diff: 'contour' + MAP_TYPE.diff,
  color_DENSITY: 'color' + MAP_TYPE.event,
  color_DENSITY_MAP_sigmaa: 'color' + MAP_TYPE.sigmaa,
  color_DENSITY_MAP_diff: 'color' + MAP_TYPE.diff,
  color_DENSITY_MAP_diff_negate: 'color' + MAP_TYPE.diff + '_negate'
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
  LIGAND: 'LIGAND',
  QUALITY: 'QUALITY'
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

export const COMMON_PARAMS = {
  warningIcon: true
};

export const MOL_REPRESENTATION_BUFFER = 'buffer';

export const NGL_VIEW_DEFAULT_VALUES = {
  [NGL_PARAMS.backgroundColor]: BACKGROUND_COLOR.black,
  [NGL_PARAMS.clipNear]: 45,
  [NGL_PARAMS.clipFar]: 100,
  [NGL_PARAMS.clipDist]: 10,
  [NGL_PARAMS.fogNear]: 47,
  [NGL_PARAMS.fogFar]: 55,
  [NGL_PARAMS.isolevel_DENSITY]: 1,
  [NGL_PARAMS.boxSize_DENSITY]: 0,
  [NGL_PARAMS.opacity_DENSITY]: 1,
  [NGL_PARAMS.contour_DENSITY]: true,
  [NGL_PARAMS.color_DENSITY]: 'orange',
  [NGL_PARAMS.isolevel_DENSITY_MAP_sigmaa]: 1.2,
  [NGL_PARAMS.boxSize_DENSITY_MAP_sigmaa]: 0,
  [NGL_PARAMS.opacity_DENSITY_MAP_sigmaa]: 1,
  [NGL_PARAMS.contour_DENSITY_MAP_sigmaa]: true,
  [NGL_PARAMS.color_DENSITY_MAP_sigmaa]: 'blue',
  [NGL_PARAMS.isolevel_DENSITY_MAP_diff]: 3,
  [NGL_PARAMS.boxSize_DENSITY_MAP_diff]: 0,
  [NGL_PARAMS.opacity_DENSITY_MAP_diff]: 1,
  [NGL_PARAMS.contour_DENSITY_MAP_diff]: true,
  [NGL_PARAMS.color_DENSITY_MAP_diff]: 'lightgreen',
  [NGL_PARAMS.color_DENSITY_MAP_diff_negate]: 'tomato',
  [COMMON_PARAMS.warningIcon]: true
};

export const ELEMENT_COLORS = {
  H: [255, 255, 255],
  HE: [217, 255, 255],
  LI: [204, 128, 255],
  BE: [194, 255, 0],
  B: [255, 181, 181],
  C: [144, 144, 144],
  N: [48, 80, 248],
  O: [255, 13, 13],
  F: [144, 224, 80],
  NE: [179, 227, 245],
  NA: [171, 92, 242],
  MG: [138, 255, 0],
  AL: [191, 166, 166],
  SI: [240, 200, 160],
  P: [255, 128, 0],
  S: [255, 255, 48],
  CL: [31, 240, 31],
  BR: [105, 35, 31],
  ALTERNATIVE: [208, 208, 224]
};

export const DENSITY_MAPS = {
  SIGMAA: '_MAP_sigmaa',
  DIFF: '_MAP_diff'
};
