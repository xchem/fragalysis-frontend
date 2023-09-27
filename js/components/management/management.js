/**
 * Created by ricgillams on 29/10/2018.
 */
import { Grid, makeStyles, Checkbox, ListItemSecondaryAction, List, ListItem, ListItemText } from '@material-ui/core';
import React, { memo } from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: 'inherit',
    width: 'inherit',
    padding: 8
  },
  paddingItem: {
    padding: 8
  },
  list: {
    backgroundColor: theme.palette.background.paper
  },
  listItem: {
    borderColor: '#dddddd',
    borderWidth: 1,
    borderStyle: 'solid'
  }
}));

export const Management = memo(() => {
  const classes = useStyles();

  const proposalList = [
    { id: 'LB-test1', owner: 'qwu18777' },
    { id: 'LB-test2', owner: 'qwu18777' },
    { id: 'LB-test3', owner: 'qwu18777' }
  ];
  const targetList = [
    { id: 'target-test1', proposalId: 'LB-test1', owner: 'qwu18777' },
    { id: 'target-test2', proposalId: 'LB-test1', owner: 'qwu18777' },
    { id: 'target-test3', proposalId: 'LB-test2', owner: 'qwu18777' }
  ];

  const render_method = (data, type) => {
    if (type === 'proposalList') {
      return (
        <ListItem key={data.id} className={classes.listItem}>
          <ListItemText>Title: {data.id}</ListItemText>
          <ListItemSecondaryAction>
            <Checkbox id={data.id}>Load proposal</Checkbox>
          </ListItemSecondaryAction>
        </ListItem>
      );
    } else if (type === 'targetList') {
      return (
        <ListItem key={data.id} className={classes.listItem}>
          <ListItemText>
            Title: {data.id}, Proposal: {data.proposalId}
          </ListItemText>
          <ListItemSecondaryAction>
            <Checkbox>Fragalysis (private)</Checkbox>
            <Checkbox>Fragalysis (public)</Checkbox>
          </ListItemSecondaryAction>
        </ListItem>
      );
    }
  };

  if (proposalList) {
    return (
      <Grid container direction="column" justifyContent="space-between" className={classes.root}>
        <Grid item>
          <Grid container>
            <Grid item xs={6} md={6} className={classes.paddingItem}>
              <h3>Proposal List</h3>
              <p>Here is a list of the proposals for which you have been registered.</p>
              <p>
                Upon checking the box, the targets associated with the proposal will be uploaded into the Fragalysis
                cloud infrastructure.
              </p>
              <p>You will then be able to manage the associated data for each target independently.</p>
            </Grid>
            <Grid item xs={6} md={6} className={classes.paddingItem}>
              <h3>Target List</h3>
              <p> For each proposal approved in the left column, the related targets will appear in the list below.</p>
              <p>
                Upon checking the private box, the target will becoming visible to users from the relevant proposal.
              </p>
              <p>
                If you would like to make your data publicly accessible, check the public box. Public targets do not
                require a FedID login for access.
              </p>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={6} md={6} className={classes.paddingItem}>
              <List>{proposalList.reverse().map(data => render_method(data, 'proposalList'))}</List>
            </Grid>
            <Grid item xs={6} md={6} className={classes.paddingItem}>
              <List>{targetList.reverse().map(data => render_method(data, 'targetList'))}</List>
            </Grid>
          </Grid>
        </Grid>

        <Grid container item className={classes.paddingItem}>
          <Grid item>
            <h3>
              In accordance with the Diamond data policy, we use reasonable endeavours to preserve the confidentiality
              of your experimental data!!!
            </h3>
            <p>
              The Diamond data policy is located here:
              <a
                className="inline"
                href="https://www.diamond.ac.uk/Users/Policy-Documents/Policies/Experimental-Data-Management-Pol.html"
              >
                https://www.diamond.ac.uk/Users/Policy-Documents/Policies/Experimental-Data-Management-Pol.html
              </a>
            </p>
          </Grid>
        </Grid>
      </Grid>
    );
  } else {
    return null;
  }
});
