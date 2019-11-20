/**
 * Created by abradley on 14/03/2018.
 */

import React, { Fragment, memo, useContext, forwardRef, useState, useEffect, useLayoutEffect } from 'react';
import clsx from 'clsx';
import {
  Grid,
  makeStyles,
  LinearProgress,
  AppBar,
  Typography,
  CssBaseline,
  ListItem,
  ListItemIcon,
  Divider,
  Menu,
  ListItemText,
  Tab,
  Avatar,
  useMediaQuery,
  Box,
  ButtonGroup
} from '@material-ui/core';
import {
  PowerSettingsNew,
  Input,
  Person,
  Home,
  Storage,
  ReportProblem,
  SupervisorAccount,
  Menu as MenuIcon
} from '@material-ui/icons';
import { withRouter } from 'react-router-dom';
import SessionManagement from '../session/sessionManagement';
import { HeaderLoadingContext } from './loadingContext';
import { Button } from '../common';
import { URLS } from '../routes/constants';
const uuidv4 = require('uuid/v4');

function useCombinedRefs(...refs) {
  const targetRef = React.useRef();

  React.useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}

const useStyles = makeStyles(theme => ({
  padding: {
    margin: theme.spacing(2)
  },
  headerPadding: {
    paddingLeft: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  },
  sponsors: {
    padding: theme.spacing(1)
  },
  sponsorImg: {
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 6,
    paddingBottom: 6
  },
  appBar: {
    backgroundColor: theme.palette.white
  }
}));

const Index = memo(
  forwardRef(({ history, children, setHeaderHeight, headerHeight = 0 }, ref) => {
    const classes = useStyles();
    const { isLoading } = useContext(HeaderLoadingContext);

    const [error, setError] = useState();
    const [anchorElProfileMenu, setAnchorElProfileMenu] = React.useState(null);
    const xsDown = useMediaQuery(theme => theme.breakpoints.down('xs'));
    const mdDown = useMediaQuery(theme => theme.breakpoints.down('md'));

    if (error) {
      throw new Error('Custom user error.' + uuidv4());
    }

    const handleOpenProfileMenu = event => {
      setAnchorElProfileMenu(event.currentTarget);
    };

    const handleCloseProfileMenu = () => {
      setAnchorElProfileMenu(null);
    };

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
    let authListItem;
    let envNavbar = '';

    let username = null;

    const reportErrorMenuItem = (
      <ListItem button onClick={() => setError(true)}>
        <ListItemIcon>
          <ReportProblem />
        </ListItemIcon>
        <ListItemText primary="Report Error" />
      </ListItem>
    );

    // eslint-disable-next-line no-undef
    if (DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN') {
      authListItem = (
        <ListItem
          button
          onClick={() => {
            window.location.replace(URLS.login);
          }}
        >
          <ListItemIcon>
            <Input />
          </ListItemIcon>
          <ListItemText primary="Login" />
        </ListItem>
      );
    } else {
      authListItem = (
        <ListItem
          button
          onClick={() => {
            window.location.replace(URLS.logout);
          }}
        >
          <ListItemIcon>
            <PowerSettingsNew />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      );

      // eslint-disable-next-line no-undef
      username = DJANGO_CONTEXT['username'];
    }

    const prodSite = (
      <p>
        Please use:
        <a href={URLS.prodLanding} data-toggle="tooltip" title="https://fragalysis.diamond.ac.uk">
          production site
        </a>
      </p>
    );

    if (document.location.host.startsWith('fragalysis.diamond') !== true) {
      envNavbar = 'DEVELOPMENT';
    } else {
      envNavbar = 'Home';
    }

    const profileDetail = (rest, container, item) => {
      return (
        <Grid item={item} container={container} {...rest}>
          <Grid item>
            <Avatar className={classes.padding}>
              <Person />
            </Avatar>
          </Grid>
          <Grid item>{username}</Grid>
          <Grid item>{prodSite}</Grid>
        </Grid>
      );
    };

    const innerRef = React.useRef(null);
    const combinedRef = useCombinedRefs(ref, innerRef);

    useEffect(() => {
      setHeaderHeight(combinedRef.current.offsetHeight);
    }, [ref, combinedRef, xsDown, mdDown, setHeaderHeight]);

    return (
      <Fragment>
        <AppBar position="absolute" ref={combinedRef} className={classes.appBar}>
          <Grid container direction="row" justify="space-between" alignItems="center" className={classes.headerPadding}>
            <Grid item>
              <Grid container direction="row" justify="center" alignItems="center">
                <Grid item>
                  <Typography
                    variant="h5"
                    color="textPrimary"
                    onClick={() => history.push(URLS.landing)}
                    className={classes.sponsorImg}
                  >
                    Fragalysis <b>{envNavbar}</b>
                  </Typography>
                </Grid>
                <Grid item>
                  <img
                    src={require('../../img/xchemLogo.png')}
                    height="28"
                    onClick={openXchem}
                    className={classes.sponsorImg}
                  />
                </Grid>
                <Grid item>
                  <img
                    src={require('../../img/dlsLogo.png')}
                    height="28"
                    onClick={openDiamond}
                    className={classes.sponsorImg}
                  />
                </Grid>
                <Grid item>
                  <img
                    src={require('../../img/sgcLogo.png')}
                    height="28"
                    onClick={openSgc}
                    className={classes.sponsorImg}
                  />
                </Grid>
                <Grid item>
                  <Button startIcon={<SupervisorAccount />} variant="text" onClick={() => history.push(funders)}>
                    Supported by
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <ButtonGroup variant="text">
                <SessionManagement />
                <Button variant="text" onClick={handleOpenProfileMenu} startIcon={<MenuIcon />}>
                  Menu
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>
        </AppBar>
        <Menu
          id="simple-menu"
          anchorEl={anchorElProfileMenu}
          keepMounted
          open={Boolean(anchorElProfileMenu)}
          onClose={handleCloseProfileMenu}
        >
          {profileDetail(
            {
              direction: 'column',
              justify: 'center',
              alignItems: 'center',
              className: classes.drawerHeader
            },
            true
          )}
          <Divider />
          <ListItem button onClick={() => history.push(URLS.landing)}>
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>

          <ListItem button onClick={() => history.push(URLS.sessions)}>
            <ListItemIcon>
              <Storage />
            </ListItemIcon>
            <ListItemText primary="Sessions" />
          </ListItem>
          <ListItem button onClick={() => history.push(funders)}>
            <ListItemIcon>
              <SupervisorAccount />
            </ListItemIcon>
            <ListItemText primary="Supported by" />
          </ListItem>
          <Divider />
          {authListItem}
          {reportErrorMenuItem}
        </Menu>
        <Box width="100%" paddingTop={`${headerHeight}px`}>
          {isLoading === true && <LinearProgress color="secondary" />}
        </Box>
      </Fragment>
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
