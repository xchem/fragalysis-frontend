/**
 * Created by abradley on 14/03/2018.
 */

import React, { memo, useContext, forwardRef, useState, useEffect } from 'react';
import {
  Grid,
  makeStyles,
  AppBar,
  Typography,
  ListItem,
  ListItemIcon,
  Divider,
  Drawer,
  ListItemText,
  Avatar,
  Box,
  ButtonGroup,
  CircularProgress
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
import { HeaderContext } from './headerContext';
import { Button } from '../common';
import { URLS } from '../routes/constants';
import { useCombinedRefs } from '../../utils/refHelpers';
import { ComputeHeight } from '../../utils/computeHeight';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { useDisableUserInteraction } from '../useEnableUserInteracion';
const uuidv4 = require('uuid/v4');

const useStyles = makeStyles(theme => ({
  padding: {
    margin: theme.spacing(2)
  },
  headerPadding: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  title: {
    flexGrow: 1
  },
  sponsors: {
    padding: theme.spacing(1)
  },
  appBar: {
    backgroundColor: theme.palette.white
  },
  drawerHeader: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default
  },
  loadingPaper: {
    backgroundColor: theme.palette.background.default,
    zIndex: 1,
    width: '100%',
    position: 'absolute',
    opacity: 0.9,
    pointerEvents: 'initial'
  },
  loadingWheel: {
    top: '50%',
    left: '50%',
    position: 'fixed'
  }
}));

const Index = memo(
  forwardRef(({ history, children, setHeaderHeight, headerHeight = 0 }, ref) => {
    const classes = useStyles();
    const { isLoading } = useContext(HeaderContext);
    const disableUserInteraction = useDisableUserInteraction();

    const [error, setError] = useState();
    const [openMenu, setOpenMenu] = React.useState(false);

    if (error) {
      throw new Error('Custom user error.' + uuidv4());
    }

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

      username = DJANGO_CONTEXT['username'];
    }

    const prodSite = (
      <Typography variant="body2">
        Please use:
        <a href={URLS.prodLanding} data-toggle="tooltip" title="https://fragalysis.diamond.ac.uk">
          production site
        </a>
      </Typography>
    );

    if (document.location.host.startsWith('fragalysis.diamond') !== true) {
      envNavbar = 'DEVELOPMENT';
    } else {
      envNavbar = 'Home';
    }
    const [forceCompute, setForceCompute] = useState();
    const innerRef = React.useRef();
    const combinedRef = useCombinedRefs(ref, innerRef);
    useEffect(() => {
      if (combinedRef.current) {
        setForceCompute(forceCompute === undefined);
      }
    }, [combinedRef, forceCompute]);

    return (
      <ComputeHeight
        componentRef={combinedRef.current}
        height={headerHeight}
        setHeight={setHeaderHeight}
        forceCompute={forceCompute === true}
      >
        <AppBar position="absolute" ref={combinedRef} className={classes.appBar}>
          <Grid container direction="row" justify="space-between" alignItems="center" className={classes.headerPadding}>
            <Grid item>
              <Grid container direction="row" justify="flex-start" alignItems="center" spacing={1}>
                <Grid item>
                  <Typography variant="h5" color="textPrimary" onClick={() => history.push(URLS.landing)}>
                    Fragalysis <b>{envNavbar}</b>
                  </Typography>
                </Grid>
                <Grid item>
                  <img src={require('../../img/xchemLogo.png')} height="20" onClick={openXchem} />
                </Grid>
                <Grid item>
                  <img src={require('../../img/dlsLogo.png')} height="20" onClick={openDiamond} />
                </Grid>
                <Grid item>
                  <img src={require('../../img/sgcLogo.png')} height="20" onClick={openSgc} />
                </Grid>
                <Grid item>
                  <Button
                    startIcon={<SupervisorAccount />}
                    variant="text"
                    size="small"
                    onClick={() => history.push(funders)}
                  >
                    Supported by
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <ButtonGroup variant="text" size="small">
                <SessionManagement />
                <Button
                  onClick={() => {
                    setOpenMenu(true);
                  }}
                  startIcon={<MenuIcon />}
                >
                  Menu
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>
        </AppBar>
        <Drawer
          anchor="right"
          open={openMenu}
          onClose={() => {
            setOpenMenu(false);
          }}
        >
          <Grid container direction="column" justify="center" alignItems="center" className={classes.drawerHeader}>
            <Grid item>
              <Avatar className={classes.padding}>
                <Person />
              </Avatar>
            </Grid>
            <Grid item>
              <Typography variant="subtitle2">{username}</Typography>
            </Grid>
            <Grid item>{prodSite}</Grid>
          </Grid>

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
        </Drawer>
        <Box paddingTop={`${headerHeight}px`} width="100%">
          {(isLoading === true || disableUserInteraction === true) && (
            <Box
              className={classes.loadingPaper}
              width="100%"
              height={`calc(${document.documentElement.offsetHeight}px - ${headerHeight}px)`}
            >
              <div className={classes.loadingWheel}>
                <CircularProgress />
              </div>
            </Box>
          )}
        </Box>
      </ComputeHeight>
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
