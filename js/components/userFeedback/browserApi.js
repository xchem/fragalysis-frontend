import { setImageSource, setIsOpenForm } from './redux/actions';
import domtoimage from 'dom-to-image-more';
/* Getting image from screen capture or  */

// https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
export const isFirefox = () => {
  return typeof InstallTrigger !== 'undefined';
};
export const isChrome = () => {
  return !!window.chrome;
};

export const canCaptureScreen = () => {
  // TODO: edge  Available as a member of Navigator instead of MediaDevices.
  return (
    window.isSecureContext &&
    typeof navigator.mediaDevices !== 'undefined' &&
    typeof navigator.mediaDevices.getDisplayMedia !== 'undefined'
  );
};

/**
 * Take a screenshot vis browser API.
 */
const takeScreenshot = async () => {
  let canvas = null;
  // https://jsfiddle.net/8dz98u4r/
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { cursor: 'never', displaySurface: 'browser' }
  });
  if (stream != null) {
    const vid = document.createElement('video');
    vid.srcObject = stream;
    await vid.play();
    canvas = document.createElement('canvas');
    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    canvas.getContext('2d').drawImage(vid, 0, 0);
    stream.getTracks().forEach(t => t.stop());
  }
  return canvas;
  /*return new Promise((res, rej) => {
    canvas.toBlob(res);
  });*/
};

/**
 * Capture screen or ngl as canvas and assign it to form. (thunk actions are used to stored in dispatchActions.js)
 */
export const captureScreen = () => async dispatch => {
  let image = '';

  if (canCaptureScreen()) {
    console.log('capturing screen');
    try {
      const canvas = await takeScreenshot();
      if (canvas != null) {
        image = canvas;
      }
    } catch (e) {
      console.log(e.message);
    }
    /*navigator.mediaDevices.getDisplayMedia()
    .then(mediaStream => {
      // https://stackoverflow.com/questions/6150289/how-to-convert-image-into-base64-string-using-javascript
      const img = new Image();
      img.src = URL.createObjectURL(mediaStream);
    })
    .catch( err => console.log(`${err.name}: ${err.message}`));*/
  } else {
    console.log('capturing canvas');
    const view = document.getElementById('major_view');
    if (view !== null) {
      const canvas = view.getElementsByTagName('canvas')[0];
      if (canvas !== null) {
        image = canvas;
      }
    }
  }

  dispatch(setImageSource(image));
  dispatch(setIsOpenForm(true));
};

export const captureScreenOfSnapshotNglScreen = viewerAdapter => async dispatch => {
  const node = document.getElementById('major_view');
  if (!node) return null;

  // Force pixel ratio = 1 to avoid huge canvases on HiDPI
  const width = node.scrollWidth;
  const height = node.scrollHeight;

  const capture = () =>
    domtoimage.toPng(node, {
      width,
      height,
      style: {
        // neutralize DPR scaling and ensure layout size matches our width/height
        transform: 'scale(1)',
        transformOrigin: 'top left',
        width: `${width}px`,
        height: `${height}px`
      }
    });

  const dataUrl = await (viewerAdapter ? viewerAdapter.captureImage({ capture }) : capture());

  return dataUrl;
};

export const captureScreenOfSnapshotFullScreen = () => async dispatch => {
  const node = document.documentElement; // whole page, not just body
  const width = Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0);
  const height = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0);

  const dataUrl = await domtoimage.toPng(node, {
    width,
    height,
    style: {
      transform: 'scale(1)',
      transformOrigin: 'top left',
      width: `${width}px`,
      height: `${height}px`
    }
  });

  return dataUrl;
};

export const rescaleImage = async (imageDataUrl, width, height) => {
  const img = new Image();
  img.crossOrigin = 'anonymous'; // safe if same-origin or data URL
  img.src = imageDataUrl;

  // Wait for the image to fully load and decode
  if (img.decode) {
    await img.decode();
  } else {
    await new Promise(resolve => {
      img.onload = () => resolve();
    });
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw the image to fill the entire canvas
  ctx.drawImage(img, 0, 0, width, height);

  // Return resized image as data URL
  return canvas.toDataURL('image/png');
};
