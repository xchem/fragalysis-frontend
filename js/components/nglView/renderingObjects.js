import { MOL_REPRESENTATION, MOL_REPRESENTATION_BUFFER, OBJECT_TYPE, DENSITY_MAPS } from './constants';
import {
  assignRepresentationArrayToComp,
  createRepresentationsArray,
  createRepresentationStructure,
  defaultFocus
} from './generatingObjects';
import { concatStructures, Selection, Shape, Matrix4 } from 'ngl';
import { loadQualityFromFile } from './renderingHelpers';
import { getPdb } from './renderingFile';
import { setNglViewParams } from '../../reducers/ngl/actions';
import { NGL_PARAMS, QUALITY_TYPES } from './constants/index';
import { VIEWS } from '../../constants/constants';
import { MAP_TYPE } from '../../reducers/ngl/constants';
// import { molFile, pdbApo } from '../preview/molecule/redux/testData';

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

const showLigand = async ({
  stage,
  input_dict,
  object_name,
  representations,
  orientationMatrix,
  markAsRightSideLigand,
  loadQuality,
  quality,
  state
}) => {
  let stringBlob = new Blob([input_dict.sdf_info], { type: 'text/plain' });
  console.count(`showLigand started`);
  const skipOrientation = state.trackingReducers.skipOrientationChange;

  if (loadQuality && quality && quality.badids?.length > 0) {
    return loadQualityFromFile(
      stage,
      stringBlob,
      quality,
      object_name,
      orientationMatrix,
      input_dict.colour,
      QUALITY_TYPES.LIGAND,
      skipOrientation
    );
  } else {
    return loadLigandFromFile(
      stage,
      stringBlob,
      object_name,
      representations,
      markAsRightSideLigand,
      input_dict,
      orientationMatrix,
      skipOrientation
    );
  }
};

const loadLigandFromFile = (
  stage,
  stringBlob,
  object_name,
  representations,
  markAsRightSideLigand,
  input_dict,
  orientationMatrix,
  skipOrientation
) => {
  console.count(`loadLigandFromFile started`);
  return stage.loadFile(stringBlob, { name: object_name, ext: 'sdf' }).then(comp => {
    console.count(`loadLigandFromFile file loaded`);
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

    if (!skipOrientation) {
      if (orientationMatrix && orientationMatrix.elements) {
        const matrix = new Matrix4();
        matrix.fromArray(orientationMatrix.elements);
        console.count(`Before applying orientation matrix - loadLigandFromFile`);
        stage.viewerControls.orient(matrix);
        console.count(`After applying orientation matrix - loadLigandFromFile`);
      } else if (orientationMatrix === undefined) {
        comp.autoView('ligand');
        console.count(`Orientation matrix not found for loadLigandFromFile, using autoView instead.`);
      }
    }
    console.count(`loadLigandFromFile finished`);
    return assignRepresentationArrayToComp(reprArray, comp);
  });
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
  // TODO: setFocus should be in condition
  //  comp.stage.setFocus(focus_let_temp);
  // }

  return assignRepresentationArrayToComp(reprArray, comp);
};

const showHitProtein = async ({
  stage,
  input_dict,
  object_name,
  representations,
  orientationMatrix,
  dispatch,
  loadQuality,
  quality
}) => {
  let stringBlob = new Blob([input_dict.sdf_info], { type: 'text/plain' });

  const pdbBlob = await dispatch(getPdb(input_dict.prot_url));
  // const pdbBlob = new Blob([pdbApo], { type: 'text/plain' });

  if (pdbBlob) {
    if (loadQuality && quality && quality.badproteinids?.length > 0) {
      const ol = await Promise.all([
        stage.loadFile(pdbBlob, { ext: 'pdb', defaultAssembly: 'BU1' }),
        stage.loadFile(stringBlob, { ext: 'sdf' }),
        stage,
        defaultFocus,
        object_name,
        input_dict.colour
      ]);
      renderHitProtein(ol, representations, orientationMatrix);
      return loadQualityFromFile(
        stage,
        pdbBlob,
        quality,
        object_name,
        //'MID2A-x0758_0A_HIT_PROTEIN',
        orientationMatrix,
        input_dict.colour,
        QUALITY_TYPES.HIT_PROTEIN
      );
    } else {
      const ol = await Promise.all([
        stage.loadFile(pdbBlob, { ext: 'pdb', defaultAssembly: 'BU1' }),
        stage.loadFile(stringBlob, { ext: 'sdf' }),
        stage,
        defaultFocus,
        object_name,
        input_dict.colour
      ]);
      renderHitProtein(ol, representations, orientationMatrix);
    }
  }
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
  //   //TODO: setFocus should be in condition
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
    const msgs = 'START OR END UNDEFINED FOR ARROW ' + JSON.stringify(input_dict);
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

const showProtein = ({ stage, input_dict, object_name, representations, orientationMatrix, state }) =>
  stage.loadFile(input_dict.prot_url, { name: object_name, ext: 'pdb', defaultAssembly: 'BU1' }).then(comp => {
    const reprArray =
      representations || createRepresentationsArray([createRepresentationStructure(input_dict.nglProtStyle, {})]);

    const skipOrientation = state.trackingReducers.skipOrientationChange;

    if (!skipOrientation) {
      if (orientationMatrix) {
        console.count(`Before applying orientation matrix - showProtein`);
        stage.viewerControls.orient(orientationMatrix);
        console.count(`After applying orientation matrix - showProtein`);
      } else if (orientationMatrix === undefined) {
        comp.autoView();
        console.count(`Orientation matrix not found for showProtein, using autoView instead.`);
      }
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

const showDensity = ({ stage, input_dict, object_name, representations }) => {
  let densityParams_event = {
    color: input_dict.color_DENSITY,
    isolevel: input_dict.isolevel_DENSITY,
    smooth: input_dict.smooth || 0,
    boxSize: input_dict.boxSize_DENSITY,
    contour: input_dict.contour_DENSITY,
    wrap: true,
    opacity: input_dict.opacity_DENSITY,
    opaqueBack: false
  };
  let densityParams_sigmaa = {
    color: input_dict.color_DENSITY_MAP_sigmaa,
    isolevel: input_dict.isolevel_DENSITY_MAP_sigmaa,
    smooth: input_dict.smooth || 0,
    boxSize: input_dict.boxSize_DENSITY_MAP_sigmaa,
    contour: input_dict.contour_DENSITY_MAP_sigmaa,
    wrap: true,
    opacity: input_dict.opacity_DENSITY_MAP_sigmaa,
    opaqueBack: false
  };
  let densityParams_diff = {
    color: input_dict.color_DENSITY_MAP_diff,
    isolevel: input_dict.isolevel_DENSITY_MAP_diff,
    smooth: input_dict.smooth || 0,
    boxSize: input_dict.boxSize_DENSITY_MAP_diff,
    contour: input_dict.contour_DENSITY_MAP_diff,
    wrap: true,
    opacity: input_dict.opacity_DENSITY_MAP_diff,
    opaqueBack: false,
    negateIsolevel: false
  };
  let densityParams_diff_negate = {
    color: input_dict.color_DENSITY_MAP_diff_negate,
    isolevel: input_dict.isolevel_DENSITY_MAP_diff,
    smooth: input_dict.smooth || 0,
    boxSize: input_dict.boxSize_DENSITY_MAP_diff,
    contour: input_dict.contour_DENSITY_MAP_diff,
    wrap: true,
    opacity: input_dict.opacity_DENSITY_MAP_diff,
    opaqueBack: false,
    negateIsolevel: true
  };

  return Promise.all([
    input_dict.sigmaa_url &&
      input_dict.render_sigmaa &&
      stage.loadFile(input_dict.sigmaa_url, { name: object_name + DENSITY_MAPS.SIGMAA, ext: 'map' }).then(comp => {
        const repr = createRepresentationStructure(MOL_REPRESENTATION.surface, densityParams_sigmaa);
        const reprArray = representations || createRepresentationsArray([repr]);
        return { repr: assignRepresentationArrayToComp(reprArray, comp), name: object_name + DENSITY_MAPS.SIGMAA };
      }),
    input_dict.diff_url &&
      input_dict.render_diff &&
      stage.loadFile(input_dict.diff_url, { name: object_name + DENSITY_MAPS.DIFF, ext: 'map' }).then(comp => {
        const repr = createRepresentationStructure(MOL_REPRESENTATION.surface, densityParams_diff);
        const reprArray = representations || createRepresentationsArray([repr]);
        return { repr: assignRepresentationArrayToComp(reprArray, comp), name: object_name + DENSITY_MAPS.DIFF };
      }) &&
      stage.loadFile(input_dict.diff_url, { name: object_name + DENSITY_MAPS.DIFF, ext: 'map' }).then(comp => {
        const repr = createRepresentationStructure(MOL_REPRESENTATION.surface, densityParams_diff_negate);
        const reprArray = representations || createRepresentationsArray([repr]);
        return { repr: assignRepresentationArrayToComp(reprArray, comp), name: object_name + DENSITY_MAPS.DIFF };
      }),
    input_dict.event_url &&
      input_dict.render_event &&
      stage.loadFile(input_dict.event_url, { name: object_name, ext: 'ccp4' }).then(comp => {
        const repr = createRepresentationStructure(MOL_REPRESENTATION.surface, densityParams_event);
        const reprArray = representations || createRepresentationsArray([repr]);
        return { repr: assignRepresentationArrayToComp(reprArray, comp), name: object_name };
      })
  ]).then(values => {
    let val = [...values].filter(v => v !== undefined);
    return val;
  });
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
