import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import Modal from '../../../components/common/Modal';
import { makeStyles, Typography } from '@material-ui/core';
import { Timeline, TimelineEvent } from 'react-event-timeline';
import { Check } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
  customModal: {
    width: '90%',
    height: '90%',
    backgroundColor: '#ffffff',
    overflow: scroll
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
          ></TimelineEvent>
        ))}
      </Timeline>
    </Modal>
  );
});
