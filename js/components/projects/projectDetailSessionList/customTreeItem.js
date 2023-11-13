import React, { memo } from 'react';
import { Grid, IconButton, Typography } from '@material-ui/core';
import moment from 'moment';
import { CheckCircle, Delete, Share } from '@material-ui/icons';
import { TreeItem } from '@material-ui/lab';

export const CustomTreeItem = memo(({ children, nodeId, title, description }) => {
  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <Grid container direction="row" justifyContent="space-between">
          <Grid item>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="body2">
              <b>Created:</b> {moment().format('LLL')} <b>Description:</b> {description}
            </Typography>
          </Grid>
          <Grid item>
            <IconButton>
              <CheckCircle />
            </IconButton>
            <IconButton>
              <Share />
            </IconButton>
            <IconButton>
              <Delete />
            </IconButton>
          </Grid>
        </Grid>
      }
    >
      {children}
    </TreeItem>
  );
});
