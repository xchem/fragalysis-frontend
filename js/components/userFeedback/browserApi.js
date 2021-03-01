import { setImageSource, setIsOpenForm } from './redux/actions';
import { setTrackingImageSource } from '../../reducers/tracking/actions';
import html2canvas from 'html2canvas';
/* Getting image from screen capture or  */

// https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
export const isFirefox = () => {
  return typeof InstallTrigger !== 'undefined';
};
export const isChrome = () => {
  return !!window.chrome;
};

export const canCaptureScreen = () => {
  // TODO edge  Available as a member of Navigator instead of MediaDevices.
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

export const captureScreenOfSnapshot = () => async dispatch => {
  html2canvas(document.body).then(canvas => {
    dispatch(setTrackingImageSource(canvas.toDataURL()));
  });
};
