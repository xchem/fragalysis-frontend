import { MOL_REPRESENTATION, OBJECT_TYPE, SELECTION_TYPE } from './constants';
import * as listTypes from '../../constants/listTypes';

export const defaultFocus = 0;
export const createRepresentationStructure = (type, params, lastKnownID = undefined) => ({ type, params, lastKnownID });

export const createRepresentationsArray = representations =>
  representations && representations.map(r => createRepresentationStructure(r.type, r.params, r.lastKnownID));

export const assignRepresentationToComp = (type, params, comp, lastKnownID = undefined) => {
  const createdRepresentation = comp.addRepresentation(type, params || {});

  return {
    lastKnownID: lastKnownID || createdRepresentation.uuid,
    uuid: createdRepresentation.uuid,
    type,
    params: createdRepresentation.getParameters(),
    templateParams: createdRepresentation.repr.parameters
  };
};

export const assignRepresentationArrayToComp = (representations, comp) =>
  representations.map(rep => assignRepresentationToComp(rep.type, rep.params, comp, rep.lastKnownID));

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

// after Shift + click on compound
export const generateCompoundMolObject = (sdf_info, identifier) => ({
  name: 'CONFLOAD_' + identifier,
  OBJECT_TYPE: OBJECT_TYPE.LIGAND,
  colour: 'cyan',
  sdf_info: sdf_info
});

// Ligand
export const generateMoleculeObject = (data, colourToggle, datasetID) => ({
  name: `${data.protein_code || data.name}_${OBJECT_TYPE.LIGAND}${datasetID ? '_' + datasetID : ''}`,
  OBJECT_TYPE: OBJECT_TYPE.LIGAND,
  colour: colourToggle,
  sdf_info: data.sdf_info,
  moleculeId: data.id,
  selectionType: SELECTION_TYPE.LIGAND
});

// Vector
export const generateArrowObject = (data, start, end, name, colour) => ({
  name: `${listTypes.VECTOR}_${name}`,
  OBJECT_TYPE: OBJECT_TYPE.ARROW,
  start: start,
  end: end,
  colour: colour,
  site: data.site,
  moleculeId: data.id,
  selectionType: SELECTION_TYPE.VECTOR
});

// Vector
export const generateCylinderObject = (data, start, end, name, colour) => ({
  name: `${listTypes.VECTOR}_${name}`,
  OBJECT_TYPE: OBJECT_TYPE.CYLINDER,
  start: start,
  end: end,
  colour: colour,
  site: data.site,
  moleculeId: data.id,
  selectionType: SELECTION_TYPE.VECTOR
});

// Hit Protein
export const generateHitProteinObject = (data, colourToggle, base_url, datasetID) => {
  let prot_url;

  if (data && data.molecule_protein) {
    prot_url = base_url + data.molecule_protein;
  } else if (data.pdb_info) {
    if (location.protocol === 'https:') {
      prot_url = data.pdb_info.replace('http://', 'https://');
    } else {
      prot_url = data.pdb_info;
    }
  }

  return {
    name: `${data.protein_code || data.name}_${OBJECT_TYPE.HIT_PROTEIN}${datasetID ? '_' + datasetID : ''}`,
    OBJECT_TYPE: OBJECT_TYPE.HIT_PROTEIN,
    sdf_info: data.sdf_info,
    colour: colourToggle,
    prot_url,
    moleculeId: data.id,
    selectionType: SELECTION_TYPE.HIT_PROTEIN
  };
};

// Complex
export const generateComplexObject = (data, colourToggle, base_url, datasetID) => {
  let prot_url;

  if (data && data.molecule_protein) {
    prot_url = base_url + data.molecule_protein;
  } else if (data.pdb_info) {
    if (location.protocol === 'https:') {
      prot_url = data.pdb_info.replace('http://', 'https://');
    } else {
      prot_url = data.pdb_info;
    }
  }

  return {
    name: `${data.protein_code || data.name}_${OBJECT_TYPE.COMPLEX}${datasetID ? '_' + datasetID : ''}`,
    OBJECT_TYPE: OBJECT_TYPE.COMPLEX,
    sdf_info: data.sdf_info,
    colour: colourToggle,
    prot_url,
    moleculeId: data.id,
    selectionType: SELECTION_TYPE.COMPLEX
  };
};

// Surface
export const generateSurfaceObject = (data, colourToggle, base_url, datasetID) => {
  let prot_url;

  if (data && data.molecule_protein) {
    prot_url = base_url + data.molecule_protein;
  } else if (data.pdb_info) {
    if (location.protocol === 'https:') {
      prot_url = data.pdb_info.replace('http://', 'https://');
    } else {
      prot_url = data.pdb_info;
    }
  }
  return {
    name: `${data.protein_code || data.name}_${OBJECT_TYPE.SURFACE}${datasetID ? '_' + datasetID : ''}`,
    OBJECT_TYPE: OBJECT_TYPE.SURFACE,
    sdf_info: data.sdf_info,
    colour: colourToggle,
    prot_url,
    moleculeId: data.id,
    selectionType: SELECTION_TYPE.SURFACE
  };
};

export const generateDensityObject = (data, colourToggle, base_url, isWireframeStyle) => {
  let prot_url;

  if (data && data.molecule_protein) {
    prot_url = base_url + data.molecule_protein;
  } else if (data.pdb_info) {
    if (location.protocol === 'https:') {
      prot_url = data.pdb_info.replace('http://', 'https://');
    } else {
      prot_url = data.pdb_info;
    }
  }

  return {
    name: `${data.protein_code || data.name}_${OBJECT_TYPE.DENSITY}`,
    OBJECT_TYPE: OBJECT_TYPE.DENSITY,
    sdf_info: data.sdf_info,
    map_info: data.sdf_info,
    colour: colourToggle,
    prot_url,
    moleculeId: data.id,
    wireframe: isWireframeStyle,
    selectionType: SELECTION_TYPE.DENSITY
  };
};

export const generateMoleculeId = data => ({
  id: data.id,
  name: data.protein_code,
  isInspiration: data.isInspiration
});

export const generateMoleculeCompoundId = data => ({
  id: data.id,
  name: data.name,
  isCrossReference: data.isCrossReference
});

export const getVectorWithColorByCountOfCompounds = (item, currentVectorCompounds) => {
  var thisSmi = item.name.split(`${listTypes.VECTOR}_`)[1];

  var counter = 0;
  if (currentVectorCompounds) {
    Object.keys(currentVectorCompounds).forEach(compoundKey => {
      var smi = compoundKey.split('_')[0];
      if (smi === thisSmi) {
        counter += currentVectorCompounds[compoundKey]['addition'].length;
      }
    });
  }

  var colour = [1, 0, 0];

  if (counter > 50) {
    colour = [0, 1, 0];
    return { ...item, colour: colour, radius: 0.5 };
  }

  if (counter > 10) {
    colour = [0.5, 1, 0];
    return { ...item, colour: colour, radius: 0.4 };
  }

  if (counter > 0) {
    colour = [1, 1, 0];
    return { ...item, colour: colour, radius: 0.35 };
  }
  return { ...item, colour: colour, radius: 0.3 };
};

export const getRepresentationsByType = (objectsInView, object, objectType, datasetId) => {
  let parentItem = `${object.protein_code || object.name}_${objectType}${datasetId ? '_' + datasetId : ''}`;
  let objectInView = objectsInView[parentItem];
  var representations = (objectInView && objectInView.representations) || undefined;
  return representations;
};
