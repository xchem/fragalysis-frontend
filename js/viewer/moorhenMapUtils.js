// CCP4/MRC geometry and density statistics stay outside the native object graph.
// NGL uses ORIGIN in addition to grid starts, and expresses contour levels in
// standard deviations from the mean. Coot's map mesh uses grid coordinates and
// an absolute density threshold instead.
export const readCcp4MapMetadata = bytes => {
  if (!bytes || bytes.byteLength < 1024) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (String.fromCharCode(...bytes.subarray(208, 212)) !== 'MAP ') return null;
  const littleEndian = !(view.getUint8(212) === 17 && view.getUint8(213) === 17);
  const integer = word => view.getInt32(word * 4, littleEndian);
  const real = word => view.getFloat32(word * 4, littleEndian);
  const dimensions = [0, 1, 2].map(integer);
  const starts = [4, 5, 6].map(integer);
  const grid = [7, 8, 9].map(integer);
  const axes = [16, 17, 18].map(word => integer(word) - 1);
  const lengths = [10, 11, 12].map(real);
  const [alpha, beta, gamma] = [13, 14, 15].map(word => (real(word) * Math.PI) / 180);
  if (
    [...dimensions, ...grid, ...lengths].some(value => !Number.isFinite(value) || value <= 0) ||
    new Set(axes).size !== 3 ||
    axes.some(axis => axis < 0 || axis > 2)
  ) {
    return null;
  }
  const cy = (Math.cos(alpha) - Math.cos(gamma) * Math.cos(beta)) / Math.sin(gamma);
  const cell = [
    [lengths[0], 0, 0],
    [lengths[1] * Math.cos(gamma), lengths[1] * Math.sin(gamma), 0],
    [lengths[2] * Math.cos(beta), lengths[2] * cy, lengths[2] * Math.sqrt(Math.sin(beta) ** 2 - cy ** 2)]
  ];
  const basis = axes.map(axis => cell[axis].map(value => value / grid[axis]));
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const determinant = basis[0].reduce((sum, value, index) => sum + value * cross(basis[1], basis[2])[index], 0);
  if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-12) return null;
  const inverse = [cross(basis[1], basis[2]), cross(basis[2], basis[0]), cross(basis[0], basis[1])].map(row =>
    row.map(value => value / determinant)
  );
  const toNative = point => [0, 1, 2].map(axis => point.reduce((sum, value, i) => sum + value * basis[i][axis], 0));
  const centre = toNative(starts.map((value, axis) => value + (dimensions[axis] - 1) / 2));
  let radius = 0;
  for (let corner = 0; corner < 8; corner++) {
    const point = toNative(starts.map((value, axis) => value + ((corner >> axis) & 1) * (dimensions[axis] - 1)));
    radius = Math.max(radius, Math.hypot(...point.map((value, axis) => value - centre[axis])));
  }
  let mean = real(21);
  let rms = real(54);
  // Older maps can omit the header statistics, as supported by NGL's parser.
  if (!Number.isFinite(mean) || !Number.isFinite(rms) || rms <= 0) {
    const readers = { 0: [1, 'getInt8'], 1: [2, 'getInt16'], 2: [4, 'getFloat32'], 6: [2, 'getUint16'] };
    const reader = readers[integer(3)];
    const count = dimensions.reduce((product, value) => product * value, 1);
    const offset = 1024 + integer(23);
    if (reader && offset >= 1024 && offset + count * reader[0] <= bytes.byteLength) {
      let sum = 0;
      let squares = 0;
      for (let index = 0; index < count; index++) {
        const value = view[reader[1]](offset + index * reader[0], littleEndian);
        sum += value;
        squares += value * value;
      }
      mean = sum / count;
      rms = Math.sqrt(Math.max(0, squares / count - mean * mean));
    }
  }
  return { dimensions, starts, inverse, centre, radius, origin: [49, 50, 51].map(real), mean, rms, littleEndian };
};

export const getAbsoluteMapContour = (parameters, metadata, map) => {
  const level = Number(parameters.isolevel);
  if (!Number.isFinite(level)) return map.suggestedContourLevel || 0.8;
  const mean = metadata?.mean ?? map.mapMean ?? 0;
  const rms = metadata?.rms ?? map.mapRmsd ?? 1;
  const absolute = parameters.isolevelType === 'value' ? level : mean + level * rms;
  return map.isDifference ? Math.abs(absolute) : absolute;
};

export const transformCcp4MapMesh = (mesh, metadata) => {
  if (!mesh?.vert_tri || !metadata) return mesh;
  const { origin, inverse, starts, dimensions } = metadata;
  mesh.vert_tri.forEach((groups, i) => {
    groups.forEach((positions, j) => {
      const inside = new Uint8Array(positions.length / 3);
      for (let vertex = 0; vertex < inside.length; vertex++) {
        const offset = vertex * 3;
        inside[vertex] = inverse.every((row, axis) => {
          const coordinate = row.reduce((sum, value, k) => sum + value * positions[offset + k], 0) - starts[axis];
          return coordinate >= -1e-4 && coordinate <= dimensions[axis] - 1 + 1e-4;
        });
        for (let axis = 0; axis < 3; axis++) positions[offset + axis] += origin[axis];
      }
      // Coot contours periodic copies outside a cropped file. Keep only the
      // supplied volume, as NGL does for an unrestricted (boxSize=0) surface.
      const indices = mesh.idx_tri[i][j];
      const stride = mesh.prim_types[i][j] === 'TRIANGLES' ? 3 : 2;
      const retained = [];
      for (let index = 0; index < indices.length; index += stride) {
        let keep = true;
        for (let k = 0; k < stride; k++) keep = keep && inside[indices[index + k]];
        if (keep) for (let k = 0; k < stride; k++) retained.push(indices[index + k]);
      }
      mesh.idx_tri[i][j] = retained;
    });
  });
  return mesh;
};
