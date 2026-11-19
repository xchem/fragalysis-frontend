/** @jest-environment node */
import { execFileSync } from 'child_process';
import path from 'path';
import { createCcp4Map } from './fixtures/ccp4Map';
import { getAbsoluteMapContour, readCcp4MapMetadata, transformCcp4MapMesh } from './moorhenMapUtils';

describe('native map alignment', () => {
  it('aligns real Coot contours with a synthetic density peak at a fractional, signed origin', () => {
    expect.hasAssertions();
    const origin = [-3.123, 4.25, -7.3];
    const values = [];
    for (let z = 0; z < 12; z++) {
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 12; x++) values.push(Math.exp(-((x - 5.5) ** 2 + (y - 5.5) ** 2 + (z - 5.5) ** 2) / 8));
      }
    }
    const bytes = createCcp4Map({ dimensions: [12, 12, 12], origin, values, mean: 0, rms: 0.2 });
    const metadata = readCcp4MapMetadata(bytes);
    const level = getAbsoluteMapContour({ isolevel: 1.5 }, metadata, {});
    // Keep the threaded WASM runtime in a short-lived process so its worker pool
    // does not outlive Jest. This exercises the installed/pinned native package.
    const script = `
    const fs = require('fs');
    (async () => {
      const input = JSON.parse(fs.readFileSync(0, 'utf8'));
      const coot = await require(input.module)({ print: () => {}, printErr: () => {} });
      const container = new coot.molecules_container_js(false);
      container.set_use_gemmi(false);
      container.set_map_is_contoured_with_thread_pool(true);
      container.set_max_number_of_threads(3);
      coot.FS.writeFile('/synthetic.map', Buffer.from(input.bytes, 'base64'));
      const id = container.read_ccp4_map('/synthetic.map', false);
      const mesh = container.get_map_contours_mesh(id, ...input.centre, input.radius, input.level);
      const result = {
        prim_types: [['LINES']],
        vert_tri: [[Array.from(coot.getPositionsFromSimpleMesh(mesh))]],
        idx_tri: [[Array.from(coot.getLineIndicesFromSimpleMesh(mesh))]]
      };
      mesh.vertices.delete();
      mesh.triangles.delete();
      container.close_molecule(id);
      container.delete();
      console.log('DENSITY_MESH=' + JSON.stringify(result));
      process.exit(0);
    })().catch(error => { console.error(error); process.exit(1); });
  `;
    const output = execFileSync(process.execPath, ['-e', script], {
      input: JSON.stringify({
        module: path.resolve(__dirname, '../../node_modules/moorhen/public/moorhen.js'),
        bytes: Buffer.from(bytes).toString('base64'),
        centre: metadata.centre,
        radius: metadata.radius + 0.001,
        level
      }),
      encoding: 'utf8',
      timeout: 30000,
      maxBuffer: 2 * 1024 * 1024
    });
    const mesh = JSON.parse(
      output
        .split('\n')
        .find(line => line.startsWith('DENSITY_MESH='))
        .slice('DENSITY_MESH='.length)
    );
    transformCcp4MapMesh(mesh, metadata);
    const vertices = [...new Set(mesh.idx_tri[0][0])];
    const positions = mesh.vert_tri[0][0];
    expect(vertices.length).toBeGreaterThan(100);
    origin.forEach((offset, axis) => {
      const centre = vertices.reduce((sum, vertex) => sum + positions[vertex * 3 + axis], 0) / vertices.length;
      expect(centre).toBeCloseTo(2.75 + offset, 1);
      expect(vertices.every(vertex => Math.abs(positions[vertex * 3 + axis] - centre) < 1.7)).toBe(true);
    });
  });
});
