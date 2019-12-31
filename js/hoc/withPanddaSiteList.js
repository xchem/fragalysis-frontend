/**
 * Created by abradley on 17/04/2018.
 */

import React, { memo, useCallback, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../reducers/api/apiActions';
import * as listType from '../constants/listTypes';
import * as nglLoadActions from '../reducers/ngl/nglActions';
import { VIEWS } from '../constants/constants';
import { getUrl, loadFromServer } from '../utils/genericList';
import { OBJECT_TYPE } from '../components/nglView/constants';

export const withLoadingPanddaSiteList = WrappedComponent => {
  const PanddaSiteList = memo(({ group_type, target_on, object_list, setObjectList, deleteObject, loadObject }) => {
    const [/* state */ setState] = useState();
    const list_type = listType.PANDDA_SITE;
    const oldUrl = useRef('');
    const setOldUrl = url => {
      oldUrl.current = url;
    };

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
          OBJECT_TYPE: OBJECT_TYPE.SPHERE,
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
      let onCancel = () => {};
      loadFromServer({
        url: getUrl({ list_type, target_on, group_type }),
        setOldUrl: url => setOldUrl(url),
        old_url: oldUrl.current,
        list_type,
        setObjectList,
        beforePush,
        afterPush,
        cancel: onCancel
      }).catch(error => {
        setState(() => {
          throw error;
        });
      });
      return () => {
        onCancel();
      };
    }, [list_type, setObjectList, target_on, beforePush, afterPush, group_type, setState]);

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
  return connect(mapStateToProps, mapDispatchToProps)(PanddaSiteList);
};
