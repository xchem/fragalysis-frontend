// Scheduling belongs to this live bulk request, not to saved snapshot state.
// Snapshot preparation clones intents, so restored items use normal scheduling.
const bulkLigands = new WeakSet();

export const markBulkLigand = item => bulkLigands.add(item);

export const isBulkLigand = item => bulkLigands.has(item);
