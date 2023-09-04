import React, { memo, useRef, useState, useContext, useEffect, useCallback } from 'react';
import { Panel } from '../../common/Surfaces/Panel';
import { templateExtend, TemplateName, Orientation, Gitgraph } from '@gitgraph/react';
import { DynamicFeed, MergeType, PlayArrow, Refresh } from '@material-ui/icons';
import { makeStyles, Tooltip } from '@material-ui/core';
import { Button } from '../../common/Inputs/Button';
import { useDispatch, useSelector } from 'react-redux';
import palette from '../../../theme/palette';
import { setIsOpenModalBeforeExit, setSelectedSnapshotToSwitch } from '../../snapshot/redux/actions';
import JobPopup from './JobPopup';
import JobConfigurationDialog from './JobConfigurationDialog';
import { setJobPopUpAnchorEl, setJobConfigurationDialogOpen, refreshJobsData } from '../../projects/redux/actions';
import JobLauncherDialog from './JobLauncherDialog';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { SQUONK_NOT_AVAILABLE } from './constants';
import { PROJECTS_JOBS_PANEL_HEIGHT } from '../constants';
import { changeSnapshot } from '../../../reducers/tracking/dispatchActionsSwitchSnapshot';
import { NglContext } from '../../nglView/nglProvider';
import { VIEWS } from '../../../constants/constants';
import { useRouteMatch } from 'react-router-dom';

export const heightOfProjectHistory = PROJECTS_JOBS_PANEL_HEIGHT;

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%'
  },
  containerExpanded: {
    width: '100%',
    height: heightOfProjectHistory,
    overflow: 'auto'
  },
  containerCollapsed: {
    height: 0
  },
  nglViewItem: {
    paddingLeft: theme.spacing(1) / 2
  },
  checklistItem: {
    height: '100%'
  }
}));

const template = templateExtend(TemplateName.Metro, {
  branch: {
    lineWidth: 3,
    spacing: 20,
    label: {
      font: 'normal 8pt Arial',
      pointerWidth: 100,
      display: false
    }
  },
  commit: {
    message: {
      displayHash: false,
      font: 'normal 10pt Arial',
      displayAuthor: false,
      display: false
    },
    spacing: 30,
    dot: {
      size: 8
    }
  },

  tag: {
    font: 'normal 8pt Arial',
    color: palette.primary.main
  }
});

const options = {
  template,
  orientation: Orientation.Horizontal
};

export const ProjectHistory = memo(({ showFullHistory, graphKey, expanded, onExpanded, onTabChange }) => {
  const classes = useStyles();
  const { nglViewList, getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
  let match = useRouteMatch();
  const paramsProjectID = match && match.params && match.params.projectId;
  const ref = useRef(null);
  const dispatch = useDispatch();
  const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);
  const currentSnapshotList = useSelector(state => state.projectReducers.currentSnapshotList);
  const currentSnapshotJobList = useSelector(state => state.projectReducers.currentSnapshotJobList);
  const currentSnapshotTree = useSelector(state => state.projectReducers.currentSnapshotTree);
  const jobPopUpAnchorEl = useSelector(state => state.projectReducers.jobPopUpAnchorEl);
  const isSnapshotDirty = useSelector(state => state.trackingReducers.isSnapshotDirty);
  const currentSessionProject = useSelector(state => state.projectReducers.currentProject);
  const currentSessionProjectID = currentSessionProject && currentSessionProject.projectID;
  const sessionProjectID = paramsProjectID && paramsProjectID != null ? paramsProjectID : currentSessionProjectID;

  const currentProject = useSelector(state => state.targetReducers.currentProject);
  const actionListNGL =  useSelector(state => state.nglTrackingReducers.track_actions_list);
  const actionList =  useSelector(state => state.trackingReducers.track_actions_list);

  const [tryToOpen, setTryToOpen] = useState(false);
  const [transitionToSnapshot, setTransitionToSnapshot] = useState(null);

  const [jobPopupInfo, setJobPopupInfo] = useState({
    hash: null,
    jobInfo: null
  });

  const handleClickJobLauncher = () => {
    dispatch(setJobConfigurationDialogOpen(true));
  };

  const handleClickOnCommit = useCallback(commit => {
    setTryToOpen(true);
    setTransitionToSnapshot(commit);
  }, []);

  useEffect(() => {
    if (isSnapshotDirty && tryToOpen && transitionToSnapshot) {
      dispatch(setSelectedSnapshotToSwitch(transitionToSnapshot.hash));
      dispatch(setIsOpenModalBeforeExit(true));
      setTryToOpen(false);
      if (actionListNGL.length !== 0) {
        setTryToOpen(false);
        dispatch(setIsOpenModalBeforeExit(false));
        dispatch(changeSnapshot(sessionProjectID, transitionToSnapshot.hash, nglViewList, stage));
        dispatch(setIsOpenModalBeforeExit(false));
      }
    } else 
    if (!isSnapshotDirty && tryToOpen && transitionToSnapshot) {
      if (actionListNGL.length !== 0) {
      dispatch(setIsOpenModalBeforeExit(true));
      }
      dispatch(changeSnapshot(sessionProjectID, transitionToSnapshot.hash, nglViewList, stage));
      setTryToOpen(false);
    }
  }, [dispatch, isSnapshotDirty, nglViewList, sessionProjectID, stage, transitionToSnapshot, tryToOpen]);

  const commitFunction = useCallback(
    ({ title, hash, isSelected = false }) => {
      return {
        hash: `${hash}`,
        subject: `${title}`,
        onMessageClick: handleClickOnCommit,
        onClick: handleClickOnCommit,
        style:
          (isSelected === true && { dot: { size: 15, color: 'red', strokeColor: 'blue', strokeWidth: 2 } }) || undefined
      };
    },
    [handleClickOnCommit]
  );

  const handleClickTriangle = (event, hash, jobInfo) => {
    dispatch(setJobPopUpAnchorEl(event.currentTarget));
    setJobPopupInfo({ hash, jobInfo });
  };

  const commitJobFunction = ({ title, hash, customDot = null }) => ({
    hash: `${hash}`,
    subject: `${title}`,
    renderDot: customDot !== null && customDot
  });

  const renderTriangle = (fill, commit, jobInfo) => () => {
    return React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 71.84 75.33',
        height: '30',
        width: '30',
        cursor: 'pointer',
        onClick: event => handleClickTriangle(event, commit, jobInfo)
      },
      React.createElement(
        'g',
        { fill, stroke: '#DDDDDD', strokeWidth: '4' },
        React.createElement('path', {
          d: 'M 25,0 49,49.5 0,49.5 z'
        })
      ),
      React.createElement(
        'g',
        { fill: '#B7B7B7', stroke: '#BECEBE', strokeWidth: '0' },
        React.createElement('path', {
          d: 'M 25,0 49,49.5 25,35 z'
        })
      )
    );
  };

  const getJobColorCode = (jobStatus, uploadStatus) => {
    let hexColor;
    if (uploadStatus && uploadStatus === 'FAILURE') {
      hexColor = '#F51B0F';
    } else {
      switch (jobStatus) {
        case 'STARTED':
          hexColor = '#FFF2CC';
          break;
        case 'SUCCESS':
          hexColor = '#D5E8D4';
          break;
        case 'FAILURE':
          hexColor = '#F51B0F';
          break;
        case 'PENDING':
          hexColor = '#8c8c8c';
          break;
        case 'RETRY':
          hexColor = '#d2a5ff';
          break;
        case 'REVOKED':
          hexColor = '#88f7e2';
          break;
        default:
          hexColor = '#F9D5D3';
          break;
      }
    }

    return hexColor;
  };

  const renderTreeNode = (gitgraph, node, parentBranch) => {
    if (node !== undefined) {
      const newBranch = gitgraph.branch({
        name: node.title,
        from: parentBranch
      });

      newBranch.commit(
        commitFunction({
          title: node.title || '',
          hash: node.id,
          isSelected: currentSnapshotID === node.id
        })
      );

      currentSnapshotJobList[node.id]?.forEach(job => {
        const jobBranch = gitgraph.branch({
          name: job.id,
          from: newBranch
        });

        jobBranch.commit(
          commitJobFunction({
            title: job.id,
            hash: `#${job.id}`,
            customDot: renderTriangle(getJobColorCode(job.job_status, job.upload_status), node.id, job)
          })
        );
      });

      node.children.forEach(childID => {
        renderTreeNode(gitgraph, currentSnapshotList[childID], newBranch);
      });
    }
  };

  return (
    <div className={classes.root}>
      <Panel
        ref={ref}
        hasHeader
        title="Project History"
        headerActions={[
          <Tooltip title={DJANGO_CONTEXT.squonk_available ? 'Refresh the job data' : SQUONK_NOT_AVAILABLE}>
            <Button
              color="inherit"
              variant="text"
              size="small"
              onClick={() => dispatch(refreshJobsData())}
              startIcon={<Refresh />}
              disabled={DJANGO_CONTEXT.squonk_available === false || !currentProject || !currentSessionProject}
            >
              Refresh
            </Button>
          </Tooltip>,
          <Tooltip title={DJANGO_CONTEXT.squonk_available ? 'Open the job launcher' : SQUONK_NOT_AVAILABLE}>
            <Button
              color="inherit"
              variant="text"
              size="small"
              onClick={handleClickJobLauncher}
              startIcon={<PlayArrow />}
              disabled={DJANGO_CONTEXT.squonk_available === false || !currentProject || !currentSessionProject}
            >
              Job Launcher
            </Button>
          </Tooltip>,
          <Button color="inherit" variant="text" size="small" onClick={showFullHistory} startIcon={<MergeType />}>
            Detail
          </Button>,
          <Button
            color="inherit"
            variant="text"
            size="small"
            onClick={() => onTabChange('jobTable')}
            startIcon={<DynamicFeed />}
            disabled={DJANGO_CONTEXT.squonk_available === false || !currentProject || !currentSessionProject}
          >
            Job Table
          </Button>
        ]}
        hasExpansion
        defaultExpanded={expanded}
        onExpandChange={expanded => onExpanded(expanded)}
      >
        <div className={classes.containerExpanded}>
          <Gitgraph key={graphKey} options={options}>
            {gitgraph => {
              if (!!currentSnapshotTree) {
                renderTreeNode(gitgraph, currentSnapshotTree);
              }
            }}
          </Gitgraph>

          <JobPopup jobPopUpAnchorEl={jobPopUpAnchorEl} jobPopupInfo={jobPopupInfo} />
          <JobConfigurationDialog snapshots={currentSnapshotList} />
          <JobLauncherDialog />
        </div>
      </Panel>
    </div>
  );
});
