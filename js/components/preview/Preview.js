/**
 * Created by abradley on 14/04/2018.
 */

import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import { Grid, makeStyles, Box } from '@material-ui/core';
import NGLView from '../nglView/nglComponents';
import MoleculeList from '../molecule/moleculeList';
import MolGroupSelector from '../molGroupSelector';
import SummaryView from '../summaryView';
import CompoundList from '../compoundList';
import NglViewerControls from '../nglView/nglViewerControls';
import HotspotList from '../hotspot/hotspotList';
import HandleUnrecognisedTarget from '../handleUnrecognisedTarget';

import { withUpdatingTarget } from './withUpdatingTarget';
import ModalStateSave from '../session/modalStateSave';
import { VIEWS } from '../../constants/constants';

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: 'inherit',
    width: '100%'
  },
  itemPadding: {
    padding: theme.spacing(1)
  }
}));

const Preview = memo(({ isStateLoaded, headerHeight }) => {
  const classes = useStyles();

  const [molGroupsHeight, setMolGroupsHeight] = useState(0);
  const moleculeListHeight = `calc(100vh - ${headerHeight}px - ${molGroupsHeight}px - 74px)`;

  const [viewControlsHeight, setViewControlsHeight] = useState(0);
  const screenHeight = `calc(100vh - ${headerHeight}px - ${viewControlsHeight}px - 16px)`;

  const [summaryViewHeight, setSummaryViewHeight] = useState(0);
  const compoundHeight = `calc(100vh - ${headerHeight}px - ${summaryViewHeight}px - 62px)`;

  return (
    <Fragment>
      <HandleUnrecognisedTarget>
        <Grid container justify="space-between" className={classes.root}>
          <Grid item xs={12} md={6} xl={4} container direction="column">
            <Grid item className={classes.itemPadding}>
              <MolGroupSelector isStateLoaded={isStateLoaded} handleHeightChange={setMolGroupsHeight} />
            </Grid>
            <Grid item className={classes.itemPadding}>
              <MoleculeList height={moleculeListHeight} />
            </Grid>
          </Grid>
          <Grid item xs={12} md={6} xl={4} container direction="column">
            <Grid item className={classes.itemPadding}>
              <NGLView div_id={VIEWS.MAJOR_VIEW} height={screenHeight} />
            </Grid>
            <Grid
              item
              ref={ref => {
                if (ref && ref.offsetHeight !== viewControlsHeight) {
                  setViewControlsHeight(ref.offsetHeight);
                }
              }}
              className={classes.itemPadding}
            >
              <NglViewerControls />
            </Grid>
          </Grid>
          <Grid item xs={12} md={6} xl={4} container direction="column">
            <Grid
              item
              className={classes.itemPadding}
              ref={ref => {
                if (ref && ref.offsetHeight !== summaryViewHeight) {
                  setSummaryViewHeight(ref.offsetHeight);
                }
              }}
            >
              <SummaryView />
            </Grid>
            <Grid item className={classes.itemPadding}>
              <CompoundList height={compoundHeight} />
            </Grid>
          </Grid>
          <Grid item>
            <HotspotList />
          </Grid>
        </Grid>
      </HandleUnrecognisedTarget>
      <ModalStateSave />
    </Fragment>
  );
});

export default withUpdatingTarget(Preview);
