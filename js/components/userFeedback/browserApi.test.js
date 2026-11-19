import domtoimage from 'dom-to-image-more';
import { captureScreenOfSnapshotFullScreen, captureScreenOfSnapshotNglScreen } from './browserApi';

jest.mock('dom-to-image-more', () => ({ toPng: jest.fn() }));

const sceneImage = 'data:image/png;base64,molecule-and-map';
const clearedImage = 'data:image/png;base64,cleared';
const captures = [
  ['viewer thumbnail', captureScreenOfSnapshotNglScreen],
  ['full page', captureScreenOfSnapshotFullScreen]
];

const createCaptureFixture = () => {
  jest.resetAllMocks();
  document.body.innerHTML = '<div id="major_view"><canvas></canvas><span>Ligand label</span></div><canvas></canvas>';
  const view = document.getElementById('major_view');
  const canvas = view.querySelector('canvas');
  canvas.width = 1600;
  canvas.height = 1200;
  Object.defineProperties(view, { scrollWidth: { value: 800 }, scrollHeight: { value: 600 } });
  const viewerAdapter = {
    getRendererElement: jest.fn(() => canvas),
    captureImage: jest.fn(({ capture }) => capture(sceneImage))
  };
  return { view, canvas, viewerAdapter };
};

describe('snapshot screen capture', () => {
  it('replaces a canvas image without rerunning dom-to-image cleanup on its next load', async () => {
    expect.hasAssertions();
    const { canvas, viewerAdapter } = createCaptureFixture();
    const nativeDomToImage = jest.requireActual('dom-to-image-more');
    const requestFrame = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => callback());
    try {
      const imageReady = nativeDomToImage.impl.util.makeImage(clearedImage);
      const svg = document.body.lastElementChild;
      const clone = svg.firstChild;
      clone.onload();
      await imageReady;
      expect(svg.isConnected).toBe(false);

      domtoimage.toPng.mockImplementation(async (node, options) => {
        options.adjustClonedNode(canvas, clone, false);
        // Changing src loads again. The library's first onload has already
        // removed its temporary SVG and cannot safely be invoked a second time.
        clone.onload?.();
        options.adjustClonedNode(canvas, clone, true);
        clone.onload?.();
        return clone.src;
      });

      expect(await captureScreenOfSnapshotNglScreen(viewerAdapter)(jest.fn())).toBe(sceneImage);
    } finally {
      requestFrame.mockRestore();
    }
  });

  it.each(captures)(
    'keeps a frozen viewer image and overlays in the %s after the live buffer clears',
    async (label, action) => {
      expect.hasAssertions();
      const { view, canvas, viewerAdapter } = createCaptureFixture();
      const originalDom = document.body.innerHTML;
      const originalToDataURL = canvas.toDataURL;
      domtoimage.toPng.mockImplementation(async (node, options) => {
        // DOM cloning reaches the canvas asynchronously, after its WebGL frame has been cleared.
        await Promise.resolve();
        const clone = document.createElement('img');
        clone.src = clearedImage;
        options.adjustClonedNode?.(canvas, clone, false);
        options.adjustClonedNode?.(canvas, clone, true);
        expect(node.querySelector('span').textContent).toBe('Ligand label');
        const unrelatedCanvas = document.body.lastElementChild;
        const unrelatedClone = document.createElement('img');
        unrelatedClone.src = 'data:image/png;base64,other-canvas';
        options.adjustClonedNode?.(unrelatedCanvas, unrelatedClone, true);
        expect(unrelatedClone.src).toBe('data:image/png;base64,other-canvas');
        return clone.src;
      });

      expect(await action(viewerAdapter)(jest.fn())).toBe(sceneImage);
      expect(viewerAdapter.captureImage).toHaveBeenCalledTimes(1);
      expect(domtoimage.toPng.mock.calls[0][0]).toBe(label === 'viewer thumbnail' ? view : document.documentElement);
      expect(document.body.innerHTML).toBe(originalDom);
      expect(canvas.toDataURL).toBe(originalToDataURL);
    }
  );

  it('captures the thumbnail at its layout size on a high-DPI display', async () => {
    expect.hasAssertions();
    const { view, viewerAdapter } = createCaptureFixture();
    domtoimage.toPng.mockResolvedValue(sceneImage);

    await captureScreenOfSnapshotNglScreen(viewerAdapter)(jest.fn());

    expect(domtoimage.toPng).toHaveBeenCalledWith(
      view,
      expect.objectContaining({
        width: 800,
        height: 600,
        style: { transform: 'scale(1)', transformOrigin: 'top left', width: '800px', height: '600px' }
      })
    );
  });

  it.each(captures)('still supports DOM-only %s capture without an adapter', async (label, action) => {
    expect.hasAssertions();
    const { viewerAdapter } = createCaptureFixture();
    domtoimage.toPng.mockResolvedValue('data:image/png;base64,dom-only');

    expect(await action()(jest.fn())).toBe('data:image/png;base64,dom-only');
    expect(viewerAdapter.captureImage).not.toHaveBeenCalled();
  });

  it.each(captures)('propagates %s rendering errors without producing an image', async (label, action) => {
    expect.hasAssertions();
    const { viewerAdapter } = createCaptureFixture();
    viewerAdapter.captureImage.mockRejectedValue(new Error('Capture failed'));

    await expect(action(viewerAdapter)(jest.fn())).rejects.toThrow('Capture failed');
    expect(domtoimage.toPng).not.toHaveBeenCalled();
  });

  it('does not capture a thumbnail when the main view is absent', async () => {
    expect.hasAssertions();
    const { view, viewerAdapter } = createCaptureFixture();
    view.remove();

    expect(await captureScreenOfSnapshotNglScreen(viewerAdapter)(jest.fn())).toBeNull();
    expect(viewerAdapter.captureImage).not.toHaveBeenCalled();
    expect(domtoimage.toPng).not.toHaveBeenCalled();
  });
});
