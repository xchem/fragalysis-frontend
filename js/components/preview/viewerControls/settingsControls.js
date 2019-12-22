import React, { useContext, memo } from 'react';
import { Grid, makeStyles, Slider, Switch, TextField, Typography } from '@material-ui/core';
import { Drawer } from '../../common/Navigation/Drawer';
import { BACKGROUND_COLOR, NGL_PARAMS } from '../../nglView/constants';
import { useDispatch, useSelector } from 'react-redux';
import { setNglViewParams } from '../../../reducers/ngl/nglActions';
import { NglContext } from '../../nglView/nglProvider';
import { VIEWS } from '../../../constants/constants';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%'
  },
  value: {
    width: 224,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  textField: {
    width: 208
  }
}));

export const SettingControls = memo(({ open, onClose }) => {
  const viewParams = useSelector(state => state.nglReducers.present.viewParams);
  const dispatch = useDispatch();
  const classes = useStyles();

  const { getNglView } = useContext(NglContext);
  const majorView = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
  const summaryView = getNglView(VIEWS.SUMMARY_VIEW) && getNglView(VIEWS.SUMMARY_VIEW).stage;

  const handleStageColor = () => {
    if (viewParams[NGL_PARAMS.backgroundColor] === BACKGROUND_COLOR.white) {
      dispatch(setNglViewParams(NGL_PARAMS.backgroundColor, BACKGROUND_COLOR.black, majorView));
      dispatch(setNglViewParams(NGL_PARAMS.backgroundColor, BACKGROUND_COLOR.black, summaryView));
    } else {
      dispatch(setNglViewParams(NGL_PARAMS.backgroundColor, BACKGROUND_COLOR.white, majorView));
      dispatch(setNglViewParams(NGL_PARAMS.backgroundColor, BACKGROUND_COLOR.white, summaryView));
    }
  };

  return (
    <Drawer title="Settings" open={open} onClose={onClose}>
      <Grid container justify="flex-start" direction="column" className={classes.root} spacing={1}>
        <Grid item container direction="row" justify="space-between">
          <Grid item>
            <Typography variant="body1">Clip near</Typography>
          </Grid>
          <Grid item className={classes.value}>
            <Slider
              defaultValue={viewParams[NGL_PARAMS.clipNear]}
              valueLabelDisplay="auto"
              step={1}
              min={0}
              max={100}
              onChange={(e, value) => dispatch(setNglViewParams(NGL_PARAMS.clipNear, value, majorView))}
            />
          </Grid>
        </Grid>
        <Grid item container direction="row" justify="space-between">
          <Grid item>
            <Typography variant="body1">Clip far</Typography>
          </Grid>
          <Grid item className={classes.value}>
            <Slider
              defaultValue={viewParams[NGL_PARAMS.clipFar]}
              valueLabelDisplay="auto"
              step={1}
              min={0}
              max={100}
              onChange={(e, value) => dispatch(setNglViewParams(NGL_PARAMS.clipFar, value, majorView))}
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
              onChange={e => dispatch(setNglViewParams(NGL_PARAMS.clipDist, e.target.value, majorView))}
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
              defaultValue={viewParams[NGL_PARAMS.fogNear]}
              valueLabelDisplay="auto"
              step={1}
              min={0}
              max={100}
              onChange={(e, value) => dispatch(setNglViewParams(NGL_PARAMS.fogNear, value, majorView))}
            />
          </Grid>
        </Grid>
        <Grid item container direction="row" justify="space-between">
          <Grid item>
            <Typography variant="body1">Fog far</Typography>
          </Grid>
          <Grid item className={classes.value}>
            <Slider
              defaultValue={viewParams[NGL_PARAMS.fogFar]}
              valueLabelDisplay="auto"
              step={1}
              min={0}
              max={100}
              onChange={(e, value) => dispatch(setNglViewParams(NGL_PARAMS.fogFar, value, majorView))}
            />
          </Grid>
        </Grid>
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
      </Grid>
    </Drawer>
  );
});
