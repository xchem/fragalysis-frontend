import React, { useState, useRef, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles, IconButton, Tooltip, Grid, Box, Chip } from '@material-ui/core';
import { Check, Clear, Warning, Favorite, Star } from '@material-ui/icons';
import { actionAnnotation } from '../../reducers/tracking/constants';
import { TimelineEvent } from 'react-event-timeline';
import EditableText from './EditableText';
import palette from '../../theme/palette';
import { updateTrackingActions } from '../../reducers/tracking/dispatchActions';
import { actionType } from '../../reducers/tracking/constants';
import Gallery from 'react-grid-gallery';

const useStyles = makeStyles(theme => ({
  headerGrid: {
    height: '15px'
  },
  grid: {
    height: 'inherit'
  },
  iconButton: {
    padding: '6px',
    paddingTop: '0px'
  },
  timelineEvent: {
    borderBottom: '1px dashed ' + palette.divider,
    paddingBottom: '10px'
  },
  title: {
    position: 'relative',
    paddingLeft: '45px',
    textAlign: 'left',
    fontWeight: 'bold'
  },
  titleMargin: {
    marginRight: '5px'
  }
}));

const TimelineView = memo(({ data, index }) => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);
  let isSelected = currentSnapshotID === data.object_id;

  const ref = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [updatedIcon, setUpdatedIcon] = useState(null);

  const getActionIcon = annotation => {
    if (annotation) {
      switch (annotation) {
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
    <IconButton
      className={classes.iconButton}
      color={'primary'}
      onClick={() => {
        setUpdatedIcon(actionAnnotation.CHECK);
        updateDataAnnotation(actionAnnotation.CHECK);
      }}
    >
      <Tooltip title="Check">
        <Check />
      </Tooltip>
    </IconButton>,
    <IconButton
      className={classes.iconButton}
      color={'primary'}
      onClick={() => {
        setUpdatedIcon(actionAnnotation.CLEAR);
        updateDataAnnotation(actionAnnotation.CLEAR);
      }}
    >
      <Tooltip title="Clear">
        <Clear />
      </Tooltip>
    </IconButton>,
    <IconButton
      className={classes.iconButton}
      color={'primary'}
      onClick={() => {
        setUpdatedIcon(actionAnnotation.WARNING);
        updateDataAnnotation(actionAnnotation.WARNING);
      }}
    >
      <Tooltip title="Warning">
        <Warning />
      </Tooltip>
    </IconButton>,
    <IconButton
      className={classes.iconButton}
      color={'primary'}
      onClick={() => {
        setUpdatedIcon(actionAnnotation.FAVORITE);
        updateDataAnnotation(actionAnnotation.FAVORITE);
      }}
    >
      <Tooltip title="Favorite">
        <Favorite />
      </Tooltip>
    </IconButton>,
    <IconButton
      className={classes.iconButton}
      color={'primary'}
      onClick={() => {
        setUpdatedIcon(actionAnnotation.STAR);
        updateDataAnnotation(actionAnnotation.STAR);
      }}
    >
      <Tooltip title="Star">
        <Star />
      </Tooltip>
    </IconButton>
  ];

  const updateDataText = text => {
    data.text = text;
    dispatch(updateTrackingActions(data));
  };

  const updateDataAnnotation = annotation => {
    data.annotation = annotation;
    dispatch(updateTrackingActions(data));
  };

  const images = [
    {
      src: data.image,
      thumbnail: data.image,
      thumbnailWidth: 0,
      thumbnailHeight: 0,
      caption: data.object_name
    }
  ];

  return (
    <div ref={ref} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      {data.type && data.type === actionType.SNAPSHOT ? (
        <>
          <Grid container justifyContent="flex-start" direction="row" alignItems="center" className={classes.title}>
            {isSelected && (
              <Box xs={2} className={classes.titleMargin} flexShrink={1}>
                <Chip color="primary" size="small" label={`selected snapshot`} />
              </Box>
            )}
            {
              <Box xs={6} flexShrink={1} className={classes.titleMargin}>
                {`${data.text}`}
              </Box>
            }
            {
              <Grid item xs={2}>
                <Gallery
                  images={images}
                  enableImageSelection={false}
                  backdropClosesModal={true}
                  showImageCount={false}
                  lightboxWidth={2048}
                  rowHeight={30}
                />
              </Grid>
            }
          </Grid>
        </>
      ) : (
        <>
          <TimelineEvent
            key={index}
            title={
              <div>
                <Grid container justifyContent="flex-start" direction="row" alignItems="center" className={classes.headerGrid}>
                  {
                    <Grid item xs={8} className={classes.grid}>
                      <EditableText dataText={data.text} index={index} updateText={updateDataText} />
                    </Grid>
                  }
                  {isHovering && (
                    <Grid
                      container
                      item
                      justifyContent="flex-end"
                      direction="row"
                      alignItems="flex-end"
                      xs={4}
                      className={classes.grid}
                    >
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
            createdAt={new Date(data.timestamp).toLocaleString()}
            icon={updatedIcon && updatedIcon != null ? getActionIcon(updatedIcon) : getActionIcon(data.annotation)}
            iconColor={palette.primary.main}
            className={classes.timelineEvent}
          ></TimelineEvent>
        </>
      )}
    </div>
  );
});

TimelineView.displayName = 'TimelineView';
export default TimelineView;
