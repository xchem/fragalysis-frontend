/**
 * Created by abradley on 14/03/2018.
 */

import React, { Fragment, memo, useContext, forwardRef, useState } from 'react';
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
  Tab,
  Hidden,
  useMediaQuery
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
  Storage,
  ReportProblem
} from '@material-ui/icons';
import { withRouter } from 'react-router-dom';
import SessionManagement from '../session/sessionManagement';
import { HeaderLoadingContext } from './loadingContext';
import { Button } from '../common';
const uuidv4 = require('uuid/v4');

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex'
  },
  padding: {
    margin: theme.spacing(2)
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
    const [error, setError] = useState();
    const [anchorElProfileMenu, setAnchorElProfileMenu] = React.useState(null);
    const showMobileMenu = useMediaQuery(theme => theme.breakpoints.down('sm'));

    if (error) {
      throw new Error('Custom user error.' + uuidv4());
    }

    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
      setOpen(true);
    };

    const handleDrawerClose = () => {
      setOpen(false);
    };

    const handleOpenProfileMenu = event => {
      setAnchorElProfileMenu(event.currentTarget);
    };

    const handleCloseProfileMenu = () => {
      setAnchorElProfileMenu(null);
    };

    const landing = '/viewer/react/landing';
    const sessions = '/viewer/react/sessions';

    const prodLanding = 'https://fragalysis.diamond.ac.uk/viewer/react/landing';
    const login = '/accounts/login';
    const logout = '/accounts/logout';
    let authListItem = null;
    let authMenuItem = null;
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
        Please use:
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
        default:
          break;
      }
    };

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

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: open
          })}
        >
          <Grid
            direction="row"
            justify={!showMobileMenu ? 'space-between' : 'flex-start'}
            alignItems="center"
            container
            className={classes.headerPadding}
          >
            {showMobileMenu && (
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
            )}
            <Grid item>
              <Typography variant="h5" className={classes.title} color="inherit" onClick={() => history.push(landing)}>
                Fragalysis <b>{envNavbar}</b>
              </Typography>
            </Grid>
            {!showMobileMenu && (
              <Fragment>
                <Grid item>
                  <Tabs value={value} onChange={handleChange} variant="fullWidth">
                    <Tab icon={<Home />} label="Home" />
                    <Tab icon={<Storage />} label="Sessions" />
                  </Tabs>
                </Grid>
                <Grid item>
                  <Tab color="inherit" onClick={handleOpenProfileMenu} icon={<Person />} label="Account" />
                </Grid>
              </Fragment>
            )}
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
          {authListItem}
          {reportErrorMenuItem}
        </Menu>
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
            {profileDetail({ direction: 'column', xs: 10 }, true, true)}
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
            {reportErrorMenuItem}
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
