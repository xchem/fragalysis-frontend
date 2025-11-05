import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  makeStyles,
  Tooltip
} from '@material-ui/core';
import moment from 'moment';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    border: '1px solid #ccc',
    alignItems: 'center',
    // padding: theme.spacing(1),
    // marginBottom: theme.spacing(2),
    padding: 0,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    marginBottom: 0,
    borderRadius: 8,
    '& .MuiCardContent-root': {
      padding: 0
    }
  },
  thumbnailWrapper: {
    position: 'relative',
    width: 76,
    height: 76,
    marginRight: theme.spacing(2),
    borderRadius: 4,
    overflow: 'hidden'
  },
  starIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    color: '#fbc02d',
    padding: 4
  },
  media: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  content: {
    flex: 1
  },
  timestamp: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(2),
    '& button': {
      // marginBottom: theme.spacing(1),
      marginBottom: 0,
      minWidth: 80
    }
  }
}));

export const PlotlyItem = ({ item, onShowClick }) => {

  const classes = useStyles();

  // useEffect(() => {
  //   if (snapshotUpdated || numberOfImages === 0) {
  //     api({ url: `${base_url}/api/snapshot_screenshots/?snapshot=${snapshot.id}` }).then(response => {
  //       setImages(response.data.results || []);
  //     });
  //     setSnapshotUpdated(false);
  //   }
  // }, [numberOfImages, snapshot, snapshotUpdated]);

  // // id, title upload_time, plotly_data, target, project, author, identifier

  return (
    <Card className={classes.root}>
      {/* <div className={classes.thumbnailWrapper}>
        {(DJANGO_CONTEXT.pk || snapshot.additional_info?.starred) && (
          <IconButton className={classes.starIcon} onClick={handleStarClick}>
            {snapshot.additional_info?.starred ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
        )}
        <ButtonBase onClick={switchToSnapshotClick} className={classes.media}>
          <CardMedia
            component="img"
            alt="Thumbnail"
            image={images.find(i => i.screenshot_type === SCREENSHOT_TYPE.NGL_SCREEN)?.screenshot}
            className={classes.media}
          />
        </ButtonBase>
      </div> */}

      <CardContent className={classes.content} onClick={onShowClick}>
        <Typography variant="subtitle1">"{item.title}"</Typography>
        <Typography variant="body2">
          {item.author ? `${item.author.first_name} ${item.author.last_name}` : 'Anonymous'}, {`${moment
            .utc(item.upload_time)
            .format('YYYY-MM-DD HH:mm')}`}
          {/* {item.author ? `${item.author.first_name} ${item.author.last_name}` : 'Anonymous'} */}
        </Typography>
      </CardContent>

      <div className={classes.buttonGroup}>
        <Tooltip title={'Show this graph'}>
          <span>
            <Button variant="contained" color="primary" size="small" onClick={onShowClick}>
              SHOW
            </Button>
          </span>
        </Tooltip>
      </div>
    </Card>
  );
};
