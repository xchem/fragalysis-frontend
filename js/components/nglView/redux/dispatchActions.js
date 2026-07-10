import { OBJECT_TYPE } from '../constants';
import { VIEWS, SUFFIX } from '../../../constants/constants';
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

export const handleNglViewPick = (viewerAdapter, pick, getViewerAdapter) => (dispatch, getState) => {
  const state = getState();
  if (pick && viewerAdapter) {
    // For assigning the ligand interaction
    if (pick.kind === 'bond') {
      const duck_yank_data = state.apiReducers.duck_yank_data;
      const input_dict = pick.interaction;
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
        start: pick.start,
        end: pick.end,
        radius: 0.2,
        display_div: VIEWS.MAJOR_VIEW,
        color: [1, 0, 0],
        name: input_dict['interaction'] + SUFFIX.INTERACTION,
        OBJECT_TYPE: OBJECT_TYPE.ARROW
      };
      dispatch(loadObject({ target: objToLoad, stage: viewerAdapter })).catch(error => {
        throw new Error(error);
      });
    } else if (pick.componentName) {
      const name = pick.componentName;
      // Ok so now perform logic
      const type = name.split('_')[0];
      const pk = parseInt(name.split('_')[1], 10);
      if (type === OBJECT_TYPE.MOLECULE_GROUP && getViewerAdapter(VIEWS.MAJOR_VIEW)) {
        dispatch(toggleMoleculeGroup(pk, viewerAdapter));
      } else if (type === OBJECT_TYPE.MOLGROUPS_SELECT && getViewerAdapter(VIEWS.MAJOR_VIEW)) {
        dispatch(toggleMoleculeGroup(pk, viewerAdapter));
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

export const hideShapeRepresentations = (representationElement, viewerAdapter, parentKey) => {
  if (
    representationElement &&
    representationElement !== null &&
    viewerAdapter.getRepresentationParameter(representationElement, 'withQuality') === true
  ) {
    viewerAdapter.getObjects(parentKey).forEach(component => {
      viewerAdapter.getRepresentations(component).forEach(representation => {
        if (viewerAdapter.getRepresentationParameter(representation, 'isShape') === true) {
          const newVisibility = !viewerAdapter.getVisibility(representation);
          viewerAdapter.setVisibility(representation, newVisibility);
        }
      });
    });
  }
};
