/**
 * Created by abradley on 14/03/2018.
 */

import React, { Fragment, memo, useContext, forwardRef } from 'react';
import { Grid, makeStyles, LinearProgress } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import SessionManagement from '../session/sessionManagement';
import { ErrorReport } from './errorReport';
import { HeaderLoadingContext } from './loadingContext';
import { Button } from '../common/Inputs/Button';

const useStyles = makeStyles(theme => ({
  header: {
    backgroundColor: '#ffffff',
    borderColor: '#eeeeee',
    border: '1px solid transparent',
    width: 'inherit',
    padding: theme.spacing(1)
  },
  progressBar: {
    width: '100%'
  },
  root: {
    padding: theme.spacing(1)
  }
}));

const Index = memo(
  forwardRef(({ history }, ref) => {
    const classes = useStyles();
    const { isLoading } = useContext(HeaderLoadingContext);

    const openXchem = () => {
      window.location.href = 'https://www.diamond.ac.uk/Instruments/Mx/Fragment-Screening.html';
    };

    const openDiamond = () => {
      window.location.href = 'https://www.diamond.ac.uk/Home.html';
    };

    const openSgc = () => {
      window.location.href = 'https://www.sgc.ox.ac.uk/';
    };

    const showFunders = () => {
      window.location.href = '/viewer/react/funders';
    };

    const landing = '/viewer/react/landing';
    const prodLanding = 'https://fragalysis.diamond.ac.uk/viewer/react/landing';
    const login = '/accounts/login';
    const logout = '/accounts/logout';
    let new_ele = null;
    let navbarBrand = null;
    // eslint-disable-next-line no-undef
    var username = DJANGO_CONTEXT['username'];

    if (username === 'NOT_LOGGED_IN') {
      new_ele = (
        <Button color="primary" href={login}>
          Login
        </Button>
      );
    } else {
      new_ele = (
        <Fragment>
          <Button color="primary" href={logout}>
            Logout
          </Button>
          <b>{username}</b>
        </Fragment>
      );
    }

    if (document.location.host.startsWith('fragalysis.diamond') !== true) {
      navbarBrand = (
        <Grid container direction="column" justify="center" alignItems="center">
          <Grid item>
            <h4 onClick={() => history.push(landing)}>
              <a>
                Fragalysis <b>DEVELOPMENT </b>
              </a>
            </h4>
          </Grid>
          <Grid item>
            <p>
              Please use:{' '}
              <a href={prodLanding} data-toggle="tooltip" title="https://fragalysis.diamond.ac.uk">
                production site
              </a>
            </p>
          </Grid>
        </Grid>
      );
    } else {
      navbarBrand = <h4 onClick={() => history.push(landing)}>FragalysisHome</h4>;
    }

    return (
      <div ref={ref} className={classes.root}>
        <div className={classes.header}>
          <Grid container direction="row" alignItems="center">
            <Grid item xs={2}>
              {navbarBrand}
            </Grid>
            <Grid item xs={1}>
              {new_ele}
            </Grid>
            <Grid item xs={6}>
              <SessionManagement />
            </Grid>

            <Grid item xs={3}>
              <Grid container direction="column" justify="center" alignItems="center">
                <Grid item>
                  <img src={require('../../img/xchemLogo.png')} width="67" height="31" onClick={openXchem} />
                  <img src={require('../../img/dlsLogo.png')} width="100" height="31" onClick={openDiamond} />{' '}
                  <img src={require('../../img/sgcLogo.png')} width="65" height="31" onClick={openSgc} />
                  <ErrorReport />
                </Grid>
                <Grid item>
                  <p onClick={showFunders}>Supported by...</p>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
        {isLoading === true && (
          <div className={classes.progressBar}>
            <LinearProgress />
          </div>
        )}
      </div>
    );
  })
);

const withRouterAndRef = Wrapped => {
  const WithRouter = withRouter(({ forwardRef, ...otherProps }) => <Wrapped ref={forwardRef} {...otherProps} />);
  const WithRouterAndRef = React.forwardRef((props, ref) => <WithRouter {...props} forwardRef={ref} />);
  const name = Wrapped.displayName || Wrapped.name;
  WithRouterAndRef.displayName = `withRouterAndRef(${name})`;
  return WithRouterAndRef;
};

export default withRouterAndRef(Index);
