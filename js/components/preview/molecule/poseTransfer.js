import { cloneDeep, isEqual } from 'lodash';
import {
  POSE_TRANSFER_ORDERS,
  POSE_TRANSFER_SCHEDULING
} from '../../../constants/poseNavigation';

export { POSE_TRANSFER_ORDERS, POSE_TRANSFER_SCHEDULING } from '../../../constants/poseNavigation';

const DEFAULT_CLEAR_TIMEOUT = 10000;
const DEFAULT_RENDER_TIMEOUT = 60000;
const CLEAR_POLL_INTERVAL = 25;

export const DEFAULT_POSE_TRANSFER_SCHEDULING = POSE_TRANSFER_SCHEDULING.OVERLAPPED;

export const getAdjacentPoses = (orderedPoses = [], poseId) => {
  const index = orderedPoses.findIndex(pose => pose.id === poseId);

  return {
    previousPose: index > 0 ? orderedPoses[index - 1] : null,
    nextPose: index >= 0 && index < orderedPoses.length - 1 ? orderedPoses[index + 1] : null
  };
};

const uniqueControls = controls => [...new Set((controls || []).filter(Boolean))];

const getItemKey = (control, item) => `${control.key}:${String(item.id)}`;

const getActiveControlSnapshot = (state, items, control) => {
  for (const item of items || []) {
    const activeState = control.getActiveState(state, item);

    if (activeState) {
      return {
        activeState,
        customization: control.captureCustomization?.({ state, item, activeState }),
        sourceItem: item
      };
    }
  }

  return null;
};

export const captureControlSnapshots = (state, items, controls) =>
  (controls || []).reduce((snapshots, control) => {
    const snapshot = getActiveControlSnapshot(state, items, control);

    if (snapshot) {
      snapshots[control.key] = snapshot;
    }

    return snapshots;
  }, {});

export const capturePoseTransferSnapshot = ({
  state,
  poseItems,
  inspirationItems,
  poseControls,
  inspirationControls
}) => ({
  pose: captureControlSnapshots(state, poseItems, poseControls),
  inspirations: captureControlSnapshots(state, inspirationItems, inspirationControls)
});

export const hasPoseTransferState = ({
  state,
  poseItems,
  inspirationItems,
  poseControls,
  inspirationControls
}) =>
  (poseControls || []).some(control =>
    (poseItems || []).some(item => Boolean(control.getActiveState(state, item)))
  ) ||
  (inspirationControls || []).some(control =>
    (inspirationItems || []).some(item => Boolean(control.getActiveState(state, item)))
  );

export const hasPoseTransferStateForPose = ({ state, pose, config }) => {
  if (!config || !pose) {
    return false;
  }

  const inspirationItems = config.getInspirationStateItems
    ? config.getInspirationStateItems({ state, pose })
    : config.getInspirationItems({ state, pose });

  return hasPoseTransferState({
    state,
    poseItems: config.getPoseItems({ state, pose }),
    inspirationItems,
    poseControls: config.poseControls,
    inspirationControls: config.inspirationControls
  });
};

export const getFirstEligiblePoseTransfers = ({ orderedPoses = [], state, config }) => {
  const transfers = {
    previous: null,
    next: null
  };

  if (!config || orderedPoses.length < 2) {
    return transfers;
  }

  for (let index = 0; index < orderedPoses.length; index++) {
    const canMovePrevious = transfers.previous === null && index > 0;
    const canMoveNext = transfers.next === null && index < orderedPoses.length - 1;

    if (
      (canMovePrevious || canMoveNext) &&
      hasPoseTransferStateForPose({ state, pose: orderedPoses[index], config })
    ) {
      if (canMovePrevious) {
        transfers.previous = {
          sourcePose: orderedPoses[index],
          destinationPose: orderedPoses[index - 1]
        };
      }
      if (canMoveNext) {
        transfers.next = {
          sourcePose: orderedPoses[index],
          destinationPose: orderedPoses[index + 1]
        };
      }
    }

    if (transfers.previous && transfers.next) {
      break;
    }
  }

  return transfers;
};

const areControlsClear = (state, controls) =>
  uniqueControls(controls).every(control => (control.getSelectedItems?.(state) || []).length === 0);

const waitForControlsToClear = (getState, controls, timeout = DEFAULT_CLEAR_TIMEOUT) => {
  if (areControlsClear(getState(), controls)) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    const startedAt = Date.now();

    const poll = () => {
      if (areControlsClear(getState(), controls) || Date.now() - startedAt >= timeout) {
        resolve();
        return;
      }

      setTimeout(poll, CLEAR_POLL_INTERVAL);
    };

    setTimeout(poll, CLEAR_POLL_INTERVAL);
  });
};

const clearSelectedControls = async ({ dispatch, getState, stage, controls }) => {
  const state = getState();

  await Promise.all(
    uniqueControls(controls).flatMap(control =>
      (control.getSelectedItems?.(state) || []).map(selectedItem =>
        Promise.resolve(control.remove({ dispatch, stage, selectedItem, state }))
      )
    )
  );
};

const applySnapshots = async ({ dispatch, getState, stage, controls, snapshots, targets }) => {
  const controlsByKey = new Map((controls || []).map(control => [control.key, control]));

  await Promise.all(
    Object.entries(snapshots).flatMap(([key, snapshot]) => {
      const control = controlsByKey.get(key);

      if (!control) {
        return [];
      }

      return (targets || [])
        .filter(target => control.isAvailable?.({ state: getState(), item: target, snapshot }) !== false)
        .map(target =>
          Promise.resolve(
            control.apply({
              dispatch,
              getState,
              stage,
              target,
              activeState: snapshot.activeState,
              customization: snapshot.customization,
              sourceItem: snapshot.sourceItem
            })
          )
        );
    })
  );
};

const waitForCondition = ({ condition, timeout, timeoutMessage }) => {
  if (condition()) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const poll = () => {
      if (condition()) {
        resolve();
        return;
      }
      if (Date.now() - startedAt >= timeout) {
        reject(new Error(timeoutMessage));
        return;
      }

      setTimeout(poll, CLEAR_POLL_INTERVAL);
    };

    setTimeout(poll, CLEAR_POLL_INTERVAL);
  });
};

const createApplyOperations = ({ state, controls, snapshots, targets }) => {
  const controlsByKey = new Map((controls || []).map(control => [control.key, control]));
  const operations = [];

  Object.entries(snapshots || {}).forEach(([key, snapshot]) => {
    const control = controlsByKey.get(key);

    if (!control) {
      return;
    }

    (targets || []).forEach(target => {
      if (control.isAvailable?.({ state, item: target, snapshot }) === false) {
        return;
      }

      operations.push({
        control,
        key: getItemKey(control, target),
        snapshot,
        target
      });
    });
  });

  return operations;
};

const mergeApplyOperations = (...operationGroups) => {
  const operationsByKey = new Map();

  operationGroups.flat().forEach(operation => operationsByKey.set(operation.key, operation));

  return [...operationsByKey.values()];
};

const createDestinationOperations = ({
  state,
  config,
  snapshot,
  destinationPoseItems,
  destinationInspirationItems
}) =>
  mergeApplyOperations(
    createApplyOperations({
      state,
      controls: config.poseControls,
      snapshots: snapshot.pose,
      targets: destinationPoseItems
    }),
    createApplyOperations({
      state,
      controls: config.inspirationControls,
      snapshots: snapshot.inspirations,
      targets: destinationInspirationItems
    })
  );

const captureItemSnapshot = (state, item, control) => {
  const activeState = control.getActiveState(state, item);

  if (!activeState) {
    return null;
  }

  return {
    activeState: cloneDeep(activeState),
    customization: cloneDeep(control.captureCustomization?.({ state, item, activeState })),
    sourceItem: item
  };
};

const operationMatchesCurrent = ({ state, operation, currentSnapshot }) => {
  if (operation.control.matchesSnapshot) {
    return operation.control.matchesSnapshot({
      state,
      target: operation.target,
      currentSnapshot,
      snapshot: operation.snapshot
    });
  }

  return (
    isEqual(currentSnapshot.activeState, operation.snapshot.activeState) &&
    isEqual(currentSnapshot.customization, operation.snapshot.customization)
  );
};

const applyOperations = ({ dispatch, getState, stage, operations }) =>
  Promise.all(
    operations.map(({ control, snapshot, target }) =>
      Promise.resolve(
        control.apply({
          dispatch,
          getState,
          stage,
          target,
          activeState: snapshot.activeState,
          customization: snapshot.customization,
          sourceItem: snapshot.sourceItem
        })
      )
    )
  );

const isOperationRendered = (state, operation) => {
  if (operation.control.isRendered) {
    return operation.control.isRendered({
      state,
      item: operation.target,
      activeState: operation.snapshot.activeState,
      snapshot: operation.snapshot
    });
  }

  return Boolean(operation.control.getActiveState(state, operation.target));
};

const waitForOperationsToRender = ({ getState, operations, timeout }) => {
  if (!operations.length) {
    return Promise.resolve();
  }

  return waitForCondition({
    condition: () => operations.every(operation => isOperationRendered(getState(), operation)),
    timeout,
    timeoutMessage: 'Timed out while waiting for the destination structures to render.'
  });
};

const getSelectedEntries = (state, controls) =>
  uniqueControls(controls).flatMap(control =>
    (control.getSelectedItems?.(state) || []).map(selectedItem => ({
      control,
      key: getItemKey(control, selectedItem),
      selectedItem
    }))
  );

const getSelectedEntryForOperation = (state, operation) =>
  getSelectedEntries(state, [operation.control]).find(entry => entry.key === operation.key) || {
    control: operation.control,
    key: operation.key,
    selectedItem: {
      id: operation.target.id,
      activeState: operation.control.getActiveState(state, operation.target)
    }
  };

const isSelectedEntryActive = (state, entry) => {
  if (entry.control.isSelectedItemActive) {
    return entry.control.isSelectedItemActive({ state, selectedItem: entry.selectedItem });
  }

  return Boolean(entry.control.getActiveState(state, entry.selectedItem));
};

const removeSelectedEntries = ({ dispatch, getState, stage, entries }) => {
  const state = getState();

  return Promise.all(
    entries
      .filter(entry => isSelectedEntryActive(state, entry))
      .map(entry =>
        Promise.resolve(
          entry.control.remove({
            dispatch,
            stage,
            selectedItem: entry.selectedItem,
            state
          })
        )
      )
  );
};

const waitForSelectedEntriesToClear = ({ getState, entries, timeout }) => {
  if (!entries.length) {
    return Promise.resolve();
  }

  return waitForCondition({
    condition: () => entries.every(entry => !isSelectedEntryActive(getState(), entry)),
    timeout,
    timeoutMessage: 'Timed out while waiting for the previous structures to be removed.'
  });
};

const removeOperations = async ({ dispatch, getState, stage, operations, timeout }) => {
  const entries = operations.map(operation => getSelectedEntryForOperation(getState(), operation));

  await removeSelectedEntries({ dispatch, getState, stage, entries });
  await waitForSelectedEntriesToClear({ getState, entries, timeout });
};

const restoreOperations = ({ operations }) =>
  operations.map(operation => ({
    ...operation,
    snapshot: operation.originalSnapshot
  }));

const captureSelectedEntryOperation = ({ config, state, entry }) => {
  const target =
    entry.control.getTransferItem?.({ state, selectedItem: entry.selectedItem }) ||
    config.getTransferItem?.({
      state,
      selectedItem: entry.selectedItem,
      control: entry.control
    }) ||
    entry.selectedItem;
  const snapshot = captureItemSnapshot(state, target, entry.control);

  if (!snapshot) {
    return null;
  }

  return {
    control: entry.control,
    key: entry.key,
    snapshot,
    target
  };
};

const restoreMissingOperations = async ({
  dispatch,
  getState,
  stage,
  operations,
  renderTimeout
}) => {
  const missingOperations = operations.filter(
    operation => !operation.control.getActiveState(getState(), operation.target)
  );

  await applyOperations({ dispatch, getState, stage, operations: missingOperations });
  await waitForOperationsToRender({
    getState,
    operations: missingOperations,
    timeout: renderTimeout
  });
};

const rollbackAddFirstTransfer = async ({
  dispatch,
  getState,
  stage,
  newOperations,
  refreshedOperations,
  clearTimeout,
  renderTimeout
}) => {
  if (refreshedOperations.length) {
    try {
      await removeOperations({
        dispatch,
        getState,
        stage,
        operations: refreshedOperations,
        timeout: clearTimeout
      });
      const originalOperations = restoreOperations({ operations: refreshedOperations });
      await applyOperations({ dispatch, getState, stage, operations: originalOperations });
      await waitForOperationsToRender({ getState, operations: originalOperations, timeout: renderTimeout });
    } catch (rollbackError) {
      // Continue with removing new-only additions even if a shared structure cannot be restored.
    }
  }

  try {
    await removeOperations({
      dispatch,
      getState,
      stage,
      operations: newOperations,
      timeout: clearTimeout
    });
  } catch (rollbackError) {
    // Preserve the original transfer error. The UI reports that error to the user.
  }
};

const executeRemoveFirstTransfer = async ({
  config,
  dispatch,
  getState,
  stage,
  snapshot,
  destinationPoseItems,
  destinationInspirationItems
}) => {
  const controlsToClear = uniqueControls([
    ...(config.poseControls || []),
    ...(config.inspirationControls || [])
  ]);

  await clearSelectedControls({ dispatch, getState, stage, controls: controlsToClear });
  await waitForControlsToClear(getState, controlsToClear, config.clearTimeout);

  await applySnapshots({
    dispatch,
    getState,
    stage,
    controls: config.poseControls,
    snapshots: snapshot.pose,
    targets: destinationPoseItems
  });
  await applySnapshots({
    dispatch,
    getState,
    stage,
    controls: config.inspirationControls,
    snapshots: snapshot.inspirations,
    targets: destinationInspirationItems
  });
};

const executeAddFirstTransfer = async ({
  config,
  dispatch,
  getState,
  stage,
  snapshot,
  destinationPoseItems,
  destinationInspirationItems
}) => {
  const initialState = getState();
  const controls = uniqueControls([...(config.poseControls || []), ...(config.inspirationControls || [])]);
  const desiredOperations = createDestinationOperations({
    state: initialState,
    config,
    snapshot,
    destinationPoseItems,
    destinationInspirationItems
  });
  const desiredKeys = new Set(desiredOperations.map(operation => operation.key));
  const newOperations = [];
  const retainedOperations = [];
  const changedOverlapOperations = [];

  desiredOperations.forEach(operation => {
    const currentSnapshot = captureItemSnapshot(initialState, operation.target, operation.control);

    if (!currentSnapshot) {
      newOperations.push(operation);
    } else if (!operationMatchesCurrent({ state: initialState, operation, currentSnapshot })) {
      changedOverlapOperations.push({ ...operation, originalSnapshot: currentSnapshot });
    } else {
      retainedOperations.push(operation);
    }
  });

  const renderTimeout = config.renderTimeout ?? DEFAULT_RENDER_TIMEOUT;
  const clearTimeout = config.clearTimeout ?? DEFAULT_CLEAR_TIMEOUT;
  let refreshedOperations = [];

  try {
    await applyOperations({ dispatch, getState, stage, operations: newOperations });
    await waitForOperationsToRender({
      getState,
      operations: [...newOperations, ...retainedOperations],
      timeout: renderTimeout
    });

    if (changedOverlapOperations.length) {
      refreshedOperations = changedOverlapOperations;
      await removeOperations({
        dispatch,
        getState,
        stage,
        operations: changedOverlapOperations,
        timeout: clearTimeout
      });
      await applyOperations({ dispatch, getState, stage, operations: changedOverlapOperations });
      await waitForOperationsToRender({
        getState,
        operations: changedOverlapOperations,
        timeout: renderTimeout
      });
    }
  } catch (error) {
    await rollbackAddFirstTransfer({
      dispatch,
      getState,
      stage,
      newOperations,
      refreshedOperations,
      clearTimeout,
      renderTimeout
    });
    throw error;
  }

  const staleEntries = getSelectedEntries(getState(), controls).filter(entry => !desiredKeys.has(entry.key));
  await removeSelectedEntries({ dispatch, getState, stage, entries: staleEntries });
  await waitForSelectedEntriesToClear({ getState, entries: staleEntries, timeout: clearTimeout });
};

const refreshOperation = async ({ dispatch, getState, stage, operation, clearTimeout, renderTimeout }) => {
  await removeOperations({
    dispatch,
    getState,
    stage,
    operations: [operation],
    timeout: clearTimeout
  });
  await applyOperations({ dispatch, getState, stage, operations: [operation] });
  await waitForOperationsToRender({ getState, operations: [operation], timeout: renderTimeout });
};

const executeOverlappedTransfer = async ({
  config,
  dispatch,
  getState,
  stage,
  snapshot,
  destinationPoseItems,
  destinationInspirationItems
}) => {
  const initialState = getState();
  const controls = uniqueControls([...(config.poseControls || []), ...(config.inspirationControls || [])]);
  const desiredOperations = createDestinationOperations({
    state: initialState,
    config,
    snapshot,
    destinationPoseItems,
    destinationInspirationItems
  });
  const desiredKeys = new Set(desiredOperations.map(operation => operation.key));
  const initialEntries = getSelectedEntries(initialState, controls);
  const staleEntries = initialEntries.filter(entry => !desiredKeys.has(entry.key));
  const staleOperations = staleEntries
    .map(entry => captureSelectedEntryOperation({ config, state: initialState, entry }))
    .filter(Boolean);
  const newOperations = [];
  const retainedOperations = [];
  const changedOverlapOperations = [];

  desiredOperations.forEach(operation => {
    const currentSnapshot = captureItemSnapshot(initialState, operation.target, operation.control);

    if (!currentSnapshot) {
      newOperations.push(operation);
    } else if (!operationMatchesCurrent({ state: initialState, operation, currentSnapshot })) {
      changedOverlapOperations.push({ ...operation, originalSnapshot: currentSnapshot });
    } else {
      retainedOperations.push(operation);
    }
  });

  const renderTimeout = config.renderTimeout ?? DEFAULT_RENDER_TIMEOUT;
  const clearTimeout = config.clearTimeout ?? DEFAULT_CLEAR_TIMEOUT;
  const startAdditions = () =>
    (async () => {
      await applyOperations({ dispatch, getState, stage, operations: newOperations });
      await waitForOperationsToRender({ getState, operations: newOperations, timeout: renderTimeout });
    })();
  const startRemovals = () => [
    (async () => {
      await removeSelectedEntries({ dispatch, getState, stage, entries: staleEntries });
      await waitForSelectedEntriesToClear({ getState, entries: staleEntries, timeout: clearTimeout });
    })(),
    ...changedOverlapOperations.map(operation =>
      refreshOperation({
        dispatch,
        getState,
        stage,
        operation,
        clearTimeout,
        renderTimeout
      })
    )
  ];
  const operationTasks =
    config.transferOrder === POSE_TRANSFER_ORDERS.ADD_FIRST
      ? [startAdditions(), ...startRemovals()]
      : [...startRemovals(), startAdditions()];
  const tasks = [
    ...operationTasks,
    waitForOperationsToRender({
      getState,
      operations: retainedOperations,
      timeout: renderTimeout
    })
  ];
  const taskErrors = await Promise.all(
    tasks.map(task => Promise.resolve(task).then(() => null, error => error))
  );
  const transferError = taskErrors.find(Boolean);

  if (transferError) {
    await rollbackAddFirstTransfer({
      dispatch,
      getState,
      stage,
      newOperations,
      refreshedOperations: changedOverlapOperations,
      clearTimeout,
      renderTimeout
    });

    try {
      await restoreMissingOperations({
        dispatch,
        getState,
        stage,
        operations: staleOperations,
        renderTimeout
      });
    } catch (rollbackError) {
      // Preserve the transfer error; the UI will report it after best-effort rollback.
    }

    throw transferError;
  }
};

const addTransferContext = (error, context) => {
  const transferError = error instanceof Error ? error : new Error(String(error));
  transferError.poseTransferContext = context;
  return transferError;
};

const executePostTransferFocus = async ({
  config,
  dispatch,
  getState,
  stage,
  destinationPose,
  destinationPoseItems,
  destinationInspirationItems,
  destinationOperations
}) => {
  const focus = config.postTransferFocus;

  if (!focus?.enabled) {
    return null;
  }

  await waitForOperationsToRender({
    getState,
    operations: destinationOperations,
    timeout: config.renderTimeout ?? DEFAULT_RENDER_TIMEOUT
  });

  try {
    const state = getState();
    const target = focus.getTarget
      ? focus.getTarget({
          state,
          destinationPose,
          destinationPoseItems,
          destinationInspirationItems
        })
      : destinationPoseItems[0];

    const usesTarget = Boolean(focus.getTarget || focus.isEligible);

    if (
      (usesTarget && !target) ||
      focus.isEligible?.({
        state,
        target,
        destinationPose,
        destinationPoseItems,
        destinationInspirationItems
      }) === false
    ) {
      return null;
    }

    await Promise.resolve(
      focus.apply({
        dispatch,
        getState,
        stage,
        state,
        target,
        destinationPose,
        destinationPoseItems,
        destinationInspirationItems
      })
    );
    return null;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
};

export const executePoseTransfer = ({ config, sourcePose, destinationPose, stage }) => async (
  dispatch,
  getState
) => {
  const initialState = getState();
  const sourcePoseItems = config.getPoseItems({ state: initialState, pose: sourcePose });
  const sourceInspirationItems = config.getInspirationItems({ state: initialState, pose: sourcePose });
  const destinationPoseItems = config.getPoseTargets({ state: initialState, pose: destinationPose });
  const destinationInspirationItems = config.getInspirationItems({ state: initialState, pose: destinationPose });
  const snapshot = capturePoseTransferSnapshot({
    state: initialState,
    poseItems: sourcePoseItems,
    inspirationItems: sourceInspirationItems,
    poseControls: config.poseControls,
    inspirationControls: config.inspirationControls
  });
  const dialogState = config.dialogs?.capture?.({ state: initialState, sourcePose }) || null;
  const sourceInspirationIds = config.getInspirationIds
    ? config.getInspirationIds({ state: initialState, pose: sourcePose })
    : sourceInspirationItems.map(item => item.id);
  const destinationOperations = createDestinationOperations({
    state: initialState,
    config,
    snapshot,
    destinationPoseItems,
    destinationInspirationItems
  });
  let postTransferError = null;

  try {
    await Promise.resolve(
      config.dialogs?.beforeTransfer?.({
        dispatch,
        dialogState,
        sourcePose,
        destinationPose
      })
    );

    const transferScheduling = config.transferScheduling || DEFAULT_POSE_TRANSFER_SCHEDULING;

    // In OVERLAPPED mode transferOrder controls attempted launch priority only. The second group
    // starts immediately without awaiting the first, so additions and removals still overlap.
    // Changed shared objects always retain their safe per-object remove-then-add sequence.
    if (transferScheduling === POSE_TRANSFER_SCHEDULING.OVERLAPPED) {
      await executeOverlappedTransfer({
        config,
        dispatch,
        getState,
        stage,
        snapshot,
        destinationPoseItems,
        destinationInspirationItems
      });
    } else if (config.transferOrder === POSE_TRANSFER_ORDERS.ADD_FIRST) {
      await executeAddFirstTransfer({
        config,
        dispatch,
        getState,
        stage,
        snapshot,
        destinationPoseItems,
        destinationInspirationItems
      });
    } else {
      await executeRemoveFirstTransfer({
        config,
        dispatch,
        getState,
        stage,
        snapshot,
        destinationPoseItems,
        destinationInspirationItems
      });
    }

    postTransferError = await executePostTransferFocus({
      config,
      dispatch,
      getState,
      stage,
      destinationPose,
      destinationPoseItems,
      destinationInspirationItems,
      destinationOperations
    });
  } catch (error) {
    throw addTransferContext(error, {
      dialogState,
      sourceInspirationIds
    });
  }

  return {
    dialogState,
    snapshot,
    postTransferError,
    destinationInspirationIds: destinationInspirationItems.map(item => item.id)
  };
};
