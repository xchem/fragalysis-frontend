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
  const [error, setError] = useState();

  if (error) {
    throw new Error('Custom user error.' + uuidv4());
  }

  return (
    <Button variant="contained" color="secondary" className={classes.button} onClick={() => setError(true)}>
      Report Error
    </Button>
  );
});
