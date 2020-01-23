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
      ...rest
    }) => {
      const target = match.params.target;
      const uuid = match.params.uuid;
      const snapshotUuid = match.params.snapshotUuid;

      const { isLoading, setIsLoading } = useContext(HeaderContext);
      const [state, setState] = useState();

      useEffect(() => {
        resetTargetAndSelection(resetSelection);
      }, [resetSelection, resetTargetAndSelection]);

      useEffect(() => {
        setTargetUUIDs(uuid, snapshotUuid);
      }, [setTargetUUIDs, snapshotUuid, uuid]);

      useEffect(() => {
        updateTarget(notCheckTarget, target, setIsLoading, targetIdList).catch(error => {
          setState(() => {
            throw error;
          });
        });
      }, [notCheckTarget, setIsLoading, target, updateTarget, targetIdList]);

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
      target_on: state.apiReducers.present.target_on,
      targetIdList: state.apiReducers.present.target_id_list
    };
  }
  const mapDispatchToProps = {
    updateTarget,
    setTargetUUIDs,
    resetTargetAndSelection
  };

  return connect(mapStateToProps, mapDispatchToProps)(UpdateTarget);
};
