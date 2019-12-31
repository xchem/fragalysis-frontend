import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as nglLoadActions from '../../reducers/ngl/nglActions';
import * as apiActions from '../../reducers/api/apiActions';
import { Button } from '@material-ui/core';
import { Save, SaveOutlined, Share } from '@material-ui/icons';
import { getStore } from '../globalStore';
import * as selectionActions from '../../reducers/selection/selectionActions';
import * as listTypes from '../listTypes';
import DownloadPdb from '../downloadPdb';
import { savingStateConst, savingTypeConst } from './constants';
import { OBJECT_TYPE } from '../nglView/constants';
import { api, METHOD, getCsrfToken } from '../../utils/api';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { canCheckTarget } from './helpers';
import { NglContext } from '../nglView/nglProvider';
import { SCENES } from '../../reducers/ngl/nglConstants';
import { HeaderContext } from '../header/headerContext';

/**
 * Created by ricgillams on 13/06/2018.
 */

export const withSessionManagement = WrappedComponent => {
  const SessionManagement = memo(
    ({
      savingState,
      uuid,
      latestSession,
      sessionId,
      sessionTitle,
      targetIdList,
      setSavingState,
      reloadApiState,
      reloadSelectionState,
      setLatestSession,
      setLatestSnapshot,
      setSessionId,
      setUuid,
      setSessionTitle,
      setVectorList,
      setBondColorMap,
      setTargetUnrecognised,
      saveCurrentStateAsSessionScene,
      reloadNglViewFromScene,
      ...rest
    }) => {
      const [/* state */ setState] = useState();
      const [saveType, setSaveType] = useState('');
      const [nextUuid, setNextUuid] = useState('');
      const [newSessionFlag, setNewSessionFlag] = useState(0);
      const [loadedSession, setLoadedSession] = useState();
      const { pathname } = window.location;
      const { nglViewList } = useContext(NglContext);
      const { setHeaderButtons, setSnackBarTitle } = useContext(HeaderContext);

      const disableButtons =
        (savingState &&
          (savingState.startsWith(savingStateConst.saving) || savingState.startsWith(savingStateConst.overwriting))) ||
        false;
      const generateArrowObject = (start, end, name, colour) => {
        return {
          name: listTypes.VECTOR + '_' + name,
          OBJECT_TYPE: OBJECT_TYPE.ARROW,
          start: start,
          end: end,
          colour: colour
        };
      };
      const generateCylinderObject = (start, end, name, colour) => {
        return {
          name: listTypes.VECTOR + '_' + name,
          OBJECT_TYPE: OBJECT_TYPE.CYLINDER,
          start: start,
          end: end,
          colour: colour
        };
      };
      const postToServer = useCallback(
        sessionState => {
          saveCurrentStateAsSessionScene();
          setSavingState(sessionState);
        },
        [saveCurrentStateAsSessionScene, setSavingState]
      );

      const newSession = useCallback(() => {
        postToServer(savingStateConst.savingSession);
        setSaveType(savingTypeConst.sessionNew);
      }, [postToServer]);

      const saveSession = useCallback(() => {
        postToServer(savingStateConst.overwritingSession);
        setSaveType(savingTypeConst.sessionNew);
      }, [postToServer]);

      const newSnapshot = useCallback(() => {
        postToServer(savingStateConst.savingSnapshot);
        setSaveType(savingTypeConst.snapshotNew);
      }, [postToServer]);

      const generateObjectList = useCallback(out_data => {
        let colour = [1, 0, 0];
        let deletions = out_data.deletions;
        let outList = [];
        for (let key in deletions) {
          outList.push(generateArrowObject(deletions[key][0], deletions[key][1], key.split('_')[0], colour));
        }
        let additions = out_data.additions;
        for (let key in additions) {
          outList.push(generateArrowObject(additions[key][0], additions[key][1], key.split('_')[0], colour));
        }
        let linker = out_data.linkers;
        for (let key in linker) {
          outList.push(generateCylinderObject(linker[key][0], linker[key][1], key.split('_')[0], colour));
        }
        let rings = out_data.ring;
        for (let key in rings) {
          outList.push(generateCylinderObject(rings[key][0], rings[key][2], key.split('_')[0], colour));
        }
        return outList;
      }, []);

      const generateBondColorMap = inputDict => {
        let out_d = {};
        Object.keys(inputDict || {}).forEach(keyItem => {
          Object.keys(inputDict[keyItem] || {}).forEach(vector => {
            const v = vector.split('_')[0];
            out_d[v] = inputDict[keyItem][vector];
          });
        });
        return out_d;
      };

      const handleVector = useCallback(
        json => {
          let objList = generateObjectList(json['3d']);
          setVectorList(objList);
          let vectorBondColorMap = generateBondColorMap(json['indices']);
          setBondColorMap(vectorBondColorMap);
        },
        [generateObjectList, setBondColorMap, setVectorList]
      );

      const redeployVectorsLocal = useCallback(
        url => {
          api({ url })
            .then(response => handleVector(response.data['vectors']))
            .catch(error => {
              setState(() => {
                throw error;
              });
            });
        },
        [handleVector, setState]
      );

      const reloadSession = useCallback(
        myJson => {
          let jsonOfView = JSON.parse(JSON.parse(JSON.parse(myJson.scene)).state);
          reloadApiState(jsonOfView.apiReducers.present);
          setSessionId(myJson.id);
          if (nglViewList.length > 0) {
            reloadSelectionState(jsonOfView.selectionReducers.present);
            nglViewList.forEach(nglView => {
              reloadNglViewFromScene(nglView.stage, nglView.id, SCENES.sessionScene, jsonOfView);
            });
            if (jsonOfView.selectionReducers.present.vectorOnList.length !== 0) {
              let url =
                window.location.protocol +
                '//' +
                window.location.host +
                '/api/vector/' +
                jsonOfView.selectionReducers.present.vectorOnList[JSON.stringify(0)] +
                '/';
              redeployVectorsLocal(url);
            }
            setSessionTitle(myJson.title);
          }
        },
        [
          reloadApiState,
          reloadSelectionState,
          nglViewList,
          setSessionTitle,
          setSessionId,
          reloadNglViewFromScene,
          redeployVectorsLocal
        ]
      );

      // After fetching scene from session
      useEffect(() => {
        if (loadedSession) {
          let jsonOfView = JSON.parse(JSON.parse(JSON.parse(loadedSession.scene)).state);
          let target = jsonOfView.apiReducers.present.target_on_name;
          let targetUnrecognised = true;
          targetIdList.forEach(item => {
            if (target === item.title) {
              targetUnrecognised = false;
            }
          });

          if (canCheckTarget(pathname) === false) {
            setTargetUnrecognised(targetUnrecognised);
          }
          if (targetUnrecognised === false && targetIdList.length > 0 && canCheckTarget(pathname) === true) {
            reloadSession(loadedSession);
          }
        }
      }, [pathname, reloadSession, setTargetUnrecognised, targetIdList, loadedSession]);

      const generateNextUuid = useCallback(() => {
        if (nextUuid === '') {
          const uuidv4 = require('uuid/v4');
          setNextUuid(uuidv4());
          setNewSessionFlag(1);
        }
      }, [nextUuid]);

      const getSessionDetails = useCallback(() => {
        api({ method: METHOD.GET, url: '/api/viewscene/?uuid=' + latestSession })
          .then(response =>
            response.data && response.data.results.length > 0
              ? setSessionTitle(response.data.results[JSON.stringify(0)].title)
              : setSessionTitle('')
          )
          .catch(error => {
            setState(() => {
              throw error;
            });
          });
      }, [latestSession, setSessionTitle, setState]);

      const updateFraggleBox = useCallback(
        myJson => {
          if (saveType === savingTypeConst.sessionNew && myJson) {
            setLatestSession(myJson.uuid);
            setSessionId(myJson.id);
            setSessionTitle(myJson.title);
            setSaveType('');
            setNextUuid('');
            getSessionDetails();
          } else if (saveType === savingTypeConst.sessionSave) {
            setSaveType('');
            getSessionDetails();
          } else if (saveType === savingTypeConst.snapshotNew && myJson) {
            setLatestSnapshot(myJson.uuid);
            setSaveType('');
          }
        },
        [getSessionDetails, saveType, setLatestSession, setLatestSnapshot, setSessionId, setSessionTitle]
      );

      // componentDidUpdate
      useEffect(() => {
        generateNextUuid();
        let hasBeenRefreshed = true;
        if (uuid !== 'UNSET') {
          api({ method: METHOD.GET, url: '/api/viewscene/?uuid=' + uuid })
            .then(response => setLoadedSession(response.data.results[0]))
            .catch(error => {
              setState(() => {
                throw error;
              });
            });
        }
        if (hasBeenRefreshed === true) {
          let store = JSON.stringify(getStore().getState());
          const timeOptions = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
          };
          let TITLE = 'Created on ' + new Intl.DateTimeFormat('en-GB', timeOptions).format(Date.now());
          let userId = DJANGO_CONTEXT['pk'];
          let stateObject = JSON.parse(store);
          let newPresentObject = Object.assign(stateObject.apiReducers.present, {
            latestSession: nextUuid
          });

          const fullState = {
            state: JSON.stringify({
              apiReducers: { present: newPresentObject },
              nglReducers: { present: stateObject.nglReducers.present },
              selectionReducers: { present: stateObject.selectionReducers.present }
            })
          };

          if (saveType === savingTypeConst.sessionNew && newSessionFlag === 1) {
            setNewSessionFlag(0);
            const formattedState = {
              uuid: nextUuid,
              title: TITLE,
              user_id: userId,
              scene: JSON.stringify(JSON.stringify(fullState))
            };
            api({
              url: '/api/viewscene/',
              method: METHOD.POST,
              headers: {
                'X-CSRFToken': getCsrfToken(),
                accept: 'application/json',
                'content-type': 'application/json'
              },
              data: JSON.stringify(formattedState)
            })
              .then(response => {
                updateFraggleBox(response.data);
              })
              .catch(error => {
                setState(() => {
                  throw error;
                });
              });
          } else if (saveType === savingTypeConst.sessionSave) {
            const formattedState = {
              scene: JSON.stringify(JSON.stringify(fullState))
            };
            api({
              url: '/api/viewscene/' + JSON.parse(sessionId),
              method: METHOD.PATCH,
              headers: {
                'X-CSRFToken': getCsrfToken(),
                accept: 'application/json',
                'content-type': 'application/json'
              },
              data: JSON.stringify(formattedState)
            })
              .then(response => {
                updateFraggleBox(response.data);
              })
              .catch(error => {
                setState(() => {
                  throw error;
                });
              });
          } else if (saveType === savingTypeConst.snapshotNew) {
            const uuidv4 = require('uuid/v4');
            const formattedState = {
              uuid: uuidv4(),
              title: 'undefined',
              user_id: userId,
              scene: JSON.stringify(JSON.stringify(fullState))
            };
            api({
              url: '/api/viewscene/',
              method: METHOD.POST,
              headers: {
                'X-CSRFToken': getCsrfToken(),
                accept: 'application/json',
                'content-type': 'application/json'
              },
              data: JSON.stringify(formattedState)
            })
              .then(response => {
                updateFraggleBox(response.data);
              })
              .catch(error => {
                setState(() => {
                  throw error;
                });
              });
          }
        }
      }, [generateNextUuid, newSessionFlag, nextUuid, saveType, sessionId, setState, setUuid, updateFraggleBox, uuid]);

      // Function for set Header buttons and snackBar information about session
      useEffect(() => {
        if (sessionTitle === undefined || sessionTitle === 'undefined') {
          setHeaderButtons([
            <Button key="saveAs" color="primary" onClick={newSession} startIcon={<Save />} disabled={disableButtons}>
              Save Session As
            </Button>,
            <Button key="share" color="primary" onClick={newSnapshot} startIcon={<Share />} disabled={disableButtons}>
              Share Snapshot
            </Button>,
            <DownloadPdb key="download" />
          ]);
          setSnackBarTitle('Currently no active session.');
        } else {
          setHeaderButtons([
            <Button
              key="saveSession"
              color="primary"
              onClick={saveSession}
              startIcon={<SaveOutlined />}
              disabled={disableButtons}
            >
              Save Session
            </Button>,
            <Button key="saveAs" color="primary" onClick={newSession} startIcon={<Save />} disabled={disableButtons}>
              Save Session As
            </Button>,
            <Button key="share" color="primary" onClick={newSnapshot} startIcon={<Share />} disabled={disableButtons}>
              Share Snapshot
            </Button>,
            <DownloadPdb key="download" />
          ]);
          setSnackBarTitle(`Session: ${sessionTitle}`);
        }

        return () => {
          setHeaderButtons(null);
          setSnackBarTitle(null);
        };
      }, [disableButtons, newSession, newSnapshot, saveSession, sessionTitle, setHeaderButtons, setSnackBarTitle]);

      return <WrappedComponent {...rest} />;
    }
  );

  function mapStateToProps(state) {
    return {
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
    reloadApiState: apiActions.reloadApiState,
    reloadSelectionState: selectionActions.reloadSelectionState,
    setLatestSession: apiActions.setLatestSession,
    setLatestSnapshot: apiActions.setLatestSnapshot,
    setSessionId: apiActions.setSessionId,
    setUuid: apiActions.setUuid,
    setSessionTitle: apiActions.setSessionTitle,
    setVectorList: selectionActions.setVectorList,
    setBondColorMap: selectionActions.setBondColorMap,
    setTargetUnrecognised: apiActions.setTargetUnrecognised,
    saveCurrentStateAsSessionScene: nglLoadActions.saveCurrentStateAsSessionScene,
    reloadNglViewFromScene: nglLoadActions.reloadNglViewFromScene
  };
  return connect(mapStateToProps, mapDispatchToProps)(SessionManagement);
};
