/**
 * Created by ricgillams on 21/06/2018.
 */
import { Col, Row } from 'react-bootstrap';
import React, { PureComponent } from 'react';
import TargetList from './targetList';
import SessionList from './sessionList';
import { BrowserBomb } from './browserBombModal';

export class Welcome extends PureComponent {
  render() {
    var text_div;
    // eslint-disable-next-line no-undef
    if (DJANGO_CONTEXT['authenticated'] === true) {
      // eslint-disable-next-line no-undef
      var entry_text = "You're logged in as " + DJANGO_CONTEXT['username'];
      text_div = <h3>{entry_text}</h3>;
    } else {
      text_div = (
        <h3>
          {'\n'}To view own targets login here:{' '}
          <a className="inline" href="/accounts/login">
            FedID Login
          </a>
        </h3>
      );
    }
    return (
      <Row>
        <Col xs={1} md={1} />
        <Col xs={2} md={2}>
          <Row>
            <h1>Welcome to Fragalysis{'\n'}</h1>
            {text_div}
          </Row>
          <Row>
            <p>
              <a className="inline" href="http://cs04r-sc-vserv-137.diamond.ac.uk:8089/overview/targets/">
                Target status overview
              </a>{' '}
              (only accessible within Diamond)
            </p>
          </Row>
        </Col>
        <Col xs={4} md={4}>
          <div>
            <TargetList key="TARGLIST" />
          </div>
        </Col>
        <Col xs={4} md={4}>
          <div>
            <SessionList key="SESSIONLIST" />
          </div>
        </Col>
        <Col xs={1} md={1}>
          <BrowserBomb />
        </Col>
      </Row>
    );
  }
}
export default Welcome;