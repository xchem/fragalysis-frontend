import {
  DEFAULT_RHS_POSE_NAVIGATION_CONFIG,
  normalizeRhsPoseNavigationConfig,
  POSE_TRANSFER_CENTERING_MODES,
  POSE_TRANSFER_ORDERS,
  POSE_TRANSFER_SCHEDULING
} from './poseNavigation';

describe('pose navigation configuration', () => {
  it('defaults to centering between the design and inspiration ligands', () => {
    expect.hasAssertions();
    expect(normalizeRhsPoseNavigationConfig()).toStrictEqual(
      DEFAULT_RHS_POSE_NAVIGATION_CONFIG
    );
    expect(DEFAULT_RHS_POSE_NAVIGATION_CONFIG.postTransferCenteringMode).toBe(
      POSE_TRANSFER_CENTERING_MODES.VISIBLE_LIGAND_CENTROID
    );
  });

  it.each([
    [true, POSE_TRANSFER_CENTERING_MODES.DESIGN_LIGAND],
    [false, POSE_TRANSFER_CENTERING_MODES.NONE]
  ])('migrates legacy centering value %s', (legacyValue, expectedMode) => {
    expect.hasAssertions();
    expect(
      normalizeRhsPoseNavigationConfig({
        transferOrder: POSE_TRANSFER_ORDERS.ADD_FIRST,
        transferScheduling: POSE_TRANSFER_SCHEDULING.PHASED,
        centerOnDestinationLigandAfterTransfer: legacyValue
      })
    ).toStrictEqual({
      transferOrder: POSE_TRANSFER_ORDERS.ADD_FIRST,
      transferScheduling: POSE_TRANSFER_SCHEDULING.PHASED,
      postTransferCenteringMode: expectedMode
    });
  });
});
