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
  LinearProgress,
  Tooltip  
} from '@material-ui/core';
import {
  PowerSettingsNew,
  Input,
  Person,
  Home,
  SupervisorAccount,
  Menu as MenuIcon,
  Work,
  Description,
  Timeline,
  QuestionAnswer,
  Chat,
  Lock,
  LockOpen,
  Restore,
  Layers,
  CreateNewFolder,
  Save
} from '@material-ui/icons';
import { HeaderContext } from './headerContext';
import { Button } from '../common';
import { URLS } from '../routes/constants';
import { useCombinedRefs } from '../../utils/refHelpers';
import { ComputeSize } from '../../utils/computeSize';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
// import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';
import { useHistory } from 'react-router-dom';
import { IssueReport } from '../userFeedback/issueReport';
import { FundersModal } from '../funders/fundersModal';
import { TrackingModal } from '../tracking/trackingModal';
// eslint-disable-next-line import/extensions
import { version } from '../../../package.json';
import { isDiscourseAvailable, openDiscourseLink } from '../../utils/discourse';
import { useSelector, useDispatch } from 'react-redux';
import { generateDiscourseTargetURL, getExistingPost } from '../../utils/discourse';
import { DiscourseErrorModal } from './discourseErrorModal';
import { setOpenDiscourseErrorModal } from '../../reducers/api/actions';
import { lockLayout, resetCurrentLayout } from '../../reducers/layout/actions';
import { ChangeLayoutButton } from './changeLayoutButton';
import { setIsActionsRestoring, setProjectActionListLoaded } from '../../reducers/tracking/actions';
import { layouts } from '../../reducers/layout/layouts';
import { setDialogCurrentStep, setOpenSnapshotSavingDialog } from '../snapshot/redux/actions';
import { activateSnapshotDialog } from '../snapshot/redux/dispatchActions';
import { setCurrentProject, setForceCreateProject, setProjectModalOpen } from '../projects/redux/actions';
import { getVersions } from '../../utils/version';
import { ProjectModal } from '../../components/projects/projectModal';

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
    zIndex: 1301,
    width: '100%',
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'initial',
    cursor: 'progress'
  },
  loadingProgress: {
    height: 2,
    bottom: -2
  },
  clickableImage: {
    cursor: 'pointer'
  },
  inheritHeight: {
    height: 'inherit',
    paddingBottom: theme.spacing(1)
  },
  resetLayoutButton: {
    margin: `${theme.spacing()}px 0`
  }
}));

export default memo(
  forwardRef(({ headerHeight = 0, setHeaderHeight }, ref) => {
    const dispatch = useDispatch();
    let history = useHistory();
    const classes = useStyles();
    const { isLoading, headerNavbarTitle, setHeaderNavbarTitle, headerButtons } = useContext(HeaderContext);

    const [openMenu, setOpenMenu] = useState(false);
    const [openFunders, setOpenFunders] = useState(false);
    const [openTrackingModal, setOpenTrackingModal] = useState(false);
    const [versions, setVersions] = useState({});

    const layoutEnabled = useSelector(state => state.layoutReducers.layoutEnabled);
    const layoutLocked = useSelector(state => state.layoutReducers.layoutLocked);

    const currentProject = useSelector(state => state.projectReducers.currentProject);
    const targetName = useSelector(state => state.apiReducers.target_on_name);

    const openNewProjectModal = useSelector(state => state.projectReducers.isProjectModalOpen);
    const openSaveSnapshotModal = useSelector(state => state.snapshotReducers.openSavingDialog);

    const openDiscourseError = useSelector(state => state.apiReducers.open_discourse_error_modal);

    const selectedLayoutName = useSelector(state => state.layoutReducers.selectedLayoutName);

    const discourseAvailable = isDiscourseAvailable();
    const targetDiscourseVisible = discourseAvailable && targetName;
    const projectDiscourseVisible = discourseAvailable && currentProject && currentProject.title;

    useEffect(() => {
      getVersions()
        .then(response => {
          console.log(response);
          setVersions(response.data);
        })
        .catch(err => console.log(err));
    }, []);

    const openXchem = () => {
      // window.location.href = 'https://www.diamond.ac.uk/Instruments/Mx/Fragment-Screening.html';
      window.open('https://www.diamond.ac.uk/Instruments/Mx/Fragment-Screening.html', '_blank');
    };

    const openDiamond = () => {
      // window.location.href = 'https://www.diamond.ac.uk/Home.html';
      window.open('https://www.diamond.ac.uk/Home.html', '_blank');
    };

    const openSgc = () => {
      // window.location.href = 'https://www.sgc.ox.ac.uk/';
      window.open('https://www.sgc.ox.ac.uk/', '_blank');
    };

    const openJanssen = () => {
      // window.location.href = 'https://www.janssen.com/';
      window.open('https://www.janssen.com/', '_blank');
    };

    const openCovidMoonshot = () => {
      // window.location.href = 'https://covid.postera.ai/covid';
      window.open('https://covid.postera.ai/covid', '_blank');
    };

    const openDiscourseLink = url => {
      window.open(url, '_blank');
    };

    let authListItem;

    let username = null;

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

    if (headerNavbarTitle === '') {
      if (document.location.host.startsWith('fragalysis.diamond') !== true) {
        setHeaderNavbarTitle('DEVELOPMENT');
      } else {
        setHeaderNavbarTitle('Home');
      }
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
      <ComputeSize
        componentRef={combinedRef.current}
        height={headerHeight}
        setHeight={setHeaderHeight}
        forceCompute={forceCompute === true}
      >
        <AppBar position="absolute" ref={combinedRef} className={classes.appBar}>
          <Grid container direction="row" justify="space-between" alignItems="center" className={classes.headerPadding}>
            <Grid item>
              <ButtonGroup variant="text" size="small">
                <Button
                  key="menu"
                  onClick={() => {
                    setOpenMenu(true);
                  }}
                  startIcon={<MenuIcon />}
                >
                  Menu
                </Button>
                <Button>
                  <Typography
                    variant="h5"
                    color="textPrimary"
                    onClick={() => {
                      dispatch(setIsActionsRestoring(false, false));
                      dispatch(setProjectActionListLoaded(false));
                      // dispatch(setCurrentProject(null, null, null, null, null, [], null));
                      // dispatch(setDialogCurrentStep(0));
                      // dispatch(setForceCreateProject(false));
                      history.push(URLS.landing);
                      window.location.reload();
                    }}
                  >
                    Fragalysis: <b id={"headerNavbarTitle"}>{headerNavbarTitle}</b>
                  </Typography>
                </Button>
                {username !== null ? targetName !== undefined ?
                <>
                <Button
                 onClick={() => {openNewProjectModal === false ? dispatch(setProjectModalOpen(true)) : dispatch(setProjectModalOpen(false)),
                  openSaveSnapshotModal === true ? dispatch(setOpenSnapshotSavingDialog(false)) : ''}} 
                 key="newProject"
                 color="primary"
                 startIcon={<CreateNewFolder />}
                >
                   New project
                </Button> 
                {currentProject.projectID !== null ?
                <Button
                   key="saveSnapshot"
                   color="primary"
                   onClick={() => {dispatch(activateSnapshotDialog(DJANGO_CONTEXT['pk']),
                   openSaveSnapshotModal === false ? dispatch(setOpenSnapshotSavingDialog(true)) : dispatch(setOpenSnapshotSavingDialog(false)),
                   openSaveSnapshotModal === true ? dispatch(setOpenSnapshotSavingDialog(false)) : '',
                   openNewProjectModal === true ? dispatch(setProjectModalOpen(false)) : '')}}
                   startIcon={<Save />}
                >
                  Save
                </Button> : ''}
                </>
                : '' : '' }
                {headerButtons && headerButtons.map(item => item)} 
                <ProjectModal />
             </ButtonGroup>
            </Grid>
            <Grid item>
              {discourseAvailable && (
                <ButtonGroup variant="text" size="small">
                  {targetDiscourseVisible && (
                    <Tooltip title="Go to target category on Discourse">
                      <Button
                        startIcon={<Chat />}
                        variant="text"
                        size="small"
                        onClick={() => {
                          generateDiscourseTargetURL(targetName)
                            .then(response => {
                              const url = response.data['Post url'];
                              if (url) {
                                openDiscourseLink(url);
                              }
                            })
                            .catch(err => {
                              console.log(err);
                              dispatch(setOpenDiscourseErrorModal(true));
                            });
                        }}
                      ></Button>
                    </Tooltip>
                  )}
                  {projectDiscourseVisible && (
                    <Tooltip title="Go to project topic on Discourse">
                      <Button
                        startIcon={<QuestionAnswer />}
                        variant="text"
                        size="small"
                        onClick={() => {
                          getExistingPost(currentProject.title)
                            .then(response => {
                              const url = response.data['Post url'];
                              if (url) {
                                openDiscourseLink(url);
                              }
                            })
                            .catch(err => {
                              console.log(err);
                              dispatch(setOpenDiscourseErrorModal(true));
                            });
                        }}
                      ></Button>
                    </Tooltip>
                  )}
                </ButtonGroup>
              )}
            </Grid>
            <Grid item>
              <Grid container direction="row" justify="flex-start" alignItems="center" spacing={1}>
                {layoutEnabled && (
                  <>
                    {!layouts[selectedLayoutName].static && (
                      <>
                        <Grid item>
                          <Tooltip title={layoutLocked ? 'Unlock layout' : 'Lock layout'}>
                            <Button
                              onClick={() => {
                                dispatch(lockLayout(!layoutLocked));
                              }}
                            >
                              {layoutLocked ? <Lock /> : <LockOpen />}
                            </Button>
                          </Tooltip>
                        </Grid>

                        <Grid item>
                          <Tooltip title="Reset layout">
                            <Button
                              className={classes.resetLayoutButton}
                              onClick={() => {
                                dispatch(resetCurrentLayout());
                              }}
                            >
                              <Restore />
                            </Button>
                          </Tooltip>
                        </Grid>
                      </>
                    )}
                    <Grid item>
                      <ChangeLayoutButton className={classes.resetLayoutButton}>
                        <Layers />
                      </ChangeLayoutButton>
                    </Grid>
                  </>
                )}
                <Grid item>
                  <Button
                    startIcon={<Timeline />}
                    variant="text"
                    size="small"
                    onClick={() => setOpenTrackingModal(true)}
                  >
                    Timeline
                  </Button>
                </Grid>
                <Grid item>
                  <IssueReport />
                </Grid>
                <Grid item>
                  <img
                    src={require('../../img/xchemLogo.png')}
                    height="20"
                    className={classes.clickableImage}
                    onClick={openXchem}
                  />
                </Grid>
                <Grid item>
                  <img
                    src={require('../../img/dlsLogo.png')}
                    height="20"
                    className={classes.clickableImage}
                    onClick={openDiamond}
                  />
                </Grid>
                <Grid item>
                  <img
                    src={require('../../img/sgcLogo.png')}
                    height="20"
                    className={classes.clickableImage}
                    onClick={openSgc}
                  />
                </Grid>
                <Grid item>
                  <img
                    src={require('../../img/janssenLogo.png')}
                    height="20"
                    className={classes.clickableImage}
                    onClick={openJanssen}
                  />
                </Grid>
                <Grid item>
                  <img
                    src={require('../../img/covidMoonshotLogo.png')}
                    height="20"
                    className={classes.clickableImage}
                    onClick={openCovidMoonshot}
                  />
                </Grid>
                <Grid item>
                  <Button
                    startIcon={<SupervisorAccount />}
                    variant="text"
                    size="small"
                    onClick={() => setOpenFunders(true)}
                  >
                    Contributors
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {//TODO this needs to be reworked if the optimizations help
          (isLoading === true || false === true) && (
            <LinearProgress color="secondary" className={classes.loadingProgress} variant="query" />
          )}
        </AppBar>
        <FundersModal openModal={openFunders} onModalClose={() => setOpenFunders(false)} />
        <TrackingModal openModal={openTrackingModal} onModalClose={() => setOpenTrackingModal(false)} />
        <DiscourseErrorModal openModal={openDiscourseError} />
        <Drawer
          anchor="left"
          open={openMenu}
          onClose={() => {
            setOpenMenu(false);
          }}
        >
          <Grid
            container
            direction="column"
            justify="space-between"
            alignItems="center"
            className={classes.inheritHeight}
          >
            <Grid item>
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
              <Divider />

              <ListItem button onClick={() => history.push(URLS.projects)}>
                <ListItemIcon>
                  <Description />
                </ListItemIcon>
                <ListItemText primary="Projects" />
              </ListItem>

              <ListItem button onClick={() => history.push(URLS.management)}>
                <ListItemIcon>
                  <Work />
                </ListItemIcon>
                <ListItemText primary="Management" />
              </ListItem>
              <ListItem button onClick={() => setOpenFunders(true)}>
                <ListItemIcon>
                  <SupervisorAccount />
                </ListItemIcon>
                <ListItemText primary="Contributors" />
              </ListItem>
              <Divider />
              {authListItem}
            </Grid>
            <Grid item>
              {versions &&
                versions.hasOwnProperty('version') &&
                Object.entries(versions['version']).map(([sw, version]) => {
                  return (
                    <Typography variant="body2">
                      {sw}: {version}
                    </Typography>
                  );
                })}
            </Grid>
          </Grid>
        </Drawer>
        <Box paddingTop={`${headerHeight}px`} width="100%" />
      </ComputeSize>
    );
  })
);
