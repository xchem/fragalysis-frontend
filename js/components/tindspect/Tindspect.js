import React, { memo } from 'react';
import { GridLegacy as Grid } from '@mui/material';
import ViewerView from '../moorhenView/ViewerView';
import { withLoadingEventList } from '../../hoc/withLoadingEventList';
import { withLoadingPanddaSiteList } from '../../hoc/withPanddaSiteList';
import PanddaSlider from './panddaSlider';
import EventSlider from './eventSlider';
import { VIEWS } from '../../constants/constants';

const Tindspect = memo(() => {
  return (
    <Grid container>
      <Grid item xs={4} md={4}>
        <ViewerView div_id={VIEWS.PANDDA_SUMMARY} height="200px" />
        <PanddaSlider />
        <EventSlider />
      </Grid>
      <Grid item xs={8} md={8}>
        <ViewerView div_id={VIEWS.PANDDA_MAJOR} height="600px" />
      </Grid>
    </Grid>
  );
});

export default withLoadingEventList(withLoadingPanddaSiteList(Tindspect));
