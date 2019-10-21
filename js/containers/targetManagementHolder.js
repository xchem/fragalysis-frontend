/**
 * Created by ricgillams on 31/10/2018.
 */
import React, { memo } from 'react';
import { connect } from 'react-redux';
import ProposalList from '../components/proposalList';

const TargetManagement = memo(() => {
  return <ProposalList key="PROPOSALLIST" />;
});

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(TargetManagement);
