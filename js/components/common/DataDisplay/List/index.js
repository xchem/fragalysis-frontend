import React, { memo } from 'react';
import { List as MaterialList, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  list: {
    backgroundColor: theme.palette.background.paper
  }
}));

export const List = memo(({ ...rest }) => {
  const classes = useStyles();

  return <MaterialList className={classes.list} {...rest} />;
});
