/**
 * Created by abradley on 14/04/2018.
 */

import React, { Fragment, memo, useEffect, useState } from 'react';
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
  gridItemRhs: {
    width: 'calc(100% - 500px)'
  },
  fullWidth: {
    width: '100%'
  },
  root: {
    minHeight: 'inherit',
    width: 'inherit',
    padding: 8
  }
}));

const Preview = memo(({ isStateLoaded, headerHeight }) => {
  const classes = useStyles();
  const [expandedMolGroups, setExpandedMolGroups] = useState(true);

  const screenHeight = window.innerHeight * (0.7).toString() + 'px';
  //const molListHeight = window.innerHeight * (0.45).toString() + 'px';

  const [molGroupsHeight, setMolGroupsHeight] = useState(0);

  const moleculeListHeight = `calc(100vh ${expandedMolGroups === true ? '-' : '+'} ${headerHeight}px ${
    expandedMolGroups === true ? '-' : '+'
  } ${molGroupsHeight}px - 58px)`;

  console.log(expandedMolGroups, moleculeListHeight);
  return (
    <Fragment>
      <HandleUnrecognisedTarget>
        <Grid container justify="space-between" alignItems="stretch" className={classes.root}>
          <Grid item xs={12} md={6} xl={4} container direction="column" spacing={2}>
            <Grid
              item
              ref={ref => {
                if (ref && ref.offsetHeight !== molGroupsHeight) {
                  setMolGroupsHeight(ref.offsetHeight);
                }
              }}
            >
              <MolGroupSelector
                isStateLoaded={isStateLoaded}
                expanded={expandedMolGroups}
                setExpanded={setExpandedMolGroups}
              />
            </Grid>
            <Grid item>
              <MoleculeList height={moleculeListHeight} />
            </Grid>
          </Grid>
          <Grid item xs={12} md={6} xl={4}>
            <Grid container direction="column" spacing={2} justify="space-between">
              <Grid item>
                <NGLView div_id={VIEWS.MAJOR_VIEW} height={screenHeight} />
              </Grid>
              <Grid item>
                <NglViewerControls />
              </Grid>
            </Grid>
          </Grid>
          {/*
          <Grid item xs={12} md={6} xl={4}>
            <SummaryView />
            <CompoundList />
            <HotspotList />
          </Grid>
          */}
        </Grid>
      </HandleUnrecognisedTarget>
      <ModalStateSave />
    </Fragment>
  );
});

export default withUpdatingTarget(Preview);
