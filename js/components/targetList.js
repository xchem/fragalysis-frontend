/**
 * Created by abradley on 13/03/2018.
 */

import { ListGroupItem, ListGroup, Row, Col } from 'react-bootstrap';
import { FillMe } from './generalComponents';
import React, { memo, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../actions/apiActions';
import * as listType from './listTypes';

import { withRouter, Link } from 'react-router-dom';
import { getUrl, loadFromServer } from '../services/genericList';

const TargetList = memo(({ object_list, setObjectList }) => {
  const [oldUrl, setOldUrl] = useState('');

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

  useEffect(() => {
    const list_type = listType.TARGET;

    loadFromServer({
      url: getUrl({ list_type }),
      setOldUrl: url => setOldUrl(url),
      old_url: oldUrl,
      setObjectList,
      list_type
    });
  }, [oldUrl, setObjectList]);

  if (object_list) {
    return (
      <div>
        <h3>Target List:</h3>
        <ListGroup>{object_list.map(data => render_method(data))}</ListGroup>
      </div>
    );
  } else {
    return <FillMe />;
  }
});

function mapStateToProps(state) {
  return {
    object_list: state.apiReducers.present.target_id_list
  };
}
const mapDispatchToProps = {
  setObjectList: apiActions.setTargetIdList
};
export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(TargetList)
);
