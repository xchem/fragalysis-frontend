/**
 * Created by abradley on 13/03/2018.
 */

import { ListGroupItem, ListGroup, Row, Col } from 'react-bootstrap';
import { FillMe } from './generalComponents';
import React, { memo } from 'react';
import { connect } from 'react-redux';

import { withRouter, Link } from 'react-router-dom';

const TargetList = memo(({ target_id_list }) => {
  const render_method = data => {
    const preview = '/viewer/react/preview/target/' + data.title;
    const sgcUrl = 'https://thesgc.org/sites/default/files/XChem/' + data.title + '/html/index.html';
    const sgcUploaded = ['BRD1A', 'DCLRE1AA', 'FALZA', 'FAM83BA', 'HAO1A', 'NUDT4A', 'NUDT5A', 'NUDT7A', 'PARP14A'];
    if (sgcUploaded.includes(data.title)) {
      return (
        <ListGroupItem key={data.id}>
          <Row>
            <Col xs={5} sm={5} mdOffset={1} md={5} lg={6}>
              <Row />
              <p />
              <Row>
                <p>
                  <Link to={preview}>{data.title}</Link>
                </p>
              </Row>
            </Col>
            <Col xs={7} sm={7} md={6} lg={5}>
              <Row />
              <p />
              <Row>
                <p>
                  <a href={sgcUrl} target="new" styles={{ float: 'right' }}>
                    Open SGC summary
                  </a>
                </p>
              </Row>
            </Col>
          </Row>
        </ListGroupItem>
      );
    } else {
      return (
        <ListGroupItem key={data.id}>
          <Row>
            <Col xs={12} sm={12} mdOffset={1} md={11} lg={11}>
              <Row />
              <p />
              <Row>
                <p>
                  <Link to={preview}>{data.title}</Link>
                </p>
              </Row>
            </Col>
          </Row>
        </ListGroupItem>
      );
    }
  };

  if (target_id_list) {
    return (
      <div>
        <h3>Target List:</h3>
        <ListGroup>{target_id_list.map(data => render_method(data))}</ListGroup>
      </div>
    );
  } else {
    return <FillMe />;
  }
});

function mapStateToProps(state) {
  return {
    target_id_list: state.apiReducers.present.target_id_list
  };
}
export default withRouter(
  connect(
    mapStateToProps,
    null
  )(TargetList)
);
