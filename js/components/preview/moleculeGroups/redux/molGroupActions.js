import { generateComplex, generateMolecule } from '../../molecule/molecules_helpers';
import { VIEWS } from '../../../../constants/constants';
import { deleteObject } from '../../../../reducers/ngl/nglDispatchActions';
import { getJoinedMoleculeList } from '../../molecule/redux/moleculeListActions';
import { setObjectSelection } from '../../../../reducers/selection/selectionActions';

export const clearAfterDeselectingMoleculeGroup = ({ molGroupId, majorViewStage }) => (dispatch, getState) => {
  dispatch(setObjectSelection([molGroupId]));

  let site;
  const state = getState();
  const vector_list = state.selectionReducers.present.vector_list;

  // loop through all molecules
  getJoinedMoleculeList(state).forEach(mol => {
    site = mol.site;
    // remove Ligand
    dispatch(
      deleteObject(
        Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMolecule(mol.id.toString(), mol.sdf_info)),
        majorViewStage
      )
    );

    // remove Complex
    dispatch(
      deleteObject(
        Object.assign(
          { display_div: VIEWS.MAJOR_VIEW },
          generateComplex(mol.id.toString(), mol.protein_code, mol.sdf_info, mol.molecule_protein)
        ),
        majorViewStage
      )
    );
  });

  // remove all Vectors
  vector_list
    .filter(v => v.site === site)
    .forEach(item => {
      dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item), majorViewStage));
    });

  dispatch(setObjectSelection(undefined));
};
