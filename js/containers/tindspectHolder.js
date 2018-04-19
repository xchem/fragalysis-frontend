import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Grid, Well } from 'react-bootstrap';
import NGLView from '../components/nglComponents';
import EventList from '../components/eventList';
import PanddaSiteList from '../components/panddaSiteList';
import PanddaSlider from '../components/panddaSlider';
import EventSlider from '../components/eventSlider';

class Tindspect extends Component {

    constructor(props) {
        super(props)
  }

  render() {
      return (
          <Row >
              <PanddaSiteList />
              <Col xs={4} md={4}>
                  <NGLView div_id="pandda_summary" height="200px"/>
                  <PanddaSlider />
                  <EventList />
                  <EventSlider />
              </Col>
              <Col xs={8} md={8} >
                  <NGLView div_id="pandda_major" height="600px"/>
              </Col>
          </Row>
      )
    }

}

function mapStateToProps(state) {
  return {
      
      
  }
}


export default connect(mapStateToProps)(Tindspect)