import React, { memo } from 'react';
import { Grid } from '@material-ui/core';
import NGLView from './nglView/nglView';
import { withLoadingEventList } from '../hoc/withLoadingEventList';
import { withLoadingPanddaSiteList } from '../hoc/withPanddaSiteList';
import PanddaSlider from './panddaSlider';
import EventSlider from './eventSlider';
import { VIEWS } from '../constants/constants';

const Tindspect = memo(() => {
  return (
    <Grid container>
      <Grid item xs={4} md={4}>
        <NGLView div_id={VIEWS.PANDDA_SUMMARY} height="200px" />
        <PanddaSlider />
        <EventSlider />
      </Grid>
      <Grid item xs={8} md={8}>
        <NGLView div_id={VIEWS.PANDDA_MAJOR} height="600px" />
      </Grid>
    </Grid>
  );
});

export default withLoadingEventList(withLoadingPanddaSiteList(Tindspect));
