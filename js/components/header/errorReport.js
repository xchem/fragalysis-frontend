/**
 * Created by abradley on 08/10/2018.
 */

import React, { memo, useState } from 'react';
import { Button, makeStyles } from '@material-ui/core';
const uuidv4 = require('uuid/v4');

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
  const [throwError, setThrowError] = useState();

  if (throwError) {
    throw new Error('Custom user error.' + uuidv4());
  }

  return (
    <Button variant="contained" color="primary" className={classes.button} onClick={() => setThrowError(true)}>
      Report Error
    </Button>
  );
});
