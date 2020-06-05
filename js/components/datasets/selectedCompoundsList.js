import React, { memo } from 'react';
import { Panel } from '../common/Surfaces/Panel';
import { Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  container: {
    height: '100%',
    width: 'inherit',
    color: theme.palette.black
  }
}));

export const SelectedCompoundList = memo(({ height }) => {
  const classes = useStyles();
  const actions = [];
  return (
    <Panel hasHeader title="Selected Compounds" withTooltip headerActions={actions}>
      <Grid container direction="column" justify="flex-start" className={classes.container} style={{ height: height }}>
        <Grid item>List</Grid>
      </Grid>
    </Panel>
  );
});
