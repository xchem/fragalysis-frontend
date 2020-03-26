import React, { memo, useState } from 'react';
import { Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';

export const NewSnapshotForm = memo(() => {
  const currentSnapshot = useSelector(state => state.projectReducers.currentSnapshot);
  // TODO if exists children of existing snapshot, create branch
  return <Typography variant="h3">Snapshot details</Typography>;
});
