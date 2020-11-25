import React, { memo, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { HeaderContext } from '../header/headerContext';
import HandleUnrecognisedTarget from './handleUnrecognisedTarget';
import { updateTarget, setTargetUUIDs, resetTargetAndSelection } from './redux/dispatchActions';
import { useRouteMatch } from 'react-router-dom';

export const withUpdatingTarget = WrappedContainer => {
  const UpdateTarget = memo(
    ({ target_on, resetSelection, updateTarget, setTargetUUIDs, resetTargetAndSelection, targetIdList, ...rest }) => {
      let match = useRouteMatch();

      const target = match && match.params && match.params.target;
      const uuid = match && match.params && match.params.uuid;
      const snapshotUuid = match && match.params && match.params.snapshotUuid;
      const snapshotId = match && match.params && match.params.snapshotId;
      const projectId = match && match.params && match.params.projectId;

      const { isLoading, setIsLoading } = useContext(HeaderContext);
      const [state, setState] = useState();

      useEffect(() => {
        resetTargetAndSelection(resetSelection);
      }, [resetSelection, resetTargetAndSelection]);

      useEffect(() => {
        setTargetUUIDs(uuid, snapshotUuid);
      }, [setTargetUUIDs, snapshotUuid, uuid]);

      useEffect(() => {
        updateTarget({ target, setIsLoading, targetIdList, projectId }).catch(error => {
          setState(() => {
            throw error;
          });
        });
      }, [setIsLoading, target, updateTarget, targetIdList, projectId, snapshotId]);

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
      target_on: state.apiReducers.target_on,
      targetIdList: state.apiReducers.target_id_list
    };
  }
  const mapDispatchToProps = {
    updateTarget,
    setTargetUUIDs,
    resetTargetAndSelection
  };

  return connect(mapStateToProps, mapDispatchToProps)(UpdateTarget);
};
