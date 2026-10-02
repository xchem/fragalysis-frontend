// NGL 2.0.0-dev.37 used a scene bounding radius (including its distance from
// the coordinate origin), with 50% at the scene/camera target. Keep those
// serialized percentages; Moorhen's clipping and fog setters take Angstroms.
export const getSceneRadius = (buffers = [], cache = new WeakMap()) => {
  const minimum = [Infinity, Infinity, Infinity];
  const maximum = [-Infinity, -Infinity, -Infinity];
  buffers.forEach(buffer => {
    if (buffer.isHoverBuffer) return;
    let bounds = cache.get(buffer);
    const vertices = buffer.triangleVertices;
    const origins = buffer.triangleInstanceOrigins;
    const atoms = buffer.atoms;
    if (
      !bounds ||
      bounds.vertices !== vertices ||
      bounds.origins !== origins ||
      bounds.atoms !== atoms ||
      buffer.isDirty
    ) {
      bounds = {
        minimum: [Infinity, Infinity, Infinity],
        maximum: [-Infinity, -Infinity, -Infinity],
        vertices,
        origins,
        atoms
      };
      const include = (x, y, z) => {
        if (![x, y, z].every(Number.isFinite)) return;
        [x, y, z].forEach((value, axis) => {
          bounds.minimum[axis] = Math.min(bounds.minimum[axis], value);
          bounds.maximum[axis] = Math.max(bounds.maximum[axis], value);
        });
      };
      // Instanced meshes have local template vertices; their world positions
      // are the instance origins. Ordinary meshes/maps use world vertices.
      (vertices || []).forEach((positions, index) => {
        const coordinates = origins?.[index]?.length ? origins[index] : positions;
        for (let i = 0; i < coordinates.length; i += 3) {
          include(coordinates[i], coordinates[i + 1], coordinates[i + 2]);
        }
      });
      if (!Number.isFinite(bounds.minimum[0])) {
        (atoms || []).forEach(atom => include(atom.x, atom.y, atom.z));
      }
      cache.set(buffer, bounds);
    }
    for (let axis = 0; axis < 3; axis++) {
      minimum[axis] = Math.min(minimum[axis], bounds.minimum[axis]);
      maximum[axis] = Math.max(maximum[axis], bounds.maximum[axis]);
    }
  });
  if (!minimum.every(Number.isFinite)) return 50;
  const diagonal = Math.hypot(...minimum.map((value, axis) => maximum[axis] - value));
  const centerDistance = Math.hypot(...minimum.map((value, axis) => (maximum[axis] + value) / 2));
  return Math.max(10, diagonal / 2) + centerDistance;
};

export const getSceneRanges = (parameters, radius, zoom, fogClipOffset = 250) => {
  // Moorhen zoom scales a 48-Angstrom-high orthographic view, whereas NGL
  // moved a perspective camera with a 40-degree vertical field of view.
  // Convert that view size to a camera distance only for the clipDist floor.
  const cameraDistance = (24 * zoom) / Math.tan(Math.PI / 9);
  const offset = value => (radius * (value - 50)) / 50;
  return {
    clipStart: -Math.max(offset(parameters.clipNear), parameters.clipDist - cameraDistance, 0.1 - cameraDistance),
    clipEnd: Math.max(offset(parameters.clipFar), 1 - cameraDistance),
    fogStart: fogClipOffset + Math.max(offset(parameters.fogNear), 0.1 - cameraDistance),
    fogEnd: fogClipOffset + Math.max(offset(parameters.fogFar), 1 - cameraDistance)
  };
};
