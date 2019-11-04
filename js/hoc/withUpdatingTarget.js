import React, { memo, useCallback, useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as apiActions from '../actions/apiActions';
import fetch from 'cross-fetch';
import { HeaderLoadingContext } from '../components/header/loadingContext';

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

      const updateTarget = useCallback(() => {
        // Get from the REST API
        let targetUnrecognisedFlag = true;
        if (target !== undefined && targetIdList.length !== 0) {
          targetIdList.forEach(targetId => {
            if (target === targetId.title) {
              targetUnrecognisedFlag = false;
            }
          });
          setTargetUnrecognised(targetUnrecognisedFlag);
        }

        if (targetUnrecognisedFlag === false) {
          setIsLoading(true);
          fetch(window.location.protocol + '//' + window.location.host + '/api/targets/?title=' + target)
            .then(response => response.json())
            .then(json => {
              setIsLoading(false);
              return setTargetOn(json['results'][0].id);
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
    setLatestSession: apiActions.setLatestSession
  };

  return withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(UpdateTarget)
  );
};
