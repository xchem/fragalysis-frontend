import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';

const SnapshotSavingProgressDialog = ({ open }) => {
  const isSaving = useSelector(state => state.snapshotReducers.isSnapshotSaving);

  return (
    <Dialog open={isSaving} maxWidth="xs" fullWidth>
      <DialogTitle>Saving Snapshot</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>Please wait while your snapshot is being saved...</Typography>
        <LinearProgress />
      </DialogContent>
    </Dialog>
  );
};

export default SnapshotSavingProgressDialog;
