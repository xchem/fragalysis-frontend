/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { memo, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import ReactModal from 'react-modal';
import { Tooltip, OverlayTrigger, ButtonToolbar, Row, Col } from 'react-bootstrap';
import * as apiActions from '../actions/apiActions';
import Clipboard from 'react-clipboard.js';

const customStyles = {
  overlay: {
    zIndex: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.85)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-20%',
    transform: 'translate(-50%, -50%)',
    border: '10px solid #7a7a7a',
    width: '60%'
  }
};

const ModalStateSave = memo(
  ({ savingState, latestSession, latestSnapshot, sessionId, setSavingState, setSessionTitle, setErrorMessage }) => {
    const [fraggleBoxLoc, setFraggleBoxLoc] = useState();
    const [snapshotLoc, setSnapshotLoc] = useState();
    const [title, setTitle] = useState();

    const getCookie = name => {
      if (!document.cookie) {
        return null;
      }
      const xsrfCookies = document.cookie
        .split(';')
        .map(c => c.trim())
        .filter(c => c.startsWith(name + '='));
      if (xsrfCookies.length === 0) {
        return null;
      }
      return decodeURIComponent(xsrfCookies[0].split('=')[1]);
    };

    const openFraggleLink = () => {
      var url = '';
      if (savingState === 'savingSnapshot') {
        url = window.location.protocol + '//' + window.location.hostname + '/viewer/react/snapshot/' + latestSnapshot;
        window.open(url);
      } else if (savingState === 'savingSession' || savingState === 'overwritingSession') {
        url = window.location.protocol + '//' + window.location.hostname + '/viewer/react/fragglebox/' + latestSession;
        window.open(url);
      }
    };

    const getTitle = () => {
      fetch('/api/viewscene/?uuid=' + latestSession, {
        method: 'get',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
        .catch(error => {
          setErrorMessage(error);
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(myJson) {
          var downloadedTitle = myJson.results[JSON.stringify(0)].title;
          setSessionTitle(downloadedTitle);
          return downloadedTitle;
        })
        .then(t => setTitle(t));
    };

    const handleSessionNaming = e => {
      if (e.keyCode === 13) {
        var titleTemp = e.target.value;
        console.log('submit new session name ' + titleTemp);
        setSessionTitle(titleTemp);
        const csrfToken = getCookie('csrftoken');
        var formattedState = {
          uuid: latestSession,
          title: titleTemp
        };
        fetch('/api/viewscene/' + JSON.parse(sessionId), {
          method: 'PATCH',
          headers: {
            'X-CSRFToken': csrfToken,
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formattedState)
        }).catch(error => {
          setErrorMessage(error);
        });
      }
    };

    const closeModal = () => {
      setFraggleBoxLoc(undefined);
      setSnapshotLoc(undefined);
      setTitle(undefined);
      setSavingState('UNSET');
    };

    useEffect(() => {
      ReactModal.setAppElement('body');
    }, []);

    useEffect(() => {
      if (latestSession !== undefined || latestSnapshot !== undefined) {
        setFraggleBoxLoc(latestSession);
        setSnapshotLoc(latestSnapshot);
      }
    }, [latestSession, latestSnapshot]);

    const tooltip = (
      <Tooltip id="tooltip">
        <strong>Copied!</strong>
      </Tooltip>
    );
    var urlToCopy = '';
    var sessionRename = '';
    var linkSection = '';
    if (fraggleBoxLoc !== undefined || snapshotLoc !== undefined) {
      if (savingState === 'savingSnapshot') {
        sessionRename = <Row />;
        urlToCopy =
          window.location.protocol + '//' + window.location.hostname + '/viewer/react/snapshot/' + latestSnapshot;
        linkSection = (
          <Row>
            <strong>
              A permanent, fixed snapshot of the current state has been saved:
              <br />
              <a href={urlToCopy}>{urlToCopy}</a>
            </strong>
          </Row>
        );
      } else if (savingState === 'savingSession') {
        if (title === undefined) {
          getTitle();
        }
        sessionRename = (
          <Row>
            {' '}
            <input
              id="sessionRename"
              key="sessionRename"
              style={{ width: 300 }}
              defaultValue={title}
              onKeyDown={handleSessionNaming}
            />
            <sup>
              <br />
              To overwrite session name, enter new title above and press enter.
            </sup>
          </Row>
        );
        urlToCopy =
          window.location.protocol + '//' + window.location.hostname + '/viewer/react/fragglebox/' + latestSession;
        linkSection = (
          <Row>
            <strong>
              A new session has been generated:
              <br />
              <a href={urlToCopy}>{urlToCopy}</a>
            </strong>
          </Row>
        );
      } else if (savingState === 'overwritingSession') {
        if (title === undefined) {
          getTitle();
        }
        sessionRename = (
          <Row>
            {' '}
            <input
              id="sessionRename"
              key="sessionRename"
              style={{ width: 300 }}
              defaultValue={title}
              onKeyDown={handleSessionNaming}
            />
            <sup>
              <br />
              To overwrite session name, enter new title above and press enter.
            </sup>
          </Row>
        );
        urlToCopy =
          window.location.protocol + '//' + window.location.hostname + '/viewer/react/fragglebox/' + latestSession;
        linkSection = (
          <Row>
            <strong>
              Your session has been overwritten and remains available at:
              <br />
              <a href={urlToCopy}>{urlToCopy}</a>
            </strong>
          </Row>
        );
      }
      return (
        <ReactModal
          isOpen={savingState.startsWith('saving') || savingState.startsWith('overwriting')}
          style={customStyles}
        >
          <Col xs={1} md={1} />
          <Col xs={10} md={10}>
            <Row>
              <p />
            </Row>
            {sessionRename}
            <Row>
              <p />
            </Row>
            {linkSection}
            <Row>
              <p />
            </Row>
            <Row>
              <p />
            </Row>
            <Row>
              <ButtonToolbar>
                <OverlayTrigger trigger="click" placement="bottom" overlay={tooltip}>
                  <Clipboard option-container="modal" data-clipboard-text={urlToCopy} button-title="Copy me!">
                    Copy link
                  </Clipboard>
                </OverlayTrigger>
                <h3 style={{ display: 'inline' }}> </h3>
                <button onClick={openFraggleLink}>Open in new tab</button>
                <h3 style={{ display: 'inline' }}> </h3>
                <button onClick={closeModal}>Close</button>
              </ButtonToolbar>
            </Row>
          </Col>
          <Col xs={1} md={1} />
        </ReactModal>
      );
    } else {
      return null;
    }
  }
);

function mapStateToProps(state) {
  return {
    savingState: state.apiReducers.present.savingState,
    latestSession: state.apiReducers.present.latestSession,
    latestSnapshot: state.apiReducers.present.latestSnapshot,
    sessionId: state.apiReducers.present.sessionId
  };
}

const mapDispatchToProps = {
  setSavingState: apiActions.setSavingState,
  setSessionTitle: apiActions.setSessionTitle,
  setErrorMessage: apiActions.setErrorMessage
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalStateSave);
