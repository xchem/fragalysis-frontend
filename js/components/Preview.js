/**
 * Created by abradley on 14/04/2018.
 */

import React, { Fragment, memo } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import NGLView from './nglView/nglComponents';
import MoleculeList from './molecule/moleculeList';
import MolGroupSelector from './molGroupSelector';
import SummaryView from './summaryView';
import CompoundList from './compoundList';
import NglViewerControls from './nglView/nglViewerControls';
import HotspotList from './hotspot/hotspotList';
import HandleUnrecognisedTarget from './handleUnrecognisedTarget';

import { withUpdatingTarget } from '../hoc/withUpdatingTarget';
import ModalStateSave from './session/modalStateSave';

const useStyles = makeStyles(theme => ({
  gridItemLhs: {
    width: '500px'
  },
  gridItemRhs: {
    width: 'calc(100% - 500px)'
  },
  fullWidth: {
    width: '100%'
  }
}));

const Preview = memo(props => {
  const classes = useStyles();

  const screenHeight = window.innerHeight * (0.7).toString() + 'px';
  const molListHeight = window.innerHeight * (0.45).toString() + 'px';

  return (
    <Fragment>
      <HandleUnrecognisedTarget>
        <Grid container spacing={2}>
          <Grid item container direction="column" alignItems="stretch" spacing={2} className={classes.gridItemLhs}>
            <Grid item className={classes.fullWidth}>
              <MolGroupSelector />
            </Grid>
            <Grid item>
              <MoleculeList height={molListHeight} />
            </Grid>
          </Grid>
          <Grid item container className={classes.gridItemRhs} spacing={2}>
            <Grid item lg={6} md={12}>
              <NGLView div_id="major_view" height={screenHeight} />
              <NglViewerControls />
            </Grid>
            <Grid item lg={6} md={12}>
              <SummaryView />
              <CompoundList />
              <HotspotList />
            </Grid>
          </Grid>
        </Grid>
      </HandleUnrecognisedTarget>
      <ModalStateSave />
    </Fragment>
  );
});

export default withUpdatingTarget(Preview);
