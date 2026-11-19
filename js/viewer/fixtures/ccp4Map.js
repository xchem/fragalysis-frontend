// Small, synthetic map fixtures; no target data or native handles are stored.
export const createCcp4Map = ({
  dimensions = [39, 33, 34],
  starts = [0, 0, 0],
  grid = dimensions,
  axes = [1, 2, 3],
  lengths = grid.map(size => size * 0.5),
  angles = [90, 90, 90],
  origin = [-5.863, 4.477, -5.351],
  mean = -0.0257808287,
  rms = 0.3640211523,
  littleEndian = true,
  values = null
} = {}) => {
  const count = values ? dimensions.reduce((product, size) => product * size, 1) : 0;
  const bytes = new Uint8Array(1024 + count * 4);
  const view = new DataView(bytes.buffer);
  const integers = (word, items) =>
    items.forEach((value, index) => view.setInt32((word + index) * 4, value, littleEndian));
  const reals = (word, items) =>
    items.forEach((value, index) => view.setFloat32((word + index) * 4, value, littleEndian));
  integers(0, [...dimensions, 2, ...starts, ...grid]);
  reals(10, [...lengths, ...angles]);
  integers(16, axes);
  reals(21, [mean]);
  integers(22, [1]);
  reals(49, origin);
  bytes.set([77, 65, 80, 32], 208);
  bytes.set(littleEndian ? [68, 65] : [17, 17], 212);
  reals(54, [rms]);
  if (values) reals(256, values);
  return bytes;
};
