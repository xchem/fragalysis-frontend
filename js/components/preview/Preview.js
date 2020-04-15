/**
 * Created by abradley on 14/04/2018.
 */

import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { Grid, makeStyles, useTheme } from '@material-ui/core';
import NGLView from '../nglView/nglView';
import MoleculeList from './molecule/moleculeList';
import MolGroupSelector from './moleculeGroups/molGroupSelector';
import { SummaryView } from './summary/summaryView';
import { CompoundList } from './compounds/compoundList';
import { ViewerControls } from './viewerControls';
import { ComputeSize } from '../../utils/computeSize';
import { withUpdatingTarget } from '../target/withUpdatingTarget';
import { VIEWS } from '../../constants/constants';
import { withLoadingProtein } from './withLoadingProtein';
import { withSnapshotManagement } from '../snapshot/withSnapshotManagement';
import { useDispatch } from 'react-redux';
import { ProjectHistory } from './projectHistory';
import { ProjectDetailDrawer } from '../projects/projectDetailDrawer';
import { removeAllNglComponents } from '../../reducers/ngl/actions';
import { resetCurrentCompoundsSettings } from './compounds/redux/actions';
import { resetProjectsReducer } from '../projects/redux/actions';
import { NewSnapshotModal } from '../snapshot/modals/newSnapshotModal';
import { HeaderContext } from '../header/headerContext';
//import HotspotList from '../hotspot/hotspotList';

const hitNavigatorWidth = 504;

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: 'inherit'
  },
  inheritWidth: {
    width: 'inherit'
  },
  nglViewWidth: {
    // padding: 0,
    width: 'inherit'
  },
  hitColumn: {
    minWidth: hitNavigatorWidth,
    [theme.breakpoints.up('md')]: {
      width: hitNavigatorWidth
    },
    [theme.breakpoints.only('sm')]: {
      width: '100%'
    }
  },
  nglColumn: {
    [theme.breakpoints.up('lg')]: {
      width: `calc(100vw - ${2 * hitNavigatorWidth}px - ${theme.spacing(2)}px)`
    },
    [theme.breakpoints.only('md')]: {
      width: `calc(100vw - ${hitNavigatorWidth}px - ${theme.spacing(4)}px)`
    }
  },
  summaryColumn: {
    minWidth: hitNavigatorWidth,
    [theme.breakpoints.up('lg')]: {
      width: hitNavigatorWidth
    }
  }
}));

const Preview = memo(({ isStateLoaded, hideProjects }) => {
  const classes = useStyles();
  const theme = useTheme();

  const { headerHeight } = useContext(HeaderContext);
  const nglViewerControlsRef = useRef(null);
  const dispatch = useDispatch();

  const [molGroupsHeight, setMolGroupsHeight] = useState(0);
  const [filterItemsHeight, setFilterItemsHeight] = useState(0);

  const moleculeListHeight = `calc(100vh - ${headerHeight}px - ${theme.spacing(2)}px - ${molGroupsHeight}px - ${
    filterItemsHeight > 0 ? filterItemsHeight + theme.spacing(1) / 2 : 0
  }px - ${theme.spacing(8)}px)`;

  const [viewControlsHeight, setViewControlsHeight] = useState(0);

  const screenHeight = `calc(100vh - ${headerHeight}px - ${theme.spacing(2)}px - ${viewControlsHeight}px )`;

  const [summaryViewHeight, setSummaryViewHeight] = useState(0);

  const [projectHistoryHeight, setProjectHistoryHeight] = useState(0);

  const compoundHeight = `calc(100vh - ${headerHeight}px - ${theme.spacing(
    2
  )}px - ${summaryViewHeight}px  - ${projectHistoryHeight}px - 72px)`;
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Unmount Preview - reset NGL state
    return () => {
      dispatch(removeAllNglComponents());
      dispatch(resetCurrentCompoundsSettings(true));
      dispatch(resetProjectsReducer());
    };
  }, [dispatch]);

  return (
    <>
      <Grid container justify="space-between" className={classes.root} spacing={1}>
        <Grid item container direction="column" spacing={1} className={classes.hitColumn}>
          {/* Hit cluster selector */}
          <Grid item>
            <MolGroupSelector isStateLoaded={isStateLoaded} handleHeightChange={setMolGroupsHeight} />
          </Grid>
          {/* Hit navigator */}
          <Grid item>
            <MoleculeList
              height={moleculeListHeight}
              setFilterItemsHeight={setFilterItemsHeight}
              filterItemsHeight={filterItemsHeight}
              isStateLoaded={isStateLoaded}
            />
          </Grid>
        </Grid>
        <Grid item className={classes.nglColumn}>
          <Grid container direction="column">
            <Grid item className={classes.nglViewWidth}>
              <NGLView div_id={VIEWS.MAJOR_VIEW} height={screenHeight} />
            </Grid>
            <Grid item ref={nglViewerControlsRef} className={classes.inheritWidth}>
              <ComputeSize
                componentRef={nglViewerControlsRef.current}
                height={viewControlsHeight}
                setHeight={setViewControlsHeight}
              >
                <ViewerControls />
              </ComputeSize>
            </Grid>
          </Grid>
        </Grid>
        <Grid item container direction="column" spacing={1} className={classes.summaryColumn}>
          <Grid item>
            <SummaryView setSummaryViewHeight={setSummaryViewHeight} summaryViewHeight={summaryViewHeight} />
          </Grid>
          <Grid item>
            <CompoundList height={compoundHeight} />
          </Grid>
          {!hideProjects && (
            <Grid item>
              <ProjectHistory
                setHeight={setProjectHistoryHeight}
                showFullHistory={() => setShowHistory(!showHistory)}
              />
            </Grid>
          )}
        </Grid>
        {/*<Grid item xs={12} sm={6} md={4} >
          <HotspotList />
        </Grid>*/}
      </Grid>
      <NewSnapshotModal />
      {!hideProjects && <ProjectDetailDrawer showHistory={showHistory} setShowHistory={setShowHistory} />}
    </>
  );
});

export default withSnapshotManagement(withUpdatingTarget(withLoadingProtein(Preview)));
