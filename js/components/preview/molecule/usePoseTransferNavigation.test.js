import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, legacy_createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { usePoseTransferNavigation } from './usePoseTransferNavigation';
import { executePoseTransfer } from './poseTransfer';

jest.mock('./poseTransfer', () => ({
  ...jest.requireActual('./poseTransfer'),
  executePoseTransfer: jest.fn()
}));

describe('pose transfer navigation', () => {
  it('uses reported table order, loads a destination beyond the page and serializes transfers', async () => {
    const poses = Array.from({ length: 35 }, (_, index) => ({ id: index, associatedObs: [{ id: index }] }));
    const store = legacy_createStore(state => state, {}, applyMiddleware(thunk));
    const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
    const config = {
      poseControls: [{ key: 'ligand', getActiveState: (state, item) => item.id === 1 }],
      getPoseItems: ({ pose }) => pose.associatedObs,
      getInspirationItems: () => [],
      dialogs: { afterTransfer: jest.fn() }
    };
    let complete;
    executePoseTransfer.mockReturnValue(() => new Promise(resolve => { complete = resolve; }));
    const setPage = jest.fn();
    const scroll = jest.fn();
    const options = {
      config, poses, stage: {}, moleculesPerPage: 30, setCurrentPage: setPage,
      setScrollToMoleculeId: scroll, getNode: jest.fn(), setAnchor: jest.fn(), addToastMessage: jest.fn()
    };
    const { result } = renderHook(() => usePoseTransferNavigation(options), { wrapper });
    act(() => result.current.onNavigationItemsChange([poses[2], poses[1], poses[34]]));
    expect(result.current.toolbarTransfers.previous.destinationPose).toBe(poses[2]);
    expect(result.current.toolbarTransfers.next.destinationPose).toBe(poses[34]);
    let pending;
    act(() => {
      pending = result.current.onTransfer(result.current.toolbarTransfers.next);
      result.current.onTransfer(result.current.toolbarTransfers.next);
    });
    expect(executePoseTransfer).toHaveBeenCalledTimes(1);
    expect(result.current.busy).toBe(true);
    expect(setPage.mock.calls[0][0](1)).toBe(2);
    expect(scroll).toHaveBeenCalledWith(34);
    await act(async () => {
      complete({ dialogState: null, destinationInspirationIds: [], postTransferError: null });
      await pending;
    });
    expect(result.current.busy).toBe(false);
    expect(config.dialogs.afterTransfer).toHaveBeenCalledWith(expect.objectContaining({ destinationPose: poses[34] }));
  });
});
