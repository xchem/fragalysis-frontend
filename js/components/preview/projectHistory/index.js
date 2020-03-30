import React, { memo, useEffect, useRef } from 'react';
import { isEmpty } from 'lodash';
import { Panel } from '../../common/Surfaces/Panel';
import {
  Grid,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  makeStyles
} from '@material-ui/core';
import { templateExtend, TemplateName, Orientation, Gitgraph } from '@gitgraph/react';
import { Delete, Share, MergeType } from '@material-ui/icons';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { URLS } from '../../routes/constants';
import { loadSnapshotTree } from '../../projects/redux/dispatchActions';

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

export const ProjectHistory = memo(({ setHeight, showFullHistory }) => {
  const classes = useStyles();
  const ref = useRef(null);
  let history = useHistory();
  let match = useRouteMatch();
  const projectId = match && match.params && match.params.projectId;

  const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);
  const currentSnapshotList = useSelector(state => state.projectReducers.currentSnapshotList);
  const currentSnapshotTree = useSelector(state => state.projectReducers.currentSnapshotTree);
  const isLoadingTree = useSelector(state => state.projectReducers.isLoadingTree);

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
      font: 'normal 8pt Arial'
    }
  });

  const options = {
    template,
    orientation: Orientation.Horizontal
  };

  const handleClickOnCommit = commit => {
    if (projectId && commit.hash) {
      history.push(`${URLS.projects}${projectId}/${commit.hash}`);
    }
  };

  const commitFunction = ({ title, description, photo, author, email, hash, isSelected = false }) => ({
    hash: `${hash}`,
    subject: `${title}`,
    body: (
      <>
        <IconButton>
          <Share />
        </IconButton>
        <IconButton>
          <Delete />
        </IconButton>
        <br />
        <Typography variant="caption">
          <b>{`${moment().format('LLL')}, ${email}: `}</b>
          {description}
        </Typography>
      </>
    ),
    onMessageClick: handleClickOnCommit,
    onClick: handleClickOnCommit,
    style: isSelected === true ? { dot: { size: 10, color: 'red', strokeColor: 'blue', strokeWidth: 2 } } : undefined
    //tag: (isSelected === true && 'Selected') || undefined
  });

  const renderTreeNode = (childID, gitgraph, parentBranch) => {
    const node = currentSnapshotList[childID];
    if (node !== undefined) {
      const newBranch = gitgraph.branch({
        parentBranch: parentBranch,
        name: node.title,
        column: 2
      });
      node.children.forEach(childID => {
        renderTreeNode(childID, gitgraph, newBranch);
      });

      newBranch.commit(
        commitFunction({
          title: node.title,
          description: node.description,
          author: node.author.username,
          email: node.author.email,
          hash: node.id,
          isSelected: currentSnapshotID === node.id
        })
      );
    }
  };

  return (
    <Panel
      ref={ref}
      hasHeader
      title="Project History"
      headerActions={[
        <IconButton color="inherit" onClick={showFullHistory}>
          <MergeType />
        </IconButton>
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
        {!isEmpty(currentSnapshotTree) &&
          isLoadingTree === false &&
          currentSnapshotTree.children &&
          ((currentSnapshotTree.children.length > 0 && !isEmpty(currentSnapshotList)) ||
            currentSnapshotTree.children.length === 0) && (
            <Gitgraph options={options}>
              {gitgraph => {
                const initBranch = gitgraph.branch(currentSnapshotTree.title);
                initBranch.commit(
                  commitFunction({
                    title: currentSnapshotTree.title,
                    description: currentSnapshotTree.description,
                    author: currentSnapshotTree.author.username,
                    email: currentSnapshotTree.author.email,
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
      {/*<Grid item>*/}
      {/*  <Table>*/}
      {/*    <TableHead>*/}
      {/*      <TableRow>*/}
      {/*        <TableCell>Title</TableCell>*/}
      {/*        <TableCell align="right">Author</TableCell>*/}
      {/*        <TableCell align="right">Created</TableCell>*/}
      {/*      </TableRow>*/}
      {/*    </TableHead>*/}
      {/*    <TableBody>*/}
      {/*      <TableRow>*/}
      {/*        <TableCell component="th" scope="row">*/}
      {/*          {snapshotDetail.name}*/}
      {/*        </TableCell>*/}
      {/*        <TableCell align="right">*/}
      {/*          {snapshotDetail.author && snapshotDetail.author.username},*/}
      {/*          {snapshotDetail.author && snapshotDetail.author.email}*/}
      {/*        </TableCell>*/}
      {/*        <TableCell align="right">*/}
      {/*          {snapshotDetail.created && moment(snapshotDetail.created).format('LLL')}*/}
      {/*        </TableCell>*/}
      {/*      </TableRow>*/}
      {/*    </TableBody>*/}
      {/*  </Table>*/}
      {/*</Grid>*/}
    </Panel>
  );
});
