import React, { memo } from 'react';
import { GridLegacy as Grid, Button, Typography, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { base_url } from '../routes/constants';

export const DownloadProgress = memo(({ errorMessage }) => {
  const downloadInProgress = useSelector(state => state.apiReducers.directDownloadInProgress);
  const snapshotUrl = useSelector(state => state.apiReducers.snapshotDownloadUrl);

  const openSnapshot = () => {
    if (snapshotUrl && snapshotUrl.includes('http')) {
      window.open(snapshotUrl, '_blank');
    } else {
      window.open(`${base_url}${snapshotUrl}`, '_blank');
    }
  };

  return (
    <Grid container direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '100vh' }}>
      <Grid item>{downloadInProgress && <CircularProgress />}</Grid>
      <Grid item container direction="column" alignItems="center" justifyContent="center">
        <Grid item>
          {errorMessage ? (
            <Typography variant="h4" color="error" role="alert">
              {errorMessage}
            </Typography>
          ) : (
            <Typography variant="h3">Preparing and downloading the download</Typography>
          )}
        </Grid>
        <Grid
          item
          onClick={() => {
            openSnapshot();
          }}
        >
          {snapshotUrl && <Button color="primary">Open associated snapshot</Button>}
        </Grid>
      </Grid>
    </Grid>
  );
});
