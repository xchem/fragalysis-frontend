/**
 * Created by abradley on 17/04/2018.
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../actions/apiActions';
import * as listType from '../components/listTypes';
import * as nglLoadActions from '../actions/nglLoadActions';
import * as nglObjectTypes from '../components/nglObjectTypes';
import { VIEWS } from '../constants/constants';
import { getUrl, loadFromServer } from '../utils/genericList';

export const withLoadingPanddaSiteList = WrappedComponent => {
  const PanddaSiteList = memo(({ group_type, target_on, object_list, setObjectList, deleteObject, loadObject }) => {
    const list_type = listType.PANDDA_SITE;
    const [oldUrl, setOldUrl] = useState('');

    const generateObject = useCallback(
      (data, selected = false) => {
        var sele = '';
        var colour = [0, 0, 1];
        var radius = 6.0;
        if (selected) {
          sele = 'SELECT';
          colour = [0, 1, 0];
        }
        // Move this out of this
        return {
          OBJECT_TYPE: nglObjectTypes.SPHERE,
          name: list_type + sele + '_' + +data.id.toString(),
          radius: radius,
          colour: colour,
          coords: [data.site_native_com_x, data.site_native_com_y, data.site_native_com_z]
        };
      },
      [list_type]
    );

    const beforePush = useCallback(() => {
      // Delete of them in the PANDDA VIEW
      if (object_list) {
        object_list.map(data => deleteObject(Object.assign({ display_div: VIEWS.PANDDA_MAJOR }, generateObject(data))));
      }
    }, [deleteObject, generateObject, object_list]);

    const afterPush = useCallback(
      objects => {
        if (objects) {
          objects.map(data => loadObject(Object.assign({ display_div: VIEWS.PANDDA_MAJOR }, generateObject(data))));
        }
      },
      [generateObject, loadObject]
    );

    useEffect(() => {
      loadFromServer({
        url: getUrl({ list_type, target_on, group_type }),
        setOldUrl: url => setOldUrl(url),
        old_url: oldUrl,
        list_type,
        setObjectList,
        beforePush,
        afterPush
      });
    }, [list_type, oldUrl, setObjectList, target_on, beforePush, afterPush, group_type]);

    return <WrappedComponent />;
  });

  function mapStateToProps(state) {
    return {
      group_type: state.apiReducers.present.group_type,
      target_on: state.apiReducers.present.target_on,
      object_list: state.apiReducers.present.pandda_site_list
    };
  }

  const mapDispatchToProps = {
    setObjectList: apiActions.setPanddaSiteList,
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject
  };
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(PanddaSiteList);
};
