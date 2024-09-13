import React, { memo, useContext, useEffect } from 'react';
import { Box, makeStyles, useTheme } from '@material-ui/core';
import Header from '../header';
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom';
import { Management } from '../management/management';
import Tindspect from '../tindspect/Tindspect';
import Landing from '../landing/Landing';
import { ProjectPreview } from '../projects/projectPreview';
import Funders from '../funders/fundersHolder';
import { withLoadingTargetList } from '../target/withLoadingTargetIdList';
import { BrowserCheck } from '../errorHandling/browserCheck';
import { URLS } from './constants';
import { HeaderContext } from '../header/headerContext';
import { Projects } from '../projects';
import { ProjectDetailSessionList } from '../projects/projectDetailSessionList';
import { SessionRedirect } from '../snapshot/sessionRedirect';
import { DirectDisplay } from '../direct/directDisplay';
import { setSnapshotJustSaved } from '../snapshot/redux/actions';
import { useDispatch } from 'react-redux';
import { DirectDownload } from '../direct/directDownload';
import { TASPreview } from '../preview/TASPreview';

const useStyles = makeStyles(theme => ({
  content: {
    overflow: 'hidden',
    backgroundColor: theme.palette.background.default,
    flex: 1
    // padding: theme.spacing(1)
    // style scrollbars
    // '& div': {
    //   scrollbarWidth: 'thin',
    //   scrollbarColor: theme.palette.primary.main + ' ' + theme.palette.primary.light
    // }
  }
}));

const Routes = memo(() => {
  const classes = useStyles();
  const theme = useTheme();
  const { headerHeight, setHeaderHeight } = useContext(HeaderContext);
  const contentHeight = `calc(100vh - ${headerHeight}px - ${2 * theme.spacing(1)}px)`;
  const contentWidth = `100%`;
  const isFunders = useRouteMatch(URLS.funders)

  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    // Reset the snapshot just saved flag on each route change
    dispatch(setSnapshotJustSaved(undefined));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <Box height="100vh" width="100%" margin={0} display="flex" flexDirection="column">
      <Header headerHeight={headerHeight} setHeaderHeight={setHeaderHeight} isFundersLink={!!isFunders?.isExact} />
      <Box className={classes.content} minHeight={contentHeight} width={contentWidth}>
        <Switch>
          <Route exact path={URLS.projects}>
            <Projects />
          </Route>
          <Route exact path={`${URLS.projects}:projectId/history`}>
            <ProjectDetailSessionList />
          </Route>
          <Route exact path={`${URLS.projects}:projectId`}>
            <ProjectPreview />
          </Route>
          <Route exact path={`${URLS.projects}:projectId/:snapshotId`}>
            <ProjectPreview />
          </Route>
          <Route exact path={URLS.management}>
            <Management />
          </Route>
          <Route exact path="/viewer/react/fraginpect">
            <Tindspect />
          </Route>
          <Route exact path={URLS.landing}>
            <Landing />
          </Route>
          <Route exact path={`${URLS.snapshot}:sessionUUID`}>
            <SessionRedirect />
          </Route>
          <Route path={`${URLS.target}*`} children={<TASPreview />} />
          {/* <Route
            path={`${URLS.target}*`}
            render={routeProps => <TASPreview hideProjects resetSelection {...routeProps} />}
          /> */}
          <Route exact path={URLS.funders}>
            <Landing />
          </Route>
          {/* <Route exact path={URLS.funders}>
            <Funders />
          </Route> */}
          <Route path={`${URLS.direct}*`}>
            <DirectDisplay />
          </Route>
          <Route path={`${URLS.download}*`}>
            <DirectDownload />
          </Route>
        </Switch>
      </Box>
      <BrowserCheck />
    </Box >
  );
});

export default withLoadingTargetList(Routes);
