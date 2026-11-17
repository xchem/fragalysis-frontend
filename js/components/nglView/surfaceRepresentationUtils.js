import { MOL_REPRESENTATION } from './constants';

export const ensureSurfaceWorkerDisabled = representations => {
  if (!representations) {
    return representations;
  }

  return representations.map(representation => {
    if (representation?.type !== MOL_REPRESENTATION.surface) {
      return representation;
    }

    return {
      ...representation,
      params: {
        ...representation.params,
        useWorker: false
      }
    };
  });
};
