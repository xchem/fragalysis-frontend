import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { executePoseTransfer, getFirstEligiblePoseTransfers } from './poseTransfer';
import { getRequiredPageForIndex, poseListsDiffer } from './useScrollToSelectedPose';
import { TOAST_LEVELS } from '../../toast/constants';

export const usePoseTransferNavigation = ({
  config, poses, stage, moleculesPerPage, setCurrentPage, setScrollToMoleculeId,
  getNode, setAnchor, addToastMessage
}) => {
  const dispatch = useDispatch();
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [pendingAnchor, setPendingAnchor] = useState(null);
  const [orderedIds, setOrderedIds] = useState([]);
  const onNavigationItemsChange = useCallback(items => {
    const ids = items.map(item => item.id);
    setOrderedIds(previous => poseListsDiffer(previous, ids) ? ids : previous);
  }, []);
  const orderedPoses = useMemo(() => {
    const byId = new Map(poses.map(pose => [pose.id, pose]));
    return orderedIds.map(id => byId.get(id)).filter(Boolean);
  }, [poses, orderedIds]);
  const candidates = useSelector(state => {
    const { previous, next } = getFirstEligiblePoseTransfers({ orderedPoses, state, config });
    return {
      previousSource: previous?.sourcePose.id,
      previousDestination: previous?.destinationPose.id,
      nextSource: next?.sourcePose.id,
      nextDestination: next?.destinationPose.id
    };
  }, shallowEqual);
  const toolbarTransfers = useMemo(() => {
    const byId = new Map(orderedPoses.map(pose => [pose.id, pose]));
    const resolve = (source, destination) => byId.has(source) && byId.has(destination)
      ? { sourcePose: byId.get(source), destinationPose: byId.get(destination) } : null;
    return {
      previous: resolve(candidates.previousSource, candidates.previousDestination),
      next: resolve(candidates.nextSource, candidates.nextDestination)
    };
  }, [orderedPoses, candidates]);

  useEffect(() => {
    if (pendingAnchor === null) return;
    const node = getNode(pendingAnchor);
    if (node) {
      setAnchor(node);
      setPendingAnchor(null);
    }
  }, [getNode, pendingAnchor, setAnchor]);

  const onTransfer = useCallback(async ({ sourcePose, destinationPose }) => {
    if (!config || !sourcePose || !destinationPose || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const index = poses.findIndex(pose => pose.id === destinationPose.id);
    if (index >= 0) setCurrentPage(page => Math.max(page, getRequiredPageForIndex(index, moleculesPerPage)));
    setScrollToMoleculeId(destinationPose.id);
    setAnchor(null);
    setResetKey(key => key + 1);
    try {
      const result = await dispatch(executePoseTransfer({ config, sourcePose, destinationPose, stage }));
      await config.dialogs?.afterTransfer?.({
        dispatch, sourcePose, destinationPose, dialogState: result.dialogState,
        destinationInspirationIds: result.destinationInspirationIds, requestAnchor: setPendingAnchor
      });
      if (result.postTransferError) {
        addToastMessage?.({
          text: config.postTransferFocus?.failureMessage || 'Pose settings were transferred, but focusing failed.',
          level: TOAST_LEVELS.ERROR
        });
      }
    } catch (error) {
      try {
        await config.dialogs?.onTransferFailure?.({
          dispatch, sourcePose, destinationPose, error, requestAnchor: setPendingAnchor,
          dialogState: error.poseTransferContext?.dialogState,
          sourceInspirationIds: error.poseTransferContext?.sourceInspirationIds || []
        });
      } catch {
        // Keep the original transfer failure as the actionable error.
      }
      addToastMessage?.({ text: `Unable to transfer pose display settings: ${error.message || error}`, level: TOAST_LEVELS.ERROR });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [config, dispatch, poses, stage, moleculesPerPage, setCurrentPage, setScrollToMoleculeId, setAnchor, addToastMessage]);

  return { busy, resetKey, toolbarTransfers, onNavigationItemsChange, onTransfer };
};
