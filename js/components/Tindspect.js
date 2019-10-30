import React, { memo } from 'react';
import { Row, Col } from 'react-bootstrap';
import NGLView from './nglView/nglComponents';
import { withLoadingEventList } from '../hoc/withLoadingEventList';
import { withLoadingPanddaSiteList } from '../hoc/withPanddaSiteList';
import PanddaSlider from './panddaSlider';
import EventSlider from './eventSlider';

const Tindspect = memo(() => {
  return (
    <Row>
      <Col xs={4} md={4}>
        <NGLView div_id="pandda_summary" height="200px" />
        <PanddaSlider />
        <EventSlider />
      </Col>
      <Col xs={8} md={8}>
        <NGLView div_id="pandda_major" height="600px" />
      </Col>
    </Row>
  );
});

export default withLoadingEventList(withLoadingPanddaSiteList(Tindspect));
