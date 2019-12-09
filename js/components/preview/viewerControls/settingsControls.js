import React, { useContext, memo } from 'react';
import { Grid, Slider, Switch, TextField, Typography } from '@material-ui/core';
import { Drawer } from '../../common/Navigation/Drawer';
import { BACKGROUND_COLOR } from '../../nglView/constants';
import { useDispatch, useSelector } from 'react-redux';
import { setBackgroundColor } from '../../../reducers/ngl/nglActions';
import { NglContext } from '../../nglView/nglProvider';
import { VIEWS } from '../../../constants/constants';

export const SettingControls = memo(({ open, onClose }) => {
  const backgroundColor = useSelector(state => state.nglReducers.present.backgroundColor);
  const dispatch = useDispatch();

  const { getNglView } = useContext(NglContext);
  const majorView = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
  const summaryView = getNglView(VIEWS.SUMMARY_VIEW) && getNglView(VIEWS.SUMMARY_VIEW).stage;

  const handleStageColor = () => {
    if (backgroundColor === BACKGROUND_COLOR.white) {
      dispatch(setBackgroundColor(BACKGROUND_COLOR.black, majorView));
      dispatch(setBackgroundColor(BACKGROUND_COLOR.black, summaryView));
    } else {
      dispatch(setBackgroundColor(BACKGROUND_COLOR.white, majorView));
      dispatch(setBackgroundColor(BACKGROUND_COLOR.white, summaryView));
    }
  };

  return (
    <Drawer title="Settings" open={open} onClose={onClose}>
      <Grid container direction="row" justify="space-between" spacing={1}>
        <Grid item xs={6}>
          <Typography variant="body1">Clip near</Typography>
        </Grid>
        <Grid item xs={6}>
          <Slider defaultValue={3} valueLabelDisplay="auto" step={1} min={0} max={110} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">Clip far</Typography>
        </Grid>
        <Grid item xs={6}>
          <Slider defaultValue={3} valueLabelDisplay="auto" step={1} min={0} max={110} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">Clip dist</Typography>
        </Grid>
        <Grid item xs={6}>
          <TextField />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">Fog near</Typography>
        </Grid>
        <Grid item xs={6}>
          <Slider defaultValue={3} valueLabelDisplay="auto" step={1} min={0} max={110} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">Fog far</Typography>
        </Grid>
        <Grid item xs={6}>
          <Slider defaultValue={3} valueLabelDisplay="auto" step={1} min={0} max={110} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">Background colour</Typography>
        </Grid>
        <Grid item xs={6}>
          <Switch
            size="small"
            color="primary"
            checked={backgroundColor === BACKGROUND_COLOR.white}
            onChange={handleStageColor}
          />
        </Grid>
      </Grid>
    </Drawer>
  );
});
