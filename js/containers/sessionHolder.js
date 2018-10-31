/**
 * Created by ricgillams on 31/10/2018.
 */
import React, {Component} from "react";
import {connect} from "react-redux";
import SessionList from "../components/sessionList";

class Sessions extends Component {

    constructor(props) {
        super(props)
  }

  render() {
      return (
          <SessionList key="SESSIONLIST"/>
      )
    }
}

function mapStateToProps(state) {
  return { }
}

export default connect(mapStateToProps)(Sessions)