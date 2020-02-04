import React, { memo } from 'react';
import { Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  input: {
    width: 400
  },
  margin: {
    margin: theme.spacing(1)
  }
}));

export const InputFieldAvatar = memo(({ icon, field }) => {
  const classes = useStyles();

  return (
    <div className={classes.margin}>
      <Grid container spacing={1} alignItems="flex-end">
        <Grid item>{icon}</Grid>
        <Grid item>{field}</Grid>
      </Grid>
    </div>
  );
});
