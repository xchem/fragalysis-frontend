import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import Modal from '../common/Modal';
import { Grid, makeStyles } from '@material-ui/core';
import { Timeline, TimelineEvent } from 'react-event-timeline';
import { Check, Clear } from '@material-ui/icons';
import palette from '../../theme/palette';
import { Panel } from '../common';

const useStyles = makeStyles(theme => ({
  customModal: {
    width: '70%',
    height: '90%'
  },
  customContentModal: {
    height: '100%'
  },
  timelineEvent: {
    borderBottom: '1px dashed ' + palette.divider,
    paddingBottom: '10px'
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
  const actionList = useSelector(state => state.trackingReducers.truck_actions_list);

  if (openModal === undefined) {
    console.log('undefined openModal');
    onModalClose();
  }

  return (
    <Modal
      otherClasses={classes.customModal}
      otherContentClasses={classes.customContentModal}
      open={openModal}
      onClose={() => onModalClose()}
    >
      <Panel bodyOverflow={true} hasHeader={true} title="Action List">
        <Grid container justify="space-between" className={classes.containerExpanded}>
          <div className={classes.divContainer}>
            <div className={classes.divScrollable}>
              <Timeline>
                {actionList.map((data, index) => (
                  <TimelineEvent
                    key={index}
                    title={data.text}
                    createdAt={new Date(data.timestamp).toLocaleString()}
                    icon={data.type.includes('OFF') === true ? <Clear /> : <Check />}
                    iconColor={palette.primary.main}
                    className={classes.timelineEvent}
                  ></TimelineEvent>
                ))}
              </Timeline>
            </div>
          </div>
        </Grid>
      </Panel>
    </Modal>
  );
});
