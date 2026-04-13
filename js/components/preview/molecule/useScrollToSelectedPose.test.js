import {
  elementIsVisibleInContainer,
  findFirstScrollablePose,
  getPoseObservationIds,
  getRequiredPageForIndex
} from './useScrollToSelectedPose';

describe('useScrollToSelectedPose helpers', () => {
  it('returns observation ids from associated observations first', () => {
    expect.hasAssertions();

    expect(
      getPoseObservationIds({
        associatedObs: [{ id: 11 }, { id: 12 }],
        site_observations: [99]
      })
    ).toStrictEqual([11, 12]);
  });

  it('falls back to site observations when associated observations are missing', () => {
    expect.hasAssertions();

    expect(
      getPoseObservationIds({
        site_observations: [21, 22]
      })
    ).toStrictEqual([21, 22]);
  });

  it('prioritizes the explicitly requested pose when it is visible in the list', () => {
    expect.hasAssertions();

    const poses = [
      { id: 'lhs-1', associatedObs: [{ id: 1 }] },
      { id: 'lhs-2', associatedObs: [{ id: 2 }] }
    ];

    expect(
      findFirstScrollablePose({
        poses,
        prioritizedPoseId: 'lhs-2',
        selectedObservationIds: [1]
      })
    ).toStrictEqual({
      poseId: 'lhs-2',
      index: 1
    });
  });

  it('finds the first pose that contains a selected observation', () => {
    expect.hasAssertions();

    const poses = [
      { id: 'pose-1', associatedObs: [{ id: 10 }] },
      { id: 'pose-2', associatedObs: [{ id: 20 }, { id: 30 }] },
      { id: 'pose-3', associatedObs: [{ id: 40 }] }
    ];

    expect(
      findFirstScrollablePose({
        poses,
        selectedObservationIds: [30, 40]
      })
    ).toStrictEqual({
      poseId: 'pose-2',
      index: 1
    });
  });

  it('calculates the required page using zero-based indexes', () => {
    expect.hasAssertions();

    expect(getRequiredPageForIndex(0, 30)).toBe(1);
    expect(getRequiredPageForIndex(29, 30)).toBe(1);
    expect(getRequiredPageForIndex(30, 30)).toBe(2);
  });

  it('checks row visibility against the scroll container rather than the window', () => {
    expect.hasAssertions();

    const container = {
      getBoundingClientRect: jest.fn(() => ({
        top: 100,
        left: 0,
        bottom: 300,
        right: 200
      }))
    };

    const visibleRow = {
      getBoundingClientRect: jest.fn(() => ({
        top: 120,
        left: 0,
        bottom: 180,
        right: 180
      }))
    };

    const hiddenRow = {
      getBoundingClientRect: jest.fn(() => ({
        top: 320,
        left: 0,
        bottom: 380,
        right: 180
      }))
    };

    expect(elementIsVisibleInContainer(visibleRow, container)).toBe(true);
    expect(elementIsVisibleInContainer(hiddenRow, container)).toBe(false);
    expect(elementIsVisibleInContainer(hiddenRow, container, true)).toBe(false);
  });
});
