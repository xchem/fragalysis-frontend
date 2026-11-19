// Optional reference regeneration; never loaded by the app or ordinary tests.
// Usage: node scripts/contact-detector/generate-reference.cjs <ngl 2.0.0-dev.37 dist/ngl.js>
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '../..');
const fixtures = path.join(root, 'js/viewer/contacts/fixtures');
const canonical = data =>
  Array.from(data.types, (type, i) =>
    [
      type,
      ...data.position1.slice(i * 3, i * 3 + 3),
      ...data.position2.slice(i * 3, i * 3 + 3),
      ...data.color.slice(i * 3, i * 3 + 3),
      data.radius[i]
    ].map(value => Number(value.toFixed(5)))
  ).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

async function generate() {
  const reference = fs.readFileSync(process.argv[2], 'utf8');
  const window = new JSDOM('').window;
  const NGL = {};
  vm.runInNewContext(reference, {
    exports: NGL,
    module: { exports: NGL },
    window,
    document: window.document,
    navigator: window.navigator,
    self: window,
    console,
    setTimeout,
    clearTimeout,
    FileReader: window.FileReader,
    File: window.File,
    Blob: window.Blob,
    Uint8Array,
    Float32Array,
    ArrayBuffer
  });
  const defaults = {
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
    maxHydrophobicDist: 4,
    maxHbondDist: 3.5,
    maxHbondSulfurDist: 4.1,
    maxHbondAccAngle: 45,
    maxHbondDonAngle: 45,
    maxHbondAccPlaneAngle: 90,
    maxHbondDonPlaneAngle: 35,
    maxPiStackingDist: 5.5,
    maxPiStackingOffset: 2,
    maxPiStackingAngle: 30,
    maxCationPiDist: 6,
    maxCationPiOffset: 2,
    maxIonicDist: 5,
    maxHalogenBondDist: 3.5,
    maxHalogenBondAngle: 30,
    maxMetalDist: 3,
    refineSaltBridges: true,
    masterModelIndex: 0,
    lineOfSightDistFactor: 1,
    filterSele: '',
    radiusSize: 0.05,
    radiusScale: 1
  };
  const cases = [
    {
      name: 'tutorial',
      file: 'node_modules/moorhen/public/baby-gru/tutorials/moorhen-tutorial-structure-number-1.pdb'
    },
    {
      name: 'tutorial-all',
      file: 'node_modules/moorhen/public/baby-gru/tutorials/moorhen-tutorial-structure-number-1.pdb',
      parameters: { waterHydrogenBond: true, backboneHydrogenBond: true, hydrophobic: true }
    },
    { name: 'types', file: 'js/viewer/contacts/fixtures/contact-types.pdb' },
    {
      name: 'types-all',
      file: 'js/viewer/contacts/fixtures/contact-types.pdb',
      parameters: { waterHydrogenBond: true, backboneHydrogenBond: true, hydrophobic: true }
    },
    {
      name: 'types-filtered',
      file: 'js/viewer/contacts/fixtures/contact-types.pdb',
      parameters: { sele: '1-6', ionicInteraction: false, maxCationPiDist: 4 }
    },
    {
      name: 'types-paired-filter',
      file: 'js/viewer/contacts/fixtures/contact-types.pdb',
      parameters: { filterSele: ['1', '2'] }
    },
    {
      name: 'complex',
      file: 'js/viewer/contacts/fixtures/complex-protein.pdb',
      sdfFile: 'js/viewer/contacts/fixtures/complex-ligand.sdf',
      parameters: { sele: '/0 or /1' }
    },
    {
      name: 'complex-paired',
      file: 'js/viewer/contacts/fixtures/complex-protein.pdb',
      sdfFile: 'js/viewer/contacts/fixtures/complex-ligand.sdf',
      parameters: { filterSele: ['/0', '/1'] }
    },
    {
      name: 'environment',
      file: 'js/viewer/contacts/fixtures/contact-types.pdb',
      environment: true,
      parameters: { sele: 'LIG' }
    }
  ];
  const output = {
    version: '2.0.0-dev.37',
    referenceSha256: crypto
      .createHash('sha256')
      .update(reference)
      .digest('hex'),
    cases: []
  };
  for (const fixture of cases) {
    const pdb = fs.readFileSync(path.join(root, fixture.file), 'utf8');
    let structure = await NGL.autoLoad(new window.Blob([pdb]), { ext: 'pdb' });
    let sdfSha256;
    if (fixture.sdfFile) {
      const sdf = fs.readFileSync(path.join(root, fixture.sdfFile), 'utf8');
      sdfSha256 = crypto
        .createHash('sha256')
        .update(sdf)
        .digest('hex');
      const ligand = await NGL.autoLoad(new window.Blob([sdf]), { ext: 'sdf' });
      const protein = structure;
      const proteinView = protein.getView(new NGL.Selection('not ligand'));
      structure = NGL.concatStructures('complex', proteinView, ligand);
      proteinView.dispose();
      protein.dispose();
      ligand.dispose();
    }
    let sele = fixture.parameters?.sele || '';
    if (fixture.environment) {
      const nearby = structure.getAtomSetWithinSelection(new NGL.Selection('LIG'), 5);
      sele = structure.getAtomSetWithinGroup(nearby).toSeleString() + ' or LIG';
    }
    const view = structure.getView(new NGL.Selection(sele));
    const data = NGL.RepresentationRegistry.get('contact').prototype.getContactData.call(
      { ...defaults, ...fixture.parameters },
      view
    );
    data.types = Uint8Array.from(data.picking.array, index => data.picking.contacts.contactStore.type[index]);
    const records = canonical(data);
    output.cases.push({
      ...fixture,
      pdbSha256: crypto
        .createHash('sha256')
        .update(pdb)
        .digest('hex'),
      sdfSha256,
      records
    });
    console.log(
      fixture.name,
      records.reduce((counts, [type]) => {
        counts[type] = (counts[type] || 0) + 1;
        return counts;
      }, {})
    );
    view.dispose();
    structure.dispose();
  }
  window.close();
  fs.writeFileSync(path.join(fixtures, 'ngl-reference.json'), JSON.stringify(output) + '\n');
}
generate().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
