// Keep the detector's contact-index mapping; picking belongs to Moorhen.
export class ContactPicker {
  constructor(array, contacts) {
    this.array = array;
    this.contacts = contacts;
  }
}
export class AtomPicker {
  constructor() {
    throw new Error('Contact detection does not provide atom picking');
  }
}
export class BondPicker extends AtomPicker {}
export class UnitcellPicker extends AtomPicker {}
