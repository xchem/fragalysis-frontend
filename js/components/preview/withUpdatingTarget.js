import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as apiActions from '../../reducers/api/apiActions';
import { HeaderContext } from '../header/headerContext';
import * as selectionActions from '../../reducers/selection/selectionActions';
import { api } from '../../utils/api';
import HandleUnrecognisedTarget from '../handleUnrecognisedTarget';

export const withUpdatingTarget = WrappedContainer => {
  const UpdateTarget = memo(
    ({
      match,
      targetIdList,
      setTargetUnrecognised,
      setTargetOn,
      target_on,
      setUuid,
      setLatestSession,
      resetSelection,
      resetSelectionState,
      resetTargetState,
      notCheckTarget,
      ...rest
    }) => {
      const target = match.params.target;
      const { isLoading, setIsLoading } = useContext(HeaderContext);
      const [/* state */ setState] = useState();

      useEffect(() => {
        if (resetSelection) {
          resetTargetState();
          resetSelectionState();
        }
      }, [resetTargetState, resetSelectionState, resetSelection]);

      const updateTarget = useCallback(() => {
        if (!notCheckTarget) {
          // Get from the REST API
          let targetUnrecognisedFlag = true;
          if (target !== undefined) {
            if (targetIdList && targetIdList.length > 0) {
              targetIdList.forEach(targetId => {
                if (target === targetId.title) {
                  targetUnrecognisedFlag = false;
                }
              });
            }
            setTargetUnrecognised(targetUnrecognisedFlag);
          }

          if (targetUnrecognisedFlag === false) {
            setIsLoading(true);
            api({
              url: `${window.location.protocol}//${window.location.host}/api/targets/?title=${target}`
            })
              .then(response => {
                return setTargetOn(response.data['results'][0].id);
              })
              .finally(() => setIsLoading(false))
              .catch(error => {
                setState(() => {
                  throw error;
                });
              });
          }
        }
      }, [target, targetIdList, setTargetUnrecognised, setIsLoading, setTargetOn, setState, notCheckTarget]);

      // Component DidMount - Fragglebox
      useEffect(() => {
        if (match.params.uuid !== undefined) {
          const uuid = match.params.uuid;
          setUuid(uuid);
          setLatestSession(uuid);
        } else if (match.params.snapshotUuid !== undefined) {
          const snapshotUuid = match.params.snapshotUuid;
          setUuid(snapshotUuid);
        }
      }, [match.params.snapshotUuid, match.params.uuid, setUuid, setLatestSession]);

      useEffect(() => {
        updateTarget();
      }, [updateTarget]);

      if (isLoading === true) {
        return null;
      } else if (target_on === undefined) {
        return <HandleUnrecognisedTarget />;
      } else {
        return <WrappedContainer {...rest} />;
      }
    }
  );

  function mapStateToProps(state) {
    return {
      targetIdList: state.apiReducers.present.target_id_list,
      target_on: state.apiReducers.present.target_on
    };
  }
  const mapDispatchToProps = {
    setTargetOn: apiActions.setTargetOn,
    setTargetUnrecognised: apiActions.setTargetUnrecognised,
    setUuid: apiActions.setUuid,
    setLatestSession: apiActions.setLatestSession,
    resetSelectionState: selectionActions.resetSelectionState,
    resetTargetState: apiActions.resetTargetState
  };

  return withRouter(connect(mapStateToProps, mapDispatchToProps)(UpdateTarget));
};
