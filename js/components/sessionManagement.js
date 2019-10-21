/**
 * Created by ricgillams on 13/06/2018.
 */

import React, { memo, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as nglLoadActions from '../actions/nglLoadActions';
import * as apiActions from '../actions/apiActions';
import { Button, ButtonToolbar, Row, Col } from 'react-bootstrap';
import { css } from 'react-emotion';
import { RingLoader } from 'react-spinners';
import { getStore } from '../containers/globalStore';
import * as selectionActions from '../actions/selectionActions';
import { withRouter } from 'react-router-dom';
import * as listTypes from './listTypes';
import * as nglObjectTypes from './nglObjectTypes';
import DownloadPdb from './downloadPdb';

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const SessionManagement = memo(
  ({
    nglOrientations,
    savingState,
    uuid,
    latestSession,
    sessionId,
    sessionTitle,
    targetIdList,
    setSavingState,
    setOrientation,
    setNGLOrientation,
    loadObject,
    reloadApiState,
    reloadSelectionState,
    setLatestSession,
    setLatestSnapshot,
    setErrorMessage,
    setStageColor,
    setSessionId,
    setUuid,
    setSessionTitle,
    setVectorList,
    setBondColorMap,
    setTargetUnrecognised,
    setLoadingState
  }) => {
    const [saveType, setSaveType] = useState('');
    const [nextUuid, setNextUuid] = useState('');
    const [newSessionFlag, setNewSessionFlag] = useState(0);

    const checkTarget = myJson => {
      var jsonOfView = JSON.parse(JSON.parse(JSON.parse(myJson.scene)).state);
      var target = jsonOfView.apiReducers.present.target_on_name;
      var targetUnrecognised = true;
      for (var i in targetIdList) {
        if (target === targetIdList[i].title) {
          targetUnrecognised = false;
        }
      }
      if (targetUnrecognised === true) {
        setLoadingState(false);
      }
      setTargetUnrecognised(targetUnrecognised);
      if (targetUnrecognised === false) {
        reloadSession(myJson);
      }
    };

    const redeployVectorsLocal = url => {
      fetch(url)
        .then(response => response.json(), error => console.log('An error occurred.', error))
        .then(json => handleVector(json['vectors']));
    };

    const reloadSession = myJson => {
      var jsonOfView = JSON.parse(JSON.parse(JSON.parse(myJson.scene)).state);
      reloadApiState(jsonOfView.apiReducers.present);
      reloadSelectionState(jsonOfView.selectionReducers.present);
      setStageColor(jsonOfView.nglReducers.present.stageColor);
      restoreOrientation(jsonOfView.nglReducers.present.nglOrientations);
      if (jsonOfView.selectionReducers.present.vectorOnList.length !== 0) {
        var url =
          window.location.protocol +
          '//' +
          window.location.host +
          '/api/vector/' +
          jsonOfView.selectionReducers.present.vectorOnList[JSON.stringify(0)] +
          '/';
        redeployVectorsLocal(url);
      }
      setSessionTitle(myJson.title);
      setSessionId(myJson.id);
    };

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

    const updateFraggleBox = myJson => {
      if (saveType === 'sessionNew') {
        setLatestSession(myJson.uuid);
        setSessionId(myJson.id);
        setSessionTitle(myJson.title);
        setSaveType('');
        setSavingState('savingSession');
        setNextUuid('');
        getSessionDetails();
      } else if (saveType === 'sessionSave') {
        setSaveType('');
        setSavingState('overwritingSession');
        getSessionDetails();
      } else if (saveType === 'snapshotNew') {
        setLatestSnapshot(myJson.uuid);
        setSaveType('');
        setSavingState('savingSnapshot');
      }
    };

    const newSession = () => {
      setSaveType('sessionNew');
      postToServer();
    };

    const saveSession = () => {
      setSaveType('sessionNew');
      postToServer();
    };

    const newSnapshot = () => {
      setSaveType('snapshotNew');
      postToServer();
    };

    const deployErrorModal = error => {
      setErrorMessage(error);
    };

    const postToServer = () => {
      for (var key in nglOrientations) {
        setOrientation(key, 'REFRESH');
      }
    };

    const handleJson = myJson => {
      if (myJson.scene === undefined) {
        return;
      }
      checkTarget(myJson);
    };

    const restoreOrientation = myOrientDict => {
      for (var div_id in myOrientDict) {
        var orientation = myOrientDict[div_id]['orientation'];
        var components = myOrientDict[div_id]['components'];
        for (var component in components) {
          loadObject(components[component]);
        }
        setNGLOrientation(div_id, orientation);
      }
    };

    const generateArrowObject = (start, end, name, colour) => {
      return {
        name: listTypes.VECTOR + '_' + name,
        OBJECT_TYPE: nglObjectTypes.ARROW,
        start: start,
        end: end,
        colour: colour
      };
    };

    const generateCylinderObject = (start, end, name, colour) => {
      return {
        name: listTypes.VECTOR + '_' + name,
        OBJECT_TYPE: nglObjectTypes.CYLINDER,
        start: start,
        end: end,
        colour: colour
      };
    };

    const generateObjectList = out_data => {
      var colour = [1, 0, 0];
      var deletions = out_data.deletions;
      var outList = [];
      for (var key in deletions) {
        outList.push(generateArrowObject(deletions[key][0], deletions[key][1], key.split('_')[0], colour));
      }
      var additions = out_data.additions;
      for (var key in additions) {
        outList.push(generateArrowObject(additions[key][0], additions[key][1], key.split('_')[0], colour));
      }
      var linker = out_data.linkers;
      for (var key in linker) {
        outList.push(generateCylinderObject(linker[key][0], linker[key][1], key.split('_')[0], colour));
      }
      var rings = out_data.ring;
      for (var key in rings) {
        outList.push(generateCylinderObject(rings[key][0], rings[key][2], key.split('_')[0], colour));
      }
      return outList;
    };

    const generateBondColorMap = inputDict => {
      var out_d = {};
      for (var key in inputDict) {
        for (var vector in inputDict[key]) {
          var vect = vector.split('_')[0];
          out_d[vect] = inputDict[key][vector];
        }
      }
      return out_d;
    };

    const handleVector = json => {
      var objList = generateObjectList(json['3d']);
      setVectorList(objList);
      var vectorBondColorMap = generateBondColorMap(json['indices']);
      setBondColorMap(vectorBondColorMap);
    };

    const generateNextUuid = () => {
      if (nextUuid === '') {
        const uuidv4 = require('uuid/v4');
        setNextUuid(uuidv4());
        setNewSessionFlag(1);
      }
    };

    const getSessionDetails = () => {
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
          var title = myJson.results[JSON.stringify(0)].title;
          return title;
        })
        .then(title => setSessionTitle(title));
    };

    // componentDidUpdate
    useEffect(() => {
      generateNextUuid();
      var hasBeenRefreshed = true;
      if (uuid !== 'UNSET') {
        fetch('/api/viewscene/?uuid=' + uuid)
          .then(function(response) {
            return response.json();
          })
          .then(json => handleJson(json.results[0]));
        setUuid('UNSET');
      }
      for (var key in nglOrientations) {
        if (nglOrientations[key] === 'REFRESH') {
          hasBeenRefreshed = false;
        }
        if (nglOrientations[key] === 'STARTED') {
          hasBeenRefreshed = false;
        }
      }
      if (hasBeenRefreshed === true) {
        var store = JSON.stringify(getStore().getState());
        const csrfToken = getCookie('csrftoken');
        const timeOptions = {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false
        };
        var TITLE = 'Created on ' + new Intl.DateTimeFormat('en-GB', timeOptions).format(Date.now());
        // eslint-disable-next-line no-undef
        var userId = DJANGO_CONTEXT['pk'];
        var stateObject = JSON.parse(store);
        var newPresentObject = Object.assign(stateObject.apiReducers.present, {
          latestSession: nextUuid
        });
        var newApiObject = Object.assign(stateObject.apiReducers, {
          present: newPresentObject
        });
        var newStateObject = Object.assign(JSON.parse(store), {
          apiReducers: newApiObject
        });
        var fullState = { state: JSON.stringify(newStateObject) };
        if (saveType === 'sessionNew' && newSessionFlag === 1) {
          setNewSessionFlag(0);
          var formattedState = {
            uuid: nextUuid,
            title: TITLE,
            user_id: userId,
            scene: JSON.stringify(JSON.stringify(fullState))
          };
          fetch('/api/viewscene/', {
            method: 'post',
            headers: {
              'X-CSRFToken': csrfToken,
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formattedState)
          })
            .then(function(response) {
              return response.json();
            })
            .then(myJson => {
              updateFraggleBox(myJson);
            })
            .catch(error => {
              deployErrorModal(error);
            });
        } else if (saveType === 'sessionSave') {
          formattedState = {
            scene: JSON.stringify(JSON.stringify(fullState))
          };
          fetch('/api/viewscene/' + JSON.parse(sessionId), {
            method: 'PATCH',
            headers: {
              'X-CSRFToken': csrfToken,
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formattedState)
          })
            .then(function(response) {
              return response.json();
            })
            .then(myJson => {
              updateFraggleBox(myJson);
            })
            .catch(error => {
              deployErrorModal(error);
            });
        } else if (saveType === 'snapshotNew') {
          const uuidv4 = require('uuid/v4');
          formattedState = {
            uuid: uuidv4(),
            title: 'undefined',
            user_id: userId,
            scene: JSON.stringify(JSON.stringify(fullState))
          };
          fetch('/api/viewscene/', {
            method: 'post',
            headers: {
              'X-CSRFToken': csrfToken,
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formattedState)
          })
            .then(function(response) {
              return response.json();
            })
            .then(myJson => {
              updateFraggleBox(myJson);
            })
            .catch(error => {
              deployErrorModal(error);
            });
        }
      }
    }, [deployErrorModal, generateNextUuid, handleJson, newSessionFlag, nextUuid, nglOrientations, saveType, sessionId, setUuid, updateFraggleBox, uuid]);

    const { pathname } = location;
    var buttons = '';
    if (
      pathname !== '/viewer/react/landing' &&
      pathname !== '/viewer/react/funders' &&
      pathname !== '/viewer/react/sessions' &&
      pathname !== '/viewer/react/targetmanagement'
    ) {
      if (sessionTitle === undefined || sessionTitle === 'undefined') {
        buttons = (
          <Col>
            <ButtonToolbar>
              <Button bsSize="sm" bsStyle="info" disabled>
                Save Session
              </Button>
              <Button bsSize="sm" bsStyle="info" onClick={newSession}>
                Save Session As...
              </Button>
              <Button bsSize="sm" bsStyle="info" onClick={newSnapshot}>
                Share Snapshot
              </Button>
              <DownloadPdb />
            </ButtonToolbar>
            <Row>
              <p>Currently no active session.</p>
            </Row>
          </Col>
        );
      } else {
        buttons = (
          <Col>
            <ButtonToolbar>
              <Button bsSize="sm" bsStyle="info" onClick={saveSession}>
                Save Session
              </Button>
              <Button bsSize="sm" bsStyle="info" onClick={newSession}>
                Save Session As...
              </Button>
              <Button bsSize="sm" bsStyle="info" onClick={newSnapshot}>
                Share Snapshot
              </Button>
              <DownloadPdb />
            </ButtonToolbar>
            <Row>
              <p>Session: {sessionTitle}</p>
            </Row>
          </Col>
        );
      }
    }
    if (savingState.startsWith('saving') || savingState.startsWith('overwriting')) {
      return (
        <RingLoader
          className={override}
          sizeUnit={'px'}
          size={30}
          color={'#7B36D7'}
          loading={savingState.startsWith('saving') || savingState.startsWith('overwriting')}
        />
      );
    } else {
      return <ButtonToolbar>{buttons}</ButtonToolbar>;
    }
  }
);

function mapStateToProps(state) {
  return {
    nglOrientations: state.nglReducers.present.nglOrientations,
    savingState: state.apiReducers.present.savingState,
    uuid: state.apiReducers.present.uuid,
    latestSession: state.apiReducers.present.latestSession,
    sessionId: state.apiReducers.present.sessionId,
    sessionTitle: state.apiReducers.present.sessionTitle,
    targetIdList: state.apiReducers.present.target_id_list
  };
}

const mapDispatchToProps = {
  setSavingState: apiActions.setSavingState,
  setOrientation: nglLoadActions.setOrientation,
  setNGLOrientation: nglLoadActions.setNGLOrientation,
  loadObject: nglLoadActions.loadObject,
  reloadApiState: apiActions.reloadApiState,
  reloadSelectionState: selectionActions.reloadSelectionState,
  setLatestSession: apiActions.setLatestSession,
  setLatestSnapshot: apiActions.setLatestSnapshot,
  setErrorMessage: apiActions.setErrorMessage,
  setStageColor: nglLoadActions.setStageColor,
  setSessionId: apiActions.setSessionId,
  setUuid: apiActions.setUuid,
  setSessionTitle: apiActions.setSessionTitle,
  setVectorList: selectionActions.setVectorList,
  setBondColorMap: selectionActions.setBondColorMap,
  setTargetUnrecognised: apiActions.setTargetUnrecognised,
  setLoadingState: nglLoadActions.setLoadingState
};
export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SessionManagement)
);
