import { MOL_REPRESENTATION, MOL_REPRESENTATION_BUFFER, ELEMENT_COLORS } from './constants';
import {
  assignRepresentationArrayToComp,
  createRepresentationsArray,
  createRepresentationStructure
} from '../../viewer/ngl/representationHelpers';
import { Shape, MeshBuffer, Vector3 } from 'ngl';
import { refmesh } from './constants/mesh';
import { hexToRgb } from '../../utils/colors';
import { QUALITY_TYPES } from './constants/index';

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

export const loadQualityFromFile = async (
  stage,
  file,
  quality,
  object_name,
  orientationMatrix,
  color,
  qualityType,
  skipOrientation
) => {
  console.count(`loadQualityFromFile started`);
  // let goodids =
  //   qualityType === QUALITY_TYPES.LIGAND
  //     ? (quality && quality.goodids) || []
  //     : (quality && quality.goodproteinids) || [];
  // we are not using the goodids when rendering bad protein atoms - so far this is just my assumption
  let goodids = qualityType === QUALITY_TYPES.LIGAND ? (quality && quality.goodids) || [] : [];
  let badids =
    qualityType === QUALITY_TYPES.LIGAND ? (quality && quality.badids) || [] : (quality && quality.badproteinids) || [];
  let badcomments =
    qualityType === QUALITY_TYPES.LIGAND
      ? (quality && quality.badcomments) || []
      : (quality && quality.badproteincomments) || [];
  // let badatomsnames = (quality && quality.badatomsnames) || [];
  // let atomCount = goodids.length + badids.length;
  let extension = qualityType === QUALITY_TYPES.LIGAND ? 'sdf' : 'pdb';

  return stage.loadFile(file, { name: object_name, ext: extension }).then(function(comp) {
    console.count(`loadQualityFromFile file loaded`);
    let representationStructures = [];
    let rgbColor = hexToRgb(color);

    let atom_info = comp.object.atomMap.dict;
    let atom_info_array = [];
    for (var key in atom_info) {
      atom_info_array.push(key.split('|')[0]);
    }

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

    const vShift = new Vector3();
    const absOffset = (1 - 0.4) * 0.3; // .2 works swell - this needs better defining
    comp.object.getBondProxy().calculateShiftDir(vShift);
    vShift.multiplyScalar(absOffset);

    n.forEach((num1, index) => {
      const num2 = m[index];
      const bondorder = order[index];
      if (badids.includes(num1) || badids.includes(num2)) {
        let acoord = [comp.object.atomStore.x[num1], comp.object.atomStore.y[num1], comp.object.atomStore.z[num1]];
        let bcoord = [comp.object.atomStore.x[num2], comp.object.atomStore.y[num2], comp.object.atomStore.z[num2]];

        let element1 = null;
        let element2 = null;
        if (qualityType === QUALITY_TYPES.LIGAND) {
          element1 = comp.object.atomMap.list[num1].element;
          element2 = comp.object.atomMap.list[num2].element;
        } else {
          element1 = comp.object.atomMap.list[comp.object.atomStore.atomTypeId[num1]].element;
          element2 = comp.object.atomMap.list[comp.object.atomStore.atomTypeId[num2]].element;
        }
        if (element1 && element2) {
          let a1c = element1 === 'C' ? [rgbColor.r, rgbColor.g, rgbColor.b] : ELEMENT_COLORS[element1];
          let a2c = element2 === 'C' ? [rgbColor.r, rgbColor.g, rgbColor.b] : ELEMENT_COLORS[element2];
          let alternativeColor = ELEMENT_COLORS.ALTERNATIVE;

          let bond_label = null;
          if (qualityType === QUALITY_TYPES.LIGAND) {
            bond_label = 'bond: '.concat(atom_info_array[num1], '-', atom_info_array[num2]);
          } else {
            bond_label = 'bond: '.concat(
              comp.object.atomMap.list[comp.object.atomStore.atomTypeId[num1]].atomname,
              '-',
              comp.object.atomMap.list[comp.object.atomStore.atomTypeId[num2]].atomname
            );
          }

          let bond_size = 0.05 / (0.5 * bondorder);
          if (qualityType === QUALITY_TYPES.HIT_PROTEIN) {
            bond_size = 0.015;
          }
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

    for (let badIndex in badids) {
      let id = badids[badIndex];
      let comment = badcomments.length > badIndex ? badcomments[badIndex] : '';
      let origin = [comp.object.atomStore.x[id], comp.object.atomStore.y[id], comp.object.atomStore.z[id]];
      let atom_label = 'atom: '.concat(atom_info_array[id], ' | ', (comment && comment) || '');

      let meshScaleFactor = 1;
      if (qualityType === QUALITY_TYPES.HIT_PROTEIN) {
        meshScaleFactor = 0.5;
      }

      let m = refmesh.map(function(v, i) {
        return origin[i % 3] + v * meshScaleFactor;
      });

      let element = null;
      if (qualityType === QUALITY_TYPES.LIGAND) {
        element = comp.object.atomMap.list[id]?.element;
      } else {
        element = comp.object.atomMap.list[comp.object.atomStore.atomTypeId[id]]?.element;
      }
      if (element) {
        let eleC = element === 'C' ? [rgbColor.r, rgbColor.g, rgbColor.b] : ELEMENT_COLORS[element];

        let col2 = Array(m.length)
          .fill(1)
          .map(function(v, i) {
            return eleC[i % 3] / 255;
          });

        let col = new Float32Array(col2);

        let radius = 0.2;
        if (qualityType === QUALITY_TYPES.HIT_PROTEIN) {
          radius = 0.1;
        }

        shape.addSphere(origin, [eleC[0] / 255, eleC[1] / 255, eleC[2] / 255], radius, atom_label);

        var meshBuffer = new MeshBuffer({
          position: new Float32Array(m),
          color: col
        });

        shape.addBuffer(meshBuffer);
      }
    }

    const shapeComp = stage.addComponentFromObject(shape);
    shapeComp.addRepresentation(MOL_REPRESENTATION_BUFFER, { isShape: true });

    // if (!skipOrientation) {
    //   if (orientationMatrix && orientationMatrix.elements) {
    //     const matrix = new Matrix4();
    //     matrix.fromArray(orientationMatrix.elements);

    //     console.count(`Before applying quality orientation matrix.`);
    //     stage.viewerControls.orient(matrix);
    //     console.count(`After applying quality orientation matrix.`);
    //   } else if (orientationMatrix === undefined) {
    //     comp.autoView('ligand');
    //     console.count(`Orientation matrix not found for quality, using autoView instead.`);
    //   }
    // }

    const reprArray = createRepresentationsArray(representationStructures);
    console.count(`loadQualityFromFile finnished`);
    return assignRepresentationArrayToComp(reprArray, comp);
  });
};
