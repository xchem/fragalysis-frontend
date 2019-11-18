import React, { memo } from 'react';
import { makeStyles, TextField as MaterialTextField } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  }
}));

export const TextField = memo(({ children, ...rest }) => {
  const classes = useStyles();
  return <MaterialTextField className={classes.textField} {...rest} />;
});
