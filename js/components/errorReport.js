/**
 * Created by abradley on 08/10/2018.
 */

import React, { memo } from 'react';
import { Button, makeStyles } from '@material-ui/core';
// import { showReportDialog } from '@sentry/browser';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  },
  input: {
    display: 'none'
  }
}));

export const ErrorReport = memo(() => {
  const classes = useStyles();
  const reportError = () => {
    // Set a custom user error to invoke sentry
    const uuidv4 = require('uuid/v4');
    throw new Error('Custom user error.' + uuidv4());
  };

  return (
    <Button variant="contained" color="secondary" className={classes.button} onClick={reportError}>
      Report Error
    </Button>
  );
});
