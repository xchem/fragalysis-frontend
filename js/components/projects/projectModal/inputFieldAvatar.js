import React, { memo } from 'react';
import { Grid, makeStyles, TextField } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';

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
