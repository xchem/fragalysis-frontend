import { MOL_REPRESENTATION, OBJECT_TYPE } from '../../components/nglView/constants';
import { concatStructures, Selection, Shape } from 'ngl';

export const defaultFocus = 0;

const showSphere = (stage, input_dict, object_name) => {
  let colour = input_dict.colour;
  let radius = input_dict.radius;
  let coords = input_dict.coords;
  let shape = new Shape(object_name);
  shape.addSphere(coords, colour, radius);
  let shapeComp = stage.addComponentFromObject(shape);
  shapeComp.addRepresentation(MOL_REPRESENTATION.buffer);
};

const showMol = (stage, input_dict, object_name) => {
  let stringBlob = new Blob([input_dict.sdf_info], { type: 'text/plain' });
  stage
    .loadFile(stringBlob, { name: object_name, ext: 'sdf' })
    .then(function(comp) {
      comp.addRepresentation(MOL_REPRESENTATION.ballPlusStick, {
        colorScheme: 'element',
        colorValue: input_dict.colour,
        multipleBond: true
      });
      comp.autoView('ligand');
    })
    .catch(error => {
      console.error(error);
    });
};

const renderComplex = ol => {
  console.log(ol);
  let cs = concatStructures(
    ol[4],
    ol[0].structure.getView(new Selection('not ligand')),
    ol[1].structure.getView(new Selection(''))
  );
  let stage = ol[2];
  let focus_let_temp = ol[3];
  let colour = ol[5];
  // Set the object name
  let comp = stage.addComponentFromObject(cs);

  comp.addRepresentation(MOL_REPRESENTATION.cartoon);
  comp.addRepresentation(MOL_REPRESENTATION.contact, {
    masterModelIndex: 0,
    weakHydrogenBond: true,
    maxHbondDonPlaneAngle: 35,
    sele: '/0 or /1'
  });
  comp.addRepresentation(MOL_REPRESENTATION.line, {
    colorScheme: 'element',
    colorValue: colour,
    sele: '/0'
  });

  comp.autoView('ligand');
  comp.stage.setFocus(focus_let_temp);
};

const showComplex = (stage, input_dict, object_name) => {
  let stringBlob = new Blob([input_dict.sdf_info], { type: 'text/plain' });
  Promise.all([
    stage.loadFile(input_dict.prot_url, { ext: 'pdb' }),
    stage.loadFile(stringBlob, { ext: 'sdf' }),
    stage,
    defaultFocus,
    object_name,
    input_dict.colour
  ])
    .then(ol => {
      renderComplex(ol);
    })
    .catch(error => {
      console.error(error);
    });
};

const showEvent = (stage, input_dict, object_name) => {
  stage
    .loadFile(input_dict.pdb_info, { name: object_name, ext: 'pdb' })
    .then(comp => {
      comp.addRepresentation(MOL_REPRESENTATION.cartoon, {});
      let selection = new Selection('LIG');
      let radius = 5;
      let atomSet = comp.structure.getAtomSetWithinSelection(selection, radius);
      let atomSet2 = comp.structure.getAtomSetWithinGroup(atomSet);
      let sele2 = atomSet2.toSeleString();
      let sele1 = atomSet.toSeleString();
      comp.addRepresentation(MOL_REPRESENTATION.contact, {
        masterModelIndex: 0,
        weakHydrogenBond: true,
        maxHbondDonPlaneAngle: 35,
        linewidth: 1,
        sele: sele2 + ' or LIG'
      });
      comp.addRepresentation(MOL_REPRESENTATION.line, {
        sele: sele1
      });
      comp.addRepresentation(MOL_REPRESENTATION.ballPlusStick, {
        sele: 'LIG'
      });
      comp.autoView('LIG');
    })
    .catch(error => {
      console.error(error);
    });

  stage
    .loadFile(input_dict.map_info, { name: object_name, ext: 'ccp4' })
    .then(comp => {
      comp.addRepresentation(MOL_REPRESENTATION.surface, {
        color: 'mediumseagreen',
        isolevel: 3,
        boxSize: 10,
        useWorker: false,
        contour: true,
        opaqueBack: false,
        isolevelScroll: false
      });
      comp.addRepresentation(MOL_REPRESENTATION.surface, {
        color: 'tomato',
        isolevel: 3,
        negateIsolevel: true,
        boxSize: 10,
        useWorker: false,
        contour: true,
        opaqueBack: false,
        isolevelScroll: false
      });
    })
    .catch(error => {
      console.error(error);
    });
};

const showCylinder = (stage, input_dict, object_name) => {
  let colour = input_dict.colour === undefined ? [1, 0, 0] : input_dict.colour;
  let radius = input_dict.radius === undefined ? 0.4 : input_dict.radius;
  // Handle undefined start and finish
  if (input_dict.start === undefined || input_dict.end === undefined) {
    console.log('START OR END UNDEFINED FOR CYLINDER' + input_dict.toString());
    return;
  }
  let shape = new Shape(object_name, { disableImpostor: true });
  shape.addCylinder(input_dict.start, input_dict.end, colour, radius);
  let shapeComp = stage.addComponentFromObject(shape);
  shapeComp.addRepresentation(MOL_REPRESENTATION.buffer);
};

const showArrow = (stage, input_dict, object_name) => {
  let colour = input_dict.colour === undefined ? [1, 0, 0] : input_dict.colour;
  let radius = input_dict.radius === undefined ? 0.3 : input_dict.radius;
  // Handle undefined start and finish
  if (input_dict.start === undefined || input_dict.end === undefined) {
    console.log('START OR END UNDEFINED FOR ARROW ' + input_dict.toString());
    return;
  }
  let shape = new Shape(object_name, { disableImpostor: true });
  shape.addArrow(input_dict.start, input_dict.end, colour, radius);
  let shapeComp = stage.addComponentFromObject(shape);
  shapeComp.addRepresentation(MOL_REPRESENTATION.buffer);
};

const showProtein = (stage, input_dict, object_name) => {
  stage
    .loadFile(input_dict.prot_url, { name: object_name, ext: 'pdb' })
    .then(comp => {
      comp.addRepresentation(input_dict.nglProtStyle, {});
      comp.autoView();
    })
    .catch(error => {
      console.error(error);
    });
};

const showHotspot = (stage, input_dict, object_name) => {
  if (input_dict.map_type === 'AP') {
    stage
      .loadFile(input_dict.hotUrl, { name: object_name, ext: 'dx' })
      .then(comp => {
        comp.addRepresentation(MOL_REPRESENTATION.surface, {
          color: '#FFFF00',
          isolevelType: 'value',
          isolevel: input_dict.isoLevel,
          opacity: input_dict.opacity,
          opaqueBack: false,
          name: 'surf',
          disablePicking: input_dict.disablePicking
        });
      })
      .catch(error => {
        console.error(error);
      });
  } else if (input_dict.map_type === 'DO') {
    stage
      .loadFile(input_dict.hotUrl, { name: object_name, ext: 'dx' })
      .then(comp => {
        comp.addRepresentation(MOL_REPRESENTATION.surface, {
          isolevelType: 'value',
          isolevel: input_dict.isoLevel,
          opacity: input_dict.opacity,
          opaqueBack: false,
          color: '#0000FF',
          name: 'surf',
          disablePicking: input_dict.disablePicking
        });
      })
      .catch(error => {
        console.error(error);
      });
  } else if (input_dict.map_type === 'AC') {
    stage
      .loadFile(input_dict.hotUrl, { name: object_name, ext: 'dx' })
      .then(comp => {
        comp.addRepresentation(MOL_REPRESENTATION.surface, {
          color: '#FF0000',
          isolevelType: 'value',
          isolevel: input_dict.isoLevel,
          opacity: input_dict.opacity,
          opaqueBack: false,
          name: 'surf',
          disablePicking: input_dict.disablePicking
        });
      })
      .catch(error => {
        console.error(error);
      });
  }
};

// Refactor this out into a utils directory
export const nglObjectDictionary = {
  [OBJECT_TYPE.SPHERE]: showSphere,
  [OBJECT_TYPE.MOLECULE]: showMol,
  [OBJECT_TYPE.COMPLEX]: showComplex,
  [OBJECT_TYPE.CYLINDER]: showCylinder,
  [OBJECT_TYPE.ARROW]: showArrow,
  [OBJECT_TYPE.PROTEIN]: showProtein,
  [OBJECT_TYPE.EVENTMAP]: showEvent,
  [OBJECT_TYPE.HOTSPOT]: showHotspot
};
