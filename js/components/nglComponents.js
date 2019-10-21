/**
 * Created by abradley on 01/03/2018.
 */

import { Stage, Shape, concatStructures, Selection } from 'ngl';
import React, { memo, useEffect, useState, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../actions/apiActions';
import * as nglLoadActions from '../actions/nglLoadActions';
import * as nglObjectTypes from '../components/nglObjectTypes';
import * as listTypes from './listTypes';
import * as selectionActions from '../actions/selectionActions';
import { SUFFIX, VIEWS, PREFIX } from './constants';

const NGLView = memo(
  ({
    nglOrientations,
    orientationToSet,
    mol_group_list,
    mol_group_on,
    mol_group_selection,
    pandda_site_on,
    pandda_site_list,
    duck_yank_data,
    objectsToLoad,
    objectsToDelete,
    objectsLoading,
    objectsInView,
    stageColor,
    targetOnName,
    setMolGroupOn,
    setMolGroupSelection,
    selectVector,
    setDuckYankData,
    setNGLOrientation,
    setPanddaSiteOn,
    setOrientation,
    objectLoading,
    loadObjectSuccess,
    deleteObject,
    loadObject,
    deleteObjectSuccess,
    setLoadingState,
    div_id,
    height
  }) => {
    const ref_data_dict = useRef({
      [listTypes.MOLGROUPS]: {
        oldGroupOn: -1,
        oldGroupsOn: [],
        list: 'mol_group_list',
        onGroup: 'mol_group_on',
        onGroups: 'mol_group_selection'
      },
      [listTypes.PANDDA_SITE]: {
        oldGroupOn: -1,
        oldGroupsOn: [],
        list: 'pandda_site_list',
        onGroup: 'pandda_site_on'
      }
    });

    // Create NGL Stage object
    let local_div_id = 'viewport';
    if (div_id) {
      local_div_id = div_id;
    }
    const refStage = useRef(undefined);
    const [focus_let, setFocus_let] = useState(95);

    const showLine = (stage, input_dict, object_name) => {
      let shape = new Shape(object_name);
      shape.addLine();
      let shapeComp = stage.addComponentFromObject(shape);
      shapeComp.addRepresentation('buffer');
    };

    const processInt = pickingProxy => {
      let atom_id = '';
      if (pickingProxy.object.atom2.resname === 'HET') {
        atom_id = 'atom1';
      } else {
        atom_id = 'atom2';
      }
      let atom_name = pickingProxy.object[atom_id].atomname;
      let res_name = pickingProxy.object[atom_id].resname;
      let chain_name = pickingProxy.object[atom_id].chainname;
      let res_num = pickingProxy.object[atom_id].resno;
      let tot_name = chain_name + '_' + res_name + '_' + res_num.toString() + '_' + atom_name;
      let mol_int = parseInt(pickingProxy.object.atom1.structure.name.split(PREFIX.COMPLEX_LOAD)[1]);
      return { interaction: tot_name, complex_id: mol_int };
    };

    const toggleMolGroup = useCallback(
      groupId => {
        const objIdx = mol_group_selection.indexOf(groupId);
        const selectionCopy = mol_group_selection.slice();
        if (objIdx === -1) {
          setMolGroupOn(groupId);
          selectionCopy.push(groupId);
          setMolGroupSelection(selectionCopy);
        } else {
          selectionCopy.splice(objIdx, 1);
          setMolGroupSelection(selectionCopy);
        }
      },
      [mol_group_selection, setMolGroupOn, setMolGroupSelection]
    );

    const showPick = useCallback(
      (stage, pickingProxy) => {
        if (pickingProxy) {
          // For assigning the ligand interaction
          if (pickingProxy.object.type === 'hydrogen bond') {
            let input_dict = processInt(pickingProxy);
            if (duck_yank_data['interaction'] !== undefined) {
              deleteObject({
                display_div: VIEWS.MAJOR_VIEW,
                name: duck_yank_data['interaction'] + SUFFIX.INTERACTION
              });
            }
            setDuckYankData(input_dict);
            loadObject({
              start: pickingProxy.object.center1,
              end: pickingProxy.object.center2,
              radius: 0.2,
              display_div: VIEWS.MAJOR_VIEW,
              color: [1, 0, 0],
              name: input_dict['interaction'] + SUFFIX.INTERACTION,
              OBJECT_TYPE: nglObjectTypes.ARROW
            });
          } else if (pickingProxy.object.name) {
            let name = pickingProxy.object.name;
            // Ok so now perform logic
            let type = name.split('_')[0].split('(')[1];
            if (type === listTypes.MOLGROUPS) {
              let pk = parseInt(name.split('_')[1].split(')')[0], 10);
              toggleMolGroup(pk);
            } else if (type === listTypes.MOLGROUPS_SELECT) {
              let pk = parseInt(name.split('_')[1].split(')')[0], 10);
              toggleMolGroup(pk);
            } else if (type === listTypes.PANDDA_SITE) {
              let pk = parseInt(name.split('_')[1].split(')')[0], 10);
              setPanddaSiteOn(pk);
            }
            //else if (type === listTypes.MOLECULE) {
            //}
            else if (type === listTypes.VECTOR) {
              const vectorSmi = name.split('_')[1].slice(0, -1);
              selectVector(vectorSmi);
            }
          }
        }
      },
      [deleteObject, duck_yank_data, loadObject, selectVector, setDuckYankData, setPanddaSiteOn, toggleMolGroup]
    );

    const checkIfLoading = useCallback(() => {
      for (let key in objectsToLoad) {
        if (objectsToLoad[key]['display_div'] === local_div_id) {
          setLoadingState(true);
          return false;
        }
      }
      for (let key in objectsLoading) {
        if (objectsLoading[key]['display_div'] === local_div_id) {
          setLoadingState(true);
          return false;
        }
      }
      setLoadingState(false);
      return true;
    }, [local_div_id, objectsLoading, setLoadingState, objectsToLoad]);

    const showSphere = (stage, input_dict, object_name) => {
      let colour = input_dict.colour;
      let radius = input_dict.radius;
      let coords = input_dict.coords;
      let shape = new Shape(object_name);
      shape.addSphere(coords, colour, radius);
      let shapeComp = stage.addComponentFromObject(shape);
      shapeComp.addRepresentation('buffer');
    };

    const showMol = (stage, input_dict, object_name) => {
      let stringBlob = new Blob([input_dict.sdf_info], { type: 'text/plain' });
      stage.loadFile(stringBlob, { name: object_name, ext: 'sdf' }).then(function(comp) {
        comp.addRepresentation('ball+stick', {
          colorScheme: 'element',
          colorValue: input_dict.colour,
          multipleBond: true
        });
        comp.autoView('ligand');
      });
    };

    const renderComplex = ol => {
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
      // let nglProtStyle = this.props.nglProtStyle
      comp.addRepresentation('cartoon');
      comp.addRepresentation('contact', {
        masterModelIndex: 0,
        weakHydrogenBond: true,
        maxHbondDonPlaneAngle: 35,
        sele: '/0 or /1'
      });
      comp.addRepresentation('line', {
        colorScheme: 'element',
        colorValue: colour,
        sele: '/0'
      });
      comp.autoView('ligand');
      stage.setFocus(focus_let_temp);
    };

    const showComplex = (stage, input_dict, object_name) => {
      let stringBlob = new Blob([input_dict.sdf_info], { type: 'text/plain' });
      Promise.all([
        stage.loadFile(input_dict.prot_url, { ext: 'pdb' }),
        stage.loadFile(stringBlob, { ext: 'sdf' }),
        stage,
        focus_let,
        object_name,
        input_dict.colour
      ]).then(ol => renderComplex(ol));
    };

    const showEvent = (stage, input_dict, object_name) => {
      stage.loadFile(input_dict.pdb_info, { name: object_name, ext: 'pdb' }).then(function(comp) {
        comp.addRepresentation('cartoon', {});
        let selection = new Selection('LIG');
        let radius = 5;
        let atomSet = comp.structure.getAtomSetWithinSelection(selection, radius);
        let atomSet2 = comp.structure.getAtomSetWithinGroup(atomSet);
        let sele2 = atomSet2.toSeleString();
        let sele1 = atomSet.toSeleString();
        comp.addRepresentation('contact', {
          masterModelIndex: 0,
          weakHydrogenBond: true,
          maxHbondDonPlaneAngle: 35,
          linewidth: 1,
          sele: sele2 + ' or LIG'
        });
        comp.addRepresentation('line', {
          sele: sele1
        });
        comp.addRepresentation('ball+stick', {
          sele: 'LIG'
        });
        comp.autoView('LIG');
      });

      stage.loadFile(input_dict.map_info, { name: object_name, ext: 'ccp4' }).then(function(comp) {
        let surfFofc = comp.addRepresentation('surface', {
          color: 'mediumseagreen',
          isolevel: 3,
          boxSize: 10,
          useWorker: false,
          contour: true,
          opaqueBack: false,
          isolevelScroll: false
        });
        let surfFofcNeg = comp.addRepresentation('surface', {
          color: 'tomato',
          isolevel: 3,
          negateIsolevel: true,
          boxSize: 10,
          useWorker: false,
          contour: true,
          opaqueBack: false,
          isolevelScroll: false
        });
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
      shapeComp.addRepresentation('buffer');
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
      shapeComp.addRepresentation('buffer');
    };

    const showProtein = (stage, input_dict, object_name) => {
      stage.loadFile(input_dict.prot_url, { name: object_name, ext: 'pdb' }).then(function(comp) {
        comp.addRepresentation(input_dict.nglProtStyle, {});
        comp.autoView();
      });
    };

    const showHotspot = (stage, input_dict, object_name) => {
      if (input_dict.map_type === 'AP') {
        stage.loadFile(input_dict.hotUrl, { name: object_name, ext: 'dx' }).then(function(comp) {
          comp.addRepresentation('surface', {
            color: '#FFFF00',
            isolevelType: 'value',
            isolevel: input_dict.isoLevel,
            opacity: input_dict.opacity,
            opaqueBack: false,
            name: 'surf',
            disablePicking: input_dict.disablePicking
          });
        });
      } else if (input_dict.map_type === 'DO') {
        stage.loadFile(input_dict.hotUrl, { name: object_name, ext: 'dx' }).then(function(comp) {
          comp.addRepresentation('surface', {
            isolevelType: 'value',
            isolevel: input_dict.isoLevel,
            opacity: input_dict.opacity,
            opaqueBack: false,
            color: '#0000FF',
            name: 'surf',
            disablePicking: input_dict.disablePicking
          });
        });
      } else if (input_dict.map_type === 'AC') {
        stage.loadFile(input_dict.hotUrl, { name: object_name, ext: 'dx' }).then(function(comp) {
          comp.addRepresentation('surface', {
            color: '#FF0000',
            isolevelType: 'value',
            isolevel: input_dict.isoLevel,
            opacity: input_dict.opacity,
            opaqueBack: false,
            name: 'surf',
            disablePicking: input_dict.disablePicking
          });
        });
      }
    };

    // Refactor this out into a utils directory
    const function_dict = {
      [nglObjectTypes.SPHERE]: showSphere,
      [nglObjectTypes.MOLECULE]: showMol,
      [nglObjectTypes.COMPLEX]: showComplex,
      [nglObjectTypes.CYLINDER]: showCylinder,
      [nglObjectTypes.ARROW]: showArrow,
      [nglObjectTypes.PROTEIN]: showProtein,
      [nglObjectTypes.EVENTMAP]: showEvent,
      [nglObjectTypes.HOTSPOT]: showHotspot
    };

    const getRadius = data => {
      if (data.mol_id === undefined) {
        return 5.0;
      } else if (data.mol_id.length > 10) {
        return 5.0;
      } else if (data.mol_id.length > 5) {
        return 3.0;
      } else {
        return 2.0;
      }
    };

    const generateSphere = useCallback(
      (data, selected = false, listType = listTypes.MOLGROUPS, view = VIEWS.SUMMARY_VIEW) => {
        let sele = '';
        let color = [0, 0, 1];
        let getCoords = {};

        getCoords[listTypes.MOLGROUPS] = [data.x_com, data.y_com, data.z_com];
        getCoords[listTypes.PANDDA_SITE] = [data.site_native_com_x, data.site_native_com_y, data.site_native_com_z];
        if (selected) {
          sele = 'SELECT';
          color = [0, 1, 0];
        }
        const radius = getRadius(data);
        return Object.assign({}, data, {
          name: listType + sele + '_' + +data.id.toString(),
          display_div: view,
          OBJECT_TYPE: nglObjectTypes.SPHERE,
          coords: getCoords[listType],
          radius: radius,
          colour: color
        });
      },
      []
    );

    const showSelect = useCallback(
      (listType, view) => {
        let oldGroup = ref_data_dict.current[listType].oldGroupOn;

        const listOnTemp = ref_data_dict.current[listType].list;
        const onGroupTemp = ref_data_dict.current[listType].onGroup;
        let listOn;
        let onGroup;
        if (listOnTemp === 'pandda_site_list') {
          listOn = pandda_site_list;
        } else if (listOnTemp === 'mol_group_list') {
          listOn = mol_group_list;
        }
        if (onGroupTemp === 'pandda_site_list') {
          onGroup = pandda_site_on;
        } else if (onGroupTemp === 'mol_group_list') {
          onGroup = mol_group_on;
        }

        if (onGroup && onGroup !== oldGroup) {
          let old_data;
          let new_data;
          for (let index in listOn) {
            if (listOn[index].id === onGroup) {
              new_data = listOn[index];
            }
            if (listOn[index].id === oldGroup) {
              old_data = listOn[index];
            }
          }
          if (old_data) {
            deleteObject(generateSphere(old_data, true, listType, view));
            loadObject(generateSphere(old_data, false, listType, view));
          }
          // Delete the two old spheres
          if (new_data) {
            deleteObject(generateSphere(new_data, false, listType, view));
            loadObject(generateSphere(new_data, true, listType, view));
          }
          ref_data_dict.current[listType].oldGroupOn = onGroup;
        }
        /* if (listOn === undefined) {
          console.error('ERROR - Not found prop: ', listOnTemp);
        }
        if (onGroup === undefined) {
          console.error('ERROR - Not found prop: ', onGroupTemp);
        }*/
      },
      [deleteObject, generateSphere, loadObject, mol_group_list, mol_group_on, pandda_site_list, pandda_site_on]
    );

    const showMultipleSelect = useCallback(
      (listType, view) => {
        let oldGroups = ref_data_dict.current[listType].oldGroupsOn;
        let listOn = [ref_data_dict.current[listType].list];
        let onGroups = [ref_data_dict.current[listType].onGroups];

        if (onGroups) {
          const groupsToRemove = [];
          const groupsToAdd = [];
          listOn.forEach(list => {
            const isInOldGroups = oldGroups.some(g => g === list.id);
            const isInNewGroups = onGroups.some(g => g === list.id);
            if (isInOldGroups && !isInNewGroups) {
              groupsToRemove.push(list);
            } else if (!isInOldGroups && isInNewGroups) {
              groupsToAdd.push(list);
            }
          });
          // change groups that shuld be 'removed'
          groupsToRemove.forEach(data => {
            deleteObject(generateSphere(data, true, listType, view));
            loadObject(generateSphere(data, false, listType, view));
          });
          // change groups that should be 'added'
          groupsToAdd.forEach(data => {
            deleteObject(generateSphere(data, false, listType, view));
            loadObject(generateSphere(data, true, listType, view));
          });
          // update oldGroupsOn array
          ref_data_dict.current[listType].oldGroupsOn = onGroups;
        }
      },
      [deleteObject, generateSphere, loadObject]
    );

    /**
     * Function to deal with the logic of showing molecules
     */
    const renderDisplay = useCallback(() => {
      refStage.current.viewer.setBackground(stageColor);
      for (let nglKey in objectsToLoad) {
        let nglObject = objectsToLoad[nglKey];
        if (local_div_id === nglObject.display_div) {
          function_dict[nglObject.OBJECT_TYPE](refStage.current, nglObject, nglKey);
          objectLoading(nglObject);
        }
      }
      for (let nglKey in objectsToDelete) {
        if (local_div_id === objectsToDelete[nglKey].display_div) {
          let comps = refStage.current.getComponentsByName(nglKey);
          for (let component in comps.list) {
            refStage.current.removeComponent(comps.list[component]);
          }
          deleteObjectSuccess(objectsToDelete[nglKey]);
        }
      }
      showMultipleSelect(listTypes.MOLGROUPS, VIEWS.SUMMARY_VIEW);
      showSelect(listTypes.PANDDA_SITE, VIEWS.PANDDA_MAJOR);
    }, [
      deleteObjectSuccess,
      function_dict,
      local_div_id,
      objectLoading,
      objectsToDelete,
      objectsToLoad,
      showMultipleSelect,
      showSelect,
      stageColor
    ]);

    const updateOrientation = useCallback(() => {
      if (orientationToSet !== undefined) {
        if (orientationToSet[local_div_id] !== 'SET') {
          if (checkIfLoading() === true) {
            let ori = orientationToSet[local_div_id];
            let curr_orient = refStage.current.viewerControls.getOrientation();
            if (
              curr_orient &&
              curr_orient.elements &&
              ori &&
              ori.elements &&
              curr_orient.elements.length === ori.elements.length
            ) {
              for (let i = 0; i < curr_orient.elements.length; i += 1) {
                curr_orient.elements[i] = ori.elements[i];
              }
            }
            refStage.current.viewerControls.orient(curr_orient);
            setNGLOrientation(local_div_id, 'SET');
          }
        }
      }
      if (nglOrientations !== undefined) {
        if (nglOrientations[local_div_id] === 'REFRESH') {
          if (checkIfLoading() === true) {
            let objectsInThisDiv = {};
            for (let key in objectsInView) {
              if (objectsInView[key]['display_div'] === local_div_id) {
                objectsInThisDiv[key] = objectsInView[key];
              }
            }
            setOrientation(local_div_id, {
              orientation: refStage.current.viewerControls.getOrientation(),
              components: objectsInThisDiv
            });
          }
        }
      }
      for (let nglKey in objectsLoading) {
        let nglObject = objectsLoading[nglKey];
        if (local_div_id === nglObject.display_div) {
          if (refStage.current.getComponentsByName(nglKey).list.length > 0) {
            loadObjectSuccess(objectsLoading[nglKey]);
          }
        }
      }
    }, [
      checkIfLoading,
      loadObjectSuccess,
      local_div_id,
      nglOrientations,
      objectsInView,
      orientationToSet,
      setNGLOrientation,
      setOrientation,
      objectsLoading
    ]);

    useEffect(() => {
      refStage.current = new Stage(local_div_id);
      // Handle window resizing
      let local_stage = refStage.current;
      window.addEventListener(
        'resize',
        function(event) {
          local_stage.handleResize();
        },
        false
      );
      refStage.current.mouseControls.add('clickPick-left', showPick);
      setOrientation(local_div_id, 'STARTED');
      setNGLOrientation(local_div_id, 'SET');
    }, [local_div_id, setNGLOrientation, setOrientation, showPick]);

    useEffect(() => {
      updateOrientation();
    }, [updateOrientation]);

    useEffect(() => {
      renderDisplay();
      if (targetOnName !== undefined) {
        document.title = targetOnName + ': Fragalysis';
      }
    }, [renderDisplay, targetOnName]);

    return <div style={{ height: height || '600px' }} id={local_div_id} />;
  }
);
function mapStateToProps(state) {
  return {
    nglOrientations: state.nglReducers.present.nglOrientations,
    orientationToSet: state.nglReducers.present.orientationToSet,
    mol_group_list: state.apiReducers.present.mol_group_list,
    mol_group_on: state.apiReducers.present.mol_group_on,
    mol_group_selection: state.apiReducers.present.mol_group_selection,
    pandda_site_on: state.apiReducers.present.pandda_site_on,
    pandda_site_list: state.apiReducers.present.pandda_site_list,
    duck_yank_data: state.apiReducers.present.duck_yank_data,
    objectsToLoad: state.nglReducers.present.objectsToLoad,
    objectsToDelete: state.nglReducers.present.objectsToDelete,
    objectsLoading: state.nglReducers.present.objectsLoading,
    objectsInView: state.nglReducers.present.objectsInView,
    stageColor: state.nglReducers.present.stageColor,
    targetOnName: state.apiReducers.present.target_on_name
  };
}
const mapDispatchToProps = {
  setMolGroupOn: apiActions.setMolGroupOn,
  setMolGroupSelection: apiActions.setMolGroupSelection,
  selectVector: selectionActions.selectVector,
  setDuckYankData: apiActions.setDuckYankData,
  setNGLOrientation: nglLoadActions.setNGLOrientation,
  setPanddaSiteOn: apiActions.setPanddaSiteOn,
  setOrientation: nglLoadActions.setOrientation,
  objectLoading: nglLoadActions.objectLoading,
  loadObjectSuccess: nglLoadActions.loadObjectSuccess,
  deleteObject: nglLoadActions.deleteObject,
  loadObject: nglLoadActions.loadObject,
  deleteObjectSuccess: nglLoadActions.deleteObjectSuccess,
  setLoadingState: nglLoadActions.setLoadingState
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NGLView);
