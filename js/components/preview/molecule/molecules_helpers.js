import { OBJECT_TYPE } from '../../nglView/constants';
// concat molecule results for all selected molecule groups into single list

export const getJoinedMoleculeList = ({ object_selection, cached_mol_lists, mol_group_list }) => {
  let joinedMoleculeLists = [];
  if (object_selection) {
    object_selection.forEach(obj => {
      const cachedData = cached_mol_lists[obj];
      const site = (mol_group_list || []).findIndex(group => group.id === obj) + 1;
      if (cachedData && cachedData.results) {
        cachedData.results.forEach(r => joinedMoleculeLists.push(Object.assign({ site: site }, r)));
      }
    });
  }
  return joinedMoleculeLists;
};

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
