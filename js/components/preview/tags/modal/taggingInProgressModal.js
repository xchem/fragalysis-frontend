import React, { memo } from 'react';
import {
  CircularProgress,
  makeStyles,
  Typography,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '../../../common/Modal/index';

export const TaggingInProgressModal = memo(({ open, isError, handleClose, molsLeft }) => {
  let msg = 'Tagging is in progress. Please wait...' + '(Left: ' + molsLeft + ')';
  return (
    <Modal open={open || isError}>
      {!isError && (
        <DialogContent>
          <DialogContentText>{msg}</DialogContentText>
        </DialogContent>
      )}
      {isError && (
        <>
          <DialogContent>
            <DialogContentText>{'Ooops something went wrong...'}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary" autoFocus variant="contained">
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Modal>
  );
});
