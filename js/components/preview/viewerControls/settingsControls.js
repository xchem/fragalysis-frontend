import React, { useContext, memo } from 'react';
import { Grid, makeStyles, Slider, Switch, TextField, Typography } from '@material-ui/core';
import { Drawer } from '../../common/Navigation/Drawer';
import { BACKGROUND_COLOR, NGL_PARAMS } from '../../nglView/constants';
import { useDispatch, useSelector } from 'react-redux';
import {
  setNglBckGrndColor,
  setNglClipNear,
  setNglClipFar,
  setNglClipDist,
  setNglFogNear,
  setNglFogFar,
  setIsoLevel,
  setBoxSize,
  setOpacity,
  setContour
} from '../../../reducers/ngl/dispatchActions';
import { NglContext } from '../../nglView/nglProvider';
import { VIEWS } from '../../../constants/constants';
import palette from '../../../theme/palette';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    paddingTop: theme.spacing(1)
  },
  value: {
    width: 224,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  textField: {
    width: 208
  },
  divider: {
    borderTop: '1px dashed ' + palette.dividerDark,
    paddingTop: '15px',
    marginTop: '10px'
  }
}));

export const SettingControls = memo(({ open, onClose }) => {
  const viewParams = useSelector(state => state.nglReducers.viewParams);
  const dispatch = useDispatch();
  const classes = useStyles();

  const { getNglView } = useContext(NglContext);
  const majorView = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
  const summaryView = getNglView(VIEWS.SUMMARY_VIEW) && getNglView(VIEWS.SUMMARY_VIEW).stage;

  const handleStageColor = () => {
    if (viewParams[NGL_PARAMS.backgroundColor] === BACKGROUND_COLOR.white) {
      dispatch(setNglBckGrndColor(BACKGROUND_COLOR.black, majorView, summaryView));
      // dispatch(setNglViewParams(NGL_PARAMS.backgroundColor, BACKGROUND_COLOR.black, majorView, VIEWS.MAJOR_VIEW));
      // dispatch(setNglViewParams(NGL_PARAMS.backgroundColor, BACKGROUND_COLOR.black, summaryView, VIEWS.SUMMARY_VIEW));
    } else {
      dispatch(setNglBckGrndColor(BACKGROUND_COLOR.white, majorView, summaryView));
      // dispatch(setNglViewParams(NGL_PARAMS.backgroundColor, BACKGROUND_COLOR.white, majorView, VIEWS.MAJOR_VIEW));
      // dispatch(setNglViewParams(NGL_PARAMS.backgroundColor, BACKGROUND_COLOR.white, summaryView, VIEWS.SUMMARY_VIEW));
    }
  };

  const handleRepresentation = () => {
    if (viewParams[NGL_PARAMS.contour] === false) {
      dispatch(setContour(true, viewParams[NGL_PARAMS.contour], majorView));
    } else {
      dispatch(setContour(false, viewParams[NGL_PARAMS.contour], majorView));
    }
  };

  return (
    <Drawer title="Settings" open={open} onClose={onClose}>
      <Grid container justify="flex-start" direction="column" className={classes.root} spacing={1}>
        <Grid item container direction="row" justify="space-between">
          <Grid item>
            <Typography variant="body1">Background colour</Typography>
          </Grid>
          <Grid item>
            <Switch
              size="small"
              color="primary"
              checked={viewParams[NGL_PARAMS.backgroundColor] === BACKGROUND_COLOR.white}
              onChange={handleStageColor}
            />
          </Grid>
        </Grid>
        <Grid item container direction="row" justify="space-between">
          <Grid item>
            <Typography variant="body1">Clip near</Typography>
          </Grid>
          <Grid item className={classes.value}>
            <Slider
              value={viewParams[NGL_PARAMS.clipNear]}
              valueLabelDisplay="auto"
              step={1}
              min={0}
              max={100}
              onChange={(e, value) => dispatch(setNglClipNear(value, viewParams[NGL_PARAMS.clipNear], majorView))}
            />
          </Grid>
        </Grid>
        <Grid item container direction="row" justify="space-between">
          <Grid item>
            <Typography variant="body1">Clip far</Typography>
          </Grid>
          <Grid item className={classes.value}>
            <Slider
              value={viewParams[NGL_PARAMS.clipFar]}
              valueLabelDisplay="auto"
              step={1}
              min={0}
              max={100}
              onChange={(e, value) => dispatch(setNglClipFar(value, viewParams[NGL_PARAMS.clipFar], majorView))}
            />
          </Grid>
        </Grid>
        <Grid item container direction="row" justify="space-between">
          <Grid item>
            <Typography variant="body1">Clip dist</Typography>
          </Grid>
          <Grid item className={classes.value}>
            <TextField
              type="number"
              value={viewParams[NGL_PARAMS.clipDist]}
              onChange={e => dispatch(setNglClipDist(e.target.value, viewParams[NGL_PARAMS.clipDist], majorView))}
              className={classes.textField}
            />
          </Grid>
        </Grid>
        <Grid item container direction="row" justify="space-between">
          <Grid item>
            <Typography variant="body1">Fog near</Typography>
          </Grid>
          <Grid item className={classes.value}>
            <Slider
              value={viewParams[NGL_PARAMS.fogNear]}
              valueLabelDisplay="auto"
              step={1}
              min={0}
              max={100}
              onChange={(e, value) => dispatch(setNglFogNear(value, viewParams[NGL_PARAMS.fogNear], majorView))}
            />
          </Grid>
        </Grid>
        <Grid item container direction="row" justify="space-between">
          <Grid item>
            <Typography variant="body1">Fog far</Typography>
          </Grid>
          <Grid item className={classes.value}>
            <Slider
              value={viewParams[NGL_PARAMS.fogFar]}
              valueLabelDisplay="auto"
              step={1}
              min={0}
              max={100}
              onChange={(e, value) => dispatch(setNglFogFar(value, viewParams[NGL_PARAMS.fogFar], majorView))}
            />
          </Grid>
        </Grid>
        <div className={classes.divider}>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">ISO</Typography>
            </Grid>
            <Grid item className={classes.value}>
              <Slider
                value={viewParams[NGL_PARAMS.isolevel]}
                valueLabelDisplay="auto"
                step={2}
                min={-1000}
                max={1000}
                onChange={(e, value) => dispatch(setIsoLevel(value, viewParams[NGL_PARAMS.isolevel], majorView))}
              />
            </Grid>
          </Grid>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">Box size</Typography>
            </Grid>
            <Grid item className={classes.value}>
              <Slider
                value={viewParams[NGL_PARAMS.boxSize]}
                valueLabelDisplay="auto"
                step={1}
                min={0}
                max={100}
                onChange={(e, value) => dispatch(setBoxSize(value, viewParams[NGL_PARAMS.boxSize], majorView))}
              />
            </Grid>
          </Grid>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">Opacity</Typography>
            </Grid>
            <Grid item className={classes.value}>
              <Slider
                value={viewParams[NGL_PARAMS.opacity]}
                valueLabelDisplay="auto"
                step={0.01}
                min={0}
                max={1}
                onChange={(e, value) => dispatch(setOpacity(value, viewParams[NGL_PARAMS.opacity], majorView))}
              />
            </Grid>
          </Grid>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">Surface/wireframe toggle</Typography>
            </Grid>
            <Grid item>
              <Switch
                size="small"
                color="primary"
                checked={viewParams[NGL_PARAMS.contour] === true}
                onChange={handleRepresentation}
              />
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Drawer>
  );
});
