// The explicit extension selects Webpack's source-text rule for this module.
// eslint-disable-next-line import/extensions
import detectorSource from './vendor/detector.mjs';

export const contactWorkerHandler = `
self.onmessage = async ({ data: { id, input } }) => {
  try {
    const result = await detectContacts(input);
    self.postMessage({ id, result }, Object.values(result).map(array => array.buffer));
  } catch (error) {
    self.postMessage({ id, error: error.message || String(error) });
  }
};`;

export default function createContactWorker() {
  // A self-contained module Blob works with the separate Django/bundle origins.
  const url = URL.createObjectURL(new Blob([detectorSource, '\n', contactWorkerHandler], { type: 'text/javascript' }));
  try {
    const worker = new Worker(url, { type: 'module', name: 'fragalysis-contacts' });
    return { worker, release: () => URL.revokeObjectURL(url) };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}
