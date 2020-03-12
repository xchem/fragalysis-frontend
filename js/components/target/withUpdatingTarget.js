import React, { memo, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { HeaderContext } from '../header/headerContext';
import HandleUnrecognisedTarget from './handleUnrecognisedTarget';
import { updateTarget, setTargetUUIDs, resetTargetAndSelection } from './redux/dispatchActions';

export const withUpdatingTarget = WrappedContainer => {
  const UpdateTarget = memo(
    ({
      match,
      target_on,
      resetSelection,
      notCheckTarget,
      updateTarget,
      setTargetUUIDs,
      resetTargetAndSelection,
      targetIdList,
      targetId,
      ...rest
    }) => {
      const target = match && match.params && match.params.target;
      const uuid = targetId !== null ? targetId : match && match.params && match.params.uuid;
      const snapshotUuid = match && match.params && match.params.snapshotUuid;

      const { isLoading, setIsLoading } = useContext(HeaderContext);
      const [state, setState] = useState();

      useEffect(() => {
        resetTargetAndSelection(resetSelection);
      }, [resetSelection, resetTargetAndSelection]);

      useEffect(() => {
        setTargetUUIDs(uuid, snapshotUuid);
      }, [setTargetUUIDs, snapshotUuid, uuid]);

      useEffect(() => {
        updateTarget({ notCheckTarget, target, targetId, setIsLoading, targetIdList }).catch(error => {
          setState(() => {
            throw error;
          });
        });
      }, [notCheckTarget, setIsLoading, target, updateTarget, targetIdList, targetId]);

      if (isLoading === true) {
        return null;
      } else if (target_on === undefined) {
        return <HandleUnrecognisedTarget />;
      } else {
        return <WrappedContainer {...rest} match={match} />;
      }
    }
  );

  function mapStateToProps(state) {
    return {
      target_on: state.apiReducers.target_on,
      targetIdList: state.apiReducers.target_id_list,
      targetId: state.projectReducers.currentProject.targetId
    };
  }
  const mapDispatchToProps = {
    updateTarget,
    setTargetUUIDs,
    resetTargetAndSelection
  };

  return connect(mapStateToProps, mapDispatchToProps)(UpdateTarget);
};
