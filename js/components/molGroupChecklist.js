import React, { memo } from 'react';
import { Grid, makeStyles, Checkbox } from '@material-ui/core';
import { connect } from 'react-redux';
import * as apiActions from '../reducers/api/apiActions';

const useStyles = makeStyles(() => ({
  divContainer: {
    height: '100%',
    width: '100%',
    padding: '16px 16px 8px 8px'
  },
  divScrollable: {
    height: '100%',
    width: '100%',
    border: 'solid 1px #DEDEDE',
    overflow: 'auto'
  },
  checkboxRoot: {
    color: 'black'
  },
  selectedLine: {
    color: 'blue',
    fontWeight: 'bold'
  },
  title: {
    position: 'relative',
    top: '-196px',
    backgroundColor: 'white',
    width: 'fit-content',
    fontSize: '16px'
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
    <div className={classes.divContainer}>
      <div className={classes.divScrollable}>
        <Grid container direction="column">
          {mol_group_list &&
            mol_group_list.map((o, idx) => {
              const checked = mol_group_selection.some(i => i === o.id);
              const site = idx + 1;
              return (
                <Grid item container alignItems="center" key={`mol-checklist-item-${idx}`}>
                  <Grid item>
                    <Checkbox
                      color="default"
                      checked={checked}
                      onChange={handleOnSelect(o)}
                      classes={{
                        root: classes.checkboxRoot
                      }}
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
      <div className={classes.title}>selected sites:</div>
    </div>
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
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(molGroupChecklist);
