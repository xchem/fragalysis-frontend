import { MOL_REPRESENTATION, MOL_REPRESENTATION_BUFFER, OBJECT_TYPE } from './constants';
import {
  assignRepresentationArrayToComp,
  createRepresentationsArray,
  createRepresentationStructure,
  defaultFocus
} from './generatingObjects';
import { concatStructures, Selection, Shape, Matrix4, MeshBuffer } from 'ngl';
import { addToPdbCache } from '../../reducers/ngl/actions';

const showSphere = ({ stage, input_dict, object_name, representations }) => {
  let colour = input_dict.colour;
  let radius = input_dict.radius;
  let coords = input_dict.coords;
  let shape = new Shape(object_name);
  shape.addSphere(coords, colour, radius);
  let comp = stage.addComponentFromObject(shape);
  let reprArray =
    representations || createRepresentationsArray([createRepresentationStructure(MOL_REPRESENTATION_BUFFER, {})]);

  return Promise.resolve(assignRepresentationArrayToComp(reprArray, comp));
};

const showLigand = ({ stage, input_dict, object_name, representations, orientationMatrix, markAsRightSideLigand }) => {
  let stringBlob = new Blob([input_dict.sdf_info], { type: 'text/plain' });

  let badids = '';
  let badcomments = '';

  return loadBadAtomsFromFile(stage, stringBlob, input_dict.sdf_info, badids, badcomments, object_name);

  /*   return stage.loadFile(stringBlob, { name: object_name, ext: 'sdf' }).then(comp => {
    const reprArray =
      representations ||
      createRepresentationsArray([
        createRepresentationStructure(
          markAsRightSideLigand ? MOL_REPRESENTATION.licorice : MOL_REPRESENTATION.ballPlusStick,
          {
            colorScheme: 'element',
            colorValue: input_dict.colour,
            multipleBond: true,
            radiusSize: markAsRightSideLigand ? 0.11 : undefined
          }
        )
      ]);

    if (orientationMatrix && orientationMatrix.elements) {
      const matrix = new Matrix4();
      matrix.fromArray(orientationMatrix.elements);

      stage.viewerControls.orient(matrix);
    } else if (orientationMatrix === undefined) {
      comp.autoView('ligand');
    }
    return assignRepresentationArrayToComp(reprArray, comp);
  }); */
};

const renderHitProtein = (ol, representations, orientationMatrix) => {
  let cs = concatStructures(
    ol[4],
    ol[0].structure.getView(new Selection('not ligand')),
    ol[1].structure.getView(new Selection(''))
  );
  let stage = ol[2];
  //let focus_let_temp = ol[3];
  let colour = ol[5];
  // Set the object name
  let comp = stage.addComponentFromObject(cs);

  const repr3 = createRepresentationStructure(MOL_REPRESENTATION.line, {
    colorScheme: 'element',
    colorValue: colour,
    sele: '/0',
    linewidth: 4
  });

  const reprArray = representations || createRepresentationsArray([repr3]);
  // if (orientationMatrix) {
  //   stage.viewerControls.orient(orientationMatrix);
  // } else if (orientationMatrix === undefined) {
  //   comp.autoView('ligand');
  // TODO setFocus should be in condition
  //  comp.stage.setFocus(focus_let_temp);
  // }

  return assignRepresentationArrayToComp(reprArray, comp);
};

const loadPdbFile = url => {
  return fetch(url)
    .then(response => response.text())
    .then(str => {
      return new Blob([str], { type: 'text/plain' });
    });
};

const getNameOfPdb = url => {
  const parts = url.split('/');
  const last = parts[parts.length - 1];
  return last;
};

const getPdb = url => (dispatch, getState) => {
  const state = getState();

  const pdbCache = state.nglReducers.pdbCache;
  const pdbName = getNameOfPdb(url);
  if (pdbCache.hasOwnProperty(pdbName)) {
    return new Promise((resolve, reject) => {
      resolve(pdbCache[pdbName]);
    });
  } else {
    return loadPdbFile(url).then(b => {
      dispatch(addToPdbCache(pdbName, b));
      return b;
    });
  }
};

const showHitProtein = ({ stage, input_dict, object_name, representations, orientationMatrix, dispatch }) => {
  let stringBlob = new Blob([input_dict.sdf_info], { type: 'text/plain' });

  return dispatch(getPdb(input_dict.prot_url))
    .then(pdbBlob => {
      return Promise.all([
        stage.loadFile(pdbBlob, { ext: 'pdb', defaultAssembly: 'BU1' }),
        stage.loadFile(stringBlob, { ext: 'sdf' }),
        stage,
        defaultFocus,
        object_name,
        input_dict.colour
      ]);
    })
    .then(ol => {
      renderHitProtein(ol, representations, orientationMatrix);
    });
};

const renderComplex = (ol, representations, orientationMatrix) => {
  let cs = concatStructures(
    ol[4],
    ol[0].structure.getView(new Selection('not ligand')),
    ol[1].structure.getView(new Selection(''))
  );
  let stage = ol[2];
  let focus_let_temp = ol[3];
  // Set the object name
  let comp = stage.addComponentFromObject(cs);
  // duplication of protein
  // const repr1 = createRepresentationStructure(MOL_REPRESENTATION.cartoon, {});

  const repr2 = createRepresentationStructure(MOL_REPRESENTATION.contact, {
    masterModelIndex: 0,
    weakHydrogenBond: true,
    maxHbondDonPlaneAngle: 35,
    sele: '/0 or /1'
  });

  const reprArray = representations || createRepresentationsArray([repr2]);
  // if (orientationMatrix) {
  //   stage.viewerControls.orient(orientationMatrix);
  // } else if (orientationMatrix === undefined) {
  //   comp.autoView('ligand');
  //   //TODO setFocus should be in condition
  //   comp.stage.setFocus(focus_let_temp);
  // }

  return assignRepresentationArrayToComp(reprArray, comp);
};

const showComplex = ({ stage, input_dict, object_name, representations, orientationMatrix }) => {
  let stringBlob = new Blob([input_dict.sdf_info], { type: 'text/plain' });
  return Promise.all([
    stage.loadFile(input_dict.prot_url, { ext: 'pdb', defaultAssembly: 'BU1' }),
    stage.loadFile(stringBlob, { ext: 'sdf' }),
    stage,
    defaultFocus,
    object_name,
    input_dict.colour
  ]).then(ol => renderComplex(ol, representations, orientationMatrix));
};

const showSurface = ({ stage, input_dict, object_name, representations, orientationMatrix }) =>
  stage.loadFile(input_dict.prot_url, { name: object_name, ext: 'pdb', defaultAssembly: 'BU1' }).then(comp => {
    const reprArray =
      representations ||
      createRepresentationsArray([
        createRepresentationStructure(MOL_REPRESENTATION.surface, {
          sele: 'polymer',
          colorScheme: 'electrostatic',
          // colorDomain: [-0.3, 0.3],
          surfaceType: 'av',
          radiusType: 'vdw',
          opacity: 0.74,
          colorValue: input_dict.colour
        })
      ]);

    // if (orientationMatrix) {
    //   stage.viewerControls.orient(orientationMatrix);
    // } else if (orientationMatrix === undefined) {
    //   comp.autoView();
    // }
    return Promise.resolve(assignRepresentationArrayToComp(reprArray, comp));
  });

// ligand
const showEvent = ({ stage, input_dict, object_name, representations, orientationMatrix }) =>
  Promise.all(
    [
      stage.loadFile(input_dict.pdb_info, { name: object_name, ext: 'pdb', defaultAssembly: 'BU1' }).then(comp => {
        const repr1 = createRepresentationStructure(MOL_REPRESENTATION.cartoon, {});
        let selection = new Selection('LIG');
        let radius = 5;
        let atomSet = comp.structure.getAtomSetWithinSelection(selection, radius);
        let atomSet2 = comp.structure.getAtomSetWithinGroup(atomSet);
        let sele2 = atomSet2.toSeleString();
        let sele1 = atomSet.toSeleString();

        const repr2 = createRepresentationStructure(MOL_REPRESENTATION.contact, {
          masterModelIndex: 0,
          weakHydrogenBond: true,
          maxHbondDonPlaneAngle: 35,
          linewidth: 1,
          sele: sele2 + ' or LIG'
        });

        const repr3 = createRepresentationStructure(MOL_REPRESENTATION.line, {
          sele: sele1
        });

        const repr4 = createRepresentationStructure(MOL_REPRESENTATION.ballPlusStick, {
          sele: 'LIG'
        });

        // if (orientationMatrix) {
        //   stage.viewerControls.orient(orientationMatrix);
        // } else if (orientationMatrix === undefined) {
        //   comp.autoView('LIG');
        // }

        const reprArray = representations || createRepresentationsArray([repr1, repr2, repr3, repr4]);
        return assignRepresentationArrayToComp(reprArray, comp);
      }),

      stage.loadFile(input_dict.map_info, { name: object_name, ext: 'ccp4' }).then(comp => {
        const repr1 = createRepresentationStructure(MOL_REPRESENTATION.surface, {
          color: 'mediumseagreen',
          isolevel: 3,
          boxSize: 10,
          useWorker: false,
          contour: true,
          opaqueBack: false,
          isolevelScroll: false
        });

        const repr2 = createRepresentationStructure(MOL_REPRESENTATION.surface, {
          color: 'tomato',
          isolevel: 3,
          negateIsolevel: true,
          boxSize: 10,
          useWorker: false,
          contour: true,
          opaqueBack: false,
          isolevelScroll: false
        });
        const reprArray = representations || createRepresentationsArray([repr1, repr2]);
        return assignRepresentationArrayToComp(reprArray, comp);
      })
    ].then(values => [...values])
  );

// vector
const showCylinder = ({ stage, input_dict, object_name, representations, orientationMatrix }) => {
  let colour = input_dict.colour === undefined ? [1, 0, 0] : input_dict.colour;
  let radius = input_dict.radius === undefined ? 0.4 : input_dict.radius;
  // Handle undefined start and finish
  if (input_dict.start === undefined || input_dict.end === undefined) {
    const msgs = 'START OR END UNDEFINED FOR CYLINDER' + input_dict.toString();
    return Promise.reject(msgs);
  }
  let shape = new Shape(object_name, { disableImpostor: true });
  shape.addCylinder(input_dict.start, input_dict.end, colour, radius);
  let comp = stage.addComponentFromObject(shape);
  // if (orientationMatrix) {
  //   stage.viewerControls.orient(orientationMatrix);
  // } else if (orientationMatrix === undefined) {
  //   comp.autoView();
  // }
  const reprArray =
    representations || createRepresentationsArray([createRepresentationStructure(MOL_REPRESENTATION_BUFFER, {})]);

  return Promise.resolve(assignRepresentationArrayToComp(reprArray, comp));
};

// vector
const showArrow = ({ stage, input_dict, object_name, representations, orientationMatrix }) => {
  let colour = input_dict.colour === undefined ? [1, 0, 0] : input_dict.colour;
  let radius = input_dict.radius === undefined ? 0.3 : input_dict.radius;
  // Handle undefined start and finish
  if (input_dict.start === undefined || input_dict.end === undefined) {
    const msgs = 'START OR END UNDEFINED FOR ARROW ' + input_dict.toString();
    return Promise.reject(msgs);
  }
  let shape = new Shape(object_name, { disableImpostor: true });
  shape.addArrow(input_dict.start, input_dict.end, colour, radius);
  let comp = stage.addComponentFromObject(shape);
  // if (orientationMatrix) {
  //   stage.viewerControls.orient(orientationMatrix);
  // } else if (orientationMatrix === undefined) {
  //   comp.autoView();
  // }

  const reprArray =
    representations || createRepresentationsArray([createRepresentationStructure(MOL_REPRESENTATION_BUFFER, {})]);

  return Promise.resolve(assignRepresentationArrayToComp(reprArray, comp));
};

const showProtein = ({ stage, input_dict, object_name, representations, orientationMatrix }) =>
  stage.loadFile(input_dict.prot_url, { name: object_name, ext: 'pdb', defaultAssembly: 'BU1' }).then(comp => {
    const reprArray =
      representations || createRepresentationsArray([createRepresentationStructure(input_dict.nglProtStyle, {})]);

    if (orientationMatrix) {
      stage.viewerControls.orient(orientationMatrix);
    } else if (orientationMatrix === undefined) {
      comp.autoView();
    }
    return Promise.resolve(assignRepresentationArrayToComp(reprArray, comp));
  });

const showHotspot = ({ stage, input_dict, object_name, representations }) => {
  if (input_dict.map_type === 'AP') {
    return stage.loadFile(input_dict.hotUrl, { name: object_name, ext: 'dx' }).then(comp => {
      const reprArray =
        representations ||
        createRepresentationsArray([
          createRepresentationStructure(MOL_REPRESENTATION.surface, {
            color: '#FFFF00',
            isolevelType: 'value',
            isolevel: input_dict.isoLevel,
            opacity: input_dict.opacity,
            opaqueBack: false,
            name: 'surf',
            disablePicking: input_dict.disablePicking
          })
        ]);

      return Promise.resolve(assignRepresentationArrayToComp(reprArray, comp));
    });
  } else if (input_dict.map_type === 'DO') {
    return stage.loadFile(input_dict.hotUrl, { name: object_name, ext: 'dx' }).then(comp => {
      const reprArray =
        representations ||
        createRepresentationsArray([
          createRepresentationStructure(MOL_REPRESENTATION.surface, {
            isolevelType: 'value',
            isolevel: input_dict.isoLevel,
            opacity: input_dict.opacity,
            opaqueBack: false,
            color: '#0000FF',
            name: 'surf',
            disablePicking: input_dict.disablePicking
          })
        ]);

      return Promise.resolve(assignRepresentationArrayToComp(reprArray, comp));
    });
  } else if (input_dict.map_type === 'AC') {
    return stage.loadFile(input_dict.hotUrl, { name: object_name, ext: 'dx' }).then(comp => {
      const reprArray =
        representations ||
        createRepresentationsArray([
          createRepresentationStructure(MOL_REPRESENTATION.surface, {
            color: '#FF0000',
            isolevelType: 'value',
            isolevel: input_dict.isoLevel,
            opacity: input_dict.opacity,
            opaqueBack: false,
            name: 'surf',
            disablePicking: input_dict.disablePicking
          })
        ]);

      return Promise.resolve(assignRepresentationArrayToComp(reprArray, comp));
    });
  }
};

// TODO:
const showDensity = ({ stage, input_dict, object_name, representations }) => {
  return {};
};

// Refactor this out into a utils directory
export const nglObjectDictionary = {
  [OBJECT_TYPE.SPHERE]: showSphere,
  [OBJECT_TYPE.LIGAND]: showLigand,
  [OBJECT_TYPE.HIT_PROTEIN]: showHitProtein,
  [OBJECT_TYPE.COMPLEX]: showComplex,
  [OBJECT_TYPE.SURFACE]: showSurface,
  [OBJECT_TYPE.CYLINDER]: showCylinder,
  [OBJECT_TYPE.ARROW]: showArrow,
  [OBJECT_TYPE.PROTEIN]: showProtein,
  [OBJECT_TYPE.EVENTMAP]: showEvent,
  [OBJECT_TYPE.HOTSPOT]: showHotspot,
  [OBJECT_TYPE.DENSITY]: showDensity
};

let ElementColors = {
  H: [255, 255, 255],
  HE: [217, 255, 255],
  LI: [204, 128, 255],
  BE: [194, 255, 0],
  B: [255, 181, 181],
  C: [144, 144, 144],
  N: [48, 80, 248],
  O: [255, 13, 13],
  F: [144, 224, 80],
  NE: [179, 227, 245],
  NA: [171, 92, 242],
  MG: [138, 255, 0],
  AL: [191, 166, 166],
  SI: [240, 200, 160],
  P: [255, 128, 0],
  S: [255, 255, 48],
  CL: [31, 240, 31]
};

function readGoodAtomsFromFile(text, badids) {
  var regexp = /[CSONF]/g;
  var match,
    matches = [];
  while ((match = regexp.exec(text)) != null) {
    matches.push(match[0]);
  }
  var idx = [...Array(matches.length).keys()];
  let diff = idx.filter(x => !badids.includes(x));
  return diff;
}

function loadBadAtomsFromFile(stage, file, text, badidsValue, badcommentsValue, object_name) {
  let badids = badidsValue.split(';').map(x => parseInt(x));
  let badcomments = badcommentsValue.split(';');
  let diff = readGoodAtomsFromFile(text, badids);

  return stage.loadFile(file, { name: object_name, ext: 'sdf' }).then(function(o) {
    let representationStructures = [];

    // Create Frame, balls don't render, nor do bonds
    const repr1 = createRepresentationStructure('ball+stick', { aspectRatio: 0, radius: 0, multipleBond: 'symmetric' });
    representationStructures.push(repr1);
    //o.addRepresentation(repr1);

    let atom_info = o.object.atomMap.dict;
    let atom_info_array = [];
    for (var key in atom_info) {
      atom_info_array.push(key.split('|')[0]);
    }
    console.log(atom_info);
    console.log(atom_info_array);
    o.autoView();

    // Draw Good Atoms + Bonds
    const repr2 = createRepresentationStructure('ball+stick', {
      aspectRatio: 2,
      sele: '@'.concat(diff),
      multipleBond: 'symmetric'
    });
    representationStructures.push(repr2);
    // o.addRepresentation(repr2);

    let shape = new Shape('shape', { dashedCylinder: true });
    let bonds = o.object.bondStore;
    let n = bonds.atomIndex1;
    let m = bonds.atomIndex2;

    n.forEach((num1, index) => {
      const num2 = m[index];
      if (badids.includes(num1) || badids.includes(num2)) {
        let acoord = [o.object.atomStore.x[num1], o.object.atomStore.y[num1], o.object.atomStore.z[num1]];
        let bcoord = [o.object.atomStore.x[num2], o.object.atomStore.y[num2], o.object.atomStore.z[num2]];
        var sx = bcoord[0] - acoord[0];
        var sy = bcoord[1] - acoord[1];
        var sz = bcoord[2] - acoord[2];

        let length = (sx ** 2 + sy ** 2 + sz ** 2) ** 0.5;
        var unitSlopeX = sx / length;
        var unitSlopeY = sy / length;
        var unitSlopeZ = sz / length;

        let a2coord = [acoord[0] + unitSlopeX * 0.1, acoord[1] + unitSlopeY * 0.1, acoord[2] + unitSlopeZ * 0.1];
        let b2coord = [bcoord[0] - unitSlopeX * 0.1, bcoord[1] - unitSlopeY * 0.1, bcoord[2] - unitSlopeZ * 0.1];
        // Create handle for count is exceeded!
        // order is startxyz, endxyz, colour, radius, name
        let a1c = ElementColors[o.object.atomMap.list[num1].element];
        let a2c = ElementColors[o.object.atomMap.list[num2].element];

        let bond_label = 'bond: '.concat(atom_info_array[num1], '-', atom_info_array[num2]);

        shape.addCylinder(acoord, bcoord, [a1c[0] / 255, a1c[1] / 255, a1c[2] / 255], 0.1, bond_label);

        if (o.object.atomMap.list[num1].element === o.object.atomMap.list[num2].element) {
          shape.addCylinder(a2coord, b2coord, [208 / 255, 208 / 255, 224 / 255], 0.1, bond_label);
        } else {
          shape.addCylinder(a2coord, b2coord, [a2c[0] / 255, a2c[1] / 255, a2c[2] / 255], 0.1, bond_label);
        }
      }
    });
    stage.addComponentFromObject(shape);
    for (let badIndex in badids) {
      let id = badids[badIndex];
      let origin = [o.object.atomStore.x[id], o.object.atomStore.y[id], o.object.atomStore.z[id]];
      let atom_label = 'atom: '.concat(atom_info_array[id], ' | ', badcomments[badIndex]);

      let m = refmesh.map(function(v, i) {
        return origin[i % 3] + v;
      });

      let element = o.object.atomMap.list[id]?.element && 'H';
      let eleC = ElementColors[element];
      let col2 = Array(m.length)
        .fill(1)
        .map(function(v, i) {
          return eleC[i % 3] / 255;
        });
      let col = new Float32Array(col2);

      shape.addSphere(origin, [0, 0, 0, 0], 0.2, atom_label);
      // Probably need to create a new shape constructor, with minimum opacity and then render it as needed...
      var meshBuffer = new MeshBuffer({
        position: new Float32Array(m),
        color: col
      });
      shape.addBuffer(meshBuffer);
      var shapeComp = stage.addComponentFromObject(shape);
      shapeComp.addRepresentation('buffer');
    }

    const reprArray = createRepresentationsArray(representationStructures);

    return assignRepresentationArrayToComp(reprArray, o);
  });
}

let refmesh = [];
