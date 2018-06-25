/**
 * Created by ricgillams on 21/06/2018.
 */
import { ListGroupItem, ListGroup, Col, Row} from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'
import * as nglLoadActions from "../actions/nglLoadActions";
import LandingTargetList from "./landingTargetList";
import { Link } from 'react-router-dom'

export class Welcome extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        return (
            <Row >
              <Col xs={4} md={4} >
                  <div>
                      <h3>Welcome to Fragalysis{"\n"}</h3>
                      <h3>{"\n"}To view own targets login here: <a href="/accounts/login">FedID Login</a></h3>
                  </div>
              </Col>
              <Col xs={4} md={4} >
                  <div>
                      <LandingTargetList key="<li><Link to='/viewer/react/preview/TARGNAME'>TARGNAME</Link></li>"/>
                  </div>
              </Col>
          </Row>
        )
    }
}

function mapStateToProps(state) {
  return {
      redirectFlag: state.apiReducers.redirectFlag,
  }
}
const mapDispatchToProps = {
    setUuid: nglLoadActions.setUuid,
}

export default connect(mapStateToProps, mapDispatchToProps)(Welcome)