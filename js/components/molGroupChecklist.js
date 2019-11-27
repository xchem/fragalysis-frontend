import React, { memo, Fragment } from 'react';
import { Grid, makeStyles, Checkbox } from '@material-ui/core';
import { connect } from 'react-redux';
import * as apiActions from '../reducers/api/apiActions';
import { heightOfBody } from './molGroupSelector';
import { generateMolId, generateMolObject, generateObject, getJoinedMoleculeList } from './molecule/molecules_helpers';
import { VIEWS } from '../constants/constants';
import * as nglLoadActions from '../reducers/ngl/nglLoadActions';

const useStyles = makeStyles(theme => ({
  divContainer: {
    height: '100%',
    width: '100%',
    paddingTop: theme.spacing(1) / 2
  },
  divScrollable: {
    height: '100%',
    width: '100%',
    border: 'solid 1px #DEDEDE',
    overflow: 'auto'
  },
  selectedLine: {
    color: theme.palette.primary.main,
    fontWeight: 'bold'
  },
  title: {
    position: 'relative',
    top: `calc(0px - 6px - ${heightOfBody})`,
    marginLeft: theme.spacing(1),
    backgroundColor: theme.palette.white,
    width: 'fit-content',
    fontWeight: 'bold'
  },
  rowItem: {
    height: 22
  }
}));

const molGroupChecklist = memo(
  ({
    mol_group_list,
    mol_group_selection,
    setMolGroupOn,
    setMolGroupSelection,
    countOfPendingVectorLoadRequests,
    vector_list,
    cached_mol_lists,
    deleteObject
  }) => {
    const classes = useStyles();

    const handleSiteClearSelection = molGroupSelectionId => {
      let site;
      // loop through all molecules
      getJoinedMoleculeList({ object_selection: [molGroupSelectionId], cached_mol_lists, mol_group_list }).forEach(
        mol => {
          site = mol.site;
          console.log(mol);
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
        }
      );

      // remove all Vectors
      vector_list
        .filter(v => v.site === site)
        .forEach(item => {
          deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item));
        });
    };

    const handleOnSelect = o => e => {
      const objIdx = mol_group_selection.indexOf(o.id);
      const selectionCopy = mol_group_selection.slice();
      if (e.target.checked && objIdx === -1) {
        setMolGroupOn(o.id);
        selectionCopy.push(o.id);
        setMolGroupSelection(selectionCopy);
      } else if (!e.target.checked && objIdx > -1) {
        handleSiteClearSelection(o.id);
        selectionCopy.splice(objIdx, 1);
        setMolGroupSelection(selectionCopy);
        if (selectionCopy.length > 0) {
          setMolGroupOn(selectionCopy.slice(-1)[0]);
        } else {
          setMolGroupOn(undefined);
        }
      }
    };

    return (
      <Fragment>
        <div className={classes.divContainer}>
          <div className={classes.divScrollable}>
            <Grid container direction="column">
              {mol_group_list &&
                mol_group_list.map((o, idx) => {
                  const checked = mol_group_selection.some(i => i === o.id);
                  const site = idx + 1;
                  return (
                    <Grid
                      item
                      container
                      alignItems="center"
                      key={`mol-checklist-item-${idx}`}
                      className={classes.rowItem}
                    >
                      <Grid item>
                        <Checkbox
                          color="primary"
                          checked={checked}
                          onChange={handleOnSelect(o)}
                          disabled={countOfPendingVectorLoadRequests > 0}
                        />
                      </Grid>
                      <Grid item className={checked ? classes.selectedLine : null}>
                        {`Site ${site} - (${o.id})`}
                      </Grid>
                    </Grid>
                  );
                })}
            </Grid>
          </div>
        </div>
        <div className={classes.title}>Selected sites:</div>
      </Fragment>
    );
  }
);

const mapStateToProps = state => {
  return {
    mol_group_list: state.apiReducers.present.mol_group_list,
    mol_group_selection: state.apiReducers.present.mol_group_selection,
    countOfPendingVectorLoadRequests: state.selectionReducers.present.countOfPendingVectorLoadRequests,
    cached_mol_lists: state.apiReducers.present.cached_mol_lists,
    vector_list: state.selectionReducers.present.vector_list
  };
};

const mapDispatchToProps = {
  setMolGroupOn: apiActions.setMolGroupOn,
  setMolGroupSelection: apiActions.setMolGroupSelection,
  deleteObject: nglLoadActions.deleteObject
};
export default connect(mapStateToProps, mapDispatchToProps)(molGroupChecklist);
