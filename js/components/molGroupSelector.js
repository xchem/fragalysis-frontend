import React, { useState, memo, useRef, useEffect } from 'react';
import { Grid, makeStyles, Button } from '@material-ui/core';
import BorderedView from './borderedView';
import NGLView from './nglView/nglComponents';
import MolGroupChecklist from './molGroupChecklist';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';
import * as apiActions from '../reducers/api/apiActions';
import { connect } from 'react-redux';
import * as nglLoadActions from '../reducers/ngl/nglLoadActions';
import { VIEWS } from '../constants/constants';
import * as selectionActions from '../reducers/selection/selectionActions';
import { generateMolObject, generateObject, getJoinedMoleculeList } from '../utils/molecules_helpers';
import { withLoadingMolGroupList } from '../hoc/withLoadingMolGroupList';

const useStyles = makeStyles(() => ({
  containerExpanded: {
    height: '208px'
  },
  containerCollapsed: {
    height: '0px'
  },
  nglViewItem: {
    paddingLeft: '4px'
  },
  checklistItem: {
    height: '100%'
  },
  button: {
    minWidth: 'unset'
  },
  sortFilterButtonStyle: {
    textTransform: 'none',
    fontWeight: 'bold',
    fontSize: 'larger'
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
    handleHeightChange
  }) => {
    const classes = useStyles();
    const ref = useRef(null);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {}, [ref]);

    useEffect(() => {
      if (ref.current && handleHeightChange instanceof Function) {
        handleHeightChange(ref.current.offsetHeight);
      }
    }, [expanded, handleHeightChange]);

    const handleTitleButtonClick = () => {
      setExpanded(!expanded);
    };

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

    const titleRightElement = (
      <div>
        <Button onClick={handleClearSelection} className={classes.button}>
          <span className={classes.sortFilterButtonStyle}>clear selection</span>
        </Button>
        <Button onClick={handleTitleButtonClick} className={classes.button}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </Button>
      </div>
    );

    return (
      <div ref={ref}>
        <BorderedView title="hit cluster selector" rightElement={titleRightElement}>
          <Grid
            item
            container
            alignItems="center"
            className={expanded ? classes.containerExpanded : classes.containerCollapsed}
          >
            <Grid item xs={5} className={classes.nglViewItem}>
              <NGLView div_id={VIEWS.SUMMARY_VIEW} height={expanded ? '200px' : '0px'} />
            </Grid>
            <Grid item xs={7} className={classes.checklistItem}>
              {expanded && <MolGroupChecklist />}
            </Grid>
          </Grid>
        </BorderedView>
      </div>
    );
  }
);

function mapStateToProps(state) {
  return {
    object_selection: state.apiReducers.present.mol_group_selection,
    cached_mol_lists: state.apiReducers.present.cached_mol_lists,
    mol_group_list: state.apiReducers.present.mol_group_list,
    vector_list: state.selectionReducers.present.vector_list
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
