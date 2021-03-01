import React, { memo, useContext, useEffect, useRef } from 'react';
import { Panel } from '../../common/Surfaces/Panel';
import { templateExtend, TemplateName, Orientation, Gitgraph } from '@gitgraph/react';
import { MergeType } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core';
import { Button } from '../../common/Inputs/Button';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { loadSnapshotTree } from '../../projects/redux/dispatchActions';
import palette from '../../../theme/palette';
import { ModalShareSnapshot } from '../../snapshot/modals/modalShareSnapshot';
import { setIsOpenModalBeforeExit, setSelectedSnapshotToSwitch } from '../../snapshot/redux/actions';
import { NglContext } from '../../nglView/nglProvider';

export const heightOfProjectHistory = '164px';

const useStyles = makeStyles(theme => ({
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
    spacing: 12,
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
      displayAuthor: false
    },
    spacing: 24,
    dot: {
      size: 8
    }
  },

  tag: {
    font: 'normal 8pt Arial',
    color: palette.primary.contrastText,
    bgColor: palette.primary.main
  }
});

const options = {
  template,
  orientation: Orientation.Horizontal
};

export const ProjectHistory = memo(({ setHeight, showFullHistory }) => {
  const classes = useStyles();
  const ref = useRef(null);
  let history = useHistory();
  const { nglViewList } = useContext(NglContext);
  const dispatch = useDispatch();
  let match = useRouteMatch();
  const projectID = useSelector(state => state.projectReducers.currentProject).projectID;
  const snapshotId = useSelector(state => state.projectReducers.currentSnapshot).id;
  const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);
  const currentSnapshotList = useSelector(state => state.projectReducers.currentSnapshotList);
  const currentSnapshotTree = useSelector(state => state.projectReducers.currentSnapshotTree);
  const isLoadingTree = useSelector(state => state.projectReducers.isLoadingTree);

  const handleClickOnCommit = commit => {
    dispatch(setSelectedSnapshotToSwitch(commit.hash));
    dispatch(setIsOpenModalBeforeExit(true));
  };

  const commitFunction = ({ title, hash, isSelected = false }) => ({
    hash: `${hash}`,
    subject: `${title}`,
    onMessageClick: handleClickOnCommit,
    onClick: handleClickOnCommit,
    style:
      (isSelected === true && { dot: { size: 10, color: 'red', strokeColor: 'blue', strokeWidth: 2 } }) || undefined
  });

  const renderTreeNode = (childID, gitgraph, parentBranch) => {
    const node = currentSnapshotList[childID];
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

      node.children.forEach(childID => {
        renderTreeNode(childID, gitgraph, newBranch);
      });
    }
  };

  useEffect(() => {
    if (currentSnapshotID !== null) {
      dispatch(loadSnapshotTree(projectID)).catch(error => {
        throw new Error(error);
      });
    }
  }, [currentSnapshotID, dispatch, projectID, snapshotId]);

  return (
    <>
      <Panel
        ref={ref}
        hasHeader
        title="Project History"
        headerActions={[
          <Button color="inherit" variant="text" size="small" onClick={showFullHistory} startIcon={<MergeType />}>
            Detail
          </Button>
        ]}
        hasExpansion
        defaultExpanded
        onExpandChange={expand => {
          if (ref.current && setHeight instanceof Function) {
            setHeight(ref.current.offsetHeight);
          }
        }}
      >
        <div className={classes.containerExpanded}>
          {isLoadingTree === false &&
            currentSnapshotTree !== null &&
            currentSnapshotTree.children !== null &&
            currentSnapshotTree.title !== null &&
            currentSnapshotTree.id !== null &&
            currentSnapshotID !== null &&
            currentSnapshotList !== null && (
              <Gitgraph options={options}>
                {gitgraph => {
                  const initBranch = gitgraph.branch(currentSnapshotTree.title);

                  initBranch.commit(
                    commitFunction({
                      title: currentSnapshotTree.title || '',
                      hash: currentSnapshotTree.id,
                      isSelected: currentSnapshotID === currentSnapshotTree.id
                    })
                  );

                  currentSnapshotTree.children.forEach(childID => {
                    renderTreeNode(childID, gitgraph, initBranch);
                  });
                }}
              </Gitgraph>
            )}
        </div>
      </Panel>
    </>
  );
});
