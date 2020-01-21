import React, { memo } from 'react';
import { Panel } from '../../common/Surfaces/Panel';
import { InputAdornment, makeStyles, TextField } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import moment from 'moment';
import { Gitgraph, templateExtend, TemplateName } from '@gitgraph/react';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  table: {
    minWidth: 650
  },
  search: {
    margin: theme.spacing(1)
  }
}));

export const ProjectDetailGit = memo(() => {
  const classes = useStyles();

  var withoutHash = templateExtend(TemplateName.Metro, {
    commit: {
      message: {
        displayHash: false
      }
    }
  });

  const options = {
    template: withoutHash
  };

  const commitFunction = ({ title, description, author }) => {};

  return (
    <Panel
      hasHeader
      title="Snaphots"
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
          const master = gitgraph.branch('master');
          master.commit('Init session of the the project');
          master
            .commit('Add README')
            .commit('Add tests')
            .commit('Implement feature');
          master.tag('v1.0');
          const newFeature = gitgraph.branch('new-feature');
          newFeature.commit({
            author: 'Tibor Postek <tibor.postek@m2ms.sk>',
            subject: `Major session, ${moment().format('LLL')}`,
            body: (
              <>
                <img src={require('../../../img/dlsLogo.png')} height="60px" width="100px" />
                All major interactions are implemented
              </>
            ),
            // "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends.",
            style: {
              dot: {
                color: 'yellow',
                strokeColor: 'green',
                strokeWidth: 20
              }
            },
            tag: 'v1.0',
            onClick: e => {
              console.log('clicked ', e);
            },
            onMouseOver: e => {
              console.log('mouse over, ', e);
            }
          });
          master.commit('Hotfix a bug');
          newFeature.commit('Fix tests');
          // Merge `newFeature` into `master`
          master.merge(newFeature, 'Release new version');
        }}
      </Gitgraph>
    </Panel>
  );
});
