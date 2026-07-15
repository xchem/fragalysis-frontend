import { GridLegacy as Grid, IconButton, Popover, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { makeStyles } from '../../../../../ui/styles';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QualityStatusLight } from './QualityStatusLight';
import { useSelector } from 'react-redux';
import { QUALITY_STATUS_COLORS, QUALITY_STATUSES } from './constants';
import { MoreHoriz } from '@mui/icons-material';
import { QualityStatusModal } from './QualityStatusModal';
import RichTooltip from '../../../../tooltip/RichTooltip';
import { TooltipPathProvider } from '../../../../tooltip/TooltipPathContext';

const useStyles = makeStyles(theme => ({
  posePropertiesTable: {
    pointerEvents: 'auto'
  },
  posePropertiesTableCell: {
    padding: 4
  },
  wrapper: {
    position: 'relative',
    height: '100%',
    width: '100%'
  },
  statusTrigger: {
    position: 'absolute',
    top: 0,
    left: 2,
    height: 17,
    width: 17,
    cursor: 'pointer'
  },
  pizza: {
    height: 17,
    width: 17,
    borderRadius: '50%',
    position: 'absolute'
  },
  pizzaLight: {
    position: 'absolute',
    top: 1,
    left: 1
  }
}));

export const QualityStatusWrapper = memo(({ data }) => {
  const allStatuses = useSelector(state => state.apiReducers.quality_statuses);
  const classes = useStyles();

  // These values are rendered per row; derive them without scheduling passive updates.
  const qualityStatuses = useMemo(
    () =>
      allStatuses.filter(
        status => status.site_observation === data.main_site_observation && status.comment !== 'Created on load'
      ),
    [allStatuses, data.main_site_observation]
  );

  const latestPeerReviews = useMemo(() => {
    const userMap = {};
    qualityStatuses.forEach(status => {
      if (!(status.user in userMap) && status.main_status === false) {
        userMap[status.user] = status;
      }
    });
    return Object.values(userMap);
  }, [qualityStatuses]);

  const getMainQualityStatusObject = useCallback(() => {
    return qualityStatuses?.find(status => status.main_status === true);
  }, [qualityStatuses]);

  const mainQualityStatus = useMemo(() => {
    const status = getMainQualityStatusObject() ? getMainQualityStatusObject().status : QUALITY_STATUSES.OTHER;
    return status;
  }, [getMainQualityStatusObject]);

  const getStatusCount = useCallback(
    type => {
      let count = 0;
      latestPeerReviews.forEach(status => {
        if (status.status === type) count++;
      });
      return count;
    },
    [latestPeerReviews]
  );

  const pizzaGradient = useMemo(() => {
    let gradient = '';
    let latest = 0;
    const totalReviews = latestPeerReviews.length;
    Object.values(QUALITY_STATUSES).map(status => {
      const count = getStatusCount(status);
      if (count > 0) {
        const current = latest + (count / totalReviews) * 100;
        gradient += `${QUALITY_STATUS_COLORS[status]} ${latest}% ${current}%, `;
        latest = current;
      }
    });
    // remove trailing comma and space
    gradient = gradient.slice(0, -2);
    return gradient;
  }, [getStatusCount, latestPeerReviews.length]);

  const statusLightDivRef = useRef(null);
  const closePopoverTimerRef = useRef(null);
  const qualityStatusAnchorRef = useRef(null);
  const [anchorElModal, setAnchorElModal] = useState(null);
  const [anchorElQualityStatus, setAnchorElQualityStatus] = useState(null);
  const [tableIsOpen, setTableIsOpen] = useState(false);

  const clearClosePopoverTimer = useCallback(() => {
    if (closePopoverTimerRef.current !== null) {
      window.clearTimeout(closePopoverTimerRef.current);
      closePopoverTimerRef.current = null;
    }
  }, []);

  const closeSummaryPopover = useCallback(() => {
    clearClosePopoverTimer();
    setAnchorElModal(null);
    setTableIsOpen(false);
  }, [clearClosePopoverTimer]);

  useEffect(() => {
    closeSummaryPopover();
    qualityStatusAnchorRef.current = null;
    setAnchorElQualityStatus(null);
  }, [closeSummaryPopover, data.id, data.main_site_observation]);

  useEffect(() => {
    return () => clearClosePopoverTimer();
  }, [clearClosePopoverTimer]);

  const handleEditDialogOpen = useCallback(event => {
    clearClosePopoverTimer();
    qualityStatusAnchorRef.current = event.currentTarget;
    setAnchorElQualityStatus(event.currentTarget);
  }, [clearClosePopoverTimer]);

  const handleEditDialogOpenFromLight = useCallback(event => {
    clearClosePopoverTimer();
    qualityStatusAnchorRef.current = event.currentTarget;
    setAnchorElModal(statusLightDivRef.current || event.currentTarget);
    setAnchorElQualityStatus(event.currentTarget);
  }, [clearClosePopoverTimer]);

  const handleStatusMouseEnter = event => {
    clearClosePopoverTimer();
    setAnchorElModal(event.currentTarget);
  };

  const handleStatusMouseLeave = () => {
    clearClosePopoverTimer();
    closePopoverTimerRef.current = window.setTimeout(() => {
      if (!qualityStatusAnchorRef.current) {
        closeSummaryPopover();
      }
    }, 100);
  };

  const handleQualityStatusSummaryTooltipEnter = useCallback(() => {
    clearClosePopoverTimer();
    setTableIsOpen(true);
  }, [clearClosePopoverTimer]);

  const handleQualityStatusSummaryTooltipLeave = useCallback(() => {
    setTableIsOpen(false);
    if (!Boolean(anchorElQualityStatus)) {
      closeSummaryPopover();
    }
  }, [anchorElQualityStatus, closeSummaryPopover]);

  const handleModalPopoverClose = () => {
    closeSummaryPopover();
  };
  const handleModalClose = () => {
    handleModalPopoverClose();
    qualityStatusAnchorRef.current = null;
    setAnchorElQualityStatus(null);
  };

  const popoverOpen = Boolean(anchorElModal) || tableIsOpen;

  const getQualityStatusSummaryTooltip = useCallback(() => {
    return (
      <Table
        className={classes.posePropertiesTable}
        onMouseLeave={handleQualityStatusSummaryTooltipLeave}
        onMouseEnter={handleQualityStatusSummaryTooltipEnter}
      >
        <TableBody>
          <TableRow>
            <RichTooltip
              path={getMainQualityStatusObject()?.user ? `user.userName` : `user.noUser`}
              values={{
                user: getMainQualityStatusObject()?.user
                  ? `${getMainQualityStatusObject().first_name} ${getMainQualityStatusObject().last_name}`
                  : ''
              }}
            >
              <TableCell className={classes.posePropertiesTableCell}>
                <QualityStatusLight status={mainQualityStatus} />
              </TableCell>
            </RichTooltip>
            <TableCell className={classes.posePropertiesTableCell}>:</TableCell>
            {latestPeerReviews.map((status, index) => {
              return (
                <RichTooltip
                  key={index}
                  path={status.user ? `user.userName` : `user.noUser`}
                  values={{
                    user: status.user ? `${status.first_name} ${status.last_name}` : ''
                  }}
                >
                  <TableCell className={classes.posePropertiesTableCell}>
                    <QualityStatusLight status={status.status} />
                  </TableCell>
                </RichTooltip>
              );
            })}
            <TableCell className={classes.posePropertiesTableCell}>
              <RichTooltip path="addReviews" title={'Add reviews'}>
                <IconButton size="small" onClick={handleEditDialogOpen}>
                  <MoreHoriz />
                </IconButton>
              </RichTooltip>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }, [
    latestPeerReviews,
    handleEditDialogOpen,
    getMainQualityStatusObject,
    mainQualityStatus,
    classes.posePropertiesTable,
    classes.posePropertiesTableCell,
    handleQualityStatusSummaryTooltipEnter,
    handleQualityStatusSummaryTooltipLeave
  ]);

  return (
    <Grid item className={classes.wrapper}>
      <div
        ref={statusLightDivRef}
        className={classes.statusTrigger}
        onMouseEnter={handleStatusMouseEnter}
        onMouseLeave={handleStatusMouseLeave}
      >
        <div style={{ background: `conic-gradient(${pizzaGradient})` }} className={classes.pizza}></div>
        <QualityStatusLight
          status={mainQualityStatus}
          props={{
            className: classes.pizzaLight,
            onClick: handleEditDialogOpenFromLight
          }}
        />
      </div>
      <Popover
        id="mouse-over-popover"
        style={{ pointerEvents: 'none' }}
        open={popoverOpen}
        anchorEl={anchorElModal}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left'
        }}
        onClose={handleModalPopoverClose}
        disableRestoreFocus
      >
        <TooltipPathProvider path="summaryTooltip">{getQualityStatusSummaryTooltip()}</TooltipPathProvider>
      </Popover>
      <QualityStatusModal
        openModal={Boolean(anchorElQualityStatus)}
        onModalClose={handleModalClose}
        statuses={qualityStatuses}
        latestPeerReviews={latestPeerReviews}
        site_observation={data.main_site_observation}
        anchorElQualityStatus={anchorElQualityStatus}
      />
    </Grid>
  );
});
