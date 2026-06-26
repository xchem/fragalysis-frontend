/**
 * Created by abradley on 14/03/2018.
 */

import React, { memo, useContext, forwardRef, useState, useEffect, useCallback } from 'react';
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
  LinearProgress
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
  Save,
  HelpOutline
} from '@material-ui/icons';
import { HeaderContext } from './headerContext';
import { Button } from '../common';
import { base_url, URLS } from '../routes/constants';
import { useCombinedRefs } from '../../utils/refHelpers';
import { ComputeSize } from '../../utils/computeSize';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
// import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';
import { useHistory } from 'react-router-dom';
import { FundersModal } from '../funders/fundersModal';
// eslint-disable-next-line import/extensions
import { version } from '../../../package.json';
import { isDiscourseAvailable, openDiscourseLink } from '../../utils/discourse';
import { useSelector, useDispatch } from 'react-redux';
import { generateDiscourseTargetURL, getExistingPost } from '../../utils/discourse';
import { DiscourseErrorModal } from './discourseErrorModal';
import { setOpenDiscourseErrorModal } from '../../reducers/api/actions';
import { lockLayout, resetCurrentLayout } from '../../reducers/layout/actions';
import { ChangeLayoutButton } from './changeLayoutButton';
import { layouts } from '../../reducers/layout/layouts';
import {
  setDisableRedirect,
  setDontShowShareSnapshot,
  setOpenSnapshotSavingDialog,
  setSnapshotEditDialogOpen,
  setSnapshotToBeEdited
} from '../snapshot/redux/actions';
import { createNewSnapshot } from '../snapshot/redux/dispatchActions';
import { setCurrentSnapshot } from '../projects/redux/actions';
import { getVersions } from '../../utils/version';
import { ServicesStatusWrapper } from '../services';
import { COMPANIES, get_logo } from '../funders/constants';
import { setEditTargetDialogOpen } from '../target/redux/actions';
import { Pin, Settings, Upload } from '@mui/icons-material';
import { TargetSettingsModal } from '../target/targetSettingsModal';
import { SnapshotType } from '../projects/redux/constants';
import { NglContext } from '../nglView/nglProvider';
import { VIEWS } from '../../constants/constants';
import moment from 'moment';
import { ToastContext } from '../toast';
import { api, METHOD } from '../../utils/api';
import { QualityStatusService } from '../preview/molecule/moleculeView/qualityStatus/QualityStatusService';
import { TooltipPathProvider } from '../tooltip/TooltipPathContext';
import RichTooltip from '../tooltip/RichTooltip';

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
  headerButtonGroup: {
    '& .MuiButtonGroup-grouped': {
      backgroundColor: `${theme.palette.white} !important`
    },
    '& .MuiButton-root': {
      backgroundColor: `${theme.palette.white} !important`,
      '&:hover': {
        backgroundColor: `${theme.palette.white} !important`
      }
    },
    '& .MuiButton-root.Mui-disabled': {
      backgroundColor: `${theme.palette.white} !important`
    }
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

export const Header = memo(
  forwardRef(({ headerHeight = 0, setHeaderHeight, isFundersLink = false }, ref) => {
    const dispatch = useDispatch();
    let history = useHistory();
    const classes = useStyles();
    const { headerNavbarTitle, setHeaderNavbarTitle, headerButtons } = useContext(HeaderContext);

    const { nglViewList, getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    const [openMenu, setOpenMenu] = useState(false);
    const [openFunders, setOpenFunders] = useState(false);
    const [openTargetSettings, setOpenTargetSettings] = useState(false);
    const [versions, setVersions] = useState({});

    const layoutEnabled = useSelector(state => state.layoutReducers.layoutEnabled);
    const layoutLocked = useSelector(state => state.layoutReducers.layoutLocked);

    const currentProject = useSelector(state => state.projectReducers.currentProject);
    const targetName = useSelector(state => state.apiReducers.target_on_name);

    const openSaveSnapshotModal = useSelector(state => state.snapshotReducers.openSavingDialog);

    const openDiscourseError = useSelector(state => state.apiReducers.open_discourse_error_modal);

    const selectedLayoutName = useSelector(state => state.layoutReducers.selectedLayoutName);

    const currentSnapshot = useSelector(state => state.projectReducers.currentSnapshot);
    const currentSnapshotId = currentSnapshot && currentSnapshot.id;

    const discourseAvailable = isDiscourseAvailable();
    const targetDiscourseVisible = discourseAvailable && targetName;
    const projectDiscourseVisible = discourseAvailable && currentProject && currentProject.title;

    const { toastError, toastInfo } = useContext(ToastContext);

    useEffect(() => {
      setOpenFunders(isFundersLink);
    }, [isFundersLink]);

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

    const getTokenFromApi = async () => {
      return api({
        url: `${base_url}/api/token/`,
        method: METHOD.GET
      })
        .then(resp => {
          return resp.data.sessionid;
        })
        .catch(err => {
          console.log('error fetching token', err);
          return '';
        });
    };

    const getToken = async () => {
      const token = await getTokenFromApi();
      await navigator.clipboard.writeText(token);
      toastInfo(`Token '${token}' was copied to the clipboard`, { autoHideDuration: 5000 });
    };

    const createSnapshot = useCallback(
      (title, description) => {
        if (!currentSnapshotId || !currentProject || !title || !description) return;
        // Prepare snapshot data
        const type = SnapshotType.MANUAL;
        const author = DJANGO_CONTEXT['pk'] || null;
        const parent = currentSnapshotId;
        const session_project = currentProject.projectID;

        // Prevents redirect and displaying of share snapshot dialog
        dispatch(setDisableRedirect(true));
        dispatch(setDontShowShareSnapshot(true));

        // With the above flags set, createNewSnapshot returns the ID of newly created snapshot as the second item in the array
        return dispatch(
          createNewSnapshot({
            title,
            description,
            type,
            author,
            parent,
            session_project,
            nglViewList,
            stage,
            overwriteSnapshot: false,
            createDiscourse: false
          })
        );
      },
      [currentProject, currentSnapshotId, dispatch, nglViewList, stage]
    );

    const editSnapshot = useCallback(
      snapshotCopy => {
        dispatch(setSnapshotToBeEdited(snapshotCopy));
        dispatch(setSnapshotEditDialogOpen(true));
      },
      [dispatch]
    );

    let authListItem;

    let username = null;
    let userId = null;

    if (DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN') {
      authListItem = (
        <ListItem
          id="login-button-id"
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
          id="logout-button-id"
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
              <ButtonGroup variant="text" size="small" className={classes.headerButtonGroup}>
                <RichTooltip path="menu">
                  <Button
                    id="open-menu-button"
                    key="menu"
                    onClick={() => {
                      setOpenMenu(true);
                    }}
                    startIcon={<MenuIcon />}
                  >
                    Menu
                  </Button>
                </RichTooltip>
                <RichTooltip path="targetSettings">
                  <Button onClick={() => setOpenTargetSettings(true)} disabled={!targetName || !DJANGO_CONTEXT.pk}>
                    <Typography variant="h5" color="textPrimary">
                      Fragalysis: <b id={'headerNavbarTitle'}>{headerNavbarTitle}</b>
                    </Typography>
                  </Button>
                </RichTooltip>
                {username !== null ? (
                  targetName !== undefined ? (
                    <>
                      {currentProject.projectID !== null ? (
                        <RichTooltip path="saveSnapshot">
                          <Button
                            key="saveSnapshot"
                            color="primary"
                            onClick={async () => {
                              // Prevents redirect and displaying of share snapshot dialog
                              dispatch(setDisableRedirect(true));
                              dispatch(setDontShowShareSnapshot(true));

                              const title = moment().format('-- YYYY-MM-DD -- HH:mm:ss');
                              const description = `snapshot generated by ${DJANGO_CONTEXT['username']}`;
                              createSnapshot(title, description)
                                .then(newSnapshotId => {
                                  const options = {
                                    link: {
                                      linkAction: editSnapshot,
                                      linkText: 'Click to edit',
                                      linkParams: [{ id: newSnapshotId, title: title, description: description }]
                                    }
                                  };
                                  api({ url: `${base_url}/api/snapshots/${newSnapshotId}` }).then(snapshotResponse => {
                                    dispatch(
                                      setCurrentSnapshot({
                                        id: snapshotResponse.data.id,
                                        type: snapshotResponse.data.type,
                                        title: snapshotResponse.data.title,
                                        author: snapshotResponse.data.author,
                                        description: snapshotResponse.data.description,
                                        created: snapshotResponse.data.created,
                                        children: snapshotResponse.data.children,
                                        parent: snapshotResponse.data.parent,
                                        data: snapshotResponse.data.data
                                      })
                                    );
                                    toastInfo('New snapshot created. Switching to selected snapshot.', options);
                                  });
                                })
                                .catch(err => {
                                  toastError('Error creating new snapshot. Unable to switch to selected snapshot.');
                                  console.error(`Save snapshot - error: ${err}`);
                                });
                            }}
                            startIcon={<Save />}
                          >
                            Save
                          </Button>
                        </RichTooltip>
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
              </ButtonGroup>
            </Grid>
            <Grid item>
              {discourseAvailable && (
                <ButtonGroup variant="text" size="small" className={classes.headerButtonGroup}>
                  {targetDiscourseVisible && (
                    <RichTooltip path="discourseTarget">
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
                    </RichTooltip>
                  )}
                  {projectDiscourseVisible && (
                    <RichTooltip path="discourseCategory">
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
                    </RichTooltip>
                  )}
                </ButtonGroup>
              )}
            </Grid>
            <ServicesStatusWrapper />
            <QualityStatusService />
            <Grid item>
              <RichTooltip path="help">
                <Button onClick={() => openLink(URLS.helpPage)} startIcon={<HelpOutline />} variant="text" size="small">
                  Help
                </Button>
              </RichTooltip>
            </Grid>
            <Grid item>
              <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
                {layoutEnabled && (
                  <>
                    {!layouts[selectedLayoutName].static && (
                      <>
                        <Grid item>
                          <RichTooltip path={layoutLocked ? 'layout.unlockLayout' : 'layout.lockLayout'}>
                            <Button
                              onClick={() => {
                                dispatch(lockLayout(!layoutLocked));
                              }}
                            >
                              {layoutLocked ? <Lock /> : <LockOpen />}
                            </Button>
                          </RichTooltip>
                        </Grid>

                        <Grid item>
                          <RichTooltip path="layout.resetLayout">
                            <Button
                              className={classes.resetLayoutButton}
                              onClick={() => {
                                dispatch(resetCurrentLayout());
                              }}
                            >
                              <Restore />
                            </Button>
                          </RichTooltip>
                        </Grid>
                      </>
                    )}
                    <Grid item>
                      <TooltipPathProvider path="layout.changeLayout">
                        <ChangeLayoutButton className={classes.resetLayoutButton}>
                          <Layers />
                        </ChangeLayoutButton>
                      </TooltipPathProvider>
                    </Grid>
                  </>
                )}
                <Grid item></Grid>
                <Grid item>
                  <RichTooltip path={'xchem'} values={{ companyTitle: COMPANIES.xchem.title }}>
                    <img
                      src={get_logo(COMPANIES.xchem.image)}
                      height="20"
                      className={classes.clickableImage}
                      onClick={() => openLink(COMPANIES.xchem.link)}
                    />
                  </RichTooltip>
                </Grid>
                <Grid item>
                  <RichTooltip path={'diamond'} values={{ companyTitle: COMPANIES.diamond.title }}>
                    <img
                      src={get_logo(COMPANIES.diamond.image)}
                      height="20"
                      className={classes.clickableImage}
                      onClick={() => openLink(COMPANIES.diamond.link)}
                    />
                  </RichTooltip>
                </Grid>
                <Grid item>
                  <RichTooltip path={'asap'} values={{ companyTitle: COMPANIES.asap.title }}>
                    <img
                      src={get_logo(COMPANIES.asap.image)}
                      height="20"
                      className={classes.clickableImage}
                      onClick={() => openLink(COMPANIES.asap.link)}
                    />
                  </RichTooltip>
                </Grid>
                <Grid item>
                  <RichTooltip path={'fragmentScreen'} values={{ companyTitle: COMPANIES.fragmentScreen.title }}>
                    <img
                      src={get_logo(COMPANIES.fragmentScreen.image)}
                      height="20"
                      className={classes.clickableImage}
                      onClick={() => openLink(COMPANIES.fragmentScreen.link)}
                    />
                  </RichTooltip>
                </Grid>
                <Grid item>
                  <RichTooltip path={'cmd'} values={{ companyTitle: COMPANIES.cmd.title }}>
                    <img
                      src={get_logo(COMPANIES.cmd.image)}
                      height="20"
                      className={classes.clickableImage}
                      onClick={() => openLink(COMPANIES.cmd.link)}
                    />
                  </RichTooltip>
                </Grid>
                <Grid item>
                  <RichTooltip path="contributors">
                    <Button
                      startIcon={<SupervisorAccount />}
                      variant="text"
                      size="small"
                      onClick={() => setOpenFunders(true)}
                    >
                      Contributors
                    </Button>
                  </RichTooltip>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </AppBar>
        <TooltipPathProvider path="funders">
          <FundersModal openModal={openFunders} onModalClose={() => setOpenFunders(false)} />
        </TooltipPathProvider>
        <TargetSettingsModal openModal={openTargetSettings} onModalClose={() => setOpenTargetSettings(false)} />
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
              </Grid>

              <Divider />
              <RichTooltip path="drawer.home">
                <ListItem
                  button
                  onClick={() => {
                    history.push(URLS.landing);
                    window.location.reload();
                  }}
                >
                  <ListItemIcon>
                    <Home />
                  </ListItemIcon>
                  <ListItemText primary="Home" />
                </ListItem>
              </RichTooltip>

              <Divider />

              <RichTooltip path="drawer.management">
                <ListItem button onClick={() => history.push(URLS.management)}>
                  <ListItemIcon>
                    <Work />
                  </ListItemIcon>
                  <ListItemText primary="Management" />
                </ListItem>
              </RichTooltip>
              <RichTooltip path="drawer.contributors">
                <ListItem button onClick={() => setOpenFunders(true)}>
                  <ListItemIcon>
                    <SupervisorAccount />
                  </ListItemIcon>
                  <ListItemText primary="Contributors" />
                </ListItem>
              </RichTooltip>
              {DJANGO_CONTEXT.pk && !!targetName && (
                <>
                  <Divider />
                  <RichTooltip path="drawer.targetSettings">
                    <ListItem button onClick={() => setOpenTargetSettings(true)}>
                      <ListItemIcon>
                        <Settings />
                      </ListItemIcon>
                      <ListItemText primary="Target settings" />
                    </ListItem>
                  </RichTooltip>
                </>
              )}
              {DJANGO_CONTEXT.pk && (
                <>
                  <Divider />
                  <RichTooltip path="drawer.getToken">
                    <ListItem button onClick={getToken}>
                      <ListItemIcon>
                        <Pin />
                      </ListItemIcon>
                      <ListItemText primary="Get Token" />
                    </ListItem>
                  </RichTooltip>
                  <Divider />
                  <RichTooltip path="drawer.lhsUpload">
                    <ListItem button onClick={() => openLink(URLS.lhsUpload)}>
                      <ListItemIcon>
                        <Upload />
                      </ListItemIcon>
                      <ListItemText primary="LHS upload" />
                    </ListItem>
                  </RichTooltip>
                  <RichTooltip path="drawer.rhsUpload">
                    <ListItem button onClick={() => openLink(URLS.rhsUpload)}>
                      <ListItemIcon>
                        <Upload />
                      </ListItemIcon>
                      <ListItemText primary="RHS upload" />
                    </ListItem>
                  </RichTooltip>
                  <RichTooltip path="drawer.metadataUpload">
                    <ListItem button onClick={() => openLink(URLS.metadataUpload)}>
                      <ListItemIcon>
                        <Upload />
                      </ListItemIcon>
                      <ListItemText primary="Metadata upload" />
                    </ListItem>
                  </RichTooltip>
                  <RichTooltip path="drawer.assayDataUpload">
                    <ListItem button onClick={() => openLink(URLS.assayDataUpload)}>
                      <ListItemIcon>
                        <Upload />
                      </ListItemIcon>
                      <ListItemText primary="Assay data upload" />
                    </ListItem>
                  </RichTooltip>
                </>
              )}
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
