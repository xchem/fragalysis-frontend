import React, { memo, useCallback, useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as apiActions from '../../reducers/api/apiActions';
import { HeaderLoadingContext } from '../header/loadingContext';
import * as selectionActions from '../../reducers/selection/selectionActions';
import { api, METHOD } from '../../utils/api';

export const withUpdatingTarget = WrappedContainer => {
  const UpdateTarget = memo(
    ({
      match,
      targetIdList,
      setTargetUnrecognised,
      setTargetOn,
      setErrorMessage,
      target_on,
      setUuid,
      setLatestSession,
      resetSelection,
      resetSelectionState,
      resetTargetState,
      ...rest
    }) => {
      const target = match.params.target;
      const { isLoading, setIsLoading } = useContext(HeaderLoadingContext);

      const deployErrorModal = useCallback(
        error => {
          setErrorMessage(error);
        },
        [setErrorMessage]
      );

      useEffect(() => {
        if (resetSelection) {
          resetTargetState();
          resetSelectionState();
        }
      }, [resetTargetState, resetSelectionState, resetSelection]);

      const updateTarget = useCallback(() => {
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
            url: window.location.protocol + '//' + window.location.host + '/api/targets/?title=' + target,
            method: METHOD.GET
          })
            .then(response => {
              setIsLoading(false);
              return setTargetOn(response.data['results'][0].id);
            })
            .catch(error => {
              deployErrorModal(error);
            });
        }
      }, [target, setTargetUnrecognised, targetIdList, deployErrorModal, setTargetOn, setIsLoading]);

      useEffect(() => {
        updateTarget();
      }, [updateTarget]);

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

      if (isLoading === true || target_on === undefined) {
        return null;
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
    setErrorMessage: apiActions.setErrorMessage,
    setUuid: apiActions.setUuid,
    setLatestSession: apiActions.setLatestSession,
    resetSelectionState: selectionActions.resetSelectionState,
    resetTargetState: apiActions.resetTargetState
  };

  return withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(UpdateTarget)
  );
};
