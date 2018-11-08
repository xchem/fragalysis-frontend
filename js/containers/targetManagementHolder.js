/**
 * Created by ricgillams on 31/10/2018.
 */
import React, {Component} from "react";
import {connect} from "react-redux";
import ProposalList from "../components/proposalList";

class TargetManagement extends Component {

    constructor(props) {
        super(props)
  }

  render() {
      return (
          <ProposalList key="PROPOSALLIST"/>
      )
    }
}

function mapStateToProps(state) {
  return { }
}

export default connect(mapStateToProps)(TargetManagement)