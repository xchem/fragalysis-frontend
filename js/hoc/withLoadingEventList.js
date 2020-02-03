/**
 * Created by abradley on 19/04/2018.
 */

import React, { memo, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../reducers/api/actions';
import * as listType from '../constants/listTypes';
import { getUrl, loadFromServer } from '../utils/genericList';

export const withLoadingEventList = WrappedComponent => {
  const EventList = memo(({ target_on, pandda_site_on, setObjectList }) => {
    const [state, setState] = useState();
    const list_type = listType.PANDDA_EVENT;
    const oldUrl = useRef('');
    const setOldUrl = url => {
      oldUrl.current = url;
    };

    useEffect(() => {
      let onCancel = () => {};
      loadFromServer({
        url: getUrl({ list_type, target_on, pandda_site_on }),
        setOldUrl: url => setOldUrl(url),
        old_url: oldUrl.current,
        list_type,
        setObjectList,
        cancel: onCancel
      }).catch(error => {
        setState(() => {
          throw error;
        });
      });
      return () => {
        onCancel();
      };
    }, [list_type, setObjectList, target_on, pandda_site_on]);

    return <WrappedComponent />;
  });

  function mapStateToProps(state) {
    return {
      target_on: state.apiReducers.target_on,
      pandda_site_on: state.apiReducers.pandda_site_on
    };
  }

  const mapDispatchToProps = {
    setObjectList: apiActions.setPanddaEventList
  };
  return connect(mapStateToProps, mapDispatchToProps)(EventList);
};
