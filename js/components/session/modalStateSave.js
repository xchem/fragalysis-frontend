/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { memo, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Modal from '../common/Modal';
import { Grid, makeStyles } from '@material-ui/core';
import * as apiActions from '../../reducers/api/apiActions';
import { TextField } from '../common/Inputs/TextField';
import { Button } from '../common/Inputs/Button';
import { savingStateConst } from './constants';
import { updateClipboard } from './helpers';
import { api } from '../../utils/api';

const useStyles = makeStyles(theme => ({
  row: {
    width: 'inherit'
  },
  textField: {
    width: 'inherit',
    margin: theme.spacing(1)
  }
}));

const ModalStateSave = memo(
  ({ savingState, latestSession, latestSnapshot, sessionId, setSavingState, setSessionTitle }) => {
    const [fraggleBoxLoc, setFraggleBoxLoc] = useState();
    const [snapshotLoc, setSnapshotLoc] = useState();
    const [title, setTitle] = useState('');
    const classes = useStyles();
    const [state, setState] = useState();

    let urlToCopy = '';
    const port = window.location.port ? `:${window.location.port}` : '';
    let sessionRename = false;
    let linkTitle = '';

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
      if (savingState === savingStateConst.savingSnapshot) {
        url =
          window.location.protocol +
          '//' +
          window.location.hostname +
          port +
          '/viewer/react/snapshot/' +
          latestSnapshot;
        window.open(url);
      } else if (
        savingState === savingStateConst.savingSession ||
        savingState === savingStateConst.overwritingSession
      ) {
        url =
          window.location.protocol +
          '//' +
          window.location.hostname +
          port +
          '/viewer/react/fragglebox/' +
          latestSession;
        window.open(url);
      }
    };

    const getTitle = () => {
      api({
        url: '/api/viewscene/?uuid=' + latestSession,
        method: 'get',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json'
        }
      })
        .then(response => {
          var downloadedTitle = response.data.results[JSON.stringify(0)].title;
          setSessionTitle(downloadedTitle);
          return downloadedTitle;
        })
        .then(t => setTitle(t))
        .catch(error => {
          setState(() => {
            throw error;
          });
        });
    };

    const handleSessionNaming = e => {
      if (e.keyCode === 13) {
        var titleTemp = e.target.value;
        setSessionTitle(titleTemp);
        const csrfToken = getCookie('csrftoken');
        var formattedState = {
          uuid: latestSession,
          title: titleTemp
        };
        api({
          url: '/api/viewscene/' + JSON.parse(sessionId),
          method: 'PATCH',
          headers: {
            'X-CSRFToken': csrfToken,
            accept: 'application/json',
            'content-type': 'application/json'
          },
          body: JSON.stringify(formattedState)
        }).catch(error => {
          setState(() => {
            throw error;
          });
        });
      }
    };

    const closeModal = () => {
      setFraggleBoxLoc(undefined);
      setSnapshotLoc(undefined);
      setTitle('');
      setSavingState(savingStateConst.UNSET);
    };

    useEffect(() => {
      if (latestSession !== undefined || latestSnapshot !== undefined) {
        setFraggleBoxLoc(latestSession);
        setSnapshotLoc(latestSnapshot);
      }
    }, [latestSession, latestSnapshot]);

    let isLoading = true;

    if (snapshotLoc !== undefined || fraggleBoxLoc !== undefined) {
      if (savingState === savingStateConst.savingSnapshot) {
        urlToCopy =
          window.location.protocol +
          '//' +
          window.location.hostname +
          port +
          '/viewer/react/snapshot/' +
          latestSnapshot;
        linkTitle = 'A permanent, fixed snapshot of the current state has been saved: ';
        isLoading = false;
      } else if (savingState === savingStateConst.savingSession) {
        if (title === '') {
          getTitle();
        } else {
          isLoading = false;
        }
        sessionRename = true;
        urlToCopy =
          window.location.protocol +
          '//' +
          window.location.hostname +
          port +
          '/viewer/react/fragglebox/' +
          latestSession;
        linkTitle = 'A new session has been generated: ';
      } else if (savingState === savingStateConst.overwritingSession) {
        if (title === '') {
          getTitle();
        } else {
          isLoading = false;
        }
        sessionRename = true;
        urlToCopy =
          window.location.protocol +
          '//' +
          window.location.hostname +
          port +
          '/viewer/react/fragglebox/' +
          latestSession;
        linkTitle = 'Your session has been overwritten and remains available at: ';
      }
    }

    return (
      <Modal
        open={
          savingState &&
          (savingState.startsWith(savingStateConst.saving) || savingState.startsWith(savingStateConst.overwriting))
        }
        loading={isLoading}
      >
        <Grid container direction="column" justify="space-between" alignItems="stretch">
          {sessionRename === true && (
            <Grid item className={classes.row}>
              <TextField
                id="sessionRename"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={handleSessionNaming}
                className={classes.textField}
                helperText="To overwrite session name, enter new title above and press enter."
              />
            </Grid>
          )}
          <Grid item>{linkTitle}</Grid>
          <Grid item>
            <a href={urlToCopy}>{urlToCopy}</a>
          </Grid>
          <Grid item>
            <Grid container direction="row" justify="space-between" alignItems="center">
              <Grid item>
                <Button onClick={() => updateClipboard(urlToCopy)}>Copy link</Button>
              </Grid>
              <Grid item>
                <Button onClick={openFraggleLink}>Open in new tab</Button>
              </Grid>
              <Grid item>
                <Button onClick={closeModal}>Close</Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Modal>
    );
  }
);

function mapStateToProps(state) {
  return {
    savingState: state.apiReducers.savingState,
    latestSession: state.apiReducers.latestSession,
    latestSnapshot: state.apiReducers.latestSnapshot,
    sessionId: state.apiReducers.sessionId
  };
}

const mapDispatchToProps = {
  setSavingState: apiActions.setSavingState,
  setSessionTitle: apiActions.setSessionTitle
};

export default connect(mapStateToProps, mapDispatchToProps)(ModalStateSave);
