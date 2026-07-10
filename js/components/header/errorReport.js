/**
 * Created by abradley on 08/10/2018.
 */

import React, { memo, useState } from 'react';
import { Button } from '@mui/material';
import { makeStyles } from '../../ui/styles';
import { createUuid } from '../../utils/uuid';

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
    throw new Error('Custom user error.' + createUuid());
  }

  return (
    <Button variant="contained" color="primary" className={classes.button} onClick={() => setThrowError(true)}>
      Report Error
    </Button>
  );
});
