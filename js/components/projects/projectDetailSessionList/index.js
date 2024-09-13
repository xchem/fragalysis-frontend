import React, { memo } from 'react';
import { Panel } from '../../common/Surfaces/Panel';
import { InputAdornment, makeStyles, TextField, IconButton } from '@material-ui/core';
import { Delete, Search, Share } from '@material-ui/icons';
import moment from 'moment';
import { Gitgraph, templateExtend, TemplateName } from '@gitgraph/react';
import Modal from '../../common/Modal';
import { URLS } from '../../routes/constants';
import { COMPANIES, get_logo } from '../../funders/constants';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  table: {
    minWidth: 650
  },
  search: {
    margin: theme.spacing(1)
  },
  thumbnail: {
    float: 'left',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    width: 66
  },
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  }
}));

export const ProjectDetailSessionList = memo(({ history }) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

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
        font: 'normal 11pt Arial'
        // displayAuthor: false
      },
      spacing: 10,
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
  };

  const handleClickOnCommit = commit => {
    console.log('redirecting to session');
    history.push(`${URLS.target}NUDT5A`);
  };

  const commitFunction = ({ title, description, photo, author, email }) => ({
    author: ` <${email}>`,
    subject: `${moment().format('LLL')}: ${title}`,
    body: (
      <>
        <img src={get_logo(COMPANIES.xchem.image)} className={classes.thumbnail} onClick={() => setOpen(true)} />
        {description}
        <IconButton>
          <Share />
        </IconButton>
        <IconButton>
          <Delete />
        </IconButton>
      </>
    ),
    onMessageClick: handleClickOnCommit,
    onClick: handleClickOnCommit
  });

  return (
    <Panel
      hasHeader
      title="Project sessions"
      headerActions={[
        <TextField
          className={classes.search}
          id="input-with-icon-textfield"
          placeholder="Search"
          size="small"
          color="primary"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
      ]}
    >
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
          const majorSnapshot = gitgraph.branch('Major molecule functionality');
          majorSnapshot.commit(
            commitFunction({
              title: 'Major snapshop',
              description: 'Create all major interactions are implemented',
              author: 'Pavol Brunclik',
              email: 'pavol.brunclik@m2ms.sk'
            })
          );
          const cancerMolecules = gitgraph.branch('Cancer branch molecules');
          cancerMolecules.commit(
            commitFunction({
              title: 'Add cancer molecule models',
              description: 'Base model and 3 options are available',
              author: 'Pavol Brunclik',
              email: 'pavol.brunclik@m2ms.sk'
            })
          );
          cancerMolecules.commit(
            commitFunction({
              title: 'Add cancer molecule',
              description: 'This molecule is rare and expensive',
              author: 'Tibor Postek',
              email: 'tibor.postek@m2ms.sk'
            })
          );
          cancerMolecules.commit(
            commitFunction({
              title: 'Add medical experiment',
              description: 'Testing molecules for fighting with cancer',
              author: 'Tibor Postek',
              email: 'tibor.postek@m2ms.sk'
            })
          );
          cancerMolecules.commit(
            commitFunction({
              title: 'Add biological experiment',
              description: 'Testing molecules on animals, that are disabled by with cancer',
              author: 'Tibor Postek',
              email: 'tibor.postek@m2ms.sk'
            })
          );

          majorSnapshot.commit(
            commitFunction({
              title: 'Create automatic snapshop',
              description: 'Automatic generated snapshot',
              author: 'Pavol Brunclik',
              email: 'pavol.brunclik@m2ms.sk'
            })
          );

          master.commit(
            commitFunction({
              title: 'Add methods',
              description: 'Add method of molecules molecule verification',
              author: 'Tibor Postek',
              email: 'tibor.postek@m2ms.sk'
            })
          );
        }}
      </Gitgraph>
      <Modal open={open} onClose={() => setOpen(false)}>
        <img src={get_logo(COMPANIES.xchem.image)} />
      </Modal>
    </Panel>
  );
});
