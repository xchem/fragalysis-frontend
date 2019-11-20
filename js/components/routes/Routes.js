import React, { memo, useState } from 'react';
import { Box, makeStyles, useTheme } from '@material-ui/core';
import Header from '../header';
import { Route, Switch } from 'react-router-dom';
import TargetManagement from '../targetManagementHolder';
import Tindspect from '../Tindspect';
import Landing from '../landing/Landing';
import Preview from '../preview/Preview';
import Sessions from '../sessionHolder';
import Funders from '../fundersHolder';
import { withLoadingTargetList } from './withLoadingTargetIdList';
import { HeaderLoadingProvider } from '../header/loadingContext';
import { BrowserBomb } from '../browserBombModal';

const useStyles = makeStyles(theme => ({
  content: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(1)
  }
}));

const Routes = memo(() => {
  const classes = useStyles();
  const theme = useTheme();

  const [headerHeight, setHeaderHeight] = useState(0);
  const contentHeight = `calc(100vh - ${headerHeight}px - ${2 * theme.spacing(1)}px)`;
  const contentWidth = `calc(100% - ${2 * theme.spacing(1)}px)`;

  return (
    <Box minHeight="100vh" width="100%" margin={0}>
      <HeaderLoadingProvider>
        <Header headerHeight={headerHeight} setHeaderHeight={setHeaderHeight} />
        <Box className={classes.content} minHeight={contentHeight} width={contentWidth}>
          <Switch>
            <Route exact path="/viewer/react/targetmanagement" component={TargetManagement} />
            <Route exact path="/viewer/react/fraginpect" component={Tindspect} />
            <Route exact path="/viewer/react/landing" component={Landing} />
            <Route
              exact
              path="/viewer/react/preview/target/:target"
              render={routeProps => <Preview headerHeight={headerHeight} resetSelection {...routeProps} />}
            />
            <Route exact path="/viewer/react/sessions" component={Sessions} />
            <Route
              path="/viewer/react/fragglebox/:uuid"
              render={routeProps => <Preview headerHeight={headerHeight} isStateLoaded {...routeProps} />}
            />
            <Route
              path="/viewer/react/snapshot/:snapshotUuid"
              render={routeProps => <Preview headerHeight={headerHeight} isStateLoaded {...routeProps} />}
            />
            <Route exact path="/viewer/react/funders" component={Funders} />
          </Switch>
        </Box>
      </HeaderLoadingProvider>
      <BrowserBomb />
    </Box>
  );
});

export default withLoadingTargetList(Routes);
