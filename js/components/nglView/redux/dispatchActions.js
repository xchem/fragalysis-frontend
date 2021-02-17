import { OBJECT_TYPE } from '../constants';
import { PREFIX, VIEWS, SUFFIX } from '../../../constants/constants';
import { generateSphere } from '../../preview/molecule/molecules_helpers';
import { clearAfterDeselectingMoleculeGroup } from '../../preview/moleculeGroups/redux/dispatchActions';
import { loadObject, deleteObject } from '../../../reducers/ngl/dispatchActions';
import { setMolGroupSelection } from '../../../reducers/selection/actions';
import { setDuckYankData, setMolGroupOn, setPanddaSiteOn } from '../../../reducers/api/actions';
import * as listTypes from '../../../constants/listTypes';
import { selectVectorAndResetCompounds } from '../../../reducers/selection/dispatchActions';

export const toggleMoleculeGroup = (molGroupId, summaryViewStage) => (dispatch, getState) => {
  const state = getState();
  const molGroupSelection = state.selectionReducers.mol_group_selection;
  const objIdx = molGroupSelection.indexOf(molGroupId);
  const currentMolGroupStringID = `${OBJECT_TYPE.MOLECULE_GROUP}_${molGroupId}`;
  const selectionCopy = molGroupSelection.slice();
  const currentMolGroup = state.apiReducers.mol_group_list.find(o => o.id === molGroupId);

  if (objIdx === -1) {
    dispatch(setMolGroupOn(molGroupId));
    selectionCopy.push(molGroupId);
    dispatch(setMolGroupSelection(selectionCopy));
    dispatch(
      deleteObject(
        {
          display_div: VIEWS.SUMMARY_VIEW,
          name: currentMolGroupStringID
        },
        summaryViewStage
      )
    );
    dispatch(
      loadObject({
        target: Object.assign({ display_div: VIEWS.SUMMARY_VIEW }, generateSphere(currentMolGroup, true)),
        stage: summaryViewStage
      })
    ).catch(error => {
      throw new Error(error);
    });
  } else {
    selectionCopy.splice(objIdx, 1);
    dispatch(setMolGroupSelection(selectionCopy));
    dispatch(
      deleteObject(
        {
          display_div: VIEWS.SUMMARY_VIEW,
          name: currentMolGroupStringID
        },
        summaryViewStage
      )
    );
    dispatch(
      loadObject({
        target: Object.assign({ display_div: VIEWS.SUMMARY_VIEW }, generateSphere(currentMolGroup, false)),
        stage: summaryViewStage
      })
    ).catch(error => {
      throw new Error(error);
    });
    dispatch(clearAfterDeselectingMoleculeGroup({ molGroupId }));
  }
};

const processInt = pickingProxy => {
  let atom_id = '';
  if (pickingProxy.object.atom2.resname === 'HET') {
    atom_id = 'atom1';
  } else {
    atom_id = 'atom2';
  }
  let atom_name = pickingProxy.object[atom_id].atomname;
  let res_name = pickingProxy.object[atom_id].resname;
  let chain_name = pickingProxy.object[atom_id].chainname;
  let res_num = pickingProxy.object[atom_id].resno;
  let tot_name = chain_name + '_' + res_name + '_' + res_num.toString() + '_' + atom_name;
  let mol_int = parseInt(pickingProxy.object.atom1.structure.name.split(PREFIX.COMPLEX_LOAD)[1]);
  return { interaction: tot_name, complex_id: mol_int };
};

export const handleNglViewPick = (stage, pickingProxy, getNglView) => (dispatch, getState) => {
  const state = getState();
  if (pickingProxy && stage) {
    // For assigning the ligand interaction
    if (pickingProxy.bond) {
      const duck_yank_data = state.apiReducers.duck_yank_data;
      let input_dict = processInt(pickingProxy);
      if (duck_yank_data['interaction'] !== undefined) {
        dispatch(
          deleteObject({
            display_div: VIEWS.MAJOR_VIEW,
            name: duck_yank_data['interaction'] + SUFFIX.INTERACTION
          })
        );
      }
      dispatch(setDuckYankData(input_dict));
      const objToLoad = {
        start: pickingProxy.object.center1,
        end: pickingProxy.object.center2,
        radius: 0.2,
        display_div: VIEWS.MAJOR_VIEW,
        color: [1, 0, 0],
        name: input_dict['interaction'] + SUFFIX.INTERACTION,
        OBJECT_TYPE: OBJECT_TYPE.ARROW
      };
      dispatch(loadObject({ target: objToLoad, stage })).catch(error => {
        throw new Error(error);
      });
    } else if (pickingProxy.component && pickingProxy.component.object && pickingProxy.component.object.name) {
      let name = pickingProxy.component.object.name;
      // Ok so now perform logic
      const type = name.split('_')[0];
      const pk = parseInt(name.split('_')[1], 10);
      if (type === OBJECT_TYPE.MOLECULE_GROUP && getNglView(VIEWS.MAJOR_VIEW)) {
        dispatch(toggleMoleculeGroup(pk, stage));
      } else if (type === OBJECT_TYPE.MOLGROUPS_SELECT && getNglView(VIEWS.MAJOR_VIEW)) {
        dispatch(toggleMoleculeGroup(pk, stage));
      } else if (type === listTypes.PANDDA_SITE) {
        dispatch(setPanddaSiteOn(pk));
      }
      //else if (type === listTypes.MOLECULE) {
      //}
      else if (type === listTypes.VECTOR) {
        const vectorSmile = name.split('_')[1];
        dispatch(selectVectorAndResetCompounds(vectorSmile));
      }
    }
  }
};
