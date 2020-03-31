import React, { memo } from 'react';
import { IconButton, makeStyles, Drawer, Typography, Grid } from '@material-ui/core';
import { Delete, Share, Close } from '@material-ui/icons';
import { Gitgraph, templateExtend, TemplateName } from '@gitgraph/react';
import { URLS } from '../../routes/constants';
import moment from 'moment';
import Modal from '../../common/Modal';
import { useSelector } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';
import palette from '../../../theme/palette';

const useStyles = makeStyles(theme => ({
  drawer: {
    height: 400,
    overflow: 'auto'
  },
  thumbnail: {
    float: 'left',
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 12,
    width: 66
  },
  historyHeader: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    position: 'fixed',
    width: '100%'
  },
  historyBody: {
    marginTop: 49
  },
  headerTitle: {
    padding: theme.spacing(1)
  }
}));

const myTemplate = templateExtend(TemplateName.Metro, {
  branch: {
    lineWidth: 3,
    spacing: 25,
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
    spacing: 15,
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
  template: myTemplate
};

export const ProjectDetailDrawer = memo(({ showHistory, setShowHistory }) => {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();
  let history = useHistory();
  let match = useRouteMatch();
  const projectId = match && match.params && match.params.projectId;
  const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);
  const currentSnapshotList = useSelector(state => state.projectReducers.currentSnapshotList);
  const currentSnapshotTree = useSelector(state => state.projectReducers.currentSnapshotTree);
  const isLoadingTree = useSelector(state => state.projectReducers.isLoadingTree);

  const handleClickOnCommit = commit => {
    if (projectId && commit.hash) {
      history.push(`${URLS.projects}${projectId}/${commit.hash}`);
    }
  };
  const commitFunction = ({ title, description, photo, author, email, hash, isSelected }) => ({
    hash: `${hash}`,
    subject: `${title}`,
    body: (
      <>
        {/*<img src={require('../../../img/xchemLogo.png')} className={classes.thumbnail} onClick={() => setOpen(true)} />*/}
        {/*<IconButton>*/}
        {/*  <Delete />*/}
        {/*</IconButton>*/}
        {/*<br />*/}
        <Typography variant="caption">
          <b>{`${moment().format('LLL')}, ${email}: `}</b>
          {description}
        </Typography>
        <IconButton disabled>
          <Share />
        </IconButton>
      </>
    ),
    onMessageClick: handleClickOnCommit,
    onClick: handleClickOnCommit,
    style: isSelected ? { dot: { size: 10, color: 'red', strokeColor: 'blue', strokeWidth: 2 } } : undefined,
    tag: (isSelected === true && 'selected snapshot') || undefined
  });

  const renderTreeNode = (childID, gitgraph, parentBranch) => {
    const node = currentSnapshotList[childID];
    if (node !== undefined) {
      const newBranch = gitgraph.branch({
        from: parentBranch,
        name: node.title
      });

      newBranch.commit(
        commitFunction({
          title: node.title || '',
          description: node.description || '',
          author: (node.author && node.author.username) || '',
          email: (node.author && node.author.email) || '',
          hash: node.id,
          isSelected: currentSnapshotID === node.id
        })
      );

      node.children.forEach(childID => {
        renderTreeNode(childID, gitgraph, newBranch);
      });
    }
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  return (
    <>
      <Drawer anchor="bottom" open={showHistory} onClose={handleCloseHistory}>
        <div className={classes.drawer}>
          <div className={classes.historyHeader}>
            <Grid container direction="row" justify="space-between">
              <Grid item className={classes.headerTitle}>
                <Typography variant="h6" color="inherit" noWrap>
                  Project History
                </Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={handleCloseHistory} color="inherit">
                  <Close />
                </IconButton>
              </Grid>
            </Grid>
          </div>
          <div className={classes.historyBody}>
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
                        description: currentSnapshotTree.description || '',
                        author: (currentSnapshotTree.author && currentSnapshotTree.author.username) || '',
                        email: (currentSnapshotTree.author && currentSnapshotTree.author.email) || '',
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
        </div>
      </Drawer>
      <Modal open={open} onClose={() => setOpen(false)}>
        <img src={require('../../../img/xchemLogo.png')} />
      </Modal>
    </>
  );
});
