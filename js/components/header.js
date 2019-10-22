/**
 * Created by abradley on 14/03/2018.
 */

import React, { memo } from 'react';
import { Grid, Button, makeStyles } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import SessionManagement from './sessionManagement';
import { ErrorReport } from './errorReport';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  },
  header: {
    backgroundColor: '#ffffff',
    borderColor: '#eeeeee',
    border: '1px solid transparent',
    width: 'inherit'
  }
}));

const Header = memo(({ history }) => {
  const classes = useStyles();

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
      <Button className={classes.button} variant="contained" color="primary" onClick={() => history.push(login)}>
        Login
      </Button>
    );
  } else {
    new_ele = (
      <Button className={classes.button} variant="contained" color="primary" onClick={() => history.push(logout)}>
        <b>Hello {username}</b> Logout.
      </Button>
    );
  }

  if (document.location.host.startsWith('fragalysis.diamond') !== true) {
    navbarBrand = (
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item>
          <h4>
            <a onClick={() => history.push(landing)}>
              {' '}
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
    <div className={classes.header}>
      <Grid container>
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
              <img src={require('../img/xchemLogo.png')} width="67" height="31" onClick={openXchem} />
              <img src={require('../img/dlsLogo.png')} width="100" height="31" onClick={openDiamond} />{' '}
              <img src={require('../img/sgcLogo.png')} width="65" height="31" onClick={openSgc} />
              <ErrorReport />
            </Grid>
            <Grid item>
              <p onClick={showFunders}>Supported by...</p>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
});

export default withRouter(Header);
