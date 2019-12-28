import React, { Fragment, memo, useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as nglLoadActions from '../../reducers/ngl/nglActions';
import * as apiActions from '../../reducers/api/apiActions';
import { Button, makeStyles, Snackbar, IconButton } from '@material-ui/core';
import { Close, Save, SaveOutlined, Share } from '@material-ui/icons';
import { getStore } from '../globalStore';
import * as selectionActions from '../../reducers/selection/selectionActions';
import * as listTypes from '../listTypes';
import DownloadPdb from '../downloadPdb';
import { savingStateConst, savingTypeConst } from './constants';
import { OBJECT_TYPE } from '../nglView/constants';
import { api, METHOD, getCsrfToken } from '../../utils/api';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { notCheckTarget } from './helpers';
import { NglContext } from '../nglView/nglProvider';
import { SCENES } from '../../reducers/ngl/nglConstants';

/**
 * Created by ricgillams on 13/06/2018.
 */

const useStyles = makeStyles(() => ({
  loader: {
    display: 'block',
    margin: '0 auto',
    borderCcolor: 'red'
  }
}));
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
    setLoadingState,
    saveCurrentStateAsSessionScene,
    reloadNglViewFromScene
  }) => {
    const [/* state */ setState] = useState();
    const [saveType, setSaveType] = useState('');
    const [nextUuid, setNextUuid] = useState('');
    const [newSessionFlag, setNewSessionFlag] = useState(0);
    const [loadedSession, setLoadedSession] = useState();
    const classes = useStyles();
    const { pathname } = window.location;
    const { nglViewList } = useContext(NglContext);

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
    const postToServer = sessionState => {
      saveCurrentStateAsSessionScene();
      setSavingState(sessionState);
    };
    const newSession = () => {
      postToServer(savingStateConst.savingSession);
      setSaveType(savingTypeConst.sessionNew);
    };
    const saveSession = () => {
      postToServer(savingStateConst.overwritingSession);
      setSaveType(savingTypeConst.sessionNew);
    };
    const newSnapshot = () => {
      postToServer(savingStateConst.savingSnapshot);
      setSaveType(savingTypeConst.snapshotNew);
    };

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
        setSessionId(myJson.id);
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

        if (targetUnrecognised === true) {
          setLoadingState(false);
        }
        if (notCheckTarget(pathname) === false) {
          setTargetUnrecognised(targetUnrecognised);
        }
        if (targetUnrecognised === false && targetIdList.length > 0) {
          reloadSession(loadedSession);
        }
      }
    }, [pathname, reloadSession, setLoadingState, setTargetUnrecognised, targetIdList, loadedSession]);

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
              setOpenSnackBar(true);
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
              setOpenSnackBar(true);
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
              setOpenSnackBar(true);
            })
            .catch(error => {
              setState(() => {
                throw error;
              });
            });
        }
      }
    }, [generateNextUuid, newSessionFlag, nextUuid, saveType, sessionId, setState, setUuid, updateFraggleBox, uuid]);

    const [openSnackBar, setOpenSnackBar] = React.useState(true);
    const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpenSnackBar(false);
    };

    const snackBar = title => (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        open={openSnackBar}
        onClose={handleClose}
        ContentProps={{
          'aria-describedby': 'message-id'
        }}
        message={<span id="message-id">{title}</span>}
        action={[
          <IconButton key="close" aria-label="close" color="inherit" className={classes.close} onClick={handleClose}>
            <Close />
          </IconButton>
        ]}
      />
    );
    let buttons = null;
    if (
      pathname !== '/viewer/react/landing' &&
      pathname !== '/viewer/react/funders' &&
      pathname !== '/viewer/react/sessions' &&
      pathname !== '/viewer/react/targetmanagement'
    ) {
      if (sessionTitle === undefined || sessionTitle === 'undefined') {
        buttons = (
          <Fragment>
            <Button color="primary" onClick={newSession} startIcon={<Save />} disabled={disableButtons}>
              Save Session As
            </Button>
            <Button color="primary" onClick={newSnapshot} startIcon={<Share />} disabled={disableButtons}>
              Share Snapshot
            </Button>
            <DownloadPdb />
            {snackBar('Currently no active session.')}
          </Fragment>
        );
      } else {
        buttons = (
          <Fragment>
            <Button color="primary" onClick={saveSession} startIcon={<SaveOutlined />} disabled={disableButtons}>
              Save Session
            </Button>
            <Button color="primary" onClick={newSession} startIcon={<Save />} disabled={disableButtons}>
              Save Session As
            </Button>
            <Button color="primary" onClick={newSnapshot} startIcon={<Share />} disabled={disableButtons}>
              Share Snapshot
            </Button>
            <DownloadPdb />
            {snackBar(`Session: ${sessionTitle}`)}
          </Fragment>
        );
      }
    }

    return buttons;
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
  setLoadingState: nglLoadActions.setLoadingState,
  saveCurrentStateAsSessionScene: nglLoadActions.saveCurrentStateAsSessionScene,
  reloadNglViewFromScene: nglLoadActions.reloadNglViewFromScene
};
export default connect(mapStateToProps, mapDispatchToProps)(SessionManagement);
