import React from 'react';
import { Paper as MaterialPaper, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  control: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey
  }
}));

export const Paper = ({ header, children, ...rest }) => {
  const classes = useStyles();

  return (
    <MaterialPaper className={classes.control} {...rest}>
      {children}
    </MaterialPaper>
  );
};
