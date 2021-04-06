import { MOL_REPRESENTATION, MOL_REPRESENTATION_BUFFER, ELEMENT_COLORS } from './constants';
import {
  assignRepresentationArrayToComp,
  createRepresentationsArray,
  createRepresentationStructure
} from './generatingObjects';
import { Shape, Matrix4, MeshBuffer } from 'ngl';
import { refmesh } from './constants/mesh';
import { addToQualityCache } from '../../reducers/ngl/actions';

export function loadQualityFromFile(stage, file, quality, object_name, orientationMatrix, color) {
  let goodids = (quality && quality.goodids) || [];
  let badids = (quality && quality.badids) || [];
  let badcomments = (quality && quality.badcomments) || [];

  return stage.loadFile(file, { name: object_name, ext: 'sdf' }).then(function(comp) {
    let representationStructures = [];
    let rgbColor = hexToRgb(color);
    // Create Frame, balls don't render, nor do bonds
    const repr1 = createRepresentationStructure(MOL_REPRESENTATION.ballPlusStick, {
      colorScheme: 'element',
      colorValue: color,
      multipleBond: true,
      aspectRatio: 0,
      radius: 0
      //multipleBond: 'symmetric'
    });
    //representationStructures.push(repr1);
    //o.addRepresentation(repr1);

    let atom_info = comp.object.atomMap.dict;
    let atom_info_array = [];
    for (var key in atom_info) {
      atom_info_array.push(key.split('|')[0]);
    }
    console.log(atom_info);
    console.log(atom_info_array);
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
    // o.addRepresentation(repr2);

    let shape = new Shape(object_name, { dashedCylinder: true });
    let bonds = comp.object.bondStore;
    let n = bonds.atomIndex1;
    let m = bonds.atomIndex2;

    n.forEach((num1, index) => {
      const num2 = m[index];
      if (badids.includes(num1) || badids.includes(num2)) {
        let acoord = [comp.object.atomStore.x[num1], comp.object.atomStore.y[num1], comp.object.atomStore.z[num1]];
        let bcoord = [comp.object.atomStore.x[num2], comp.object.atomStore.y[num2], comp.object.atomStore.z[num2]];
        var sx = bcoord[0] - acoord[0];
        var sy = bcoord[1] - acoord[1];
        var sz = bcoord[2] - acoord[2];

        let length = (sx ** 2 + sy ** 2 + sz ** 2) ** 0.5;
        var unitSlopeX = sx / length;
        var unitSlopeY = sy / length;
        var unitSlopeZ = sz / length;

        let a2coord = [acoord[0] + unitSlopeX * 0.1, acoord[1] + unitSlopeY * 0.1, acoord[2] + unitSlopeZ * 0.1];
        let b2coord = [bcoord[0] - unitSlopeX * 0.1, bcoord[1] - unitSlopeY * 0.1, bcoord[2] - unitSlopeZ * 0.1];

        let element1 = comp.object.atomMap.list[num1].element;
        let element2 = comp.object.atomMap.list[num2].element;
        let a1c = element1 === 'C' ? [rgbColor.r, rgbColor.g, rgbColor.b] : ELEMENT_COLORS[element1];
        let a2c = element2 === 'C' ? [rgbColor.r, rgbColor.g, rgbColor.b] : ELEMENT_COLORS[element2];
        let alternativeColor = ELEMENT_COLORS.ALTERNATIVE;

        let bond_label = 'bond: '.concat(atom_info_array[num1], '-', atom_info_array[num2]);

        // order is startxyz, endxyz, colour, radius, name
        shape.addCylinder(acoord, bcoord, [a1c[0] / 255, a1c[1] / 255, a1c[2] / 255], 0.1, bond_label);

        if (comp.object.atomMap.list[num1].element === comp.object.atomMap.list[num2].element) {
          shape.addCylinder(
            a2coord,
            b2coord,
            [alternativeColor[0] / 255, alternativeColor[1] / 255, alternativeColor[2] / 255],
            0.1,
            bond_label
          );
        } else {
          shape.addCylinder(a2coord, b2coord, [a2c[0] / 255, a2c[1] / 255, a2c[2] / 255], 0.1, bond_label);
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
      let eleC = element === 'C' ? [rgbColor.r, rgbColor.g, rgbColor.b] : ELEMENT_COLORS[element];

      let col2 = Array(m.length)
        .fill(1)
        .map(function(v, i) {
          return eleC[i % 3] / 255;
        });
      let col = new Float32Array(col2);

      shape.addSphere(origin, [eleC[0] / 255, eleC[1] / 255, eleC[2] / 255], 0.2, atom_label);
      // Probably need to create a new shape constructor, with minimum opacity and then render it as needed...
      var meshBuffer = new MeshBuffer({
        position: new Float32Array(m),
        color: col
      });
      shape.addBuffer(meshBuffer);
      var shapeComp = stage.addComponentFromObject(shape);
      shapeComp.addRepresentation(MOL_REPRESENTATION_BUFFER, { isShape: true });
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
