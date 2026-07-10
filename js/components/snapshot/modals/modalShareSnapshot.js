/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../common/Modal';
import { DialogTitle, DialogContent, DialogContentText, DialogActions, GridLegacy as Grid, CircularProgress } from '@mui/material';
import { makeStyles } from '../../../ui/styles';
import { Button } from '../../common/Inputs/Button';
import { updateClipboard } from '../helpers';
import { setSharedSnapshot } from '../redux/actions';
import { initSharedSnapshot } from '../redux/reducer';
import RichTooltip from '../../tooltip/RichTooltip';

const useStyles = makeStyles(theme => ({
  loading: {
    paddingTop: theme.spacing(2)
  }
}));

export const ModalShareSnapshot = memo(({}) => {
  const classes = useStyles();
  const sharedSnapshot = useSelector(state => state.snapshotReducers.sharedSnapshot);
  const isLoadingSnapshotDialog = useSelector(state => state.snapshotReducers.isLoadingSnapshotDialog);
  const dontShowShareSnapshot = useSelector(state => state.snapshotReducers.dontShowShareSnapshot);
  const isSaving = useSelector(state => state.snapshotReducers.isSnapshotSaving);
  const dispatch = useDispatch();

  const openInNewTab = () => {
    window.open(sharedSnapshot.url);
  };

  const closeModal = () => {
    if (sharedSnapshot && sharedSnapshot.disableRedirect === false) {
      // Really bad usage or redirection. Hint for everybody in this line ignore it, but in other parts of code
      // use react-router !
      window.location.replace(sharedSnapshot.url);
    } else if (sharedSnapshot && sharedSnapshot.disableRedirect === true) {
      dispatch(setSharedSnapshot(initSharedSnapshot));
    }
  };

  return (
    <Modal open={sharedSnapshot.url !== null && dontShowShareSnapshot === false && !isSaving}>
      {isLoadingSnapshotDialog === false ? (
        <>
          <DialogTitle id="form-dialog-title">{sharedSnapshot.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{sharedSnapshot.description}</DialogContentText>
            <a href={sharedSnapshot.url}>{sharedSnapshot.url}</a>
          </DialogContent>
          <DialogActions>
            <RichTooltip path="shareSnapshot.copyLink">
              <Button onClick={() => updateClipboard(sharedSnapshot.url)} color="primary">
                Copy link
              </Button>
            </RichTooltip>
            <RichTooltip path="shareSnapshot.openInNewTab">
              <Button style={{ width: '175px' }} onClick={openInNewTab} color="primary">
                Open in new tab to test (recommended!)
              </Button>
            </RichTooltip>
            <RichTooltip path="shareSnapshot.close">
              <Button onClick={closeModal} color="secondary">
                Close
              </Button>
            </RichTooltip>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle id="form-dialog-title">Preparing data...</DialogTitle>
          <DialogContent>
            <Grid container alignItems="center" justifyContent="center" className={classes.loading}>
              <Grid item>
                <CircularProgress />
              </Grid>
            </Grid>
          </DialogContent>
        </>
      )}
    </Modal>
  );
});
