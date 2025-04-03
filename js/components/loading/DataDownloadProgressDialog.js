import { Dialog, DialogContent, DialogTitle, LinearProgress, Typography } from '@material-ui/core';
import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';

export const DataDownloadProgressDialog = () => {
  const dataAreDownloading = useSelector(state => state.apiReducers.dataAreDownloading);
  const lhsIsFullyRendered = useSelector(state => state.selectionReducers.lhsIsFullyRendered);

  return (
    <Dialog open={dataAreDownloading || !lhsIsFullyRendered} aria-labelledby="data-download-progress-dialog-title">
      <DialogTitle id="data-download-progress-dialog-title">
        {dataAreDownloading ? 'Data download progress' : 'Rendering of UI in progress'}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          {dataAreDownloading ? 'Downloading of data is in progress...' : 'Rendering of UI is in progress...'}
        </Typography>
        {dataAreDownloading && <LinearProgress variant="indeterminate" />}
      </DialogContent>
    </Dialog>
  );
};
