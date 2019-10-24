import * as nglObjectTypes from '../nglObjectTypes';

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

export const generateMolObject = (id, sdf_info) => {
  return {
    name: 'MOLLOAD' + '_' + id,
    OBJECT_TYPE: nglObjectTypes.MOLECULE,
    colour: '#FFFFFF',
    sdf_info: sdf_info
  };
};

const base_url = window.location.protocol + '//' + window.location.host;

export const generateObject = (id, protein_code, sdf_info, molecule_protein) => {
  return {
    name: protein_code + '_COMP',
    OBJECT_TYPE: nglObjectTypes.COMPLEX,
    sdf_info: sdf_info,
    colour: '#FFFFFF',
    prot_url: base_url + molecule_protein
  };
};

export const generateMolId = id => {
  return {
    id: id
  };
};
