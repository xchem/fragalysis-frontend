import { OBJECT_TYPE } from '../../nglView/constants';
import { isEmpty } from 'lodash';

export const generateMolecule = (id, sdf_info) => {
  return {
    name: OBJECT_TYPE.MOLECULE + '_' + id,
    OBJECT_TYPE: OBJECT_TYPE.MOLECULE,
    colour: '#FFFFFF',
    sdf_info: sdf_info
  };
};

const base_url = window.location.protocol + '//' + window.location.host;

export const generateComplex = (id, protein_code, sdf_info, molecule_protein) => {
  return {
    name: protein_code + '_COMP',
    OBJECT_TYPE: OBJECT_TYPE.COMPLEX,
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

export const getTotalCountOfCompounds = vectors => {
  let tot_num = 0;
  /* TODO Add algorithm for computing count of toto count of compounds
  for (var key_to_select in state.to_select) {
    if (key_to_select.split('_')[0] === input_mol_key) {
      new_this_vector_list[key_to_select] = state.to_select[key_to_select];
    }
  }


  Object.keys(vectors).forEach(key => {
    tot_num += !isEmpty(vectors[key].addition) || vectors[key].addition ? Object.keys(vectors[key].addition).length : 0;
  }); */
  return tot_num;
};
