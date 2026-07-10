/**
 * This is a modal window for quality status overview
 */

import React, { memo, useContext, useState } from 'react';
import { GridLegacy as Grid, IconButton, Popover, TextField, Typography } from '@mui/material';
import { makeStyles } from '../../../../../ui/styles';
import { QualityStatusLight } from './QualityStatusLight';
import { QUALITY_STATUSES } from './constants';
import { Check } from '@mui/icons-material';
import classNames from 'classnames';
import { addPeerReviewStatus } from './api/apiActions';
import { useDispatch } from 'react-redux';
import { ToastContext } from '../../../../toast';
import RichTooltip from '../../../../tooltip/RichTooltip';

const useStyles = makeStyles(theme => ({
  root: {
    padding: 16,
    minWidth: 260,
    '& $gridItem': {
      padding: 4
    }
  },
  gridItem: {
    // padding: 4
  },
  paper: {
    overflow: 'hidden'
  },
  highlight: {
    boxShadow: '0px 0px 0px 2px #ccc',
    borderRadius: 5
  },
  statusLight: {
    cursor: 'pointer'
  }
}));

export const PeerReviewModal = memo(({ openDialog, onDialogClose, anchorEl, site_observation }) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [comment, setComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(QUALITY_STATUSES.NONE);

  const { toastInfo } = useContext(ToastContext);

  const addPeerReviewStatusHandler = () => {
    dispatch(addPeerReviewStatus({ status: selectedStatus, comment: comment, site_observation: site_observation }));
    toastInfo('Peer review was added', { autoHideDuration: 5000 });
    onDialogClose();
  };

  return (
    <Popover
      // id={id}
      open={openDialog}
      anchorEl={anchorEl}
      onClose={onDialogClose}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'right'
      }}
      classes={{ paper: classes.paper }}
    >
      <Grid container justifyContent="flex-start" direction="column" spacing={2} className={classes.root}>
        <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Grid className={classes.gridItem} item xs={4}>
            <Typography variant="body1">Set status:</Typography>
          </Grid>
          {Object.values(QUALITY_STATUSES).map((status, index) => (
            <Grid
              key={index}
              item
              xs
              className={classNames(classes.gridItem, classes.statusLight)}
              onClick={() => setSelectedStatus(status)}
            >
              <QualityStatusLight
                size={16}
                status={status}
                props={{ className: classNames({ [classes.highlight]: status === selectedStatus }) }}
              />
            </Grid>
          ))}
          <RichTooltip path="addPeerReview">
            <Grid className={classes.gridItem} item xs>
              <IconButton size="small" onClick={addPeerReviewStatusHandler} disabled={!comment}>
                <Check />
              </IconButton>
            </Grid>
          </RichTooltip>
        </Grid>
        <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Grid className={classes.gridItem} item xs={5}>
            <Typography variant="body1">Add comment:</Typography>
          </Grid>
          <Grid className={classes.gridItem} item xs>
            <TextField
              value={comment}
              onChange={event => setComment(event.target.value)}
              placeholder="write a comment"
            />
          </Grid>
        </Grid>
      </Grid>
    </Popover>
  );
});
