import React, { memo } from 'react';
import { Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  itemWidth: {
    width: '100%'
  },
  margin: {
    margin: theme.spacing(1)
  }
}));

export const InputFieldAvatar = memo(({ icon, field }) => {
  const classes = useStyles();

  return (
    <div className={classes.margin}>
      <Grid container spacing={1} alignItems="flex-end" wrap="nowrap" className={classes.itemWidth}>
        <Grid item>{icon}</Grid>
        <Grid item className={classes.itemWidth}>
          {field}
        </Grid>
      </Grid>
    </div>
  );
});
