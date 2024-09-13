import { Button, Grid, IconButton, Popper, Tooltip, Typography, makeStyles } from '@material-ui/core';
import React, { forwardRef } from 'react';
import { Panel } from '../common';
import { Close } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import {
  setAskLockCompoundsQuestion,
  setAskLockSelectedCompoundsQuestion,
  setIsOpenLockVisibleCompoundsDialogGlobal,
  setIsOpenLockVisibleCompoundsDialogLocal
} from './redux/actions';
import {
  getAllVisibleButNotLockedCompounds,
  getAllVisibleButNotLockedSelectedCompounds,
  lockCompounds,
  lockSelectedCompounds
} from './redux/dispatchActions';

const useStyles = makeStyles(theme => ({
  paper: {
    width: 472,
    height: 120,
    overflowY: 'hidden'
  },
  buttonYes: {
    backgroundColor: '#00D100',
    color: 'white',
    marginRight: theme.spacing(2)
  },
  buttonNo: {
    backgroundColor: '#DC143C',
    color: 'white'
  }
}));

export const LockVisibleCompoundsDialog = forwardRef(
  ({ open = false, anchorEl, datasetId, currentCmp, isSelectedCompounds = false }, ref) => {
    const id = open ? 'simple-popover-lock-visible-compounds' : undefined;
    const classes = useStyles();
    const dispatch = useDispatch();

    const handleYesClick = () => {
      if (!isSelectedCompounds) {
        if (currentCmp) {
          let cmpsToLock = dispatch(getAllVisibleButNotLockedCompounds(datasetId));
          if (cmpsToLock && cmpsToLock.length > 0) {
            dispatch(lockCompounds(datasetId, cmpsToLock, currentCmp));
          }
        } else {
          let cmpsToLock = dispatch(getAllVisibleButNotLockedCompounds(datasetId));
          //we need to skip first element if we came here from global arrows
          if (cmpsToLock && cmpsToLock.length > 0) {
            const firstCmp = cmpsToLock[0];
            dispatch(lockCompounds(datasetId, cmpsToLock, firstCmp));
          }
        }
      } else {
        if (currentCmp) {
          let cmpsToLock = dispatch(getAllVisibleButNotLockedSelectedCompounds());
          if (cmpsToLock && cmpsToLock.length > 0) {
            dispatch(lockSelectedCompounds(cmpsToLock, { datasetID: currentCmp.computed_set, molecule: currentCmp }));
          }
        } else {
          let cmpsToLock = dispatch(getAllVisibleButNotLockedSelectedCompounds());
          if (cmpsToLock && cmpsToLock.length > 0) {
            const firstCmp = cmpsToLock[0];
            dispatch(lockSelectedCompounds(cmpsToLock, firstCmp));
          }
        }
      }

      dispatch(setIsOpenLockVisibleCompoundsDialogLocal(false));
      dispatch(setIsOpenLockVisibleCompoundsDialogGlobal(false));
    };

    const handleNoClick = () => {
      if (!isSelectedCompounds) {
        dispatch(setAskLockCompoundsQuestion(false));
      } else {
        dispatch(setAskLockSelectedCompoundsQuestion(false));
      }
      dispatch(setIsOpenLockVisibleCompoundsDialogLocal(false));
      dispatch(setIsOpenLockVisibleCompoundsDialogGlobal(false));
    };

    return (
      <Popper id={id} open={open} anchorEl={anchorEl} placement="left-start" ref={ref}>
        <Panel
          hasHeader
          secondaryBackground
          title="Lock visible compounds"
          className={classes.paper}
          headerActions={[
            <Tooltip title="Close dialog">
              <IconButton
                color="inherit"
                className={classes.headerButton}
                onClick={() => {
                  dispatch(setIsOpenLockVisibleCompoundsDialogLocal(false));
                  dispatch(setIsOpenLockVisibleCompoundsDialogGlobal(false));
                }}
              >
                <Close />
              </IconButton>
            </Tooltip>
          ]}
        >
          <Grid container direction="column">
            <Grid item>
              <Typography>
                Do you want to lock visible compounds? Otherwise they will disapear from the view.
              </Typography>
            </Grid>
            <Grid item container direction="row" justifyContent="flex-end">
              <Grid item>
                <Button className={classes.buttonYes} onClick={handleYesClick}>
                  Yes
                </Button>
              </Grid>
              <Grid>
                <Button className={classes.buttonNo} onClick={handleNoClick}>
                  No
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Panel>
      </Popper>
    );
  }
);
