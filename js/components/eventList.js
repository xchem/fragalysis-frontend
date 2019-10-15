/**
 * Created by abradley on 19/04/2018.
 */

import React, { memo, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../actions/apiActions';
import * as listType from './listTypes';
import { getUrl, loadFromServer } from '../services/general';

// TODO this should be HOC
const EventList = memo(({ group_type, target_on, event_on, pandda_site_on, object_list, setObjectList }) => {
  const list_type = listType.PANDDA_EVENT;
  const [oldUrl, setOldUrl] = useState('');

  useEffect(() => {
    loadFromServer({
      url: getUrl({ list_type, target_on, pandda_site_on }),
      setOldUrl: url => setOldUrl(url),
      old_url: oldUrl,
      list_type,
      setObjectList
    });
  }, [list_type, oldUrl, setObjectList, target_on, pandda_site_on]);

  return null;
});
function mapStateToProps(state) {
  return {
    group_type: state.apiReducers.present.group_type,
    target_on: state.apiReducers.present.target_on,
    event_on: state.apiReducers.present.pandda_event_on,
    pandda_site_on: state.apiReducers.present.pandda_site_on,
    object_list: state.apiReducers.present.pandda_event_list
  };
}
const mapDispatchToProps = {
  setObjectList: apiActions.setPanddaEventList
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EventList);
