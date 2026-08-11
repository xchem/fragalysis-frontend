import {
  captureControlSnapshots,
  capturePoseTransferSnapshot,
  executePoseTransfer,
  getAdjacentPoses,
  getFirstEligiblePoseTransfers,
  hasPoseTransferState,
  POSE_TRANSFER_ORDERS,
  POSE_TRANSFER_SCHEDULING
} from './poseTransfer';

const createControl = key => ({
  key,
  getActiveState: (state, item) => state.active[key]?.[item.id] || false,
  getSelectedItems: state => Object.keys(state.active[key] || {}).map(id => ({ id })),
  captureCustomization: ({ item, activeState }) => ({ sourceId: item.id, value: activeState.value })
});

const createEligibilityConfig = controls => ({
  poseControls: controls,
  inspirationControls: controls,
  getPoseItems: ({ pose }) => pose.poseItems || [],
  getInspirationItems: ({ pose }) => pose.inspirationItems || [],
  getInspirationStateItems: ({ pose }) => pose.inspirationItems || []
});

describe('pose transfer helpers', () => {
  it('uses the supplied displayed order and exposes null at list boundaries', () => {
    expect.hasAssertions();
    const displayedOrder = [{ id: 'filtered-third' }, { id: 'filtered-first' }, { id: 'filtered-second' }];

    expect(getAdjacentPoses(displayedOrder, 'filtered-first')).toStrictEqual({
      previousPose: displayedOrder[0],
      nextPose: displayedOrder[2]
    });
    expect(getAdjacentPoses(displayedOrder, 'filtered-third').previousPose).toBeNull();
    expect(getAdjacentPoses(displayedOrder, 'filtered-second').nextPose).toBeNull();
  });

  it('finds the first eligible source independently for each toolbar direction', () => {
    expect.hasAssertions();
    const ligand = createControl('ligand');
    const state = {
      active: {
        ligand: {
          firstObservation: { value: 'top-boundary' },
          thirdObservation: { value: 'first-valid-up' }
        }
      }
    };
    const displayedOrder = [
      { id: 'first', poseItems: [{ id: 'firstObservation' }] },
      { id: 'second', poseItems: [{ id: 'secondObservation' }] },
      { id: 'third', poseItems: [{ id: 'thirdObservation' }] },
      { id: 'fourth', poseItems: [{ id: 'fourthObservation' }] }
    ];

    const transfers = getFirstEligiblePoseTransfers({
      orderedPoses: displayedOrder,
      state,
      config: createEligibilityConfig([ligand])
    });

    expect(transfers.next).toStrictEqual({
      sourcePose: displayedOrder[0],
      destinationPose: displayedOrder[1]
    });
    expect(transfers.previous).toStrictEqual({
      sourcePose: displayedOrder[2],
      destinationPose: displayedOrder[1]
    });
  });

  it('treats active inspiration controls as toolbar-transfer eligibility', () => {
    expect.hasAssertions();
    const protein = createControl('protein');
    const state = {
      active: {
        protein: {
          inspirationB: { value: 'inspiration-protein' }
        }
      }
    };
    const displayedOrder = [
      { id: 'filtered-third' },
      { id: 'filtered-first', inspirationItems: [{ id: 'inspirationB' }] },
      { id: 'filtered-second' }
    ];

    const transfers = getFirstEligiblePoseTransfers({
      orderedPoses: displayedOrder,
      state,
      config: createEligibilityConfig([protein])
    });

    expect(transfers.previous?.sourcePose.id).toBe('filtered-first');
    expect(transfers.previous?.destinationPose.id).toBe('filtered-third');
    expect(transfers.next?.sourcePose.id).toBe('filtered-first');
    expect(transfers.next?.destinationPose.id).toBe('filtered-second');
  });

  it('returns disabled toolbar candidates when no pose is eligible', () => {
    expect.hasAssertions();
    const ligand = createControl('ligand');
    const transfers = getFirstEligiblePoseTransfers({
      orderedPoses: [{ id: 'first' }, { id: 'second' }],
      state: { active: { ligand: {} } },
      config: createEligibilityConfig([ligand])
    });

    expect(transfers).toStrictEqual({ previous: null, next: null });
  });

  it('captures the first active source and its customization for each control', () => {
    expect.hasAssertions();
    const density = createControl('density');
    const state = {
      active: {
        density: {
          first: { value: 'blue' },
          second: { value: 'red' }
        }
      }
    };

    const snapshots = captureControlSnapshots(state, [{ id: 'first' }, { id: 'second' }], [density]);

    expect(snapshots.density.sourceItem.id).toBe('first');
    expect(snapshots.density.customization).toStrictEqual({ sourceId: 'first', value: 'blue' });
  });

  it('creates the union of controls active on different inspirations', () => {
    expect.hasAssertions();
    const ligand = createControl('ligand');
    const protein = createControl('protein');
    const state = {
      active: {
        ligand: { inspirationA: { value: 'ligand-settings' } },
        protein: { inspirationB: { value: 'protein-settings' } }
      }
    };
    const inspirationItems = [{ id: 'inspirationA' }, { id: 'inspirationB' }];

    const snapshot = capturePoseTransferSnapshot({
      state,
      poseItems: [],
      inspirationItems,
      poseControls: [],
      inspirationControls: [ligand, protein]
    });

    expect(Object.keys(snapshot.inspirations)).toStrictEqual(['ligand', 'protein']);
    expect(
      hasPoseTransferState({
        state,
        poseItems: [],
        inspirationItems,
        poseControls: [],
        inspirationControls: [ligand, protein]
      })
    ).toBe(true);
  });

  it('clears all selected objects before applying the captured union to every destination inspiration', async () => {
    expect.hasAssertions();
    const events = [];
    const state = {
      active: {
        ligand: {
          sourcePoseObservation: { value: 'pose-ligand' },
          inspirationA: { value: 'inspiration-ligand' },
          unrelated: { value: 'remove-me' }
        },
        protein: {
          inspirationB: { value: 'inspiration-protein' }
        }
      }
    };
    const createExecutableControl = key => ({
      ...createControl(key),
      remove: ({ selectedItem }) => {
        events.push(`remove:${key}:${selectedItem.id}`);
        delete state.active[key][selectedItem.id];
      },
      apply: ({ target, customization }) => {
        events.push(`apply:${key}:${target.id}:${customization.value}`);
      }
    });
    const ligand = createExecutableControl('ligand');
    const protein = createExecutableControl('protein');
    const sourcePose = {
      id: 'source',
      poseItems: [{ id: 'sourcePoseObservation' }],
      inspirationItems: [{ id: 'inspirationA' }, { id: 'inspirationB' }]
    };
    const destinationPose = {
      id: 'destination',
      poseTargets: [{ id: 'destinationPoseObservation' }],
      inspirationItems: [{ id: 'inspirationC' }, { id: 'inspirationD' }]
    };
    const config = {
      transferScheduling: POSE_TRANSFER_SCHEDULING.PHASED,
      poseControls: [ligand],
      inspirationControls: [ligand, protein],
      getPoseItems: ({ pose }) => pose.poseItems || [],
      getPoseTargets: ({ pose }) => pose.poseTargets || [],
      getInspirationItems: ({ pose }) => pose.inspirationItems || [],
      dialogs: {
        capture: () => ({ transferInspirations: true }),
        beforeTransfer: () => events.push('dialogs:close-others')
      }
    };
    const getState = () => state;
    const dispatch = action => (typeof action === 'function' ? action(dispatch, getState) : action);

    const result = await executePoseTransfer({ config, sourcePose, destinationPose, stage: {} })(
      dispatch,
      getState
    );

    const firstApplyIndex = events.findIndex(event => event.startsWith('apply:'));
    const lastRemoveIndex = events.reduce(
      (lastIndex, event, index) => (event.startsWith('remove:') ? index : lastIndex),
      -1
    );

    expect(firstApplyIndex).toBeGreaterThan(lastRemoveIndex);
    expect(events).toStrictEqual(
      expect.arrayContaining([
        'apply:ligand:destinationPoseObservation:pose-ligand',
        'apply:ligand:inspirationC:inspiration-ligand',
        'apply:ligand:inspirationD:inspiration-ligand',
        'apply:protein:inspirationC:inspiration-protein',
        'apply:protein:inspirationD:inspiration-protein'
      ])
    );
    expect(result.destinationInspirationIds).toStrictEqual(['inspirationC', 'inspirationD']);
    expect(result.dialogState).toStrictEqual({ transferInspirations: true });
  });

  it('launches removals before additions for remove-first overlapped scheduling', async () => {
    expect.hasAssertions();
    const events = [];
    const state = {
      active: {
        ligand: {
          source: { value: 'source-settings' },
          unrelated: { value: 'remove-concurrently' }
        }
      }
    };
    let finishDestinationAddition;
    const ligand = {
      ...createControl('ligand'),
      remove: ({ selectedItem }) => {
        events.push(`remove:${selectedItem.id}`);
        delete state.active.ligand[selectedItem.id];
      },
      apply: ({ target, customization }) => {
        events.push(`apply:start:${target.id}`);

        return new Promise(resolve => {
          finishDestinationAddition = () => {
            state.active.ligand[target.id] = { value: customization.value };
            events.push(`apply:finish:${target.id}`);
            resolve();
          };
        });
      },
      isRendered: ({ state: currentState, item }) => Boolean(currentState.active.ligand[item.id])
    };
    const sourcePose = { id: 'source-pose', poseItems: [{ id: 'source' }] };
    const destinationPose = { id: 'destination-pose', poseTargets: [{ id: 'destination' }] };
    const config = {
      transferOrder: POSE_TRANSFER_ORDERS.REMOVE_FIRST,
      poseControls: [ligand],
      inspirationControls: [],
      getPoseItems: ({ pose }) => pose.poseItems || [],
      getPoseTargets: ({ pose }) => pose.poseTargets || [],
      getInspirationItems: () => []
    };
    const getState = () => state;
    const dispatch = action => (typeof action === 'function' ? action(dispatch, getState) : action);

    const transfer = executePoseTransfer({ config, sourcePose, destinationPose, stage: {} })(
      dispatch,
      getState
    );
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(events).toStrictEqual([
      'remove:source',
      'remove:unrelated',
      'apply:start:destination'
    ]);

    finishDestinationAddition();
    await transfer;

    expect(events.at(-1)).toBe('apply:finish:destination');
    expect(state.active.ligand).toStrictEqual({
      destination: { value: 'source-settings' }
    });
  });

  it('launches additions first in add-first overlapped scheduling while shared refresh stays remove-first', async () => {
    expect.hasAssertions();
    const events = [];
    const state = {
      active: {
        ligand: {
          sourceInspiration: { value: 'blue' },
          shared: { value: 'red' }
        }
      }
    };
    const ligand = {
      ...createControl('ligand'),
      remove: ({ selectedItem }) => {
        events.push(`remove:${selectedItem.id}`);
        delete state.active.ligand[selectedItem.id];
      },
      apply: ({ target, customization }) => {
        events.push(`apply:${target.id}`);
        state.active.ligand[target.id] = { value: customization.value };
      },
      isRendered: ({ state: currentState, item }) => Boolean(currentState.active.ligand[item.id])
    };
    const sourcePose = {
      id: 'source',
      inspirationItems: [{ id: 'sourceInspiration' }, { id: 'shared' }]
    };
    const destinationPose = {
      id: 'destination',
      inspirationItems: [{ id: 'shared' }, { id: 'new' }]
    };
    const config = {
      transferOrder: POSE_TRANSFER_ORDERS.ADD_FIRST,
      poseControls: [],
      inspirationControls: [ligand],
      getPoseItems: () => [],
      getPoseTargets: () => [],
      getInspirationItems: ({ pose }) => pose.inspirationItems
    };
    const getState = () => state;
    const dispatch = action => (typeof action === 'function' ? action(dispatch, getState) : action);

    await executePoseTransfer({ config, sourcePose, destinationPose, stage: {} })(dispatch, getState);

    expect(events.indexOf('apply:new')).toBeLessThan(events.indexOf('remove:sourceInspiration'));
    expect(events.indexOf('remove:shared')).toBeLessThan(events.indexOf('apply:shared'));
    expect(state.active.ligand).toStrictEqual({
      shared: { value: 'blue' },
      new: { value: 'blue' }
    });
  });

  it('can render the destination before removing stale structures and retains an identical overlap', async () => {
    expect.hasAssertions();
    const events = [];
    const state = {
      active: {
        ligand: {
          shared: { value: 'shared-settings' },
          stale: { value: 'remove-me' }
        }
      }
    };
    const ligand = {
      ...createControl('ligand'),
      remove: ({ selectedItem }) => {
        events.push(`remove:${selectedItem.id}`);
        delete state.active.ligand[selectedItem.id];
      },
      apply: ({ target, customization }) => {
        events.push(`apply:${target.id}`);
        state.active.ligand[target.id] = {
          value: customization.value
        };
      },
      isRendered: ({ state: currentState, item }) => Boolean(currentState.active.ligand[item.id])
    };
    const sourcePose = {
      id: 'source',
      inspirationItems: [{ id: 'shared' }]
    };
    const destinationPose = {
      id: 'destination',
      inspirationItems: [{ id: 'shared' }, { id: 'new' }]
    };
    const config = {
      transferOrder: POSE_TRANSFER_ORDERS.ADD_FIRST,
      transferScheduling: POSE_TRANSFER_SCHEDULING.PHASED,
      poseControls: [],
      inspirationControls: [ligand],
      getPoseItems: () => [],
      getPoseTargets: () => [],
      getInspirationItems: ({ pose }) => pose.inspirationItems
    };
    const getState = () => state;
    const dispatch = action => (typeof action === 'function' ? action(dispatch, getState) : action);

    await executePoseTransfer({ config, sourcePose, destinationPose, stage: {} })(dispatch, getState);

    expect(events).toStrictEqual(['apply:new', 'remove:stale']);
    expect(state.active.ligand.shared).toStrictEqual({ value: 'shared-settings' });
    expect(state.active.ligand.new).toStrictEqual({ value: 'shared-settings' });
    expect(state.active.ligand.stale).toBeUndefined();
  });

  it('refreshes changed shared inspirations only after other destination structures render', async () => {
    expect.hasAssertions();
    const events = [];
    const state = {
      active: {
        ligand: {
          sourceInspiration: { value: 'blue' },
          shared: { value: 'red' }
        }
      }
    };
    const ligand = {
      ...createControl('ligand'),
      remove: ({ selectedItem }) => {
        events.push(`remove:${selectedItem.id}`);
        delete state.active.ligand[selectedItem.id];
      },
      apply: ({ target, customization }) => {
        events.push(`apply:${target.id}:${customization.value}`);
        state.active.ligand[target.id] = { value: customization.value };
      },
      isRendered: ({ state: currentState, item }) => Boolean(currentState.active.ligand[item.id])
    };
    const sourcePose = {
      id: 'source',
      inspirationItems: [{ id: 'sourceInspiration' }, { id: 'shared' }]
    };
    const destinationPose = {
      id: 'destination',
      inspirationItems: [{ id: 'shared' }, { id: 'new' }]
    };
    const config = {
      transferOrder: POSE_TRANSFER_ORDERS.ADD_FIRST,
      transferScheduling: POSE_TRANSFER_SCHEDULING.PHASED,
      poseControls: [],
      inspirationControls: [ligand],
      getPoseItems: () => [],
      getPoseTargets: () => [],
      getInspirationItems: ({ pose }) => pose.inspirationItems
    };
    const getState = () => state;
    const dispatch = action => (typeof action === 'function' ? action(dispatch, getState) : action);

    await executePoseTransfer({ config, sourcePose, destinationPose, stage: {} })(dispatch, getState);

    expect(events.indexOf('apply:new:blue')).toBeLessThan(events.indexOf('remove:shared'));
    expect(events).toStrictEqual([
      'apply:new:blue',
      'remove:shared',
      'apply:shared:blue',
      'remove:sourceInspiration'
    ]);
    expect(state.active.ligand).toStrictEqual({
      shared: { value: 'blue' },
      new: { value: 'blue' }
    });
  });

  it('rolls back newly added structures when destination rendering times out', async () => {
    expect.hasAssertions();
    const events = [];
    const state = {
      active: {
        ligand: {
          source: { value: 'old-settings' },
          unrelated: { value: 'keep-until-success' }
        }
      }
    };
    const ligand = {
      ...createControl('ligand'),
      remove: ({ selectedItem }) => {
        events.push(`remove:${selectedItem.id}`);
        delete state.active.ligand[selectedItem.id];
      },
      apply: ({ target, customization }) => {
        events.push(`apply:${target.id}`);
        state.active.ligand[target.id] = { value: customization.value };
      },
      isRendered: ({ item }) => item.id !== 'destination'
    };
    const sourcePose = { id: 'source-pose', poseItems: [{ id: 'source' }] };
    const destinationPose = { id: 'destination-pose', poseTargets: [{ id: 'destination' }] };
    const config = {
      transferOrder: POSE_TRANSFER_ORDERS.ADD_FIRST,
      transferScheduling: POSE_TRANSFER_SCHEDULING.PHASED,
      renderTimeout: 1,
      poseControls: [ligand],
      inspirationControls: [],
      getPoseItems: ({ pose }) => pose.poseItems || [],
      getPoseTargets: ({ pose }) => pose.poseTargets || [],
      getInspirationItems: () => [],
      dialogs: {
        capture: () => ({ transferInspirations: true })
      }
    };
    const getState = () => state;
    const dispatch = action => (typeof action === 'function' ? action(dispatch, getState) : action);

    await expect(
      executePoseTransfer({ config, sourcePose, destinationPose, stage: {} })(dispatch, getState)
    ).rejects.toMatchObject({
      message: expect.stringContaining('destination structures'),
      poseTransferContext: {
        dialogState: { transferInspirations: true },
        sourceInspirationIds: []
      }
    });

    expect(events).toStrictEqual(['apply:destination', 'remove:destination']);
    expect(state.active.ligand).toStrictEqual({
      source: { value: 'old-settings' },
      unrelated: { value: 'keep-until-success' }
    });
  });

  it('restores concurrently removed structures when an overlapped destination fails to render', async () => {
    expect.hasAssertions();
    const state = {
      active: {
        ligand: {
          source: { value: 'old-settings' },
          unrelated: { value: 'also-restore' }
        }
      }
    };
    const ligand = {
      ...createControl('ligand'),
      remove: ({ selectedItem }) => {
        delete state.active.ligand[selectedItem.id];
      },
      apply: ({ target, customization }) => {
        state.active.ligand[target.id] = { value: customization.value };
      },
      isRendered: ({ item }) => item.id !== 'destination'
    };
    const sourcePose = { id: 'source-pose', poseItems: [{ id: 'source' }] };
    const destinationPose = { id: 'destination-pose', poseTargets: [{ id: 'destination' }] };
    const config = {
      renderTimeout: 1,
      poseControls: [ligand],
      inspirationControls: [],
      getPoseItems: ({ pose }) => pose.poseItems || [],
      getPoseTargets: ({ pose }) => pose.poseTargets || [],
      getInspirationItems: () => []
    };
    const getState = () => state;
    const dispatch = action => (typeof action === 'function' ? action(dispatch, getState) : action);

    await expect(
      executePoseTransfer({ config, sourcePose, destinationPose, stage: {} })(dispatch, getState)
    ).rejects.toThrow('destination structures');

    expect(state.active.ligand).toStrictEqual({
      source: { value: 'old-settings' },
      unrelated: { value: 'also-restore' }
    });
  });

  it.each([POSE_TRANSFER_SCHEDULING.PHASED, POSE_TRANSFER_SCHEDULING.OVERLAPPED])(
    'runs optional destination focus after all %s transfer work completes',
    async transferScheduling => {
      expect.hasAssertions();
      const events = [];
      const state = {
        active: {
          ligand: {
            source: { value: 'ligand-settings' }
          }
        }
      };
      const ligand = {
        ...createControl('ligand'),
        remove: ({ selectedItem }) => {
          events.push(`remove:${selectedItem.id}`);
          delete state.active.ligand[selectedItem.id];
        },
        apply: ({ target, customization }) => {
          events.push(`apply:${target.id}`);
          state.active.ligand[target.id] = { value: customization.value };
        },
        isRendered: ({ state: currentState, item }) => Boolean(currentState.active.ligand[item.id])
      };
      const sourcePose = { id: 'source-pose', poseItems: [{ id: 'source' }] };
      const destinationInspiration = { id: 'destination-inspiration' };
      const destinationPose = {
        id: 'destination-pose',
        poseTargets: [{ id: 'destination' }],
        inspirationItems: [destinationInspiration]
      };
      const focus = jest.fn(({ target }) => events.push(`focus:${target.id}`));
      const config = {
        transferOrder: POSE_TRANSFER_ORDERS.REMOVE_FIRST,
        transferScheduling,
        poseControls: [ligand],
        inspirationControls: [],
        getPoseItems: ({ pose }) => pose.poseItems || [],
        getPoseTargets: ({ pose }) => pose.poseTargets || [],
        getInspirationItems: ({ pose }) => pose.inspirationItems || [],
        postTransferFocus: {
          enabled: true,
          getTarget: ({ destinationPoseItems }) => destinationPoseItems[0],
          isEligible: ({ state: currentState, target }) =>
            Boolean(currentState.active.ligand[target.id]),
          apply: focus
        }
      };
      const getState = () => state;
      const dispatch = action => (typeof action === 'function' ? action(dispatch, getState) : action);

      const result = await executePoseTransfer({ config, sourcePose, destinationPose, stage: {} })(
        dispatch,
        getState
      );

      expect(events.at(-1)).toBe('focus:destination');
      expect(focus).toHaveBeenCalledWith(
        expect.objectContaining({ destinationInspirationItems: [destinationInspiration] })
      );
      expect(result.postTransferError).toBeNull();
    }
  );

  it('skips optional destination focus when its eligibility condition is false', async () => {
    expect.hasAssertions();
    const focus = jest.fn();
    const state = { active: { ligand: { source: { value: 'settings' } } } };
    const ligand = {
      ...createControl('ligand'),
      remove: ({ selectedItem }) => delete state.active.ligand[selectedItem.id],
      apply: ({ target, customization }) => {
        state.active.ligand[target.id] = { value: customization.value };
      },
      isRendered: ({ state: currentState, item }) => Boolean(currentState.active.ligand[item.id])
    };
    const sourcePose = { id: 'source-pose', poseItems: [{ id: 'source' }] };
    const destinationPose = { id: 'destination-pose', poseTargets: [{ id: 'destination' }] };
    const config = {
      poseControls: [ligand],
      inspirationControls: [],
      getPoseItems: ({ pose }) => pose.poseItems || [],
      getPoseTargets: ({ pose }) => pose.poseTargets || [],
      getInspirationItems: () => [],
      postTransferFocus: {
        enabled: true,
        isEligible: () => false,
        apply: focus
      }
    };
    const getState = () => state;
    const dispatch = action => (typeof action === 'function' ? action(dispatch, getState) : action);

    const result = await executePoseTransfer({ config, sourcePose, destinationPose, stage: {} })(
      dispatch,
      getState
    );

    expect(focus).not.toHaveBeenCalled();
    expect(result.postTransferError).toBeNull();
  });

  it('reports focus failure without rolling back a completed transfer', async () => {
    expect.hasAssertions();
    const state = { active: { ligand: { source: { value: 'settings' } } } };
    const ligand = {
      ...createControl('ligand'),
      remove: ({ selectedItem }) => delete state.active.ligand[selectedItem.id],
      apply: ({ target, customization }) => {
        state.active.ligand[target.id] = { value: customization.value };
      },
      isRendered: ({ state: currentState, item }) => Boolean(currentState.active.ligand[item.id])
    };
    const sourcePose = { id: 'source-pose', poseItems: [{ id: 'source' }] };
    const destinationPose = { id: 'destination-pose', poseTargets: [{ id: 'destination' }] };
    const config = {
      poseControls: [ligand],
      inspirationControls: [],
      getPoseItems: ({ pose }) => pose.poseItems || [],
      getPoseTargets: ({ pose }) => pose.poseTargets || [],
      getInspirationItems: () => [],
      postTransferFocus: {
        enabled: true,
        apply: () => {
          throw new Error('focus failed');
        }
      }
    };
    const getState = () => state;
    const dispatch = action => (typeof action === 'function' ? action(dispatch, getState) : action);

    const result = await executePoseTransfer({ config, sourcePose, destinationPose, stage: {} })(
      dispatch,
      getState
    );

    expect(result.postTransferError).toStrictEqual(new Error('focus failed'));
    expect(state.active.ligand).toStrictEqual({ destination: { value: 'settings' } });
  });
});
