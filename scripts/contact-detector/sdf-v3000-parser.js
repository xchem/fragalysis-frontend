import StructureParser from 'reference/src/parser/structure-parser';
import { assignResidueTypeBonds } from 'reference/src/structure/structure-utils';

// The pinned NGL parser only supports V2000. Populate the same stores directly
// for V3000 ligands, retaining coordinates, explicit bond orders and charges.
// CTfile specification, chapter 10:
// https://www.chem.ucl.ac.uk/cposs/computational/vconf_ctfile.pdf
export default class SdfV3000Parser extends StructureParser {
  _parse() {
    const structure = this.structure;
    const atoms = structure.atomStore;
    atoms.addField('formalCharge', 1, 'int8');
    const first = structure.getAtomProxy();
    const second = structure.getAtomProxy();
    const records = this.streamer
      .asText()
      .split(/^\$\$\$\$\s*$/m)
      .filter(record => record.trim());
    records.forEach((record, model) => {
      const indices = new Map();
      let section = '';
      let expectedAtoms;
      let expectedBonds;
      let bondCount = 0;
      const lines = record.replace(/-\r?\nM {2}V30 /g, '').split(/\r?\n/);
      for (const line of lines) {
        if (!line.startsWith('M  V30 ')) continue;
        const tokens = line
          .slice(7)
          .trim()
          .split(/\s+/);
        if (tokens[0] === 'COUNTS') {
          expectedAtoms = Number(tokens[1]);
          expectedBonds = Number(tokens[2]);
        } else if (tokens[0] === 'BEGIN') {
          section = tokens[1];
        } else if (tokens[0] === 'END') {
          section = '';
        } else if (section === 'ATOM') {
          const [id, element, x, y, z] = tokens;
          const coordinates = [x, y, z].map(Number);
          const charge = Number(tokens.find(token => token.startsWith('CHG='))?.slice(4) || 0);
          if (
            !/^[A-Z][a-z]?$/.test(element) ||
            !coordinates.every(Number.isFinite) ||
            !Number.isInteger(charge) ||
            Math.abs(charge) > 15 ||
            indices.has(id)
          ) {
            throw new Error('Invalid V3000 contact atom');
          }
          const index = atoms.count;
          atoms.growIfFull();
          atoms.atomTypeId[index] = structure.atomMap.add(element + (index + 1), element);
          [atoms.x[index], atoms.y[index], atoms.z[index]] = coordinates;
          atoms.serial[index] = index;
          atoms.formalCharge[index] = charge;
          indices.set(id, index);
          this.structureBuilder.addAtom(model, '', '', 'HET', 1, 1);
        } else if (section === 'BOND') {
          const order = Number(tokens[1]);
          if (!indices.has(tokens[2]) || !indices.has(tokens[3]) || ![1, 2, 3, 4].includes(order)) {
            throw new Error('Invalid or unsupported V3000 contact bond');
          }
          first.index = indices.get(tokens[2]);
          second.index = indices.get(tokens[3]);
          structure.bondStore.addBond(first, second, order);
          bondCount++;
        }
      }
      if (indices.size !== expectedAtoms || bondCount !== expectedBonds) {
        throw new Error('Incomplete V3000 contact structure');
      }
    });
    this.structureBuilder.finalize();
    structure.finalizeAtoms();
    structure.finalizeBonds();
    assignResidueTypeBonds(structure);
  }
}
