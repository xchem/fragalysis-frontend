/**
 * Created by ricgillams on 31/10/2018.
 */
import React, { memo } from 'react';
import { connect } from 'react-redux';
import SessionList from './session/sessionList';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  itemPadding: {
    padding: theme.spacing(2)
  }
}));

const Sessions = memo(() => {
  const classes = useStyles();
  return (
    <div className={classes.itemPadding}>
      <SessionList key="SESSIONLIST" />
    </div>
  );
});

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(Sessions);
