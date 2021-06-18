import React, { useContext, memo } from 'react';
import { Grid, makeStyles, Slider, Switch, TextField, Typography } from '@material-ui/core';
import { ColorLens } from '@material-ui/icons';
import { Drawer } from '../../common/Navigation/Drawer';
import { BACKGROUND_COLOR, NGL_PARAMS, COMMON_PARAMS } from '../../nglView/constants';
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
  setContour,
  setWarningIcon,
  setElectronDesityMapColor
} from '../../../reducers/ngl/dispatchActions';
import { NglContext } from '../../nglView/nglProvider';
import { VIEWS } from '../../../constants/constants';
import palette from '../../../theme/palette';
import { ColorPicker } from '../../common/Components/ColorPicker';
import { InputFieldAvatar } from '../../projects/projectModal/inputFieldAvatar';
import { Field } from 'formik';
import { MAP_TYPE } from '../../../reducers/ngl/constants';

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
  },
  mapType: {
    textAlign: 'center'
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

  const handleRepresentation = mapType => {
    if (viewParams[NGL_PARAMS[`contour${mapType}`]] === false) {
      dispatch(setContour(mapType, true, viewParams[NGL_PARAMS[`contour${mapType}`]], majorView));
    } else {
      dispatch(setContour(mapType, false, viewParams[NGL_PARAMS[`contour${mapType}`]], majorView));
    }
  };

  const handleWarningIcon = () => {
    if (viewParams[COMMON_PARAMS.warningIcon] === false) {
      dispatch(setWarningIcon(true, viewParams[COMMON_PARAMS.warningIcon]));
    } else {
      dispatch(setWarningIcon(false, viewParams[COMMON_PARAMS.warningIcon]));
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
          <Grid item container>
            <Grid item xs={12}>
              <Typography variant="body1" className={classes.mapType}>
                EVENT MAP
              </Typography>
            </Grid>
          </Grid>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">ISO</Typography>
            </Grid>
            <Grid item className={classes.value}>
              <Slider
                value={viewParams[NGL_PARAMS.isolevel_DENSITY]}
                valueLabelDisplay="auto"
                step={1}
                min={-100}
                max={100}
                onChange={(e, value) =>
                  dispatch(setIsoLevel(MAP_TYPE.event, value, viewParams[NGL_PARAMS.isolevel_DENSITY], majorView))
                }
              />
            </Grid>
          </Grid>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">Box size</Typography>
            </Grid>
            <Grid item className={classes.value}>
              <Slider
                value={viewParams[NGL_PARAMS.boxSize_DENSITY]}
                valueLabelDisplay="auto"
                step={1}
                min={0}
                max={100}
                onChange={(e, value) =>
                  dispatch(setBoxSize(MAP_TYPE.event, value, viewParams[NGL_PARAMS.boxSize_DENSITY], majorView))
                }
              />
            </Grid>
          </Grid>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">Opacity</Typography>
            </Grid>
            <Grid item className={classes.value}>
              <Slider
                value={viewParams[NGL_PARAMS.opacity_DENSITY]}
                valueLabelDisplay="auto"
                step={0.01}
                min={0}
                max={1}
                onChange={(e, value) =>
                  dispatch(setOpacity(MAP_TYPE.event, value, viewParams[NGL_PARAMS.opacity_DENSITY], majorView))
                }
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
                checked={viewParams[NGL_PARAMS.contour_DENSITY] === true}
                onChange={(e, value) => handleRepresentation(MAP_TYPE.event)}
              />
            </Grid>
          </Grid>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">Colour</Typography>
            </Grid>
            <Grid item>
              <Grid item xs={10} className={classes.input}></Grid>
              <Grid item xs={2} className={classes.input}>
                <ColorPicker
                  selectedColor={viewParams[NGL_PARAMS.color_DENSITY]}
                  setSelectedColor={value =>
                    dispatch(
                      setElectronDesityMapColor(MAP_TYPE.event, value, viewParams[NGL_PARAMS.color_DENSITY], majorView)
                    )
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </div>
        <div className={classes.divider}>
          <Grid item container>
            <Grid item xs={12}>
              <Typography variant="body1" className={classes.mapType}>
                SIGMAA MAP
              </Typography>
            </Grid>
          </Grid>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">ISO</Typography>
            </Grid>
            <Grid item className={classes.value}>
              <Slider
                value={viewParams[NGL_PARAMS.isolevel_DENSITY_MAP_sigmaa]}
                valueLabelDisplay="auto"
                step={1}
                min={-100}
                max={100}
                onChange={(e, value) =>
                  dispatch(
                    setIsoLevel(MAP_TYPE.sigmaa, value, viewParams[NGL_PARAMS.isolevel_DENSITY_MAP_sigmaa], majorView)
                  )
                }
              />
            </Grid>
          </Grid>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">Box size</Typography>
            </Grid>
            <Grid item className={classes.value}>
              <Slider
                value={viewParams[NGL_PARAMS.boxSize_DENSITY_MAP_sigmaa]}
                valueLabelDisplay="auto"
                step={1}
                min={0}
                max={100}
                onChange={(e, value) =>
                  dispatch(
                    setBoxSize(MAP_TYPE.sigmaa, value, viewParams[NGL_PARAMS.boxSize_DENSITY_MAP_sigmaa], majorView)
                  )
                }
              />
            </Grid>
          </Grid>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">Opacity</Typography>
            </Grid>
            <Grid item className={classes.value}>
              <Slider
                value={viewParams[NGL_PARAMS.opacity_DENSITY_MAP_sigmaa]}
                valueLabelDisplay="auto"
                step={0.01}
                min={0}
                max={1}
                onChange={(e, value) =>
                  dispatch(
                    setOpacity(MAP_TYPE.sigmaa, value, viewParams[NGL_PARAMS.opacity_DENSITY_MAP_sigmaa], majorView)
                  )
                }
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
                checked={viewParams[NGL_PARAMS.contour_DENSITY_MAP_sigmaa] === true}
                onChange={(e, value) => handleRepresentation(MAP_TYPE.sigmaa)}
              />
            </Grid>
          </Grid>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">Colour</Typography>
            </Grid>
            <Grid item>
              <Grid item xs={10} className={classes.input}></Grid>
              <Grid item xs={2} className={classes.input}>
                <ColorPicker
                  selectedColor={viewParams[NGL_PARAMS.color_DENSITY_MAP_sigmaa]}
                  setSelectedColor={value =>
                    dispatch(
                      setElectronDesityMapColor(
                        MAP_TYPE.sigmaa,
                        value,
                        viewParams[NGL_PARAMS.color_DENSITY_MAP_sigmaa],
                        majorView
                      )
                    )
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </div>
        <div className={classes.divider}>
          <Grid item container>
            <Grid item xs={12}>
              <Typography variant="body1" className={classes.mapType}>
                DIFF MAP
              </Typography>
            </Grid>
          </Grid>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">ISO</Typography>
            </Grid>
            <Grid item className={classes.value}>
              <Slider
                value={viewParams[NGL_PARAMS.isolevel_DENSITY_MAP_diff]}
                valueLabelDisplay="auto"
                step={1}
                min={-100}
                max={100}
                onChange={(e, value) =>
                  dispatch(
                    setIsoLevel(MAP_TYPE.diff, value, viewParams[NGL_PARAMS.isolevel_DENSITY_MAP_diff], majorView)
                  )
                }
              />
            </Grid>
          </Grid>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">Box size</Typography>
            </Grid>
            <Grid item className={classes.value}>
              <Slider
                value={viewParams[NGL_PARAMS.boxSize_DENSITY_MAP_diff]}
                valueLabelDisplay="auto"
                step={1}
                min={0}
                max={100}
                onChange={(e, value) =>
                  dispatch(setBoxSize(MAP_TYPE.diff, value, viewParams[NGL_PARAMS.boxSize_DENSITY_MAP_diff], majorView))
                }
              />
            </Grid>
          </Grid>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">Opacity</Typography>
            </Grid>
            <Grid item className={classes.value}>
              <Slider
                value={viewParams[NGL_PARAMS.opacity_DENSITY_MAP_diff]}
                valueLabelDisplay="auto"
                step={0.01}
                min={0}
                max={1}
                onChange={(e, value) =>
                  dispatch(setOpacity(MAP_TYPE.diff, value, viewParams[NGL_PARAMS.opacity_DENSITY_MAP_diff], majorView))
                }
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
                checked={viewParams[NGL_PARAMS.contour_DENSITY_MAP_diff] === true}
                onChange={(e, value) => handleRepresentation(MAP_TYPE.diff)}
              />
            </Grid>
          </Grid>
        </div>
        <div className={classes.divider}>
          <Grid item container direction="row" justify="space-between">
            <Grid item>
              <Typography variant="body1">Warning icon toggle</Typography>
            </Grid>
            <Grid item>
              <Switch
                size="small"
                color="primary"
                checked={viewParams[COMMON_PARAMS.warningIcon] === true}
                onChange={handleWarningIcon}
              />
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Drawer>
  );
});
