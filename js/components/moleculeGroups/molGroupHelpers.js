import { VIEWS } from '../../constants/constants';
import { generateComplex, generateMolecule, getJoinedMoleculeList } from '../molecule/molecules_helpers';

export const clearAfterDeselectingMoleculeGroup = ({
  molGroupId,
  majorViewStage,
  cached_mol_lists,
  mol_group_list,
  vector_list,
  deleteObject
}) => {
  let site;
  // loop through all molecules
  getJoinedMoleculeList({ object_selection: [molGroupId], cached_mol_lists, mol_group_list }).forEach(mol => {
    site = mol.site;
    // remove Ligand
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMolecule(mol.id.toString(), mol.sdf_info)),
      majorViewStage
    );

    // remove Complex
    deleteObject(
      Object.assign(
        { display_div: VIEWS.MAJOR_VIEW },
        generateComplex(mol.id.toString(), mol.protein_code, mol.sdf_info, mol.molecule_protein)
      ),
      majorViewStage
    );
  });

  // remove all Vectors
  vector_list
    .filter(v => v.site === site)
    .forEach(item => {
      deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item), majorViewStage);
    });
};
