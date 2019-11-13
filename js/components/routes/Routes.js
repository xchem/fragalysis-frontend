import React, { memo, useState, useRef, useEffect } from 'react';
import { Box } from '@material-ui/core';
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

const Routes = memo(() => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef();

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  const contentHeight = `calc(100vh - ${headerHeight}px)`;

  return (
    <Box minHeight="100vh" width="100%">
      <HeaderLoadingProvider>
        <Header ref={headerRef} />
        <Box minHeight={contentHeight} width="inherit">
          <Switch>
            <Route exact path="/viewer/react/targetmanagement" component={TargetManagement} />
            <Route exact path="/viewer/react/fraginpect" component={Tindspect} />
            <Route exact path="/viewer/react/landing" component={Landing} />
            <Route
              exact
              path="/viewer/react/preview/target/:target"
              render={routeProps => <Preview resetSelection {...routeProps} />}
            />
            <Route exact path="/viewer/react/sessions" component={Sessions} />
            <Route
              path="/viewer/react/fragglebox/:uuid"
              render={routeProps => <Preview isStateLoaded {...routeProps} />}
            />
            <Route
              path="/viewer/react/snapshot/:snapshotUuid"
              render={routeProps => <Preview isStateLoaded {...routeProps} />}
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
