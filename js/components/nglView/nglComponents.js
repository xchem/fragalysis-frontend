/**
 * Created by abradley on 01/03/2018.
 */

import { Stage, Shape, Selection, concatStructures } from 'ngl';
import React, { memo, useEffect, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../../reducers/api/apiActions';
import * as nglLoadActions from '../../reducers/ngl/nglLoadActions';
import * as listTypes from '../listTypes';
import * as selectionActions from '../../reducers/selection/selectionActions';
import { SUFFIX, VIEWS, PREFIX } from '../../constants/constants';
import { isEmpty } from 'lodash';
import { store } from '../root';
import { MOL_REPRESENTATION, OBJECT_TYPE } from './constants';
import { Box } from '@material-ui/core';

const NGLView = memo(
  ({
    nglOrientations,
    orientationToSet,
    mol_group_list,
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
    height,
    mol_group_selection,
    targetIdList,
    target_on,
    setMoleculeList,
    nglProtStyle
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
    const refStage = useRef();
    const refSetClickFunction = useRef(false);
    const defaultFocus = 0;
    const origTarget = useRef(-1);

    /*
    const showLine = (stage, input_dict, object_name) => {
      let shape = new Shape(object_name);
      shape.addLine();
      let shapeComp = stage.addComponentFromObject(shape);
      shapeComp.addRepresentation(MOL_REPRESENTATION.buffer);
    };*/

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

    const toggleMolGroup = groupId => {
      // Anti-pattern but connected prop (mol_group_selection) is undefined here
      const mgs = store.getState().apiReducers.present.mol_group_selection;
      const objIdx = mgs.indexOf(groupId);
      const selectionCopy = mgs.slice();
      if (objIdx === -1) {
        setMolGroupOn(groupId);
        selectionCopy.push(groupId);
        setMolGroupSelection(selectionCopy);
      } else {
        selectionCopy.splice(objIdx, 1);
        setMolGroupSelection(selectionCopy);
      }
    };

    const showPick = (stage, pickingProxy) => {
      if (pickingProxy) {
        // For assigning the ligand interaction
        if (pickingProxy.bond) {
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
            OBJECT_TYPE: OBJECT_TYPE.ARROW
          });
        } else if (pickingProxy.component.object.name) {
          let name = pickingProxy.component.object.name;
          // Ok so now perform logic
          const type = name.split('_')[0];
          const pk = parseInt(name.split('_')[1], 10);
          if (type === listTypes.MOLGROUPS) {
            toggleMolGroup(pk);
          } else if (type === listTypes.MOLGROUPS_SELECT) {
            toggleMolGroup(pk);
          } else if (type === listTypes.PANDDA_SITE) {
            setPanddaSiteOn(pk);
          }
          //else if (type === listTypes.MOLECULE) {
          //}
          else if (type === listTypes.VECTOR) {
            const vectorSmi = name.split('_')[1];
            selectVector(vectorSmi);
          }
        }
      }
    };

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
      shapeComp.addRepresentation(MOL_REPRESENTATION.buffer);
    };

    const showMol = (stage, input_dict, object_name) => {
      let stringBlob = new Blob([input_dict.sdf_info], { type: 'text/plain' });
      stage.loadFile(stringBlob, { name: object_name, ext: 'sdf' }).then(function(comp) {
        comp.addRepresentation(MOL_REPRESENTATION.ballPlusStick, {
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
      ]).then(ol => renderComplex(ol));
    };

    const showEvent = (stage, input_dict, object_name) => {
      stage.loadFile(input_dict.pdb_info, { name: object_name, ext: 'pdb' }).then(comp => {
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
      });

      stage.loadFile(input_dict.map_info, { name: object_name, ext: 'ccp4' }).then(comp => {
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
      stage.loadFile(input_dict.prot_url, { name: object_name, ext: 'pdb' }).then(comp => {
        comp.addRepresentation(input_dict.nglProtStyle, {});
        comp.autoView();
      });
    };

    const showHotspot = (stage, input_dict, object_name) => {
      if (input_dict.map_type === 'AP') {
        stage.loadFile(input_dict.hotUrl, { name: object_name, ext: 'dx' }).then(comp => {
          comp.addRepresentation(MOL_REPRESENTATION.surface, {
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
        stage.loadFile(input_dict.hotUrl, { name: object_name, ext: 'dx' }).then(comp => {
          comp.addRepresentation(MOL_REPRESENTATION.surface, {
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
        stage.loadFile(input_dict.hotUrl, { name: object_name, ext: 'dx' }).then(comp => {
          comp.addRepresentation(MOL_REPRESENTATION.surface, {
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
      [OBJECT_TYPE.SPHERE]: showSphere,
      [OBJECT_TYPE.MOLECULE]: showMol,
      [OBJECT_TYPE.COMPLEX]: showComplex,
      [OBJECT_TYPE.CYLINDER]: showCylinder,
      [OBJECT_TYPE.ARROW]: showArrow,
      [OBJECT_TYPE.PROTEIN]: showProtein,
      [OBJECT_TYPE.EVENTMAP]: showEvent,
      [OBJECT_TYPE.HOTSPOT]: showHotspot
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
          OBJECT_TYPE: OBJECT_TYPE.SPHERE,
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
        let listOn = undefined;
        let onGroup = undefined;
        if (listOnTemp === 'pandda_site_list') {
          listOn = pandda_site_list;
        }
        if (onGroupTemp === 'pandda_site_on') {
          onGroup = pandda_site_on;
        }

        if (onGroup !== undefined && onGroup !== oldGroup) {
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
      },
      [deleteObject, generateSphere, loadObject, pandda_site_list, pandda_site_on]
    );

    const showMultipleSelect = useCallback(
      (listType, view) => {
        let oldGroups = ref_data_dict.current[listType].oldGroupsOn;

        const listOnTemp = ref_data_dict.current[listType].list;
        const onGroupsTemp = ref_data_dict.current[listType].onGroups;

        let listOn = undefined;
        let onGroups = undefined;
        if (listOnTemp === 'mol_group_list') {
          listOn = mol_group_list;
        }
        if (onGroupsTemp !== undefined && onGroupsTemp === 'mol_group_selection') {
          onGroups = mol_group_selection;
        }

        if (onGroups !== undefined && listOn !== undefined) {
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
      [deleteObject, generateSphere, loadObject, mol_group_list, mol_group_selection]
    );

    /**
     * Function to deal with the logic of showing molecules
     */
    const renderDisplay = useCallback(() => {
      if (!isEmpty(objectsToLoad) || !isEmpty(objectsToDelete)) {
        for (let nglKey in objectsToLoad) {
          let nglObject = objectsToLoad[nglKey];
          if (local_div_id === nglObject.display_div) {
            function_dict[nglObject.OBJECT_TYPE](refStage.current, nglObject, nglKey);
            objectLoading(nglObject);
          }
        }
        for (let nglKey in objectsToDelete) {
          if (local_div_id === objectsToDelete[nglKey].display_div) {
            const comps = refStage.current.getComponentsByName(nglKey);
            for (let component in comps.list) {
              refStage.current.removeComponent(comps.list[component]);
            }
            // Reset focus after receive ResetFocus object
            if (objectsToDelete[nglKey].OBJECT_TYPE === OBJECT_TYPE.RESET_FOCUS) {
              refStage.current.setFocus(defaultFocus);
              refStage.current.autoView();
            }
            deleteObjectSuccess(objectsToDelete[nglKey]);
          }
        }
      }
    }, [deleteObjectSuccess, function_dict, local_div_id, objectLoading, objectsToDelete, objectsToLoad]);

    const renderColorChange = useCallback(() => {
      refStage.current.setParameters({ backgroundColor: stageColor });
    }, [stageColor]);

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
      setOrientation(local_div_id, 'STARTED');
      setNGLOrientation(local_div_id, 'SET');
    }, [local_div_id, setNGLOrientation, setOrientation]);

    const handleResize = () => {
      if (refStage.current) {
        refStage.current.handleResize();
      }
    };

    useEffect(
      () => {
        if (refStage.current === undefined) {
          refStage.current = new Stage(local_div_id);
          window.addEventListener('resize', handleResize, false);
          if (refSetClickFunction.current === false) {
            refStage.current.mouseControls.add('clickPick-left', showPick);
            refSetClickFunction.current = true;
          }
        }
        return () => {
          window.removeEventListener('resize', handleResize, false);
          refStage.current.mouseControls.remove('clickPick-left', showPick);
          refStage.current.dispose();
          refStage.current = undefined;
        };
      }, // eslint-disable-next-line react-hooks/exhaustive-deps
      [local_div_id]
    );

    handleResize();

    useEffect(() => {
      updateOrientation();
    }, [updateOrientation]);

    useEffect(() => {
      renderDisplay();
      if (targetOnName !== undefined) {
        document.title = targetOnName + ': Fragalysis';
      }
    }, [renderDisplay, targetOnName]);

    useEffect(() => {
      showMultipleSelect(listTypes.MOLGROUPS, VIEWS.SUMMARY_VIEW);
      showSelect(listTypes.PANDDA_SITE, VIEWS.PANDDA_MAJOR);
    }, [showMultipleSelect, showSelect]);

    useEffect(() => {
      renderColorChange();
    }, [renderColorChange]);

    const generateTargetObject = useCallback(
      targetData => {
        // Now deal with this target
        const prot_to_load = window.location.protocol + '//' + window.location.host + targetData.template_protein;
        if (JSON.stringify(prot_to_load) !== JSON.stringify(undefined)) {
          return {
            name: 'PROTEIN_' + targetData.id.toString(),
            prot_url: prot_to_load,
            OBJECT_TYPE: OBJECT_TYPE.PROTEIN,
            nglProtStyle: nglProtStyle
          };
        }
        return undefined;
      },
      [nglProtStyle]
    );

    const checkForTargetChange = useCallback(() => {
      if (target_on !== origTarget.current && target_on !== undefined && targetIdList) {
        let targetData = null;
        targetIdList.forEach(thisTarget => {
          if (thisTarget.id === target_on && targetData === null) {
            targetData = thisTarget;
          }
        });

        setMoleculeList([]);

        Object.keys(objectsInView).forEach(obj => {
          deleteObject(objectsInView[obj]);
        });

        const targObject = generateTargetObject(targetData);
        if (targObject) {
          loadObject(Object.assign({}, targObject, { display_div: VIEWS.SUMMARY_VIEW }));
          loadObject(
            Object.assign({}, targObject, {
              display_div: VIEWS.MAJOR_VIEW,
              name: targObject.name + SUFFIX.MAIN
            })
          );
        }
        origTarget.current = target_on;
      }
    }, [generateTargetObject, loadObject, targetIdList, target_on, setMoleculeList, deleteObject, objectsInView]);

    // for loading protein
    useEffect(() => {
      if (targetIdList && targetIdList.length > 0) {
        checkForTargetChange();
      }
    }, [checkForTargetChange, targetIdList]);

    return <Box id={local_div_id} height={height || '600px'} />;
  }
);
function mapStateToProps(state) {
  return {
    nglOrientations: state.nglReducers.present.nglOrientations,
    orientationToSet: state.nglReducers.present.orientationToSet,
    mol_group_list: state.apiReducers.present.mol_group_list,
    mol_group_selection: state.apiReducers.present.mol_group_selection,
    pandda_site_on: state.apiReducers.present.pandda_site_on,
    pandda_site_list: state.apiReducers.present.pandda_site_list,
    duck_yank_data: state.apiReducers.present.duck_yank_data,
    objectsToLoad: state.nglReducers.present.objectsToLoad,
    objectsToDelete: state.nglReducers.present.objectsToDelete,
    objectsLoading: state.nglReducers.present.objectsLoading,
    objectsInView: state.nglReducers.present.objectsInView,
    stageColor: state.nglReducers.present.stageColor,
    targetOnName: state.apiReducers.present.target_on_name,
    targetIdList: state.apiReducers.present.target_id_list,
    target_on: state.apiReducers.present.target_on,
    nglProtStyle: state.nglReducers.present.nglProtStyle
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
  setLoadingState: nglLoadActions.setLoadingState,
  setMoleculeList: apiActions.setMoleculeList
};

NGLView.displayName = 'NGLView';

export default connect(mapStateToProps, mapDispatchToProps)(NGLView);
