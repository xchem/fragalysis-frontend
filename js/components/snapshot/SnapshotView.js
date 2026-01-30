import React, { useContext, useEffect, useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  makeStyles,
  IconButton,
  ButtonBase
} from '@material-ui/core';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { api, METHOD } from '../../utils/api';
import { base_url } from '../routes/constants';
import moment from 'moment';
import { SCREENSHOT_TYPE } from './constants';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { setDontShowShareSnapshot, setSnapshotEditDialogOpen, setSnapshotToBeEdited } from './redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { updateClipboard } from './helpers';
import { TOAST_LEVELS } from '../toast/constants';
import { addToastMessage } from '../../reducers/selection/actions';
import { changeSnapshot, saveAndShareSnapshot } from './redux/dispatchActions';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../nglView/nglProvider';
import RichTooltip from '../tooltip/RichTooltip';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    border: '1px solid #ccc',
    alignItems: 'center',
    // padding: theme.spacing(1),
    // marginBottom: theme.spacing(2),
    padding: 0,
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

const SnapshotView = ({ snapshot }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const snapshotToBeEdited = useSelector(state => state.snapshotReducers.snapshotToBeEdited);
  const isSnapshotEditDialogOpen = useSelector(state => state.snapshotReducers.isSnapshotEditDialogOpen);
  const snapshotsCreatedThisSession = useSelector(state => state.snapshotReducers.snapshotsCreatedThisSession);

  const { nglViewList, getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const [images, setImages] = useState([]);
  const [isStarred, setIsStarred] = useState(snapshot.additional_info?.starred || false);
  const [snapshotTitle, setSnapshotTitle] = useState(snapshot.title || '');

  const [snapshotUpdated, setSnapshotUpdated] = useState(false);

  const isCreatedThisSession = snapshotsCreatedThisSession.some(id => id === snapshot.id);

  const numberOfImages = images.length;

  useEffect(() => {
    if (snapshotUpdated || numberOfImages === 0) {
      api({ url: `${base_url}/api/snapshot_screenshots/?snapshot=${snapshot.id}` }).then(response => {
        setImages(response.data.results || []);
      });
      setSnapshotUpdated(false);
    }
  }, [numberOfImages, snapshot, snapshotUpdated]);

  useEffect(() => {
    if (snapshotToBeEdited?.id === snapshot.id && !isSnapshotEditDialogOpen) {
      setSnapshotTitle(snapshotToBeEdited.title);
      dispatch(setSnapshotToBeEdited(null));
    }
  }, [dispatch, isSnapshotEditDialogOpen, snapshot.id, snapshotToBeEdited]);

  const handleStarClick = () => {
    if (DJANGO_CONTEXT.pk) {
      snapshot.additional_info.starred = !snapshot.additional_info?.starred;
      setIsStarred(!isStarred);
      updateSnapshot();
    }
  };

  const updateSnapshot = () => {
    const snapshotCopy = { ...snapshot };
    snapshotCopy.session_project = snapshotCopy.session_project.id;
    snapshotCopy.author = DJANGO_CONTEXT.pk || null;
    api({
      method: METHOD.PUT,
      url: `${base_url}/api/snapshots/${snapshot.id}/`,
      data: JSON.stringify(snapshotCopy)
    });
  };

  const updateAllOfTheSnapshot = () => {
    dispatch(setDontShowShareSnapshot(true));
    dispatch(saveAndShareSnapshot(nglViewList, false, {}, true, snapshot.id, images, snapshot.session_project.id))
      .then(() => {
        dispatch(addToastMessage({ text: `Snapshot was successfully updated.`, level: TOAST_LEVELS.SUCCESS }));
        setSnapshotUpdated(true);
      })
      .catch(() => {
        dispatch(addToastMessage({ text: `Failed to update snapshot.`, level: TOAST_LEVELS.ERROR }));
      });
  };

  const onRenameClick = () => {
    dispatch(setSnapshotToBeEdited(snapshot));
    dispatch(setSnapshotEditDialogOpen(true));
  };

  const onShareClick = () => {
    const snapshotUrl = snapshot
      ? `${base_url}/viewer/react/projects/${snapshot.session_project.id}/${snapshot.id}/`
      : '';
    updateClipboard(snapshotUrl);
    dispatch(addToastMessage({ text: `Snapshot URL was copied to your clipboard.`, level: TOAST_LEVELS.SUCCESS }));
  };

  const switchToSnapshotClick = () => {
    dispatch(changeSnapshot(snapshot?.session_project.id, snapshot.id, stage));
  };

  return (
    <Card className={classes.root}>
      <div className={classes.thumbnailWrapper}>
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
      </div>

      <CardContent className={classes.content} onClick={switchToSnapshotClick}>
        <Typography variant="subtitle1">{snapshotTitle}</Typography>
        <Typography variant="body2">
          {snapshot?.author ? `${snapshot?.author?.first_name} ${snapshot?.author?.last_name}` : 'Anonymous'}
        </Typography>
        <Typography className={classes.timestamp}>{`${moment
          .utc(snapshot.created)
          .format('YYYY-MM-DD HH:mm')}`}</Typography>
      </CardContent>

      <div className={classes.buttonGroup}>
        <RichTooltip path={DJANGO_CONTEXT.pk || isCreatedThisSession ? 'rename.rename' : 'rename.login'}>
          <span>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={onRenameClick}
              disabled={!DJANGO_CONTEXT.pk && !isCreatedThisSession}
            >
              RENAME
            </Button>
          </span>
        </RichTooltip>
        <RichTooltip path="share">
          <span>
            <Button variant="contained" color="primary" size="small" onClick={onShareClick}>
              SHARE
            </Button>
          </span>
        </RichTooltip>
        <RichTooltip path={DJANGO_CONTEXT.pk || isCreatedThisSession ? 'update.update' : 'update.login'}>
          <span>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={updateAllOfTheSnapshot}
              disabled={!DJANGO_CONTEXT.pk && !isCreatedThisSession}
            >
              UPDATE
            </Button>
          </span>
        </RichTooltip>
      </div>
    </Card>
  );
};

export default SnapshotView;
