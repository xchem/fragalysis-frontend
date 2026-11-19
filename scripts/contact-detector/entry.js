// Computation-only entry for the pinned, MIT-licensed contact detector.
// No viewer, component, representation or GPU buffers enter this bundle.
import PdbParser from 'reference/src/parser/pdb-parser';
import SdfParser from 'reference/src/parser/sdf-parser';
import SdfV3000Parser from './sdf-v3000-parser';
import Streamer from 'reference/src/streamer/streamer';
import Selection from 'reference/src/selection/selection';
import 'reference/src/structure/structure-view';
import { concatStructures } from 'reference/src/structure/structure-utils';
import { calculateContacts, getContactData, ContactDefaultParams } from 'reference/src/chemistry/interactions/contact';

class TextStream extends Streamer {
  _read() {
    return Promise.resolve(this.src);
  }
}

// NGL contact-representation defaults plus Fragalysis' former renderComplex
// overrides (weak hydrogen bonds, donor plane angle, master protein model).
export const contactDefaults = Object.freeze({
  ...ContactDefaultParams,
  hydrogenBond: true,
  weakHydrogenBond: true,
  waterHydrogenBond: false,
  backboneHydrogenBond: false,
  hydrophobic: false,
  halogenBond: true,
  ionicInteraction: true,
  metalCoordination: true,
  cationPi: true,
  piStacking: true,
  maxHalogenBondDist: 3.5,
  maxHbondDonPlaneAngle: 35,
  masterModelIndex: 0,
  radiusSize: 0.05,
  radiusScale: 1,
  filterSele: ''
});

const selection = value => {
  const result = new Selection(value);
  if (result.selection.error) throw new Error(`Invalid contact selection: ${result.selection.error}`);
  return result;
};

export async function detectContacts({ pdb, sdf, parameters = {}, environment = false }) {
  const structures = [];
  const views = [];
  const parse = async (Parser, text) => {
    const parser = new Parser(new TextStream(text));
    // Register before parsing so failed input also releases its allocated stores.
    structures.push(parser.structure);
    return parser.parse();
  };
  const view = (structure, sele) => {
    const result = structure.getView(selection(sele));
    views.push(result);
    return result;
  };
  try {
    const LigandParser = sdf?.includes('V3000') ? SdfV3000Parser : SdfParser;
    let structure = await parse(pdb ? PdbParser : LigandParser, pdb || sdf);
    if (sdf && pdb) {
      const ligand = await parse(LigandParser, sdf);
      if (!ligand.atomCount) throw new Error('Contact ligand contains no readable atoms');
      structure = concatStructures('contacts', view(structure, 'not ligand'), ligand);
      structures.push(structure);
    }
    if (!structure.atomCount) throw new Error('Contact structure contains no readable atoms');
    const params = { ...contactDefaults };
    for (const key of Object.keys(params)) {
      if (parameters[key] !== undefined) params[key] = parameters[key];
    }
    let sele = parameters.sele || '';
    // The adapter's native CIDs are not persisted NGL selections.
    if (sele === '/*/*/*/*') sele = '';
    if (sele === '/*/*/(LIG)/*') sele = 'LIG';
    if (environment && sele === 'LIG') {
      const nearby = structure.getAtomSetWithinSelection(selection('LIG'), 5);
      sele = structure.getAtomSetWithinGroup(nearby).toSeleString() + ' or LIG';
    }
    const selected = view(structure, sele);
    const contacts = calculateContacts(selected, params);
    if (params.filterSele) {
      (Array.isArray(params.filterSele) ? params.filterSele : [params.filterSele]).forEach(selection);
    }
    const data = getContactData(contacts, selected, { ...params, radius: params.radiusSize * params.radiusScale });
    const types = Uint8Array.from(data.picking.array, index => contacts.contactStore.type[index]);
    return { position1: data.position1, position2: data.position2, color: data.color, radius: data.radius, types };
  } finally {
    views.reverse().forEach(item => item.dispose());
    structures.reverse().forEach(item => item.dispose());
  }
}
