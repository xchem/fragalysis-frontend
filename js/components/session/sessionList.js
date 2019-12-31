/**
 * Created by ricgillams on 29/10/2018.
 */

import React, { memo, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../../reducers/api/apiActions';
import * as listType from '../../constants/listTypes';
import { Link } from 'react-router-dom';
import { getUrl, loadFromServer } from '../../utils/genericList';
import { List, ListItem, Button, TextField, Panel } from '../common';
import { updateClipboard } from './helpers';
import { api, METHOD, getCsrfToken } from '../../utils/api';
import { ListItemText, CircularProgress, ListItemSecondaryAction } from '@material-ui/core';
import { URLS } from '../routes/constants';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { useLocation } from 'react-router-dom';

const SessionList = memo(
  ({ sessionIdList, seshListSaving, setSessionIdList, updateSessionIdList, setSeshListSaving }) => {
    const [/* state */ setState] = useState();
    const list_type = listType.SESSIONS;
    const oldUrl = useRef('');
    const setOldUrl = url => {
      oldUrl.current = url;
    };
    const location = useLocation();
    const { pathname } = location;

    const renameStateSession = (id, title) => {
      let currentSessionList = JSON.parse(JSON.stringify(sessionIdList));
      currentSessionList.forEach((session, index) => {
        if (`${session.id}` === `${id}`) {
          currentSessionList[index] = { ...session, title };
        }
      });
      updateSessionIdList(currentSessionList);
    };

    const handleSessionNaming = e => {
      if (e.keyCode === 13) {
        const id = e.target.id;
        const title = e.target.value;
        renameStateSession(id, title);
        const formattedState = {
          id,
          title
        };
        api({
          url: '/api/viewscene/' + id,
          method: METHOD.PATCH,
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'X-CSRFToken': getCsrfToken()
          },
          body: JSON.stringify(formattedState)
        }).catch(error => {
          setState(() => {
            throw error;
          });
        });
      }
    };

    const deleteStateSession = id => {
      let currentSessionList = JSON.parse(JSON.stringify(sessionIdList));
      currentSessionList.forEach((session, index) => {
        if (`${session.id}` === `${id}`) {
          currentSessionList.splice(index, 1);
        }
      });
      updateSessionIdList(currentSessionList);
      if (sessionIdList.length === 23) {
        setSeshListSaving(true);
        window.location.reload();
      }
    };

    const deleteSession = id => {
      deleteStateSession(id);
      var sceneUrl = '/api/viewscene/' + id;
      api({
        url: sceneUrl,
        method: METHOD.DELETE,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'X-CSRFToken': getCsrfToken()
        }
      }).catch(error => {
        setState(() => {
          throw error;
        });
      });
    };

    const renderDeleteButton = data => (
      <Button
        color="secondary"
        onClick={function onClick() {
          deleteSession(data.id);
        }}
      >
        Delete
      </Button>
    );

    const renderCopyUrlButton = data => {
      const urlToCopy =
        window.location.protocol + '//' + window.location.hostname + '/viewer/react/fragglebox/' + data.uuid;
      return (
        <Button color="primary" onClick={() => updateClipboard(urlToCopy)}>
          Copy link
        </Button>
      );
    };

    const render_method = data => {
      var fragglebox = '/viewer/react/fragglebox/' + data.uuid;
      if (pathname === '/viewer/react/sessions') {
        return (
          <ListItem key={data.id}>
            <ListItemText
              primary={
                <Link to={fragglebox}>{sessionIdList[sessionIdList.findIndex(x => x.id === data.id)].title}</Link>
              }
              secondary={`Target: ${data.target_on_name}, Last modified on ${data.modified.slice(
                0,
                10
              )} at ${data.modified.slice(11, 19)}`}
            />
            <ListItemSecondaryAction>
              <TextField
                id={`${data.id}`}
                key="sessRnm"
                style={{ width: 250 }}
                defaultValue={data.title}
                onKeyDown={handleSessionNaming}
                helperText="To rename, type new title & press enter."
              />
              {renderCopyUrlButton(data)}
              {renderDeleteButton(data)}
            </ListItemSecondaryAction>
          </ListItem>
        );
      } else {
        return (
          <ListItem key={data.id}>
            <Link to={fragglebox}>
              <ListItemText primary={data.title} />
            </Link>
            <ListItemSecondaryAction>Target: {data.target_on_name}</ListItemSecondaryAction>
          </ListItem>
        );
      }
    };

    useEffect(() => {
      let onCancel = () => {};
      loadFromServer({
        url: getUrl({ list_type, setSeshListSaving }),
        setOldUrl: url => setOldUrl(url),
        old_url: oldUrl.current,
        list_type,
        setObjectList: setSessionIdList,
        seshListSaving,
        cancel: onCancel
      }).catch(error => {
        setState(() => {
          throw error;
        });
      });
      return () => {
        onCancel();
      };
    }, [list_type, setSessionIdList, setSeshListSaving, seshListSaving, setState]);

    const sessionListTitle = 'Session List';

    if (seshListSaving === true) {
      return (
        <Panel hasHeader title={sessionListTitle}>
          <CircularProgress />
        </Panel>
      );
    } else {
      if (sessionIdList) {
        if (DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN') {
          return <h3>Please log in to view session history.</h3>;
        } else if (sessionIdList.length === 0) {
          return (
            <Panel hasHeader title={sessionListTitle}>
              <h3>You do not own any sessions!</h3>
              <p>Proceed to a target to generate sessions.</p>
            </Panel>
          );
        } else {
          if (pathname !== '/viewer/react/sessions') {
            return (
              <Panel hasHeader title={sessionListTitle}>
                <List>{sessionIdList.slice(0, 10).map(data => render_method(data))}</List>
                <p>
                  Full list and session management here: <Link to={URLS.sessions}>Sessions</Link>
                </p>
              </Panel>
            );
          } else {
            return (
              <Panel hasHeader title={sessionListTitle}>
                <List>{sessionIdList.map(data => render_method(data))}</List>
              </Panel>
            );
          }
        }
      } else {
        return null;
      }
    }
  }
);
function mapStateToProps(state) {
  return {
    sessionIdList: state.apiReducers.present.sessionIdList,
    seshListSaving: state.apiReducers.present.seshListSaving
  };
}

const mapDispatchToProps = {
  setSessionIdList: apiActions.setSessionIdList,
  updateSessionIdList: apiActions.updateSessionIdList,
  setSeshListSaving: apiActions.setSeshListSaving
};

export default connect(mapStateToProps, mapDispatchToProps)(SessionList);
