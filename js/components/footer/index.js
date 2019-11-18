import React, { forwardRef, memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CssBaseline, Grid, Toolbar, AppBar } from '@material-ui/core';
import { Button } from '../common';
import { withRouter } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  appBar: {
    top: 'auto',
    bottom: 0,
    backgroundColor: theme.palette.background.paper,
    width: '100%'
  }
}));
const Index = memo(
  forwardRef(({ history }, ref) => {
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

    const funders = '/viewer/react/funders';

    return (
      <React.Fragment>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Grid container justify="space-evenly">
              <Grid item>
                <img src={require('../../img/xchemLogo.png')} width="67" height="31" onClick={openXchem} />
              </Grid>
              <Grid item>
                <img src={require('../../img/dlsLogo.png')} width="100" height="31" onClick={openDiamond} />
              </Grid>
              <Grid item>
                <img src={require('../../img/sgcLogo.png')} width="65" height="31" onClick={openSgc} />
              </Grid>{' '}
              <Grid item>
                <Button onClick={() => history.push(funders)}>Supported by...</Button>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      </React.Fragment>
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
