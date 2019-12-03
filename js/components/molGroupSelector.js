import React, { memo, useRef } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { Delete } from '@material-ui/icons';

import { Panel } from './common/Surfaces/Panel';
import { Button } from './common/Inputs/Button';
import NGLView from './nglView/nglView';
import MolGroupChecklist from './molGroupChecklist';
import * as apiActions from '../reducers/api/apiActions';
import { connect } from 'react-redux';
import * as nglLoadActions from '../reducers/ngl/nglActions';
import { VIEWS } from '../constants/constants';
import * as selectionActions from '../reducers/selection/selectionActions';
import {
  generateMolObject,
  generateObject,
  generateResetFocusObject,
  getJoinedMoleculeList
} from './molecule/molecules_helpers';
import { withLoadingMolGroupList } from '../hoc/withLoadingMolGroupList';

export const heightOfBody = '164px';

const useStyles = makeStyles(theme => ({
  containerExpanded: {
    height: heightOfBody
  },
  containerCollapsed: {
    height: 0
  },
  nglViewItem: {
    paddingLeft: theme.spacing(1) / 2
  },
  checklistItem: {
    height: '100%'
  }
}));

const molGroupSelector = memo(
  ({
    setObjectOn,
    setObjectSelection,
    object_selection,
    cached_mol_lists,
    mol_group_list,
    deleteObject,
    setFragmentDisplayList,
    setComplexList,
    vector_list,
    setVectorOnList,
    setVectorList,
    resetSelectionState,
    handleHeightChange,
    countOfPendingVectorLoadRequests
  }) => {
    const classes = useStyles();
    const ref = useRef(null);

    const handleClearSelection = () => {
      // loop through all molecules
      getJoinedMoleculeList({ object_selection, cached_mol_lists, mol_group_list }).forEach(mol => {
        // remove Ligand
        deleteObject(
          Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMolObject(mol.id.toString(), mol.sdf_info))
        );

        // remove Complex
        deleteObject(
          Object.assign(
            { display_div: VIEWS.MAJOR_VIEW },
            generateObject(mol.id.toString(), mol.protein_code, mol.sdf_info, mol.molecule_protein)
          )
        );
      });
      // reset focus
      deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateResetFocusObject()));

      // remove all Vectors
      vector_list.forEach(item => {
        deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item));
      });

      // remove sites selection
      setObjectOn(undefined);
      setObjectSelection([]);

      // reset all selection state
      resetSelectionState();

      // remove Ligand, Complex, Vectors from selection
      //Ligand
      setFragmentDisplayList([]);
      // Complex
      setComplexList([]);
      // Vectors
      setVectorOnList([]);
      setVectorList([]);
    };

    return (
      <Panel
        ref={ref}
        hasHeader
        hasExpansion
        defaultExpanded
        title="Hit cluster selector"
        headerActions={[
          <Button
            onClick={handleClearSelection}
            disabled={countOfPendingVectorLoadRequests > 0}
            color="inherit"
            variant="text"
            size="small"
            startIcon={<Delete />}
          >
            Clear selection
          </Button>
        ]}
        onExpandChange={expand => {
          if (ref.current && handleHeightChange instanceof Function) {
            handleHeightChange(ref.current.offsetHeight);
          }
        }}
      >
        <Grid container justify="space-between" className={classes.containerExpanded}>
          <Grid item xs={5} className={classes.nglViewItem}>
            <NGLView div_id={VIEWS.SUMMARY_VIEW} height={heightOfBody} />
          </Grid>
          <Grid item xs={7} className={classes.checklistItem}>
            <MolGroupChecklist />
          </Grid>
        </Grid>
      </Panel>
    );
  }
);

function mapStateToProps(state) {
  return {
    object_selection: state.apiReducers.present.mol_group_selection,
    cached_mol_lists: state.apiReducers.present.cached_mol_lists,
    mol_group_list: state.apiReducers.present.mol_group_list,
    vector_list: state.selectionReducers.present.vector_list,
    countOfPendingVectorLoadRequests: state.selectionReducers.present.countOfPendingVectorLoadRequests
  };
}
const mapDispatchToProps = {
  setObjectOn: apiActions.setMolGroupOn,
  setObjectSelection: apiActions.setMolGroupSelection,
  deleteObject: nglLoadActions.deleteObject,
  removeFromFragmentDisplayList: selectionActions.removeFromFragmentDisplayList,
  setFragmentDisplayList: selectionActions.setFragmentDisplayList,
  setComplexList: selectionActions.setComplexList,
  setVectorOnList: selectionActions.setVectorOnList,
  setVectorList: selectionActions.setVectorList,
  resetSelectionState: selectionActions.resetSelectionState
};
export default withLoadingMolGroupList(connect(mapStateToProps, mapDispatchToProps)(molGroupSelector));
