/**
 * Created by abradley on 14/03/2018.
 */

import React, { Fragment, memo, useContext, forwardRef } from 'react';
import clsx from 'clsx';
import {
  Grid,
  makeStyles,
  LinearProgress,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  CssBaseline,
  Drawer,
  Hidden,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Divider,
  Menu,
  MenuItem,
  Avatar,
  Tabs,
  Tab
} from '@material-ui/core';
import {
  Menu as MenuIcon,
  MoveToInbox as InboxIcon,
  Mail as MailIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  PowerSettingsNew,
  Input,
  Person,
  Info,
  Home,
  Storage
} from '@material-ui/icons';
import { withRouter } from 'react-router-dom';
import SessionManagement from '../session/sessionManagement';
import { ErrorReport } from './errorReport';
import { HeaderLoadingContext } from './loadingContext';
import { Button } from '../common';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex'
  },
  avatar: {
    margin: 10
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  headerPadding: {
    paddingLeft: theme.spacing(2)
  },
  hide: {
    display: 'none'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  drawerHeader: {
    ...theme.mixins.toolbar,
    padding: theme.spacing(0, 1),
    backgroundColor: theme.palette.background.default
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: -drawerWidth
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: 0
  },
  title: {
    flexGrow: 1
  }
}));

const Index = memo(
  forwardRef(({ history, children }, ref) => {
    const classes = useStyles();
    const { isLoading } = useContext(HeaderLoadingContext);

    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
      setOpen(true);
    };

    const handleDrawerClose = () => {
      setOpen(false);
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

    const landing = '/viewer/react/landing';
    const sessions = '/viewer/react/sessions';

    const prodLanding = 'https://fragalysis.diamond.ac.uk/viewer/react/landing';
    const login = '/accounts/login';
    const logout = '/accounts/logout';
    let authListItem = null;
    let envNavbar = '';

    let username = null;

    // eslint-disable-next-line no-undef
    if (DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN') {
      authListItem = (
        <ListItem
          button
          onClick={() => {
            window.location.replace(login);
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
            window.location.replace(logout);
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
        Please use:{' '}
        <a href={prodLanding} data-toggle="tooltip" title="https://fragalysis.diamond.ac.uk">
          production site
        </a>
      </p>
    );

    if (document.location.host.startsWith('fragalysis.diamond') !== true) {
      envNavbar = 'DEVELOPMENT';
    } else {
      envNavbar = 'Home';
    }

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
      setValue(newValue);
      switch (newValue) {
        case 0: {
          history.push(landing);
          break;
        }
        case 1: {
          history.push(sessions);
          break;
        }
        case 1: {
          history.push(sessions);
          break;
        }
        default:
          break;
      }
    };

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: open
          })}
        >
          <Grid direction="row" justify="space-between" alignItems="center" container className={classes.headerPadding}>
            <Grid item>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                className={clsx(classes.menuButton, open && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <Typography variant="h5" className={classes.title} color="inherit" onClick={() => history.push(landing)}>
                Fragalysis <b>{envNavbar}</b>
              </Typography>
            </Grid>
            <Grid item>
              <Tabs value={value} onChange={handleChange} variant="fullWidth">
                <Tab label="Home" />
                <Tab label="Sessions" />
              </Tabs>
            </Grid>
            <Grid item>
              <IconButton color="inherit">
                <Person />
              </IconButton>
            </Grid>
          </Grid>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="persistent"
          anchor="left"
          open={open}
          classes={{
            paper: classes.drawerPaper
          }}
        >
          <Grid container justify="space-between" alignItems="center" className={classes.drawerHeader}>
            <Grid item container direction="column" xs={10}>
              <Grid item>
                <Avatar className={classes.avatar}>
                  <Person />
                </Avatar>
              </Grid>
              <Grid item>{username}</Grid>
              <Grid item>{prodSite}</Grid>
            </Grid>
            <Grid item xs={2}>
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            </Grid>
          </Grid>

          <Divider />
          <List>
            <ListItem button onClick={() => history.push(landing)}>
              <ListItemIcon>
                <Home />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button onClick={() => history.push(sessions)}>
              <ListItemIcon>
                <Storage />
              </ListItemIcon>
              <ListItemText primary="Sessions" />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ErrorReport />
            {authListItem}
          </List>
        </Drawer>
        <main
          className={clsx(classes.content, {
            [classes.contentShift]: open
          })}
        >
          <div className={classes.drawerHeader} />
          {/*{isLoading === true ? (
            <div className={classes.progressBar}>
              <LinearProgress />
            </div>
          ) : (
            children
          )}*/}
          {children}
        </main>
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
