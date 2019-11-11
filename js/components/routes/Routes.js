import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
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
import ModalErrorMessage from '../modalErrorDisplay';
import { BrowserBomb } from '../browserBombModal';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2)
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  }
}));

const Routes = memo(() => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <HeaderLoadingProvider>
        <Header />
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
      </HeaderLoadingProvider>
      <ModalErrorMessage />
      <BrowserBomb />
    </div>
  );
});

export default withLoadingTargetList(Routes);
