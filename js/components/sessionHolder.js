/**
 * Created by ricgillams on 31/10/2018.
 */
import React, { memo } from 'react';
import { connect } from 'react-redux';
import SessionList from './session/sessionList';

const Sessions = memo(() => {
  return <SessionList key="SESSIONLIST" />;
});

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(Sessions);
