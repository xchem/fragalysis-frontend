/**
 * Created by ricgillams on 21/06/2018.
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Grid, Well } from 'react-bootstrap';
import {Welcome} from "../components/landing";
import {TargetList} from "../components/targetList";

class Landing extends Component {

    constructor(props) {
        super(props)
  }

  render() {
      return (
          <Welcome/>
      )
    }
}

function mapStateToProps(state) {
  return { }
}

export default connect(mapStateToProps)(Landing)