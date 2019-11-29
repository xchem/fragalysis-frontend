import React from 'react';
import { Grid, Slider, Switch, TextField, Typography } from '@material-ui/core';
import { Drawer } from '../../common/Navigation/Drawer';
import { STAGE_COLOR } from '../../nglView/constants';
import { useSelector } from 'react-redux';
import { setStageColor } from '../../../reducers/ngl/nglLoadActions';

export const SettingControls = ({ open, onClose }) => {
  const stageColor = useSelector(state => state.nglReducers.present.stageColor);

  const handleStageColor = () => {
    if (stageColor === STAGE_COLOR.white) {
      setStageColor(STAGE_COLOR.black);
    } else {
      setStageColor(STAGE_COLOR.white);
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
          <Switch size="small" color="primary" onChange={handleStageColor} />
        </Grid>
      </Grid>
    </Drawer>
  );
};
