import React, { memo, useContext, useEffect, useState } from 'react';
import { HeaderContext } from '../../header/headerContext';
import { Button, IconButton, makeStyles, Drawer, Typography, Input, Grid } from '@material-ui/core';
import { Delete, History, Share } from '@material-ui/icons';
import { Gitgraph, templateExtend, TemplateName, Orientation } from '@gitgraph/react';
import { URLS } from '../../routes/constants';
import moment from 'moment';
import Modal from '../../common/Modal';

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
    padding: theme.spacing(1),
    position: 'fixed',
    width: '100%'
  },
  historyBody: {
    marginTop: 49
  }
}));

export const ProjectDetailDrawer = memo(({ showHistory, setShowHistory }) => {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();

  var myTemplate = templateExtend(TemplateName.Metro, {
    branch: {
      lineWidth: 3,
      spacing: 25,
      label: {
        font: 'normal 8pt Arial',
        pointerWidth: 100
        //  display: false
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
      font: 'normal 8pt Arial'
    }
  });

  const options = {
    template: myTemplate
    //  orientation: Orientation.Horizontal
  };

  const handleClickOnCommit = commit => {
    console.log('redirecting to session');
    // history.push(`${URLS.target}NUDT5A`);
    // handleClick(commit);
  };

  const commitFunction = ({ title, description, photo, author, email }) => ({
    subject: `${title}`,
    body: (
      <>
        <img src={require('../../../img/xchemLogo.png')} className={classes.thumbnail} onClick={() => setOpen(true)} />
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
    onClick: handleClickOnCommit
  });

  return (
    <>
      <Drawer anchor="bottom" open={showHistory} onClose={() => setShowHistory(false)}>
        <div className={classes.drawer}>
          <div className={classes.historyHeader}>
            <form className={classes.root} noValidate autoComplete="off">
              <Grid container direction="row" justify="space-between">
                <Grid item>
                  <Input defaultValue="Hello world" inputProps={{ 'aria-label': 'description' }} />
                </Grid>
                <Grid item>
                  <Input defaultValue="Hello world" inputProps={{ 'aria-label': 'description' }} />
                </Grid>
                <Grid item>
                  <Input defaultValue="Hello world" inputProps={{ 'aria-label': 'description' }} />
                </Grid>
                <Grid item>
                  <Button variant="contained">Search</Button>
                </Grid>
              </Grid>
            </form>
          </div>
          <div className={classes.historyBody}>
            <Gitgraph options={options}>
              {gitgraph => {
                const master = gitgraph.branch('Basic molecules');
                master.commit(
                  commitFunction({
                    title: 'Add basic molecules',
                    description: 'Add all molecules are in base form',
                    author: 'Tibor Postek',
                    email: 'tibor.postek@m2ms.sk'
                  })
                );

                var hotfix1 = gitgraph.branch({
                  parentBranch: master,
                  name: 'hotfix1',
                  column: 2 // which column index it should be displayed in
                });
                var hotfix2 = gitgraph.branch({
                  parentBranch: master,
                  name: 'hotfix2',
                  column: 2 // which column index it should be displayed in
                });
                var hotfix3 = gitgraph.branch({
                  parentBranch: master,
                  name: 'hotfix3',
                  column: 2 // which column index it should be displayed in
                });

                hotfix1.commit(
                  commitFunction({
                    title: 'Add methods',
                    description: 'Add method of molecules molecule verification',
                    author: 'Tibor Postek',
                    email: 'tibor.postek@m2ms.sk'
                  })
                );

                hotfix2.commit(
                  commitFunction({
                    title: 'Add methods',
                    description: 'Add method of molecules molecule verification',
                    author: 'Tibor Postek',
                    email: 'tibor.postek@m2ms.sk'
                  })
                );
                hotfix3.commit(
                  commitFunction({
                    title: 'Add methods',
                    description: 'Add method of molecules molecule verification',
                    author: 'Tibor Postek',
                    email: 'tibor.postek@m2ms.sk'
                  })
                );

                // const majorSnapshot = gitgraph.branch('Major molecule functionality');
                // majorSnapshot.commit(
                //   commitFunction({
                //     title: 'Major snapshop',
                //     description: 'Create all major interactions are implemented',
                //     author: 'Pavol Brunclik',
                //     email: 'pavol.brunclik@m2ms.sk'
                //   })
                // );
                // const cancerMolecules = gitgraph.branch('Cancer branch molecules');
                // cancerMolecules.commit(
                //   commitFunction({
                //     title: 'Add cancer molecule models',
                //     description: 'Base model and 3 options are available',
                //     author: 'Pavol Brunclik',
                //     email: 'pavol.brunclik@m2ms.sk'
                //   })
                // );
                // cancerMolecules.commit(
                //   commitFunction({
                //     title: 'Add cancer molecule',
                //     description: 'This molecule is rare and expensive',
                //     author: 'Tibor Postek',
                //     email: 'tibor.postek@m2ms.sk'
                //   })
                // );
                // cancerMolecules.commit(
                //   commitFunction({
                //     title: 'Add medical experiment',
                //     description: 'Testing molecules for fighting with cancer',
                //     author: 'Tibor Postek',
                //     email: 'tibor.postek@m2ms.sk'
                //   })
                // );
                // cancerMolecules.commit(
                //   commitFunction({
                //     title: 'Add biological experiment',
                //     description: 'Testing molecules on animals, that are disabled by with cancer',
                //     author: 'Tibor Postek',
                //     email: 'tibor.postek@m2ms.sk'
                //   })
                // );
                //
                // majorSnapshot.commit(
                //   commitFunction({
                //     title: 'Create automatic snapshop',
                //     description: 'Automatic generated snapshot',
                //     author: 'Pavol Brunclik',
                //     email: 'pavol.brunclik@m2ms.sk'
                //   })
                // );
              }}
            </Gitgraph>
          </div>
        </div>
      </Drawer>
      <Modal open={open} onClose={() => setOpen(false)}>
        <img src={require('../../../img/xchemLogo.png')} />
      </Modal>
    </>
  );
});
