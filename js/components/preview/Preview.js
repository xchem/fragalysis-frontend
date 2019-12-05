/**
 * Created by abradley on 14/04/2018.
 */

import React, { Fragment, memo, useRef, useState } from 'react';
import { Grid, makeStyles, useTheme } from '@material-ui/core';
import NGLView from '../nglView/nglView';
import MoleculeList from '../molecule/moleculeList';
import MolGroupSelector from '../molGroupSelector';
import SummaryView from '../summaryView';
import CompoundList from '../compoundList';
import NglViewerControls from './viewerControls';
import { ComputeHeight } from '../../utils/computeHeight';
//import HotspotList from '../hotspot/hotspotList';

import { withUpdatingTarget } from './withUpdatingTarget';
import ModalStateSave from '../session/modalStateSave';
import { VIEWS } from '../../constants/constants';
import { withLoadingProtein } from './withLoadingProtein';

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: 'inherit'
  },
  inheritWidth: {
    width: 'inherit'
  }
}));

const Preview = memo(({ isStateLoaded, headerHeight }) => {
  const classes = useStyles();
  const theme = useTheme();
  const nglViewerControlsRef = useRef(null);

  const [molGroupsHeight, setMolGroupsHeight] = useState(0);
  const [filterItemsHeight, setFilterItemsHeight] = useState(0);

  const moleculeListHeight = `calc(100vh - ${headerHeight}px - ${theme.spacing(2)}px - ${molGroupsHeight}px - ${
    filterItemsHeight > 0 ? filterItemsHeight + theme.spacing(1) / 2 : 0
  }px - ${theme.spacing(8)}px)`;

  const [viewControlsHeight, setViewControlsHeight] = useState(0);

  const screenHeight = `calc(100vh - ${headerHeight}px - ${theme.spacing(2)}px - ${viewControlsHeight}px)`;

  const [summaryViewHeight, setSummaryViewHeight] = useState(0);
  const compoundHeight = `calc(100vh - ${headerHeight}px - ${theme.spacing(2)}px - ${summaryViewHeight}px - 113px)`;

  return (
    <Fragment>
      <Grid container justify="space-between" className={classes.root} spacing={1}>
        <Grid item sm={12} md={6} lg={4} xl={3} container direction="column" spacing={1}>
          <Grid item>
            <MolGroupSelector isStateLoaded={isStateLoaded} handleHeightChange={setMolGroupsHeight} />
          </Grid>
          <Grid item>
            <MoleculeList
              height={moleculeListHeight}
              setFilterItemsHeight={setFilterItemsHeight}
              filterItemsHeight={filterItemsHeight}
            />
          </Grid>
        </Grid>
        <Grid item sm={12} md={6} lg={4} xl={6}>
          <Grid container direction="column" spacing={1}>
            <Grid item className={classes.inheritWidth}>
              <NGLView div_id={VIEWS.MAJOR_VIEW} height={screenHeight} />
            </Grid>
            <Grid item ref={nglViewerControlsRef}>
              <ComputeHeight
                componentRef={nglViewerControlsRef.current}
                height={viewControlsHeight}
                setHeight={setViewControlsHeight}
              >
                <NglViewerControls />
              </ComputeHeight>
            </Grid>
          </Grid>
        </Grid>
        <Grid item sm={12} md={6} lg={4} xl={3} container direction="column" spacing={1}>
          <Grid item>
            <SummaryView setSummaryViewHeight={setSummaryViewHeight} summaryViewHeight={summaryViewHeight} />
          </Grid>
          <Grid item>
            <CompoundList height={compoundHeight} />
          </Grid>
        </Grid>
        {/*<Grid item xs={12} sm={6} md={4} >
          <HotspotList />
        </Grid>*/}
      </Grid>
      <ModalStateSave />
    </Fragment>
  );
});

export default withUpdatingTarget(withLoadingProtein(Preview));
