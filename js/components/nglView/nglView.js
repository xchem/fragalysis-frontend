/**
 * Created by abradley on 01/03/2018.
 */

import { Stage } from 'ngl';
import React, { memo, useEffect, useRef, useCallback, useContext } from 'react';
import { connect, useStore } from 'react-redux';
import * as apiActions from '../../reducers/api/apiActions';
import * as nglActions from '../../reducers/ngl/nglActions';
import * as listTypes from '../listTypes';
import * as selectionActions from '../../reducers/selection/selectionActions';
import { SUFFIX, VIEWS, PREFIX } from '../../constants/constants';
import { OBJECT_TYPE } from './constants';
import { NglContext } from './nglProvider';
import { generateSphere } from '../molecule/molecules_helpers';
import { clearAfterDeselectingMoleculeGroup } from '../moleculeGroups/molGroupHelpers';
import { throttle } from 'lodash';

const NglView = memo(
  ({
    duck_yank_data,
    setMolGroupOn,
    setMolGroupSelection,
    selectVector,
    setDuckYankData,
    setPanddaSiteOn,
    deleteObject,
    div_id,
    height,
    loadObject,
    setOrientation,
    removeAllNglComponents
  }) => {
    const store = useStore();

    // connect to NGL Stage object
    const { registerNglView, unregisterNglView, getNglView } = useContext(NglContext);
    const stageRef = useRef();
    const stage = stageRef.current;

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

    const toggleMolGroup = molGroupId => {
      // Anti-pattern but connected prop (mol_group_selection) is undefined here
      const state = store.getState();
      const molGroupSelection = state.selectionReducers.present.mol_group_selection;
      const objIdx = molGroupSelection.indexOf(molGroupId);
      const currentMolGroupStringID = `${OBJECT_TYPE.MOLECULE_GROUP}_${molGroupId}`;
      const selectionCopy = molGroupSelection.slice();
      const currentMolGroup = state.apiReducers.present.mol_group_list.find(o => o.id === molGroupId);

      const currentStage = getNglView(VIEWS.SUMMARY_VIEW).stage;

      if (objIdx === -1) {
        setMolGroupOn(molGroupId);
        selectionCopy.push(molGroupId);
        setMolGroupSelection(selectionCopy, stage);
        deleteObject(
          {
            display_div: VIEWS.SUMMARY_VIEW,
            name: currentMolGroupStringID
          },
          currentStage
        );
        loadObject(
          Object.assign({ display_div: VIEWS.SUMMARY_VIEW }, generateSphere(currentMolGroup, true)),
          currentStage
        );
      } else {
        const majorViewStage = getNglView(VIEWS.MAJOR_VIEW).stage;
        selectionCopy.splice(objIdx, 1);
        setMolGroupSelection(selectionCopy, stage);
        deleteObject(
          {
            display_div: VIEWS.SUMMARY_VIEW,
            name: currentMolGroupStringID
          },
          currentStage
        );
        loadObject(
          Object.assign({ display_div: VIEWS.SUMMARY_VIEW }, generateSphere(currentMolGroup, false)),
          currentStage
        );
        clearAfterDeselectingMoleculeGroup({
          molGroupId,
          majorViewStage,
          cached_mol_lists: state.apiReducers.present.cached_mol_lists,
          mol_group_list: state.apiReducers.present.mol_group_list,
          vector_list: state.selectionReducers.present.vector_list,
          deleteObject
        });
      }
    };

    const showPick = (stage, pickingProxy) => {
      if (pickingProxy) {
        // For assigning the ligand interaction
        if (pickingProxy.bond) {
          let input_dict = processInt(pickingProxy);
          if (duck_yank_data['interaction'] !== undefined) {
            deleteObject({
              display_div: VIEWS.MAJOR_VIEW,
              name: duck_yank_data['interaction'] + SUFFIX.INTERACTION
            });
          }
          setDuckYankData(input_dict);
          const objToLoad = {
            start: pickingProxy.object.center1,
            end: pickingProxy.object.center2,
            radius: 0.2,
            display_div: VIEWS.MAJOR_VIEW,
            color: [1, 0, 0],
            name: input_dict['interaction'] + SUFFIX.INTERACTION,
            OBJECT_TYPE: OBJECT_TYPE.ARROW
          };
          loadObject(objToLoad, stage);
        } else if (pickingProxy.component.object.name) {
          let name = pickingProxy.component.object.name;
          // Ok so now perform logic
          const type = name.split('_')[0];
          const pk = parseInt(name.split('_')[1], 10);
          if (type === OBJECT_TYPE.MOLECULE_GROUP) {
            toggleMolGroup(pk);
          } else if (type === OBJECT_TYPE.MOLGROUPS_SELECT) {
            toggleMolGroup(pk);
          } else if (type === listTypes.PANDDA_SITE) {
            setPanddaSiteOn(pk);
          }
          //else if (type === listTypes.MOLECULE) {
          //}
          else if (type === listTypes.VECTOR) {
            const vectorSmi = name.split('_')[1];
            selectVector(vectorSmi);
          }
        }
      }
    };

    const handleOrientationChanged = useCallback(
      throttle(() => {
        const newStage = getNglView(div_id);
        if (newStage) {
          const currentOrientation = newStage.stage.viewerControls.getOrientation();
          setOrientation(div_id, currentOrientation);
        }
      }, 250),
      [div_id, getNglView, setOrientation]
    );

    // Initialization of NGL View component
    const handleResize = useCallback(() => {
      const newStage = getNglView(div_id);
      if (newStage) {
        newStage.stage.handleResize();
      }
    }, [div_id, getNglView]);

    useEffect(() => {
      if (stageRef.current === undefined) {
        const newStage = new Stage(div_id);
        newStage.getComponentsByName();
        registerNglView(div_id, newStage);
        window.addEventListener('resize', handleResize);
        newStage.mouseControls.add('clickPick-left', showPick);

        newStage.mouseObserver.signals.scrolled.add(handleOrientationChanged);
        newStage.mouseObserver.signals.dropped.add(handleOrientationChanged);
        newStage.mouseObserver.signals.dragged.add(handleOrientationChanged);
        stageRef.current = newStage;
      }
      return () => {
        if (stageRef.current) {
          window.removeEventListener('resize', handleResize);
          stageRef.current.mouseControls.remove('clickPick-left', showPick);

          stageRef.current.mouseObserver.signals.scrolled.remove(handleOrientationChanged);
          stageRef.current.mouseObserver.signals.dropped.remove(handleOrientationChanged);
          stageRef.current.mouseObserver.signals.dragged.remove(handleOrientationChanged);
          stageRef.current.dispose();
          removeAllNglComponents(stageRef.current);
          unregisterNglView(div_id);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [div_id, handleResize, registerNglView, unregisterNglView, handleOrientationChanged, removeAllNglComponents]);
    // End of Initialization NGL View component

    return <div id={div_id} style={{ height: height || '600px', width: '100%' }} />;
  }
);

function mapStateToProps(state) {
  return {
    duck_yank_data: state.apiReducers.present.duck_yank_data
  };
}
const mapDispatchToProps = {
  setMolGroupOn: apiActions.setMolGroupOn,
  setMolGroupSelection: selectionActions.setMolGroupSelection,
  selectVector: selectionActions.selectVector,
  setDuckYankData: apiActions.setDuckYankData,
  setPanddaSiteOn: apiActions.setPanddaSiteOn,
  deleteObject: nglActions.deleteObject,
  loadObject: nglActions.loadObject,
  setOrientation: nglActions.setOrientation,
  removeAllNglComponents: nglActions.removeAllNglComponents
};

NglView.displayName = 'NglView';

export default connect(mapStateToProps, mapDispatchToProps)(NglView);
