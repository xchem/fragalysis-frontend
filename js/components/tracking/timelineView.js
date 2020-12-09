import React, { useState, useRef, memo } from 'react';
import { makeStyles, IconButton, Tooltip, Grid } from '@material-ui/core';
import { Check, Clear, Warning, Favorite, Star } from '@material-ui/icons';
import { actionAnnotation } from '../../reducers/tracking/constants';
import { TimelineEvent } from 'react-event-timeline';
import EditableText from './editableText';
import palette from '../../theme/palette';

const useStyles = makeStyles(theme => ({
  headerGrid: {
    height: '25px'
  },
  grid: {
    height: 'inherit'
  },
  iconButton: {
    padding: '6px'
  },
  timelineEvent: {
    borderBottom: '1px dashed ' + palette.divider,
    paddingBottom: '10px'
  }
}));

const TimelineView = memo(({ data, index }) => {
  const ref = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const classes = useStyles();

  const getActionIcon = data => {
    if (data && data.annotation) {
      switch (data.annotation) {
        case actionAnnotation.CHECK:
          return <Check />;
        case actionAnnotation.CLEAR:
          return <Clear />;
        case actionAnnotation.WARNING:
          return <Warning />;
        case actionAnnotation.FAVORITE:
          return <Favorite />;
        case actionAnnotation.STAR:
          return <Star />;
        default:
          return <Check />;
      }
    } else {
      return <Check />;
    }
  };

  const annotationActions = [
    <IconButton className={classes.iconButton} color={'primary'} onClick={() => {}}>
      <Tooltip title="Check">
        <Check />
      </Tooltip>
    </IconButton>,
    <IconButton className={classes.iconButton} color={'primary'} onClick={() => {}}>
      <Tooltip title="Clear">
        <Clear />
      </Tooltip>
    </IconButton>,
    <IconButton className={classes.iconButton} color={'primary'} onClick={() => {}}>
      <Tooltip title="Warning">
        <Warning />
      </Tooltip>
    </IconButton>,
    <IconButton className={classes.iconButton} color={'primary'} onClick={() => {}}>
      <Tooltip title="Favorite">
        <Favorite />
      </Tooltip>
    </IconButton>,
    <IconButton className={classes.iconButton} color={'primary'} onClick={() => {}}>
      <Tooltip title="Star">
        <Star />
      </Tooltip>
    </IconButton>
  ];

  return (
    <div ref={ref} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <TimelineEvent
        key={index}
        title={
          <div>
            <Grid container justify="flex-start" direction="row" alignItems="center" className={classes.headerGrid}>
              {
                <Grid item xs={8} justify="flex-start" direction="row" alignItems="flex-start">
                  <EditableText text={data.text} identifier={index} />
                </Grid>
              }
              {isHovering && (
                <Grid item container direction="row" justify="flex-end" xs={4} className={classes.grid}>
                  {annotationActions &&
                    annotationActions.map((action, index) => (
                      <Grid item key={index}>
                        {action}
                      </Grid>
                    ))}
                </Grid>
              )}
            </Grid>
          </div>
        }
        createdAt={
          <Grid item justify="flex-start" alignItems="flex-start">
            {new Date(data.timestamp).toLocaleString()}
          </Grid>
        }
        icon={getActionIcon(data)}
        iconColor={palette.primary.main}
        className={classes.timelineEvent}
      ></TimelineEvent>
    </div>
  );
});

TimelineView.displayName = 'TimelineView';
export default TimelineView;
