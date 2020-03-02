import React, { memo, forwardRef } from 'react';
import { makeStyles, Button as MaterialButton, CircularProgress } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  margin: {
    margin: theme.spacing(1)
  },
  loading: {
    marginRight: theme.spacing(1)
  }
}));

export const Button = memo(
  forwardRef(({ children, loading, ...rest }, ref) => {
    const classes = useStyles();
    return (
      <MaterialButton className={classes.margin} variant="contained" disabled={loading} {...rest} ref={ref}>
        {loading && <CircularProgress className={classes.loading} color="inherit" size={16} thickness={6} />}
        {children}
      </MaterialButton>
    );
  })
);
