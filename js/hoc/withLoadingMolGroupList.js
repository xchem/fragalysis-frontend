/**
 * Created by abradley on 13/03/2018.
 */
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import * as listType from '../components/listTypes';
import * as nglLoadActions from '../actions/nglLoadActions';
import * as apiActions from '../actions/apiActions';
import { VIEWS } from '../constants/constants';
import { getUrl, loadFromServer } from '../utils/genericList';
import { OBJECT_TYPE } from '../components/nglView/constants';

// is responsible for loading molecules list
export const withLoadingMolGroupList = WrappedComponent => {
  const MolGroupList = memo(({ object_list, deleteObject, loadObject, target_on, group_type, setObjectList }) => {
    const list_type = listType.MOLGROUPS;
    const oldUrl = useRef('');
    const setOldUrl = url => {
      oldUrl.current = url;
    };

    const generateObject = useCallback(
      (data, selected = false) => {
        let sele = '';
        var colour = [0, 0, 1];
        var radius;
        if (data.mol_id.length > 10) {
          radius = 6.0;
        } else if (data.mol_id.length > 5) {
          radius = 4.0;
        } else {
          radius = 2.0;
        }
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
          coords: [data.x_com, data.y_com, data.z_com]
        };
      },
      [list_type]
    );

    const beforePush = useCallback(() => {
      if (object_list) {
        object_list.map(data => deleteObject(Object.assign({ display_div: VIEWS.SUMMARY_VIEW }, generateObject(data))));
      }
    }, [deleteObject, generateObject, object_list]);

    const afterPush = useCallback(
      data_list => {
        if (data_list) {
          data_list.map(data => loadObject(Object.assign({ display_div: VIEWS.SUMMARY_VIEW }, generateObject(data))));
        }
      },
      [generateObject, loadObject]
    );

    useEffect(() => {
      if (target_on) {
        loadFromServer({
          url: getUrl({ list_type, target_on, group_type }),
          setOldUrl: url => setOldUrl(url),
          old_url: oldUrl.current,
          afterPush: afterPush,
          beforePush: beforePush,
          list_type,
          setObjectList
        });
      }
    }, [target_on, afterPush, beforePush, group_type, list_type, setObjectList]);

    return <WrappedComponent />;
  });

  function mapStateToProps(state) {
    return {
      object_list: state.apiReducers.present.mol_group_list,
      group_type: state.apiReducers.present.group_type,
      target_on: state.apiReducers.present.target_on
    };
  }
  const mapDispatchToProps = {
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject,
    setObjectList: apiActions.setMolGroupList
  };
  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(MolGroupList);
};
