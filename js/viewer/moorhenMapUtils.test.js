import { getAbsoluteMapContour, readCcp4MapMetadata, transformCcp4MapMesh } from './moorhenMapUtils';
import { createCcp4Map } from './fixtures/ccp4Map';

describe('ccp4 compatibility', () => {
  it.each([true, false])('reads fractional origins, native bounds and statistics (little endian: %s)', littleEndian => {
    expect.hasAssertions();
    const bytes = createCcp4Map({ littleEndian });
    const original = bytes.slice();
    const metadata = readCcp4MapMetadata(bytes);
    expect(metadata.dimensions).toStrictEqual([39, 33, 34]);
    expect(metadata.centre[0]).toBeCloseTo(9.5);
    expect(metadata.centre[1]).toBeCloseTo(8);
    expect(metadata.centre[2]).toBeCloseTo(8.25);
    expect(metadata.radius).toBeCloseTo(Math.hypot(9.5, 8, 8.25));
    expect(metadata.origin[0]).toBeCloseTo(-5.863);
    expect(metadata.origin[1]).toBeCloseTo(4.477);
    expect(metadata.origin[2]).toBeCloseTo(-5.351);
    expect(bytes).toStrictEqual(original);
    expect(getAbsoluteMapContour({ isolevel: 1.2 }, metadata, {})).toBeCloseTo(0.411044554);
    expect(getAbsoluteMapContour({ isolevel: 1.2, isolevelType: 'value' }, metadata, {})).toBe(1.2);
  });

  it('converts sigma levels for Event and signed difference maps without changing the saved value', () => {
    expect.hasAssertions();
    const parameters = { isolevel: 1 };
    expect(getAbsoluteMapContour(parameters, { mean: -0.20393604, rms: 1.17932427 }, {})).toBeCloseTo(0.97538823);
    expect(getAbsoluteMapContour({ isolevel: -3 }, null, { isDifference: true, mapMean: 0, mapRmsd: 0.2 })).toBeCloseTo(
      0.6
    );
    expect(getAbsoluteMapContour({ isolevel: 0 }, { mean: -0.2, rms: 1 }, {})).toBe(-0.2);
    expect(parameters).toStrictEqual({ isolevel: 1 });
  });

  it('computes missing statistics from the voxel data', () => {
    expect.hasAssertions();
    const metadata = readCcp4MapMetadata(
      createCcp4Map({ dimensions: [2, 2, 2], rms: 0, values: [0, 1, 2, 3, 4, 5, 6, 7] })
    );
    expect(metadata.mean).toBe(3.5);
    expect(metadata.rms).toBeCloseTo(Math.sqrt(5.25));
  });

  it('keeps axis permutations, nonzero starts and non-orthogonal cells in the crop transform', () => {
    expect.hasAssertions();
    const metadata = readCcp4MapMetadata(
      createCcp4Map({
        dimensions: [3, 3, 3],
        starts: [2, -1, 4],
        grid: [10, 10, 10],
        axes: [2, 3, 1],
        lengths: [10, 10, 10],
        angles: [90, 90, 60],
        origin: [-3, 2, -5]
      })
    );
    expect(metadata.centre[0]).toBeCloseTo(6.5);
    expect(metadata.centre[1]).toBeCloseTo((3 * Math.sqrt(3)) / 2);
    expect(metadata.centre[2]).toBeCloseTo(0);
    const mesh = {
      prim_types: [['LINES']],
      vert_tri: [[new Float32Array([...metadata.centre, ...metadata.centre.map(value => value + 100)])]],
      idx_tri: [[new Uint32Array([0, 0, 0, 1])]]
    };
    transformCcp4MapMesh(mesh, metadata);
    expect(mesh.idx_tri[0][0]).toStrictEqual([0, 0]);
    expect(mesh.vert_tri[0][0][0]).toBeCloseTo(3.5);
    expect(mesh.vert_tri[0][0][2]).toBeCloseTo(-5);
  });

  it.each(['LINES', 'TRIANGLES'])(
    'moves the density into ligand coordinates and removes periodic %s outside the file',
    primitive => {
      expect.hasAssertions();
      const metadata = readCcp4MapMetadata(createCcp4Map());
      const inside = primitive === 'LINES' ? [0, 1] : [0, 1, 2];
      const outside = primitive === 'LINES' ? [2, 3] : [1, 2, 3];
      const mesh = {
        prim_types: [[primitive]],
        vert_tri: [[new Float32Array([13, 8.5, 10, 13, 9, 10, 13.5, 9, 10, 25, 9, 10])]],
        idx_tri: [[new Uint32Array([...inside, ...outside])]]
      };
      transformCcp4MapMesh(mesh, metadata);
      expect(mesh.idx_tri[0][0]).toStrictEqual(inside);
      expect(mesh.vert_tri[0][0][0]).toBeCloseTo(7.137);
      expect(mesh.vert_tri[0][0][1]).toBeCloseTo(12.977);
      expect(mesh.vert_tri[0][0][2]).toBeCloseTo(4.649);
    }
  );

  it('ignores unrecognized or invalid headers', () => {
    expect.hasAssertions();
    expect(readCcp4MapMetadata(new Uint8Array(1024))).toBeNull();
    expect(readCcp4MapMetadata(createCcp4Map({ axes: [1, 1, 3] }))).toBeNull();
    expect(readCcp4MapMetadata(new Uint8Array([1, 2, 3]))).toBeNull();
  });
});
