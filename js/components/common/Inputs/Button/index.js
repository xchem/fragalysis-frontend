import React, { memo, forwardRef } from 'react';
import { makeStyles, Button as MaterialButton } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  }
}));

export const Button = memo(
  forwardRef(({ children, ...rest }, ref) => {
    const classes = useStyles();
    return (
      <MaterialButton className={classes.button} variant="contained" {...rest} ref={ref}>
        {children}
      </MaterialButton>
    );
  })
);
