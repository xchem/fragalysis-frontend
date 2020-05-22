import React, { memo } from 'react';
import { Paper, Popper } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  paper: {
    width: 700,
    overflow: 'none',
    padding: theme.spacing(1)
  }
}));

export const InspirationDialog = memo(({ open, anchorEl, inspirationList }) => {
  const id = open ? 'simple-popover-compound-cross-reference' : undefined;
  const classes = useStyles();

  return (
    <Popper id={id} open={open} anchorEl={anchorEl} placement="left-center">
      <Paper className={classes.paper} elevation={21}>
        {inspirationList.map(id => (
          <div key={id}>{id}</div>
        ))}
      </Paper>
    </Popper>
  );
});
