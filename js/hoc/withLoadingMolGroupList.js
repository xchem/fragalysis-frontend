/**
 * Created by abradley on 13/03/2018.
 */
import React, { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../reducers/api/apiActions';
import { VIEWS } from '../constants/constants';
import { getUrl, loadFromServer } from '../utils/genericList';
import { OBJECT_TYPE } from '../components/nglView/constants';
import { NglContext } from '../components/nglView/nglProvider';
import {
  decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState,
  loadObject
} from '../reducers/ngl/nglDispatchActions';
import { setCountOfRemainingMoleculeGroups } from '../reducers/ngl/nglActions';
import { generateSphere } from '../components/preview/molecule/molecules_helpers';

// is responsible for loading molecules list
export const withLoadingMolGroupList = WrappedComponent => {
  const MolGroupList = memo(
    ({
      loadObject,
      target_on,
      group_type,
      setObjectList,
      isStateLoaded,
      setCountOfRemainingMoleculeGroups,
      decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState,
      ...rest
    }) => {
      const [state, setState] = useState();
      const { getNglView } = useContext(NglContext);
      const list_type = OBJECT_TYPE.MOLECULE_GROUP;
      const oldUrl = useRef('');
      const setOldUrl = url => {
        oldUrl.current = url;
      };
      const refOnCancel = useRef(false);

      // call redux action for add objects on NGL view
      const afterPush = useCallback(
        data_list => {
          if (data_list) {
            setCountOfRemainingMoleculeGroups(data_list.length);
            data_list.map(data =>
              loadObject(
                Object.assign({ display_div: VIEWS.SUMMARY_VIEW }, generateSphere(data)),
                getNglView(VIEWS.SUMMARY_VIEW).stage
              ).then(() => decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState())
            );
          }
        },
        [
          decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState,
          getNglView,
          loadObject,
          setCountOfRemainingMoleculeGroups
        ]
      );

      useEffect(() => {
        if (target_on && !isStateLoaded) {
          let onCancel = () => {};
          loadFromServer({
            url: getUrl({ list_type, target_on, group_type }),
            setOldUrl: url => setOldUrl(url),
            old_url: oldUrl.current,
            afterPush: afterPush,
            list_type,
            setObjectList,
            cancel: onCancel
          }).catch(error => {
            setState(() => {
              throw error;
            });
          });
          refOnCancel.current = onCancel;
        } else if (target_on && isStateLoaded) {
          // to enable user interaction with application
          setCountOfRemainingMoleculeGroups(0);
        }
        return () => {
          if (refOnCancel.current) {
            refOnCancel.current();
          }
        };
      }, [
        target_on,
        group_type,
        list_type,
        setObjectList,
        isStateLoaded,
        afterPush,
        setCountOfRemainingMoleculeGroups
      ]);

      return <WrappedComponent {...rest} />;
    }
  );

  function mapStateToProps(state) {
    return {
      group_type: state.apiReducers.present.group_type,
      target_on: state.apiReducers.present.target_on
    };
  }
  const mapDispatchToProps = {
    loadObject,
    setObjectList: apiActions.setMolGroupList,
    setCountOfRemainingMoleculeGroups: setCountOfRemainingMoleculeGroups,
    decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState: decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState
  };
  return connect(mapStateToProps, mapDispatchToProps)(MolGroupList);
};
