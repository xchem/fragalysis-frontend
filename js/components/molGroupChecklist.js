import React, { memo, Fragment } from 'react';
import { Grid, makeStyles, Checkbox } from '@material-ui/core';
import { connect } from 'react-redux';
import * as apiActions from '../reducers/api/apiActions';
import { heightOfBody } from './molGroupSelector';

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

const molGroupChecklist = memo(({ mol_group_list, mol_group_selection, setMolGroupOn, setMolGroupSelection }) => {
  const classes = useStyles();

  const handleOnSelect = o => e => {
    const objIdx = mol_group_selection.indexOf(o.id);
    const selectionCopy = mol_group_selection.slice();
    if (e.target.checked && objIdx === -1) {
      setMolGroupOn(o.id);
      selectionCopy.push(o.id);
      setMolGroupSelection(selectionCopy);
    } else if (!e.target.checked && objIdx > -1) {
      selectionCopy.splice(objIdx, 1);
      setMolGroupSelection(selectionCopy);
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
                      <Checkbox color="primary" checked={checked} onChange={handleOnSelect(o)} />
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
});

const mapStateToProps = state => {
  return {
    mol_group_list: state.apiReducers.present.mol_group_list,
    mol_group_selection: state.apiReducers.present.mol_group_selection
  };
};

const mapDispatchToProps = {
  setMolGroupOn: apiActions.setMolGroupOn,
  setMolGroupSelection: apiActions.setMolGroupSelection
};
export default connect(mapStateToProps, mapDispatchToProps)(molGroupChecklist);
