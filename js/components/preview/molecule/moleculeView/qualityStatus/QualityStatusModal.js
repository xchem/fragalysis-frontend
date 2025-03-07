/**
 * This is a modal window for quality status overview
 */

import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, Divider, Grid, IconButton, makeStyles, Popover, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from '@material-ui/core';
import { QualityStatusLight } from './QualityStatusLight';
import { PeerReviewModal } from './PeerReviewModal';
import { QUALITY_STATUSES } from './constants';
import { Add, Check } from '@material-ui/icons';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { addMainStatus } from './api/apiActions';
import { ToastContext } from '../../../../toast';
import { DJANGO_CONTEXT } from '../../../../../utils/djangoContext';

const useStyles = makeStyles(theme => ({
  root: {
    padding: 16,
    minWidth: 276,
    '& $gridItem': {
      padding: 4
    }
  },
  gridItem: {
    //
  },
  commentTd: {
    maxWidth: 125,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  posePropertiesTableCell: {
    padding: '4px 6px'
  },
  posePropertiesTable: {
    // backgroundColor: theme.palette.primary.light
  },
  highlight: {
    boxShadow: '0px 0px 0px 2px #ccc',
    borderRadius: 5
  },
  statusLight: {
    cursor: 'pointer'
  },
  mainStatusRow: {
    '& td': {
      fontWeight: 'bold'
    }
  },
  lightsTableCell: {
    display: 'flex',
    alignItems: 'center',
    color: '#ccc'
  },
  mainStatusLight: {
    margin: '0 auto'
  }
}));

export const QualityStatusModal = memo(({ openModal, onModalClose, statuses, latestPeerReviews, site_observation, anchorElQualityStatus }) => {

  const getMainQualityStatusObject = useCallback(() => {
    return statuses?.find(status => status.main_status === true);
  }, [statuses]);

  const dispatch = useDispatch();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(getMainQualityStatusObject()?.status || QUALITY_STATUSES.NONE);

  const { toastInfo } = useContext(ToastContext);

  const getPeerReviews = useCallback(() => {
    return statuses?.filter(status => status.main_status === false);
  }, [statuses]);

  const getDateDifference = useCallback((date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.abs(now - then);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${(days === 1 ? '' : 's')} ago`;
    if (hours > 0) return `${hours} hour${(hours === 1 ? '' : 's')} ago`;
    return `${minutes} minute${(minutes === 1 ? '' : 's')} ago`;
  }, []);

  const addPeerReview = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const getStatusCount = useCallback((type) => {
    let count = 0;
    latestPeerReviews.forEach(status => {
      if (status.status === type) count++;
    });
    return count;
  }, [latestPeerReviews]);

  const addMainStatusHandler = () => {
    dispatch(addMainStatus({ status: selectedStatus, site_observation: site_observation }));
    toastInfo('Main status was updated', { autoHideDuration: 5000 });
  };

  useEffect(() => {
    if (getMainQualityStatusObject()) {
      setSelectedStatus(getMainQualityStatusObject().status);
    }
  }, [getMainQualityStatusObject]);

  useEffect(() => {
    if (statuses) {
      const userMap = {};
      const userMainMap = {};
      // for (let index = 0; index < statuses.length; index++) {
      //   const status = statuses[index];

      // }
      statuses.forEach((status, index) => {
        if (status.main_status === false) {
          if (status.user in userMap) {
            statuses[userMap[status.user]].previous_status = status;
          }
          userMap[status.user] = index;
        } else {
          if (status.user in userMainMap) {
            statuses[userMainMap[status.user]].previous_status = status;
          }
          userMainMap[status.user] = index;
        }
      });
    }
  }, [statuses]);

  return (
    <Popover
      // id={id}
      open={openModal}
      anchorEl={anchorElQualityStatus}
      onClose={onModalClose}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'right'
      }}
      classes={{ paper: classes.paper }}
    >
      {/* <Dialog open={openModal} onClose={onModalClose} > */}
      <DialogContent dividers className={classes.root}>
        <Grid container justifyContent="flex-start" direction="column" spacing={2}>
          <Grid item container direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid className={classes.gridItem} item xs={2}>
              <QualityStatusLight size={18} status={getMainQualityStatusObject()?.status} className={classes.mainStatusLight} />
            </Grid>
            {DJANGO_CONTEXT.pk && <>
              <Grid className={classes.gridItem} item xs={4}>
                <Typography variant="body1">Set status:</Typography>
              </Grid>
              {Object.values(QUALITY_STATUSES).map((status, index) => (
                <Grid key={index} item xs={1}
                  className={classNames(classes.gridItem, classes.statusLight)}
                  onClick={() => setSelectedStatus(status)}
                >
                  <QualityStatusLight size={16} status={status} className={classNames({ [classes.highlight]: status === selectedStatus })} />
                </Grid>
              ))}
              <Tooltip title={'Set main status'}>
                <Grid className={classes.gridItem} item xs={1}>
                  <IconButton size="small" onClick={addMainStatusHandler} disabled={selectedStatus === getMainQualityStatusObject()?.status}>
                    <Check />
                  </IconButton>
                </Grid>
              </Tooltip>
            </>}
          </Grid>
          <Divider />
          <Grid item container direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
            <Grid className={classes.gridItem} item xs={4}>
              <Typography variant="body1">Peer review:</Typography>
            </Grid>
            {Object.values(QUALITY_STATUSES).map((status, index) => {
              const count = getStatusCount(status);
              return count > 0 && (<Grid key={index} item container direction="row" alignItems="center" xs={2} className={classes.gridItem}>
                <Grid className={classes.gridItem} item xs={6}>
                  <QualityStatusLight size={15} status={status} />
                </Grid>
                <Grid className={classes.gridItem} item xs={6}>
                  <Typography variant="body1">{count}</Typography>
                </Grid>
              </Grid>)
            })}
            {DJANGO_CONTEXT.pk &&
              <Grid className={classes.gridItem} item xs>
                <Tooltip title={'Add peer review'}>
                  <IconButton size="small" onClick={addPeerReview}>
                    <Add />
                  </IconButton>
                </Tooltip>
                <PeerReviewModal openDialog={Boolean(anchorEl)} onDialogClose={() => setAnchorEl(null)} anchorEl={anchorEl} site_observation={site_observation} />
              </Grid>
            }
          </Grid>
          <Divider />
          <Table className={classes.posePropertiesTable}>
            <TableBody>
              {statuses?.map((status, index) => {
                return <TableRow key={index} className={classNames({ [classes.mainStatusRow]: status.main_status })}>
                  <TableCell className={classNames(classes.posePropertiesTableCell, classes.lightsTableCell)}>
                    <QualityStatusLight size={15} status={status.previous_status?.status || QUALITY_STATUSES.NONE} />
                    {"➜"}
                    <QualityStatusLight size={15} status={status.status} />
                  </TableCell>
                  <Tooltip title={status.username ?? 'no username'}>
                    <TableCell className={classes.posePropertiesTableCell}>{status.user ? `${status.first_name} ${status.last_name}` : ''}</TableCell>
                  </Tooltip>
                  <TableCell className={classes.posePropertiesTableCell}>{getDateDifference(status.timestamp)}</TableCell>
                  <Tooltip title={status.comment}>
                    <TableCell className={classNames(classes.posePropertiesTableCell, classes.commentTd)}>{status.comment}</TableCell>
                  </Tooltip>
                </TableRow>
              })}
            </TableBody>
          </Table>
        </Grid>
      </DialogContent>
    </Popover>
  );
});
