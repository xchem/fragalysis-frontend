/**
 * Created by ricgillams on 29/10/2018.
 */

import { ListGroupItem, ListGroup, Col, Checkbox, Row } from 'react-bootstrap';
import React, { memo, useEffect, useRef, useState } from 'react';
import * as listType from './listTypes';
import { withRouter } from 'react-router-dom';
import { getUrl, loadFromServer } from '../utils/genericList';

const ProposalList = memo(() => {
  const [state, setState] = useState();
  const list_type = listType.SESSIONS;
  const oldUrl = useRef('');
  const setOldUrl = url => {
    oldUrl.current = url;
  };
  const [proposalList, setProposalList] = useState([
    { id: 'LB-test1', owner: 'qwu18777' },
    { id: 'LB-test2', owner: 'qwu18777' },
    { id: 'LB-test3', owner: 'qwu18777' }
  ]);
  const [targetList, setTargetList] = useState([
    { id: 'target-test1', proposalId: 'LB-test1', owner: 'qwu18777' },
    { id: 'target-test2', proposalId: 'LB-test1', owner: 'qwu18777' },
    { id: 'target-test3', proposalId: 'LB-test2', owner: 'qwu18777' }
  ]);
  const [checkedProposals, setCheckedProposals] = useState([]);

  const render_method = (data, type) => {
    if (type === 'proposalList') {
      return (
        <ListGroupItem key={data.id}>
          <p>
            Title: {data.id} &emsp; &emsp; &emsp; &emsp;{' '}
            <Checkbox id={data.id} inline>
              Load proposal
            </Checkbox>
          </p>
        </ListGroupItem>
      );
    } else if (type === 'targetList') {
      return (
        <ListGroupItem key={data.id}>
          <p>
            Title: {data.id}, Proposal: {data.proposalId} &emsp; &emsp; &emsp; &emsp;
            <Checkbox inline>Fragalysis (private)</Checkbox> &emsp;
            <Checkbox inline>Fragalysis (public)</Checkbox>
          </p>
        </ListGroupItem>
      );
    }
  };

  useEffect(() => {
    loadFromServer({
      url: getUrl({ list_type }),
      setOldUrl: url => setOldUrl(url),
      old_url: oldUrl.current,
      list_type
    }).catch(error => {
      setState(() => {
        throw error;
      });
    });
  }, [list_type]);

  // const userPk = DJANGO_CONTEXT["pk"]
  // const username = DJANGO_CONTEXT["username"]
  // const {pathname} = this.props.location;
  if (proposalList) {
    return (
      <div>
        <Row>
          <Col xs={1} md={1} />
          <Col xs={4} md={4}>
            <h3>Proposal List</h3>
            <p />
            <p>Here is a list of the proposals for which you have been registered.</p>
            <p>
              Upon checking the box, the targets associated with the proposal will be uploaded into the Fragalysis cloud
              infrastructure.
            </p>
            <p>You will then be able to manage the associated data for each target independently.</p>
          </Col>
          <Col xs={6} md={6}>
            <h3>Target List</h3>
            <p />
            <p> For each proposal approved in the left column, the related targets will appear in the list below.</p>
            <p> Upon checking the private box, the target will becoming visible to users from the relevant proposal.</p>
            <p>
              {' '}
              If you would like to make your data publicly accessible, check the public box. Public targets do not
              require a FedID login for access.
            </p>
          </Col>
          <Col xs={1} md={1} />
        </Row>
        <Row>
          <p />
        </Row>
        <Row>
          <Col xs={1} md={1} />
          <Col xs={4} md={4}>
            <ListGroup>{proposalList.reverse().map(data => render_method(data, 'proposalList'))}</ListGroup>
          </Col>
          <Col xs={6} md={6}>
            <ListGroup>{targetList.reverse().map(data => render_method(data, 'targetList'))}</ListGroup>
          </Col>
          <Col xs={1} md={1} />
        </Row>
        <Row>
          <p />
        </Row>
        <Row>
          <Col xs={1} md={1} />
          <Col xs={10} md={10}>
            <h3>
              In accordance with the Diamond data policy, we use reasonable endeavours to preserve the confidentiality
              of your experimental data!!!
            </h3>
            <p>
              The Diamond data policy is located here:{' '}
              <a
                className="inline"
                href="https://www.diamond.ac.uk/Users/Policy-Documents/Policies/Experimental-Data-Management-Pol.html"
              >
                https://www.diamond.ac.uk/Users/Policy-Documents/Policies/Experimental-Data-Management-Pol.html
              </a>
            </p>
          </Col>
          <Col xs={1} md={1} />
        </Row>
      </div>
    );
  } else {
    return null;
  }
});

export default withRouter(ProposalList);
