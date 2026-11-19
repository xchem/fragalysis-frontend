import {
  createMoorhenVector,
  createSpherePdb,
  getMoorhenRepresentationStyle,
  nglSelectionToMoorhenCid,
  normaliseMoorhenColour,
  normaliseMoorhenOrientation
} from './moorhenAdapterUtils';

describe('Moorhen adapter translations', () => {
  it('normalizes named, numeric and array colours', () => {
    expect(normaliseMoorhenColour('tomato')).toEqual({
      hex: '#ff6347',
      integer: 0xff6347,
      rgb: { r: 255, g: 99, b: 71 }
    });
    expect(normaliseMoorhenColour(0x123456).hex).toBe('#123456');
    expect(normaliseMoorhenColour([0, 0.5, 1]).hex).toBe('#0080ff');
  });

  it('maps NGL representation styles and common selections', () => {
    expect(getMoorhenRepresentationStyle('cartoon')).toBe('CRs');
    expect(getMoorhenRepresentationStyle('surface')).toBe('MolecularSurface');
    expect(getMoorhenRepresentationStyle('contact')).toBe('allHBonds');
    expect(nglSelectionToMoorhenCid('LIG')).toBe('/*/*/(LIG)/*');
    expect(nglSelectionToMoorhenCid('polymer')).toBe('/*/*/*/*');
  });

  it('creates vectors from array or object coordinates', () => {
    expect(
      createMoorhenVector({
        name: 'arrow',
        start: { x: 1, y: 2, z: 3 },
        end: [4, 5, 6],
        colour: 'red',
        arrow: true
      })
    ).toEqual(
      expect.objectContaining({
        uniqueId: 'arrow',
        arrowMode: 'end',
        xFrom: 1,
        yFrom: 2,
        zFrom: 3,
        xTo: 4,
        yTo: 5,
        zTo: 6,
        vectorColour: { r: 255, g: 0, b: 0 }
      })
    );
  });

  it('creates a one-atom sphere model and restores typed-array orientation', () => {
    expect(createSpherePdb({ x: 1, y: 2, z: 3 })).toContain('   1.000   2.000   3.000');
    expect(normaliseMoorhenOrientation(new Float32Array([0, 0, 0, -1, 1, 2, 3, 0.5]))).toEqual({
      quat4: [0, 0, 0, -1],
      origin: [1, 2, 3],
      zoom: 0.5
    });
  });

  it('restores the origin and rotation from historic NGL Matrix4 snapshots', () => {
    const historicSnapshotOrientation = {
      elements: [
        175.71917143685755,
        0,
        0,
        0,
        0,
        175.71917143685755,
        0,
        0,
        0,
        0,
        175.71917143685755,
        0,
        20.63599967956543,
        -9.788999557495117,
        30.652498722076416,
        1
      ]
    };

    expect(normaliseMoorhenOrientation(historicSnapshotOrientation)).toEqual({
      quat4: [0, 0, 0, 1],
      origin: [20.63599967956543, -9.788999557495117, 30.652498722076416]
    });

    const quarterTurnAroundZ = [0, 10, 0, 0, -10, 0, 0, 0, 0, 0, 10, 0, 4, 5, 6, 1];
    const converted = normaliseMoorhenOrientation(quarterTurnAroundZ);
    expect(converted.origin).toEqual([4, 5, 6]);
    expect(converted.quat4[0]).toBeCloseTo(0);
    expect(converted.quat4[1]).toBeCloseTo(0);
    expect(converted.quat4[2]).toBeCloseTo(Math.SQRT1_2);
    expect(converted.quat4[3]).toBeCloseTo(Math.SQRT1_2);
    expect(converted.zoom).toBeUndefined();
  });
});
