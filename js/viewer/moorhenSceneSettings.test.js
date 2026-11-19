import { getSceneRadius, getSceneRanges } from './moorhenSceneSettings';

const parameters = { clipNear: 0, clipFar: 100, clipDist: 5, fogNear: 0, fogFar: 100 };

describe('legacy scene settings', () => {
  it('keeps percentage direction and the midpoint at the scene target', () => {
    expect.hasAssertions();
    expect(getSceneRanges(parameters, 20, 1)).toStrictEqual({ clipStart: 20, clipEnd: 20, fogStart: 230, fogEnd: 270 });
    expect(getSceneRanges({ ...parameters, clipNear: 50, clipFar: 50, fogNear: 50, fogFar: 50 }, 20, 1)).toStrictEqual({
      clipStart: -0,
      clipEnd: 0,
      fogStart: 250,
      fogEnd: 250
    });
    expect(getSceneRanges({ ...parameters, clipNear: 75, clipFar: 90, fogNear: 40, fogFar: 85 }, 20, 1)).toStrictEqual({
      clipStart: -10,
      clipEnd: 16,
      fogStart: 246,
      fogEnd: 264
    });
  });

  it('uses clipDist as a minimum camera distance and recomputes it when zoom changes', () => {
    expect.hasAssertions();
    const distance = 24 / Math.tan(Math.PI / 9);
    expect(getSceneRanges({ ...parameters, clipDist: 60 }, 20, 1).clipStart).toBeCloseTo(distance - 60);
    expect(getSceneRanges({ ...parameters, clipDist: 60 }, 20, 0.5).clipStart).toBeCloseTo(distance / 2 - 60);
    expect(getSceneRanges(parameters, 20, 2).clipStart).toBe(20);
  });

  it('uses world coordinates for instanced meshes and updates bounds after redraw/removal without copying native objects', () => {
    expect.hasAssertions();
    const cache = new WeakMap();
    const buffer = { triangleVertices: [[-1, -1, -1, 1, 1, 1]], triangleInstanceOrigins: [[90, 0, 0, 110, 0, 0]] };
    buffer.parentObject = { buffers: [buffer] };
    expect(getSceneRadius([buffer], cache)).toBe(110);
    buffer.triangleInstanceOrigins = [[-20, 0, 0, 20, 0, 0]];
    expect(getSceneRadius([buffer], cache)).toBe(20);
    const map = { triangleVertices: [[-40, 0, 0, 40, 0, 0]] };
    expect(getSceneRadius([buffer, map], cache)).toBe(40);
    expect(getSceneRadius([buffer], cache)).toBe(20);
    expect(getSceneRadius([], cache)).toBe(50);
    expect(buffer.parentObject.buffers[0]).toBe(buffer);
  });
});
