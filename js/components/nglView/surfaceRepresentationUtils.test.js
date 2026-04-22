import { MOL_REPRESENTATION } from './constants';
import { ensureSurfaceWorkerDisabled } from './surfaceRepresentationUtils';

describe('ensureSurfaceWorkerDisabled', () => {
  it('forces molecular surfaces onto the non-worker path', () => {
    const surfaceRepresentation = {
      type: MOL_REPRESENTATION.surface,
      params: {
        opacity: 0.74,
        surfaceType: 'av',
        useWorker: true
      },
      lastKnownID: 'surface-1'
    };
    const cartoonRepresentation = {
      type: MOL_REPRESENTATION.cartoon,
      params: {
        color: 'green'
      },
      lastKnownID: 'cartoon-1'
    };

    const result = ensureSurfaceWorkerDisabled([surfaceRepresentation, cartoonRepresentation]);

    expect(result).toEqual([
      {
        type: MOL_REPRESENTATION.surface,
        params: {
          opacity: 0.74,
          surfaceType: 'av',
          useWorker: false
        },
        lastKnownID: 'surface-1'
      },
      cartoonRepresentation
    ]);
    expect(result[0]).not.toBe(surfaceRepresentation);
    expect(result[0].params).not.toBe(surfaceRepresentation.params);
    expect(result[1]).toBe(cartoonRepresentation);
  });

  it('returns the original empty value when nothing is provided', () => {
    expect(ensureSurfaceWorkerDisabled(undefined)).toBeUndefined();
  });
});
