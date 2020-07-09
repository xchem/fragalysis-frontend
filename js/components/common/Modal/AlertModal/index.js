import React, { memo } from 'react';
import { DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@material-ui/core';
import Modal from '../index';

export const AlertModal = memo(({ open, title, description, handleOnOk, handleOnCancel }) => {
  return (
    <Modal open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOnCancel} color="secondary" variant="contained">
          Cancel
        </Button>
        <Button onClick={handleOnOk} color="primary" autoFocus variant="contained">
          OK
        </Button>
      </DialogActions>
    </Modal>
  );
});
