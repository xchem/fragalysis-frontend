/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../common/Modal';
import { DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import { Button } from '../../common/Inputs/Button';
import { updateClipboard } from '../helpers';
import { setSharedSnapshot } from '../redux/actions';
import { initSharedSnapshot } from '../redux/reducer';

export const ModalShareSnapshot = memo(({}) => {
  const dispatch = useDispatch();
  const sharedSnapshot = useSelector(state => state.snapshotReducers.sharedSnapshot);

  const openInNewTab = () => {
    window.open(sharedSnapshot.url);
  };

  const closeModal = () => {
    dispatch(setSharedSnapshot(initSharedSnapshot));
  };

  return (
    <Modal open={sharedSnapshot.url !== null}>
      <DialogTitle id="form-dialog-title">{sharedSnapshot.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{sharedSnapshot.description}</DialogContentText>
        <a href={sharedSnapshot.url}>{sharedSnapshot.url}</a>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => updateClipboard(sharedSnapshot.url)} color="primary">
          Copy link
        </Button>
        <Button onClick={openInNewTab} color="primary">
          Open in new tab
        </Button>
        <Button onClick={closeModal} color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Modal>
  );
});
