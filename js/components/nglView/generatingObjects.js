import { MOL_REPRESENTATION, OBJECT_TYPE } from './constants';
import * as listTypes from '../listTypes';

export const defaultFocus = 0;

export const createRepresentation = (id, params, comp) => {
  // Is necessary check than params is undefined, because I access directly into NGL view instance and I will gain
  // params of current representation
  const definedParams = params !== undefined ? params : {};
  comp.addRepresentation(id, definedParams);
  return { id, params: definedParams };
};

export const generateProteinObject = data => {
  // Now deal with this target
  const prot_to_load = window.location.protocol + '//' + window.location.host + data.template_protein;
  if (JSON.stringify(prot_to_load) !== JSON.stringify(undefined)) {
    return {
      name: OBJECT_TYPE.PROTEIN + '_' + data.id.toString(),
      prot_url: prot_to_load,
      OBJECT_TYPE: OBJECT_TYPE.PROTEIN,
      nglProtStyle: MOL_REPRESENTATION.cartoon
    };
  }
  return undefined;
};

export const generateMoleculeObject = (data, colourToggle) => ({
  name: OBJECT_TYPE.MOLECULE + '_' + data.id.toString(),
  OBJECT_TYPE: OBJECT_TYPE.MOLECULE,
  colour: colourToggle,
  sdf_info: data.sdf_info
});

export const generateArrowObject = (data, start, end, name, colour) => ({
  name: listTypes.VECTOR + '_' + name,
  OBJECT_TYPE: OBJECT_TYPE.ARROW,
  start: start,
  end: end,
  colour: colour,
  site: data.site
});

export const generateCylinderObject = (data, start, end, name, colour) => ({
  name: listTypes.VECTOR + '_' + name,
  OBJECT_TYPE: OBJECT_TYPE.CYLINDER,
  start: start,
  end: end,
  colour: colour,
  site: data.site
});

export const generateMoleculeId = data => ({
  id: data.id
});

export const generateComplexObject = (data, colourToggle, base_url) => ({
  name: data.protein_code + '_COMP',
  OBJECT_TYPE: OBJECT_TYPE.COMPLEX,
  sdf_info: data.sdf_info,
  colour: colourToggle,
  prot_url: base_url + data.molecule_protein
});
