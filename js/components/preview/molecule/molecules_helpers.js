import { OBJECT_TYPE } from '../../nglView/constants';
import { base_url } from '../../routes/constants';

export const generateMolecule = (protein_code, sdf_info) => {
  return {
    name: `${protein_code}_LIGAND`,
    OBJECT_TYPE: OBJECT_TYPE.LIGAND,
    colour: '#FFFFFF',
    sdf_info: sdf_info
  };
};

export const complexObjectTypes = {
  contacts: OBJECT_TYPE.COMPLEX,
  hitProtein: OBJECT_TYPE.HIT_PROTEIN,
  surface: OBJECT_TYPE.SURFACE
};

export const generateComplex = (protein_code, sdf_info, molecule_protein, type = 'contacts') => {
  return {
    name: `${protein_code}_${complexObjectTypes[type]}`,
    OBJECT_TYPE: complexObjectTypes[type],
    sdf_info: sdf_info,
    colour: '#FFFFFF',
    prot_url: base_url + molecule_protein
  };
};

export const generateSphere = (data, selected = false) => {
  var colour = [0, 0, 1];
  var radius;
  if (data.mol_id.length > 10) {
    radius = 6.0;
  } else if (data.mol_id.length > 5) {
    radius = 4.0;
  } else {
    radius = 2.0;
  }
  if (selected) {
    colour = [0, 1, 0];
  }
  // Move this out of this
  return {
    OBJECT_TYPE: OBJECT_TYPE.SPHERE,
    name: OBJECT_TYPE.MOLECULE_GROUP + '_' + +data.id.toString(),
    radius: radius,
    colour: colour,
    coords: [data.x_com, data.y_com, data.z_com]
  };
};

export const getTotalCountOfCompounds = graph => {
  let tot_num = 0;

  if (graph) {
    Object.keys(graph).forEach(key => {
      tot_num += graph[key].addition ? Object.keys(graph[key].addition).length : 0;
    });
  }
  return tot_num;
};
