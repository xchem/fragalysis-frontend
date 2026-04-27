const asFiniteNumber = value => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
};

export const getMainObservationForComputedInspirations = ({ data, observations = [] }) =>
  observations.find(observation => observation.id === data?.main_site_observation) || null;

export const getDefaultComputedInspirations = ({ data, observations = [] }) =>
  getMainObservationForComputedInspirations({ data, observations })?.computed_inspirations || data?.computed_inspirations || [];

export const getComputedSetIdsFromTags = tags => {
  const computedSetIds = new Set();

  (tags || []).forEach(tag => {
    const additionalInfo = tag?.additional_info;
    const additionalInfoValue = additionalInfo?.computed_set ?? additionalInfo?.computed_sets;
    const values = Array.isArray(additionalInfoValue) ? additionalInfoValue : [additionalInfoValue];

    values.forEach(value => {
      const normalized = asFiniteNumber(value);
      if (normalized !== null) {
        computedSetIds.add(normalized);
      }
    });

    if (values.some(value => value !== undefined && value !== null)) {
      return;
    }

    if (typeof tag?.id === 'string') {
      const match = tag.id.match(/^rhs-(\d+)$/);
      if (match) {
        computedSetIds.add(Number(match[1]));
      }
    }
  });

  return [...computedSetIds];
};

export const getFilteredComputedInspirations = (observation, activeTags = []) => {
  const computedInspirations = observation?.computed_inspirations || [];
  const activeComputedSetIds = getComputedSetIdsFromTags(activeTags);
  const computedInspirationsBySet = observation?.computed_inspirations_by_set;

  if (!activeComputedSetIds.length || !computedInspirationsBySet) {
    return computedInspirations;
  }

  const allowedInspirationIds = new Set();

  activeComputedSetIds.forEach(computedSetId => {
    const inspirationsForSet =
      computedInspirationsBySet[computedSetId] || computedInspirationsBySet[String(computedSetId)] || [];

    inspirationsForSet.forEach(inspirationId => {
      allowedInspirationIds.add(inspirationId);
    });
  });

  if (!allowedInspirationIds.size) {
    return [];
  }

  return computedInspirations.filter(inspirationId => allowedInspirationIds.has(inspirationId));
};
