/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import Modal from '../../common/Modal';
import { DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import { Button } from '../../common/Inputs/Button';
import { updateClipboard } from '../helpers';

export const ModalShareSnapshot = memo(({}) => {
  const sharedSnapshot = useSelector(state => state.snapshotReducers.sharedSnapshot);

  const openInNewTab = () => {
    window.open(sharedSnapshot.url);
  };

  const closeModal = () => {
    // Really bad usage or redirection. Hint for everybody in this line ignore it, but in other parts of code
    // use react-router !
    window.location.replace(sharedSnapshot.url);
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
          Close
        </Button>
      </DialogActions>
    </Modal>
  );
});
