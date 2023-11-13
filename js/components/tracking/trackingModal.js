import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from '../common/Modal';
import { Grid, makeStyles, IconButton, Tooltip } from '@material-ui/core';
import { Timeline } from 'react-event-timeline';
import { Close } from '@material-ui/icons';
import { Panel } from '../common';
import TimelineView from './timelineView';
import { setProjectTrackingActions } from '../../reducers/tracking/dispatchActions';

const useStyles = makeStyles(theme => ({
  customModal: {
    width: '70%',
    height: '90%'
  },
  customContentModal: {
    height: '100%'
  },

  divContainer: {
    height: '100%',
    width: '100%',
    paddingTop: theme.spacing(1) / 2
  },
  divScrollable: {
    height: '100%',
    width: '100%',
    overflow: 'auto'
  },
  containerExpanded: { height: '100%' }
}));

export const TrackingModal = memo(({ openModal, onModalClose }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const bottomRef = useRef();

  const actionList = useSelector(state => state.trackingReducers.project_actions_list);
  const orderedActionList = (actionList && actionList.sort((a, b) => a.timestamp - b.timestamp)) || [];

  const loadAllActions = useCallback(() => {
    if (openModal === true) {
      dispatch(setProjectTrackingActions());
    }
  }, [dispatch, openModal]);

  const scrollToBottom = () => {
    if (bottomRef.current != null) {
      bottomRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  };

  useEffect(() => {
    loadAllActions();
  }, [loadAllActions]);

  if (openModal === undefined) {
    console.log('undefined openModal');
    onModalClose();
  }

  const actions = [
    <IconButton color={'inherit'} onClick={() => onModalClose()}>
      <Tooltip title="Close">
        <Close />
      </Tooltip>
    </IconButton>
  ];

  return (
    <Modal
      otherClasses={classes.customModal}
      otherContentClasses={classes.customContentModal}
      open={openModal}
      onClose={() => onModalClose()}
    >
      <Panel bodyOverflow={true} hasHeader={true} title="Action List" headerActions={actions}>
        <Grid container justifyContent="space-between" className={classes.containerExpanded}>
          <div className={classes.divContainer}>
            <div className={classes.divScrollable}>
              <Timeline>
                {orderedActionList &&
                  orderedActionList.map((data, index) => {
                    if (data && data != null) {
                      return <TimelineView key={index} data={data} index={index}></TimelineView>;
                    }
                  })}
              </Timeline>
              <div
                ref={el => {
                  bottomRef.current = el;
                  scrollToBottom();
                }}
              ></div>
            </div>
          </div>
        </Grid>
      </Panel>
    </Modal>
  );
});
