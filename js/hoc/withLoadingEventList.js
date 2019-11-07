/**
 * Created by abradley on 19/04/2018.
 */

import React, { memo, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../reducers/api/apiActions';
import * as listType from '../components/listTypes';
import { getUrl, loadFromServer } from '../utils/genericList';

export const withLoadingEventList = WrappedComponent => {
  const EventList = memo(({ target_on, pandda_site_on, setObjectList, setErrorMessage }) => {
    const list_type = listType.PANDDA_EVENT;
    const oldUrl = useRef('');
    const setOldUrl = url => {
      oldUrl.current = url;
    };

    useEffect(() => {
      loadFromServer({
        url: getUrl({ list_type, target_on, pandda_site_on }),
        setOldUrl: url => setOldUrl(url),
        old_url: oldUrl.current,
        list_type,
        setObjectList
      }).catch(error => {
        setErrorMessage(error);
      });
    }, [list_type, setObjectList, target_on, pandda_site_on, setErrorMessage]);

    return <WrappedComponent />;
  });

  function mapStateToProps(state) {
    return {
      target_on: state.apiReducers.present.target_on,
      pandda_site_on: state.apiReducers.present.pandda_site_on
    };
  }

  const mapDispatchToProps = {
    setObjectList: apiActions.setPanddaEventList,
    setErrorMessage: apiActions.setErrorMessage
  };
  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(EventList);
};
