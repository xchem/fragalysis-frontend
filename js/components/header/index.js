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
import { setOpenSnapshotSavingDialog } from '../snapshot/redux/actions';
import { activateSnapshotDialog } from '../snapshot/redux/dispatchActions';
import { setAddButton, setProjectModalIsLoading } from '../projects/redux/actions';
import { getVersions } from '../../utils/version';
import { AddProjectDetail } from '../projects/addProjectDetail';
import { ServicesStatus, ServicesStatusWrapper } from '../services';
import { COMPANIES, get_logo } from '../funders/constants';

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
    const { headerNavbarTitle, setHeaderNavbarTitle, headerButtons } = useContext(HeaderContext);

    const [openMenu, setOpenMenu] = useState(false);
    const [openFunders, setOpenFunders] = useState(false);
    const [openTrackingModal, setOpenTrackingModal] = useState(false);
    const [versions, setVersions] = useState({});

    const layoutEnabled = useSelector(state => state.layoutReducers.layoutEnabled);
    const layoutLocked = useSelector(state => state.layoutReducers.layoutLocked);

    const currentProject = useSelector(state => state.projectReducers.currentProject);
    const targetName = useSelector(state => state.apiReducers.target_on_name);

    const openNewProjectModal = useSelector(state => state.projectReducers.isProjectModalOpen);
    const isProjectModalLoading = useSelector(state => state.projectReducers.isProjectModalLoading);

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

    const openLink = link => {
      window.open(link, '_blank');
    };

    const openDiscourseLink = url => {
      window.open(url, '_blank');
    };

    let authListItem;

    let username = null;
    let userId = null;

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
      userId = DJANGO_CONTEXT['pk'];
    }

    const prodSite = (
      <Typography variant="body2">
        Please use:
        <a href={URLS.prodLanding} data-toggle="tooltip" title="https://fragalysis.diamond.ac.uk">
          production site
        </a>
      </Typography>
    );

    useEffect(() => {
      if (headerNavbarTitle === '') {
        if (document.location.host.startsWith('fragalysis.diamond') !== true) {
          setHeaderNavbarTitle('DEVELOPMENT');
        } else {
          setHeaderNavbarTitle('Home');
        }
      }
    }, [headerNavbarTitle, setHeaderNavbarTitle]);

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
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            className={classes.headerPadding}
          >
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
                    Fragalysis: <b id={'headerNavbarTitle'}>{headerNavbarTitle}</b>
                  </Typography>
                </Button>
                {username !== null ? (
                  targetName !== undefined ? (
                    <>
                      {currentProject.authorID === null ||
                        currentProject.projectID === null ||
                        currentProject.authorID === userId ? (
                        <Button
                          onClick={() => {
                            isProjectModalLoading === false
                              ? (dispatch(setProjectModalIsLoading(true)), dispatch(setAddButton(false)))
                              : dispatch(setProjectModalIsLoading(false));
                            openSaveSnapshotModal === true ? dispatch(setOpenSnapshotSavingDialog(false)) : '';
                          }}
                          key="newProject"
                          color="primary"
                          startIcon={<CreateNewFolder />}
                        >
                          New project
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            openNewProjectModal === false
                              ? (dispatch(setProjectModalIsLoading(true)), dispatch(setAddButton(false)))
                              : dispatch(setProjectModalIsLoading(false));
                            openSaveSnapshotModal === true ? dispatch(setOpenSnapshotSavingDialog(false)) : '';
                          }}
                          key="newProject"
                          color="primary"
                          startIcon={<CreateNewFolder />}
                        >
                          New project from snapshot
                        </Button>
                      )}
                      {currentProject.projectID !== null ? (
                        <Button
                          key="saveSnapshot"
                          color="primary"
                          onClick={() => {
                            dispatch(activateSnapshotDialog(DJANGO_CONTEXT['pk']));
                            openSaveSnapshotModal === false
                              ? dispatch(setOpenSnapshotSavingDialog(true))
                              : dispatch(setOpenSnapshotSavingDialog(false));
                            openSaveSnapshotModal === true ? dispatch(setOpenSnapshotSavingDialog(false)) : '';
                            isProjectModalLoading === true ? dispatch(setProjectModalIsLoading(false)) : '';

                            dispatch(setAddButton(false));
                          }}
                          startIcon={<Save />}
                        >
                          Save
                        </Button>
                      ) : (
                        ''
                      )}
                    </>
                  ) : (
                    ''
                  )
                ) : (
                  ''
                )}
                {headerButtons && headerButtons.map(item => item)}
                <AddProjectDetail />
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
            <ServicesStatusWrapper />
            <Grid item>
              <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
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
                    src={get_logo(COMPANIES.xchem.image)}
                    height="20"
                    className={classes.clickableImage}
                    onClick={() => openLink(COMPANIES.xchem.link)}
                  />
                </Grid>
                <Grid item>
                  <img
                    src={get_logo(COMPANIES.diamond.image)}
                    height="20"
                    className={classes.clickableImage}
                    onClick={() => openLink(COMPANIES.diamond.link)}
                  />
                </Grid>
                <Grid item>
                  <img
                    src={get_logo(COMPANIES.asap.image)}
                    height="20"
                    className={classes.clickableImage}
                    onClick={() => openLink(COMPANIES.asap.link)}
                  />
                </Grid>
                <Grid item>
                  <img
                    src={get_logo(COMPANIES.fragmentScreen.image)}
                    height="20"
                    className={classes.clickableImage}
                    onClick={() => openLink(COMPANIES.fragmentScreen.link)}
                  />
                </Grid>
                <Grid item>
                  <img
                    src={get_logo(COMPANIES.cmd.image)}
                    height="20"
                    className={classes.clickableImage}
                    onClick={() => openLink(COMPANIES.cmd.link)}
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
            justifyContent="space-between"
            alignItems="center"
            className={classes.inheritHeight}
          >
            <Grid item>
              <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                className={classes.drawerHeader}
              >
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
              <ListItem
                button
                onClick={() => {
                  dispatch(setIsActionsRestoring(false, false));
                  dispatch(setProjectActionListLoaded(false));
                  history.push(URLS.landing);
                  window.location.reload();
                }}
              >
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
                Object.entries(versions['version']).map(([sw, version], index) => {
                  return (
                    <Typography variant="body2" key={index}>
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
