import { MOL_REPRESENTATION, MOL_REPRESENTATION_BUFFER, ELEMENT_COLORS } from './constants';
import {
  assignRepresentationArrayToComp,
  createRepresentationsArray,
  createRepresentationStructure
} from './generatingObjects';
import { Shape, Matrix4, MeshBuffer } from 'ngl';
import { refmesh } from './constants/mesh';
import { addToQualityCache } from '../../reducers/ngl/actions';
import * as THREE from 'three';

const drawStripyBond = (atom_a, atom_b, color_a, color_b, label, size = 0.1, shape, alt) => {
  const sx = atom_b[0] - atom_a[0];
  const sy = atom_b[1] - atom_a[1];
  const sz = atom_b[2] - atom_a[2];
  const length = (sx ** 2 + sy ** 2 + sz ** 2) ** 0.5;
  const unitSlopeX = sx / length;
  const unitSlopeY = sy / length;
  const unitSlopeZ = sz / length;
  const atom_a2 = [atom_a[0] + unitSlopeX * 0.1, atom_a[1] + unitSlopeY * 0.1, atom_a[2] + unitSlopeZ * 0.1];
  const atom_b2 = [atom_b[0] - unitSlopeX * 0.1, atom_b[1] - unitSlopeY * 0.1, atom_b[2] - unitSlopeZ * 0.1];
  const a1c = color_a;
  const a2c = color_b;
  const bond_label = label;
  shape.addCylinder(atom_a, atom_b, [a1c[0] / 255, a1c[1] / 255, a1c[2] / 255], size, bond_label); // bond comment goes here! ,'this is bad'
  if (alt) {
    shape.addCylinder(atom_a2, atom_b2, [208 / 255, 208 / 255, 224 / 255], size, bond_label); // bond comment goes here! ,'this is bad'
  } else {
    shape.addCylinder(atom_a2, atom_b2, [a2c[0] / 255, a2c[1] / 255, a2c[2] / 255], size, bond_label); // bond comment goes here! ,'this is bad'
  }
};

export function loadQualityFromFile(stage, file, quality, object_name, orientationMatrix, color) {
  let goodids = (quality && quality.goodids) || [];
  let badids = (quality && quality.badids) || [];
  let badcomments = (quality && quality.badcomments) || [];

  return stage.loadFile(file, { name: object_name, ext: 'sdf' }).then(function(comp) {
    let representationStructures = [];
    let rgbColor = hexToRgb(color);

    let atom_info = comp.object.atomMap.dict;
    let atom_info_array = [];
    for (var key in atom_info) {
      atom_info_array.push(key.split('|')[0]);
    }
    comp.autoView();

    // Draw Good Atoms + Bonds
    const repr2 = createRepresentationStructure(MOL_REPRESENTATION.ballPlusStick, {
      withQuality: true,
      colorScheme: 'element',
      colorValue: color,
      multipleBond: true,
      aspectRatio: 2,
      sele: '@'.concat(goodids)
      //multipleBond: 'symmetric'
    });
    representationStructures.push(repr2);

    let shape = new Shape(object_name, { dashedCylinder: true });
    let bonds = comp.object.bondStore;
    let n = bonds.atomIndex1;
    let m = bonds.atomIndex2;
    let order = bonds.bondOrder;

    const vShift = new THREE.Vector3();
    const absOffset = (1 - 0.4) * 0.3; // .2 works swell - this needs better defining
    comp.object.getBondProxy().calculateShiftDir(vShift);
    vShift.multiplyScalar(absOffset);

    n.forEach((num1, index) => {
      const num2 = m[index];
      const bondorder = order[index];
      if (badids.includes(num1) || badids.includes(num2)) {
        let acoord = [comp.object.atomStore.x[num1], comp.object.atomStore.y[num1], comp.object.atomStore.z[num1]];
        let bcoord = [comp.object.atomStore.x[num2], comp.object.atomStore.y[num2], comp.object.atomStore.z[num2]];

        let element1 = comp.object.atomMap.list[num1].element;
        let element2 = comp.object.atomMap.list[num2].element;
        if (element1 && element2) {
          let a1c = element1 === 'C' ? [rgbColor.r, rgbColor.g, rgbColor.b] : ELEMENT_COLORS[element1];
          let a2c = element2 === 'C' ? [rgbColor.r, rgbColor.g, rgbColor.b] : ELEMENT_COLORS[element2];
          let alternativeColor = ELEMENT_COLORS.ALTERNATIVE;
          let bond_label = 'bond: '.concat(atom_info_array[num1], '-', atom_info_array[num2]);

          let bond_size = 0.05 / (0.5 * bondorder);
          if (bondorder === 1) {
            drawStripyBond(acoord, bcoord, a1c, a2c, bond_label, bond_size, shape, alternativeColor);
          } else if (bondorder === 2) {
            let acoord1 = [acoord[0] - vShift.x, acoord[1] - vShift.y, acoord[2] - vShift.z];
            let bcoord1 = [bcoord[0] - vShift.x, bcoord[1] - vShift.y, bcoord[2] - vShift.z];
            let acoord2 = [acoord[0] + vShift.x, acoord[1] + vShift.y, acoord[2] + vShift.z];
            let bcoord2 = [bcoord[0] + vShift.x, bcoord[1] + vShift.y, bcoord[2] + vShift.z];
            // draw bonds
            drawStripyBond(acoord1, bcoord1, a1c, a2c, bond_label, bond_size, shape, alternativeColor);
            drawStripyBond(acoord2, bcoord2, a1c, a2c, bond_label, bond_size, shape, alternativeColor);
          } else if (bondorder === 3) {
            let acoord1 = [acoord[0] - vShift.x, acoord[1] - vShift.y, acoord[2] - vShift.z];
            let bcoord1 = [bcoord[0] - vShift.x, bcoord[1] - vShift.y, bcoord[2] - vShift.z];
            let acoord2 = [acoord[0] + vShift.x, acoord[1] + vShift.y, acoord[2] + vShift.z];
            let bcoord2 = [bcoord[0] + vShift.x, bcoord[1] + vShift.y, bcoord[2] + vShift.z];
            // draw bonds
            drawStripyBond(acoord, bcoord, a1c, a2c, bond_label, bond_size, shape, alternativeColor);
            drawStripyBond(acoord1, bcoord1, a1c, a2c, bond_label, bond_size, shape, alternativeColor);
            drawStripyBond(acoord2, bcoord2, a1c, a2c, bond_label, bond_size, shape, alternativeColor);
          }
        }
      }
    });

    stage.addComponentFromObject(shape, { isShape: true });
    for (let badIndex in badids) {
      let id = badids[badIndex];
      let comment = badcomments.length > badIndex ? badcomments[badIndex] : '';
      let origin = [comp.object.atomStore.x[id], comp.object.atomStore.y[id], comp.object.atomStore.z[id]];
      let atom_label = 'atom: '.concat(atom_info_array[id], ' | ', (comment && comment) || '');

      let m = refmesh.map(function(v, i) {
        return origin[i % 3] + v;
      });

      let element = comp.object.atomMap.list[id]?.element;
      if (element) {
        let eleC = element === 'C' ? [rgbColor.r, rgbColor.g, rgbColor.b] : ELEMENT_COLORS[element];

        let col2 = Array(m.length)
          .fill(1)
          .map(function(v, i) {
            return eleC[i % 3] / 255;
          });

        let col = new Float32Array(col2);

        shape.addSphere(origin, [eleC[0] / 255, eleC[1] / 255, eleC[2] / 255], 0.2, atom_label);

        var meshBuffer = new MeshBuffer({
          position: new Float32Array(m),
          color: col
        });

        shape.addBuffer(meshBuffer);
        var shapeComp = stage.addComponentFromObject(shape);
        shapeComp.addRepresentation(MOL_REPRESENTATION_BUFFER, { isShape: true });
      }
    }

    if (orientationMatrix && orientationMatrix.elements) {
      const matrix = new Matrix4();
      matrix.fromArray(orientationMatrix.elements);

      stage.viewerControls.orient(matrix);
    } else if (orientationMatrix === undefined) {
      comp.autoView('ligand');
    }

    const reprArray = createRepresentationsArray(representationStructures);
    return assignRepresentationArrayToComp(reprArray, comp);
  });
}

export const readQualityInformation = (name, text) => (dispatch, getState) => {
  const state = getState();
  const qualityCache = state.nglReducers.qualityCache;
  let qualityInformation = {};

  if (qualityCache.hasOwnProperty(name)) {
    qualityInformation = qualityCache[name];
  } else {
    qualityInformation = loadQualityInformation(text);
    dispatch(addToQualityCache(name, qualityInformation));
  }
  return qualityInformation;
};

const loadQualityInformation = text => {
  let badidsRegex = /[\n\r].*<BADATOMS>\s*([^\n\r]*)/;
  let badcommentsRegex = /[\n\r].*<BADCOMMENTS>\s*([^\n\r]*)/;
  let badidsRegexResult = badidsRegex.exec(text);
  let badcommentsRegexResult = badcommentsRegex.exec(text);

  let badidsValue =
    badidsRegexResult != null && badidsRegexResult && badidsRegexResult.length > 1 ? badidsRegexResult[1] : '';
  let badcommentsValue =
    badcommentsRegexResult != null && badcommentsRegexResult && badcommentsRegexResult.length > 1
      ? badcommentsRegexResult[1]
      : '';
  let badids = badidsValue === '' ? [] : badidsValue.split(';').map(x => parseInt(x));
  let badcomments = badcommentsValue === '' ? [] : badcommentsValue.split(';');

  let goodids = readGoodAtomsFromFile(text, badids);
  return { goodids, badids, badcomments };
};

function readGoodAtomsFromFile(text, badids) {
  if (badids && badids.length > 0) {
    var regexp = /[CSONF]/g;
    var match,
      matches = [];
    while ((match = regexp.exec(text)) != null) {
      matches.push(match[0]);
    }
    var idx = [...Array(matches.length).keys()];
    let diff = idx.filter(x => !badids.includes(x));
    return diff;
  } else {
    return [];
  }
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}
