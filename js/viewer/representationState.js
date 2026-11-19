import { cloneDeep } from 'lodash';

// Native handles also reference molecules, the renderer, buffers and the store.
// Select display fields BEFORE cloning; never traverse the runtime graph.
export const copyRepresentationSettings = representation => {
  if (representation == null) return representation;
  const settings = {};
  if (representation.type !== undefined) settings.type = representation.type;
  const params = representation.params ?? representation.parameters;
  if (params !== undefined) settings.params = cloneDeep(params);
  return settings;
};

export const copyRepresentationState = representation => {
  if (representation == null) return representation;
  const state = copyRepresentationSettings(representation);
  for (const key of ['uuid', 'lastKnownID', 'templateParams', 'visible']) {
    if (representation[key] !== undefined) state[key] = cloneDeep(representation[key]);
  }
  return state;
};

// Transfers carry appearance only. IDs belong to the destination's live handle.
export const copyRepresentationSettingsList = representations => representations?.map(copyRepresentationSettings);
