import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import Modal from '../common/Modal';
import { makeStyles, Typography } from '@material-ui/core';
import { Timeline, TimelineEvent } from 'react-event-timeline';
import { Check } from '@material-ui/icons';
import palette from '../../theme/palette';

const useStyles = makeStyles(theme => ({
  customModal: {
    width: '70%',
    height: '90%',
    overflow: 'scroll'
  },
  timelineEvent: {
    borderBottom: '1px dashed ' + palette.divider,
    paddingBottom: '10px'
  }
}));

export const TrackingModal = memo(({ openModal, onModalClose }) => {
  const classes = useStyles();
  const actionList = useSelector(state => state.trackingReducers.truck_actions_list);

  if (openModal === undefined) {
    console.log('undefined openModal');
    onModalClose();
  }

  return (
    <Modal otherClasses={classes.customModal} open={openModal} onClose={() => onModalClose()}>
      <Typography variant="h5">Action list</Typography>
      <Timeline>
        {actionList.map((data, index) => (
          <TimelineEvent
            key={index}
            title={data.text}
            createdAt={new Date(data.timestamp).toLocaleString()}
            icon={<Check />}
            iconColor={palette.primary.main}
            className={classes.timelineEvent}
          ></TimelineEvent>
        ))}
      </Timeline>
    </Modal>
  );
});
