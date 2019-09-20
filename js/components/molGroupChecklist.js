import React from 'react';
import { Grid, makeStyles, Checkbox } from '@material-ui/core';
import { connect } from "react-redux";
import * as apiActions from "../actions/apiActions";

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

const molGroupChecklist = (props) => {
  const classes = useStyles();
  const { object_list, object_selection, cached_mol_lists, setObjectOn, setObjectSelection, setCachedMolLists } = props;

  const handleOnSelect = (o, site) => (e) => {
    const objIdx = object_selection.indexOf(o.id);
    const selectionCopy = object_selection.slice();
    if (e.target.checked && objIdx === -1) {
      setObjectOn(o.id);
      selectionCopy.push(o.id);
      setObjectSelection(selectionCopy);
      // get currently cached data for this molecule group and add site number to it
      const cachedGroupData = Object.assign(cached_mol_lists[o.id] || {}, { site: site });
      // create new molecule list by adding enhanced group data to it
      const newMolLists = Object.assign({}, cached_mol_lists, { [o.id]: cachedGroupData });
      setCachedMolLists(newMolLists);
    } else if (!e.target.checked && objIdx > -1) {
      selectionCopy.splice(objIdx, 1);
      setObjectSelection(selectionCopy);
    }
  };

  return (
    <div className={classes.divContainer}>
      <div className={classes.divScrollable}>
        <Grid container direction="column">
          {
            object_list && object_list.map((o, idx) => {
              const checked = object_selection.some(i => i === o.id);
              const site = idx + 1;
              return (
                <Grid item container alignItems="center" key={`mol-checklist-item-${idx}`}>
                  <Grid item>
                    <Checkbox
                      color="default"
                      checked={checked}
                      onChange={handleOnSelect(o, site)}
                      classes={{
                        root: classes.checkboxRoot
                      }}
                    />
                  </Grid>
                  <Grid item className={checked ? classes.selectedLine : null}>
                    {`Site ${site} - (${o.id})`}
                  </Grid>
                </Grid>
              )
            })
          }
        </Grid>
      </div>
      <div className={classes.title}>selected sites:</div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
      object_list: state.apiReducers.present.mol_group_list,
      object_selection: state.apiReducers.present.mol_group_selection,
      cached_mol_lists: state.apiReducers.present.cached_mol_lists
  }
}

const mapDispatchToProps = {
    setObjectOn: apiActions.setMolGroupOn,
    setObjectSelection: apiActions.setMolGroupSelection,
    setCachedMolLists: apiActions.setCachedMolLists,
}
export default connect(mapStateToProps, mapDispatchToProps)(molGroupChecklist);
