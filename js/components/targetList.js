/**
 * Created by abradley on 13/03/2018.
 */

import { FillMe } from './generalComponents';
import React, { memo } from 'react';
import { connect } from 'react-redux';
import { List, ListItem, ListItemText, makeStyles, ListItemSecondaryAction } from '@material-ui/core';

import { withRouter, Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  list: {
    backgroundColor: theme.palette.background.paper
  },
  listItem: {
    borderColor: '#dddddd',
    borderWidth: 1,
    borderStyle: 'solid'
  }
}));

const TargetList = memo(({ target_id_list }) => {
  const classes = useStyles();

  const render_method = data => {
    const preview = '/viewer/react/preview/target/' + data.title;
    const sgcUrl = 'https://thesgc.org/sites/default/files/XChem/' + data.title + '/html/index.html';
    const sgcUploaded = ['BRD1A', 'DCLRE1AA', 'FALZA', 'FAM83BA', 'HAO1A', 'NUDT4A', 'NUDT5A', 'NUDT7A', 'PARP14A'];

    return (
      <ListItem key={data.id} className={classes.listItem}>
        {sgcUploaded.includes(data.title) && (
          <Link to={preview}>
            <ListItemText primary={data.title} />
          </Link>
        )}
        <ListItemSecondaryAction>
          <a href={sgcUrl} target="new">
            Open SGC summary
          </a>
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  if (target_id_list) {
    return (
      <div>
        <h3>Target List:</h3>
        <List component="nav" className={classes.list}>
          {target_id_list.map(data => render_method(data))}
        </List>
      </div>
    );
  } else {
    return <FillMe />;
  }
});

function mapStateToProps(state) {
  return {
    target_id_list: state.apiReducers.present.target_id_list
  };
}
export default withRouter(connect(mapStateToProps, null)(TargetList));
