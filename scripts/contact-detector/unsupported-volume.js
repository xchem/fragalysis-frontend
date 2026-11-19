// Surface/volume methods on the upstream structure model are unused here.
export default class UnsupportedVolume {
  constructor() {
    throw new Error('Contact detection does not provide volume rendering');
  }
}
