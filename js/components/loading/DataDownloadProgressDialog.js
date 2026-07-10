import { Dialog, DialogContent, DialogTitle, LinearProgress, Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';

export const DataDownloadProgressDialog = () => {
  const dataAreDownloading = useSelector(state => state.apiReducers.dataAreDownloading);
  const lhsIsFullyRendered = useSelector(state => state.selectionReducers.lhsIsFullyRendered);
  const errorOccuredDuringDownload = useSelector(state => state.apiReducers.errorOccuredDuringDownload);
  const snapshotLoadingInProgress = useSelector(state => state.apiReducers.snapshotLoadingInProgress);
  const isSnapshotRendering = useSelector(state => state.nglReducers.isSnapshotRendering) || false;
  const isNGLQueueEmpty = useSelector(state => state.nglReducers.isNGLQueueEmpty);
  const switchingSnapshotWithinProject = useSelector(state => state.snapshotReducers.switchingSnapshotWithinProject);

  const snapshotRenderInProgress = snapshotLoadingInProgress || (isSnapshotRendering && !isNGLQueueEmpty);
  const shouldShowRenderingDialog =
    !switchingSnapshotWithinProject && (!lhsIsFullyRendered || snapshotRenderInProgress);
  const shouldShowDialog = !errorOccuredDuringDownload && (dataAreDownloading || shouldShowRenderingDialog);

  return (
    <Dialog
      open={shouldShowDialog}
      aria-labelledby="data-download-progress-dialog-title"
    >
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
