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
  const { object_list, object_on, setObjectOn } = props;

  const handleOnSelect = (o) => (e) => {
    if (e.target.checked) {
      setObjectOn(o.id);
    }
  };

  return (
    <div className={classes.divContainer}>
      <div className={classes.divScrollable}>
        <Grid container direction="column">
          {
            object_list && object_list.map((o, idx) => {
              const checked = object_on ? o.id === object_on : false;
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
                  <Grid item>
                    {`Site ${idx + 1} - (${o.id})`}
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
      object_on: state.apiReducers.present.mol_group_on
  }
}

const mapDispatchToProps = {
    setObjectOn: apiActions.setMolGroupOn,
}
export default connect(mapStateToProps, mapDispatchToProps)(molGroupChecklist);
