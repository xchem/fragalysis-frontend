/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../common/Modal';
import { Grid } from '@material-ui/core';
import { Button } from '../../common/Inputs/Button';
import { updateClipboard } from '../helpers';
import { setSharedSnapshotURL } from '../redux/actions';

export const ModalStateSave = memo(({}) => {
  const dispatch = useDispatch();
  const sharedSnapshotURL = useSelector(state => state.snapshotReducers.sharedSnapshotURL);
  const currentSnapshot = useSelector(state => state.projectReducers.currentSnapshot);

  const openInNewTab = () => {
    window.open(sharedSnapshotURL);
  };

  const closeModal = () => {
    dispatch(setSharedSnapshotURL(null));
  };

  return (
    <Modal open={sharedSnapshotURL !== null}>
      <Grid container direction="column" justify="space-between" alignItems="stretch">
        <Grid item>{currentSnapshot.title}</Grid>
        <Grid item>{currentSnapshot.description}</Grid>
        <Grid item>
          <a href={sharedSnapshotURL}>{sharedSnapshotURL}</a>
        </Grid>
        <Grid item>
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item>
              <Button onClick={() => updateClipboard(sharedSnapshotURL)}>Copy link</Button>
            </Grid>
            <Grid item>{<Button onClick={openInNewTab}>Open in new tab</Button>}</Grid>
            <Grid item>
              <Button onClick={closeModal}>Close</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Modal>
  );
});
