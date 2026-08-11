export const POSE_TRANSFER_ORDERS = Object.freeze({
  REMOVE_FIRST: 'remove-first',
  ADD_FIRST: 'add-first'
});

export const POSE_TRANSFER_SCHEDULING = Object.freeze({
  PHASED: 'phased',
  OVERLAPPED: 'overlapped'
});

export const POSE_TRANSFER_CENTERING_MODES = Object.freeze({
  NONE: 'none',
  DESIGN_LIGAND: 'design-ligand',
  VISIBLE_LIGAND_CENTROID: 'visible-ligand-centroid'
});

export const DEFAULT_RHS_POSE_NAVIGATION_CONFIG = Object.freeze({
  transferOrder: POSE_TRANSFER_ORDERS.REMOVE_FIRST,
  transferScheduling: POSE_TRANSFER_SCHEDULING.OVERLAPPED,
  postTransferCenteringMode: POSE_TRANSFER_CENTERING_MODES.VISIBLE_LIGAND_CENTROID
});

const normalizePostTransferCenteringMode = config => {
  if (Object.values(POSE_TRANSFER_CENTERING_MODES).includes(config?.postTransferCenteringMode)) {
    return config.postTransferCenteringMode;
  }

  // Snapshots created before centering became a radio group stored a boolean.
  if (typeof config?.centerOnDestinationLigandAfterTransfer === 'boolean') {
    return config.centerOnDestinationLigandAfterTransfer
      ? POSE_TRANSFER_CENTERING_MODES.DESIGN_LIGAND
      : POSE_TRANSFER_CENTERING_MODES.NONE;
  }

  return DEFAULT_RHS_POSE_NAVIGATION_CONFIG.postTransferCenteringMode;
};

export const normalizeRhsPoseNavigationConfig = config => ({
  transferOrder: Object.values(POSE_TRANSFER_ORDERS).includes(config?.transferOrder)
    ? config.transferOrder
    : DEFAULT_RHS_POSE_NAVIGATION_CONFIG.transferOrder,
  transferScheduling: Object.values(POSE_TRANSFER_SCHEDULING).includes(config?.transferScheduling)
    ? config.transferScheduling
    : DEFAULT_RHS_POSE_NAVIGATION_CONFIG.transferScheduling,
  postTransferCenteringMode: normalizePostTransferCenteringMode(config)
});
