import React, { forwardRef, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CircularProgress, Grid, Popper, IconButton, Typography, Tooltip } from '@material-ui/core';
import { ArrowLeft, ArrowRight, Close, KeyboardArrowDown } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { NglContext } from '../../nglView/nglProvider';
import { PLURAL_TO_SINGULAR, VIEWS, XCA_TAG_CATEGORIES } from '../../../constants/constants';
import { changeButtonClassname } from '../../datasets/helpers';
import {
  addComplex,
  addHitProtein,
  addLigand,
  addObservationsToPose,
  addSurface,
  copyPoseToPoseDTO,
  createNewPose,
  getAllCompatiblePoses,
  getCategoryById,
  prepareEmptyPoseDTO,
  removeComplex,
  removeHitProtein,
  removeLigand,
  removeObservationsFromPose,
  removeSelectedMolTypes,
  removeSurface,
  updateObservationsInPose,
  updatePose,
  withDisabledMoleculesNglControlButtons
} from './redux/dispatchActions';
import { colourList } from './utils/color';
import {
  appendToMolListToEdit,
  removeFromMolListToEdit,
  setDeselectedAllByType,
  setObservationDialogAction,
  setObservationsForLHSCmp,
  setOpenObservationsDialog,
  setPoseIdForObservationsDialog,
  setSelectedAllByType,
  setTagEditorOpenObs,
  updateMoleculeInLHSObservations
} from '../../../reducers/selection/actions';
import useDisableNglControlButtons from './useDisableNglControlButtons';
import { Button, Panel } from '../../common';
import SearchField from '../../common/Components/SearchField';
import GroupNglControlButtonsContext from './groupNglControlButtonsContext';
import MoleculeView from './moleculeView';
import { TagEditor } from '../tags/modal/tagEditor';
import { ToastContext } from '../../toast';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { updateLHSCompound, updateMoleculeInMolLists, updateMoleculeTag, updateTag } from '../../../reducers/api/actions';
import { createPoseErrorMessage } from './api/poseApi';
import { augumentTagObjectWithId, createMoleculeTagObject, DEFAULT_TAG_COLOR, getMoleculeTagForTag } from '../tags/utils/tagUtils';
import { updateExistingTag } from '../tags/api/tagsApi';
import { XCA_TAGS_CATEGORIES } from './moleculeView/moleculeView';

const MIN_PANEL_HEIGHT = 250;

const useStyles = makeStyles(theme => ({
  paper: {
    minWidth: 372,
    minHeight: MIN_PANEL_HEIGHT,
    overflowY: 'hidden',
    resize: 'vertical'
  },
  molHeader: {
    marginLeft: 19
    // width: 'calc(100% - 19px)'
  },
  rightBorder: {
    borderRight: '1px solid',
    borderRightColor: theme.palette.background.divider,
    fontWeight: 'bold',
    paddingLeft: theme.spacing(1) / 2,
    paddingRight: theme.spacing(1) / 2,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    fontSize: 8,
    width: 25,
    textAlign: 'center',
    '&:last-child': {
      borderRight: 'none',
      width: 32
    }
  },
  headerButton: {
    paddingTop: 10
  },
  container: {
    // minHeight: '100px',
    height: '100%'
    // width: 'inherit',
    // color: theme.palette.black
  },
  content: {
    overflowY: 'auto',
    width: '100%',
    // height: 214
    // minHeight: '77%',
    // height: '77%'
    // minHeight: 200,
    // marginBottom: -43
    height: `calc(99% - ${theme.spacing(6)}px - ${theme.spacing(2)}px)`
  },
  search: {
    width: 140
  },
  notFound: {
    paddingTop: theme.spacing(2)
  },
  contColButton: {
    minWidth: 'fit-content',
    paddingLeft: theme.spacing(1) / 4,
    paddingRight: theme.spacing(1) / 4,
    paddingBottom: 0,
    paddingTop: 0,
    fontWeight: 'bold',
    fontSize: 9,
    borderRadius: 0,
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
    '&:hover': {
      backgroundColor: theme.palette.primary.light
      //color: theme.palette.primary.contrastText
    },
    '&:disabled': {
      borderRadius: 0,
      borderColor: 'white',
      backgroundColor: '#c5cae9'
    }
  },
  contColButtonSelected: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.main
      //color: theme.palette.black
    }
  },
  contColButtonHalfSelected: {
    backgroundColor: theme.palette.primary.semidark,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.semidark
      //color: theme.palette.black
    }
  },
  contColButtonBottomRow: {
    border: '1px solid'
  },
  topRow: {
    marginBottom: theme.spacing(1) / 4
  },
  bottomRow: {
    marginTop: theme.spacing(1) / 4,
    '& > div': {
      marginLeft: 12
    }
  },
  dropdownContent: {
    display: 'none',
    position: 'absolute',
    backgroundColor: theme.palette.primary.contrastText,
    maxWidth: 150,
    marginTop: -1,
    border: '1px solid',
    borderColor: theme.palette.primary.main,
    // color: theme.palette.primary.contrastText,
    // boxShadow: '0px 8px 16px 0px rgba(0, 0, 0, 0.2)',
    zIndex: 1
  },
  dropdownItem: {
    fontSize: 12,
    width: '100%',
    // fontWeight: 'bold',
    paddingLeft: theme.spacing(1) / 4,
    paddingRight: theme.spacing(1) / 4,
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.palette.primary.light
    }
  },
  dropdownContentSide: {
    left: 148,
    marginTop: -18,
    maxWidth: 260,
    width: 260,
    overflowY: 'auto',
    maxHeight: 100
  },
  dropdown: {
    '&:hover > $dropdownContent': {
      display: 'flex'
    }
  },
  popoutIcon: {
    position: 'absolute',
    top: 30,
    left: 334,
    backgroundColor: theme.palette.white,
    borderRadius: 5,
    '& > *': {
      paddingRight: 0
    }
  },
  headerCell: {
    padding: '0px 8px',
    borderColor: 'black',
    fontSize: 12
  }
}));

export const ObservationsDialog = memo(
  forwardRef(({ open = false, anchorEl }, ref) => {
    const dispatch = useDispatch();

    const id = open ? 'simple-popover-compound-inspirations' : undefined;
    const imgHeight = 49;
    const imgWidth = 150;
    const classes = useStyles();
    const [searchString, setSearchString] = useState(null);
    const selectedAll = useRef(false);

    const { getNglView } = useContext(NglContext);
    const { toastInfo, toastError, toastWarning } = useContext(ToastContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    const isLoadingInspirationListOfMolecules = useSelector(
      state => state.datasetsReducers.isLoadingInspirationListOfMolecules
    );
    const observationsDataList = useSelector(state => state.selectionReducers.observationsForLHSCmp);
    const poseIdForDialog = useSelector(state => state.selectionReducers.poseIdForObservationsDialog);

    const ligandList = useSelector(state => state.selectionReducers.fragmentDisplayList);
    const proteinList = useSelector(state => state.selectionReducers.proteinList);
    const complexList = useSelector(state => state.selectionReducers.complexList);
    const surfaceList = useSelector(state => state.selectionReducers.surfaceList);
    const densityList = useSelector(state => state.selectionReducers.densityList);
    const densityListCustom = useSelector(state => state.selectionReducers.densityListCustom);
    const qualityList = useSelector(state => state.selectionReducers.qualityList);
    const vectorOnList = useSelector(state => state.selectionReducers.vectorOnList);
    const informationList = useSelector(state => state.selectionReducers.informationList);
    const molForTagEditId = useSelector(state => state.selectionReducers.molForTagEdit);
    const moleculesToEditIds = useSelector(state => state.selectionReducers.moleculesToEdit);
    const tagCategoriesList = useSelector(state => state.apiReducers.categoryList);
    // const tagList = useSelector(state => state.apiReducers.tagList);
    const tagList = useSelector(state => state.apiReducers.moleculeTags);
    const targetId = useSelector(state => state.apiReducers.target_on);

    const poses = useSelector(state => state.apiReducers.lhs_compounds_list);
    const compatiblePoses = useMemo(() => {
      const someObservation = observationsDataList[0];
      if (someObservation) {
        const pose = poses.find(pose => pose.id === someObservation.pose);
        if (pose) {
          const result = dispatch(getAllCompatiblePoses(pose.compound, pose.canon_site, pose.id));
          return result;
        }
      } else {
        return [];
      }
    }, [dispatch, observationsDataList, poses]);

    const isTagEditorOpenObs = useSelector(state => state.selectionReducers.tagEditorOpenedObs);

    const tagEditorRef = useRef();

    const getCalculatedTagColumnWidth = (tagText, font = null) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.font = `${(font ?? '12px')} "Roboto", "Helvetica", "Arial", sans-serif`;
      // 16 as padding buffer
      const calculatedWidth = ctx.measureText(tagText).width + 16;
      return calculatedWidth;
    };

    const [tagEditorAnchorEl, setTagEditorAnchorEl] = useState(null);
    const [expandView, setExpandView] = useState(null);
    const [headerWidths, setHeaderWidths] = useState({
      CanonSites: getCalculatedTagColumnWidth('CanonSites'),
      ConformerSites: getCalculatedTagColumnWidth('ConformerSites'),
      Quatassemblies: getCalculatedTagColumnWidth('Quatassemblies'),
      Crystalforms: getCalculatedTagColumnWidth('Crystalforms'),
      CrystalformSites: getCalculatedTagColumnWidth('CrystalformSites'),
      CentroidRes: getCalculatedTagColumnWidth('CentroidRes'),
      LongCode: getCalculatedTagColumnWidth('LongCode'),
    });

    /**
     * Handler for setting width of expanded view columns for child rows
     * @param {*} tagText
     * @param {*} tagCategory
     */
    const setHeaderWidthsHandler = (tagText, tagCategory) => {
      const calculatedWidth = getCalculatedTagColumnWidth(tagText, 'bold 12px');
      if (headerWidths[tagCategory] < calculatedWidth) {
        setHeaderWidths(old => {
          const newWidths = { ...old };
          newWidths[tagCategory] = calculatedWidth;
          return { ...newWidths }
        });
      }
    };

    const moleculeList = useMemo(() => {
      if (searchString !== null) {
        return observationsDataList.filter(molecule =>
          molecule.code.toLowerCase().includes(searchString.toLowerCase())
        );
      }
      return observationsDataList;
    }, [observationsDataList, searchString]);

    const allSelectedMolecules = useMemo(
      () => observationsDataList.filter(molecule => moleculesToEditIds.includes(molecule.id)),
      [moleculesToEditIds, observationsDataList]
    );

    const isLigandOn = ligandList.some(moleculeID => moleculeList.some(molecule => molecule.id === moleculeID));
    const isProteinOn = proteinList.some(moleculeID => moleculeList.some(molecule => molecule.id === moleculeID));
    const isComplexOn = complexList.some(moleculeID => moleculeList.some(molecule => molecule.id === moleculeID));

    // TODO: refactor from this line (duplicity in datasetMoleculeList.js)
    const isLigandOnForClassname = changeButtonClassname(
      ligandList.filter(moleculeID => allSelectedMolecules.find(molecule => molecule.id === moleculeID) !== undefined),
      allSelectedMolecules
    );
    const isProteinOnForClassname = changeButtonClassname(
      proteinList.filter(moleculeID => allSelectedMolecules.find(molecule => molecule.id === moleculeID) !== undefined),
      allSelectedMolecules
    );
    const isComplexOnForClassname = changeButtonClassname(
      complexList.filter(moleculeID => allSelectedMolecules.find(molecule => molecule.id === moleculeID) !== undefined),
      allSelectedMolecules
    );

    const addType = {
      ligand: addLigand,
      protein: addHitProtein,
      complex: addComplex,
      surface: addSurface
    };

    const removeType = {
      ligand: removeLigand,
      protein: removeHitProtein,
      complex: removeComplex,
      surface: removeSurface
    };

    const removeSelectedTypes = useCallback(
      (skipMolecules = [], skipTracking = false) => {
        const molecules = [...moleculeList].filter(molecule => !skipMolecules.some(mol => molecule.id === mol.id));
        dispatch(removeSelectedMolTypes(stage, molecules, skipTracking, true));
      },
      [dispatch, moleculeList, stage]
    );

    const removeSelectedType = (type, skipTracking = false) => {
      if (type === 'ligand') {
        allSelectedMolecules.forEach(molecule => {
          dispatch(removeType[type](stage, molecule, skipTracking));
        });
      } else {
        allSelectedMolecules.forEach(molecule => {
          dispatch(removeType[type](stage, molecule, colourList[molecule.id % colourList.length], skipTracking));
        });
      }

      selectedAll.current = false;
    };

    const addNewType = (type, skipTracking = false) => {
      dispatch(
        withDisabledMoleculesNglControlButtons(
          allSelectedMolecules.map(molecule => molecule.id),
          type,
          async () => {
            const promises = [];

            if (type === 'ligand') {
              allSelectedMolecules.forEach(molecule => {
                promises.push(
                  dispatch(
                    addType[type](
                      stage,
                      molecule,
                      colourList[molecule.id % colourList.length],
                      false,
                      true,
                      skipTracking
                    )
                  )
                );
              });
            } else {
              allSelectedMolecules.forEach(molecule => {
                promises.push(
                  dispatch(addType[type](stage, molecule, colourList[molecule.id % colourList.length], skipTracking))
                );
              });
            }

            await Promise.all(promises);
          }
        )
      );
    };

    const ucfirst = string => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const onButtonToggle = (type, calledFromSelectAll = false) => {
      if (calledFromSelectAll === true && selectedAll.current === true) {
        // REDO
        if (eval('is' + ucfirst(type) + 'On') === false) {
          addNewType(type);
        }
      } else if (calledFromSelectAll && selectedAll.current === false) {
        removeSelectedType(type);
      } else if (!calledFromSelectAll) {
        if (eval('is' + ucfirst(type) + 'On') === false) {
          let molecules = getSelectedMoleculesByType(type, true);
          dispatch(setSelectedAllByType(type, molecules, true));
          addNewType(type, true);
        } else {
          let molecules = getSelectedMoleculesByType(type, false);
          dispatch(setDeselectedAllByType(type, molecules, true));
          removeSelectedType(type, true);
        }
      }
    };

    const areAllMoleculesSelected = allSelectedMolecules.length === moleculeList.length;

    const handleSelectAllObservations = () => {
      if (areAllMoleculesSelected) {
        allSelectedMolecules.forEach(molecule => dispatch(removeFromMolListToEdit(molecule.id)));
      } else {
        moleculeList
          .filter(molecule => !moleculesToEditIds.includes(molecule.id))
          .forEach(molecule => dispatch(appendToMolListToEdit(molecule.id)));
      }
    };

    /**
     * Select all displayed observations, i.e. have displayed some of their L, P, C
     */
    const handleSelectAllDisplayedObservations = () => {
      // get all displayed but filter out already selected and duplicates
      // lists of IDs
      let displayedObservations = ligandList.filter(
        moleculeID =>
          moleculeList.some(molecule => molecule.id === moleculeID) &&
          !allSelectedMolecules.some(molecule => molecule.id === moleculeID)
      );

      const displayedProteins = proteinList.filter(
        moleculeID =>
          moleculeList.some(molecule => molecule.id === moleculeID) &&
          !allSelectedMolecules.some(molecule => molecule.id === moleculeID) &&
          !displayedObservations.some(molecule => molecule === moleculeID)
      );
      displayedObservations = displayedObservations.concat(displayedProteins);

      const displayedComplexes = complexList.filter(
        moleculeID =>
          moleculeList.some(molecule => molecule.id === moleculeID) &&
          !allSelectedMolecules.some(molecule => molecule.id === moleculeID) &&
          !displayedObservations.some(molecule => molecule === moleculeID)
      );
      displayedObservations = displayedObservations.concat(displayedComplexes);

      displayedObservations.forEach(moleculeID => dispatch(appendToMolListToEdit(moleculeID)));
    };

    const getSelectedMoleculesByType = (type, isAdd) => {
      switch (type) {
        case 'ligand':
          return isAdd ? getMoleculesToSelect(ligandList) : getMoleculesToDeselect(ligandList);
        case 'protein':
          return isAdd ? getMoleculesToSelect(proteinList) : getMoleculesToDeselect(proteinList);
        case 'complex':
          return isAdd ? getMoleculesToSelect(complexList) : getMoleculesToDeselect(complexList);
        default:
          return null;
      }
    };

    const getMoleculesToSelect = list => {
      let molecules = allSelectedMolecules.filter(m => !list.includes(m.id));
      return molecules;
    };

    const getMoleculesToDeselect = list => {
      let molecules = allSelectedMolecules.filter(m => list.includes(m.id));
      return molecules;
    };

    const groupNglControlButtonsDisabledState = useDisableNglControlButtons(allSelectedMolecules);

    const anyControlButtonDisabled = Object.values(groupNglControlButtonsDisabledState).some(
      buttonState => buttonState
    );

    const handleSetMainObservation = () => {
      const firstSelectedObs = observationsDataList.find(molecule => moleculesToEditIds.includes(molecule.id));
      if (firstSelectedObs) {
        const pose = poses.find(pose => pose.id === firstSelectedObs.pose);
        pose.main_site_observation = firstSelectedObs.id;
        const poseDTO = copyPoseToPoseDTO(pose);
        dispatch(updatePose(poseDTO))
          .then(resp => {
            dispatch(updateLHSCompound(pose));
            toastInfo(`Main observation was set to ${firstSelectedObs.code} with id ${pose.main_site_observation}`, {
              autoHideDuration: 5000
            });
          })
          .catch(err => {
            console.log(err);
            const errorMessage = createPoseErrorMessage(err);
            if (errorMessage) {
              toastError(errorMessage, { autoHideDuration: 600000 });
            } else {
              toastError(err, { autoHideDuration: 600000 });
            }
          });
      }
    };

    const isMovingMainObservation = pose => {
      let result = false;

      moleculesToEditIds.includes(pose.main_site_observation) && pose.site_observations.length > 1 && (result = true);

      return result;
    };

    const isTryingToMoveAllObservations = pose => {
      let result = false;

      pose.site_observations.length > 1 &&
        pose.site_observations.length === moleculesToEditIds.length &&
        (result = true);

      return result;
    };

    const handleManageGrouping = async poseId => {
      const firstSelectedObs = observationsDataList.find(molecule => moleculesToEditIds.includes(molecule.id));
      if (firstSelectedObs) {
        let sourcePose = poses.find(pose => pose.id === firstSelectedObs.pose);
        if (!isMovingMainObservation(sourcePose)) {
          if (!isTryingToMoveAllObservations(sourcePose)) {
            let destinationPose = poses.find(pose => pose.id === poseId);
            try {
              if (poseId === 0) {
                if (sourcePose.site_observations.length > 1) {
                  sourcePose = dispatch(removeObservationsFromPose(sourcePose, moleculesToEditIds));
                  dispatch(createNewPose(sourcePose.canon_site, moleculesToEditIds)).then(newPose => {
                    destinationPose = newPose;
                    toastInfo(`Observations were successfully moved to new pose ${destinationPose.display_name}`, {
                      autoHideDuration: 5000
                    });
                  });
                } else {
                  toastWarning(
                    `You are trying to create a new observation from a observation which is alone in its observation. In this case you can move it only to already existing pose.`,
                    { autoHideDuration: 600000 }
                  );
                }
              } else {
                if (sourcePose.site_observations.length === 1) {
                  dispatch(setOpenObservationsDialog(false));
                  dispatch(setObservationsForLHSCmp([]));
                  dispatch(setPoseIdForObservationsDialog(0));

                  // dispatch(setObservationDialogAction(0, [], false));
                }
                sourcePose = dispatch(removeObservationsFromPose(sourcePose, moleculesToEditIds));
                destinationPose = await dispatch(addObservationsToPose(destinationPose, moleculesToEditIds));
                dispatch(updateObservationsInPose(destinationPose, moleculesToEditIds));

                toastInfo(`Observations were successfully moved to pose ${destinationPose.display_name}`, {
                  autoHideDuration: 5000
                });
              }
            } catch (error) {
              console.log(error);
              const errorMessage = createPoseErrorMessage(error);
              if (errorMessage) {
                toastError(errorMessage, { autoHideDuration: 600000 });
              } else {
                toastError(error, { autoHideDuration: 600000 });
              }
            }
          } else {
            toastWarning(
              `You are trying to move all observations to different pose. Please select less observations and try again.`,
              { autoHideDuration: 600000 }
            );
          }
        } else {
          toastWarning(
            `You are trying to move main observation to different pose. Please assing new main observation first and then try again.`,
            { autoHideDuration: 600000 }
          );
        }
      }
    };

    /**
     * Calculate available height for dialog window
     *
     * @returns {Number}
     */
    const getPanelHeight = useCallback(() => {
      let height = 0;
      if (anchorEl) {
        // available height of the window - top position of the anchor element, ie pose from hit navigator - "bottom margin"
        // const maxHeight = window.innerHeight - anchorEl?.getBoundingClientRect().top - 13;
        const observationsApproximateHeight = moleculeList.length * 47;
        const headerFooterApproximateHeight = 87;
        const totalApproximateHeight = observationsApproximateHeight + headerFooterApproximateHeight;
        /*if (totalApproximateHeight > maxHeight) {
          height = maxHeight;
        } else*/ if (totalApproximateHeight < MIN_PANEL_HEIGHT) {
          height = MIN_PANEL_HEIGHT;
        } else {
          height = totalApproximateHeight;
        }
      } else {
        height = MIN_PANEL_HEIGHT;
      }

      return height;
    }, [anchorEl, moleculeList.length]);

    /**
     * @param {string} category
     * @return {array}
     */
    const getTagsForCategory = useCallback(category => {
      const tagCategory = tagCategoriesList.find(tagCategory => tagCategory.category === category);
      return tagCategory ? tagList.filter(tag => {
        if (tag.category === tagCategory.id) {
          // console.log('good tag', { ...tag });
          return true;
        } else return false;
      }) : [];
    }, [tagCategoriesList, tagList]);

    const updateCmp = (cmp, obs) => {
      let newCmp = { ...cmp };
      const index = newCmp.associatedObs.findIndex(o => o.id === obs.id);
      if (index >= 0) {
        newCmp.associatedObs[index] = obs;
        dispatch(updateLHSCompound(newCmp));
      }
    };

    const tagObservations = async (tag, tagToExclude) => {
      try {
        // setTaggingInProgress(true);

        let tagColor = DEFAULT_TAG_COLOR;
        if (tag.colour && tag.colour !== '') {
          tagColor = tag.colour;
        } else {
          const tagCategory = dispatch(getCategoryById(tag.category));
          if (tagCategory) {
            tagColor = `#${tagCategory.colour}`;
          }
        }

        let molTagObjects = [];
        observationsDataList.forEach(m => {
          if (!m.tags_set.some(id => id === tag.id)) {
            let newMol = { ...m };
            newMol.tags_set.push(tag.id);
            // due to same cycle of tag and untag operations we need to exclude untagged tag because of "old" data
            newMol.tags_set = newMol.tags_set.filter(id => id !== tagToExclude.id);

            const pose = poses.find(p => p.site_observations.includes(m.id));
            updateCmp(pose, newMol);
            dispatch(updateMoleculeInMolLists(newMol));
            dispatch(updateMoleculeInLHSObservations(newMol));
            const moleculeTag = getMoleculeTagForTag(tagList, tag.id);
            let mtObject = molTagObjects.find(mto => mto.tag === tag.tag);

            if (mtObject) {
              mtObject.site_observations.push(newMol.id);
            } else {
              mtObject = createMoleculeTagObject(
                tag.tag,
                targetId,
                tag.category,
                DJANGO_CONTEXT.pk,
                tagColor,
                tag.discourse_url,
                [...moleculeTag.site_observations, newMol.id], // molecules:
                tag.create_date,
                tag.additional_info,
                tag.mol_group,
                tag.hidden,
                tag.tag_prefix,
                tag.upload_name
              );
              molTagObjects.push(mtObject);
            }
          }
        });
        if (molTagObjects) {
          for (const mto of molTagObjects) {
            let molTagObject = { ...mto };
            let augMolTagObject = augumentTagObjectWithId(molTagObject, tag.id);
            await updateExistingTag(molTagObject, tag.id);
            dispatch(updateMoleculeTag(augMolTagObject));
            dispatch(updateTag(augMolTagObject));
          }
        }
      } catch (e) {
        console.log(e);
        //dispatch(setIsErrorDuringTagging(true));
      } finally {
        // setTaggingInProgress(false);
      }
    };

    const untagObservations = async tag => {
      try {
        // setTaggingInProgress(true);

        let tagColor = DEFAULT_TAG_COLOR;
        if (tag.colour && tag.colour !== '') {
          tagColor = tag.colour;
        } else {
          const tagCategory = dispatch(getCategoryById(tag.category));
          if (tagCategory) {
            tagColor = `#${tagCategory.colour}`;
          }
        }

        let molTagObjects = [];
        observationsDataList.forEach(m => {
          let newMol = { ...m };
          newMol.tags_set = newMol.tags_set.filter(id => id !== tag.id);

          const pose = poses.find(p => p.site_observations.includes(m.id));
          updateCmp(pose, newMol);
          dispatch(updateMoleculeInMolLists(newMol));
          dispatch(updateMoleculeInLHSObservations(newMol));
          const moleculeTag = getMoleculeTagForTag(tagList, tag.id);
          let mtObject = molTagObjects.find(mto => mto.tag === tag.tag);

          if (mtObject) {
            mtObject.site_observations = mtObject.site_observations.filter(id => id !== m.id);
          } else {
            let newMolList = [...moleculeTag.site_observations];
            newMolList = newMolList.filter(id => id !== m.id);
            mtObject = createMoleculeTagObject(
              tag.tag,
              targetId,
              tag.category,
              DJANGO_CONTEXT.pk,
              tagColor,
              tag.discourse_url,
              newMolList, // molecules:
              tag.create_date,
              tag.additional_info,
              tag.mol_group,
              tag.hidden,
              tag.tag_prefix,
              tag.upload_name
            );
            molTagObjects.push(mtObject);
          }
        });
        if (molTagObjects) {
          for (const mto of molTagObjects) {
            let molTagObject = { ...mto };
            let augMolTagObject = augumentTagObjectWithId(molTagObject, tag.id);
            await updateExistingTag(molTagObject, tag.id);
            dispatch(updateMoleculeTag(augMolTagObject));
            dispatch(updateTag(augMolTagObject));
          }
        }
      } catch (e) {
        console.log(e);
        //dispatch(setIsErrorDuringTagging(true));
      } finally {
        // setTaggingInProgress(false);
      }
    };

    const getMainTagByCategory = categoryId => {
      const firstSelectedObs = observationsDataList[0];
      if (firstSelectedObs) {
        // console.log('firstSelectedObs?', { ...firstSelectedObs });
        const pose = poses.find(pose => pose.id === firstSelectedObs.pose);
        const mainObservation = observationsDataList.find(observation => observation.id === pose.main_site_observation);
        if (mainObservation) {
          // tagList.filter(tag => {

          //   if (tag.category === categoryId && mainObservation.tags_set.includes(tag.id)) {
          //     console.log('tag.category', tag.category)
          //     console.log('categoryId', categoryId)
          //     console.log('mainObservation.tags_set', mainObservation.tags_set)
          //     console.log('tag.id', tag.id)
          //     return true;
          //   } else {
          //     return false;
          //   }
          // }).forEach(tag => console.log('in list', { ...tag }));
          return tagList.find(tag => tag.category === categoryId && mainObservation.tags_set.includes(tag.id));
        }
      }
      return null;
    };

    /**
     * Change the generated tags for all observations in a pose
     *
     * @param {*} tag
     */
    const handleXCAtagChange = async tag => {
      const mainObservationTag = getMainTagByCategory(tag.category);
      // do not retag same tag
      if (mainObservationTag && mainObservationTag.id === tag.id) return;
      // untag first
      if (mainObservationTag) {
        await untagObservations(mainObservationTag);
      }
      // then tag
      await tagObservations(tag, mainObservationTag);
      toastInfo(`Tag for observations was changed from "${mainObservationTag.upload_name}" to "${tag.upload_name}". They could disappear based on your tag selection`, { autoHideDuration: 5000 });
    };

    return (
      <Popper id={id} open={open} anchorEl={anchorEl} placement="left-start" ref={ref}>
        <Panel
          hasHeader
          secondaryBackground
          title="Observations"
          className={classes.paper}
          style={{ height: getPanelHeight() }}
          headerActions={[
            <SearchField
              className={classes.search}
              id="search-inspiration-dialog"
              placeholder="Search"
              size="small"
              onChange={setSearchString}
              disabled={!(isLoadingInspirationListOfMolecules === false && moleculeList)}
            />,
            <Tooltip title="Close observations">
              <IconButton
                color="inherit"
                className={classes.headerButton}
                onClick={() => {
                  dispatch(setOpenObservationsDialog(false));
                  dispatch(setObservationsForLHSCmp([]));
                  dispatch(setPoseIdForObservationsDialog(0));

                  dispatch(setObservationDialogAction(0, [], false, poseIdForDialog, observationsDataList));
                }}
              >
                <Close />
              </IconButton>
            </Tooltip>
          ]}
        >
          {isTagEditorOpenObs && (
            <TagEditor
              open={isTagEditorOpenObs}
              closeDisabled={anyControlButtonDisabled}
              setOpenDialog={setTagEditorOpenObs}
              anchorEl={tagEditorAnchorEl}
              ref={tagEditorRef}
            />
          )}
          {isLoadingInspirationListOfMolecules === false && moleculeList && (
            <Grid container direction="column" justifyContent="flex-start" className={classes.container}>
              <Grid item>
                <Grid container justifyContent="flex-start" direction="row" className={classes.molHeader} wrap="nowrap">
                  <Grid item container justifyContent="flex-start" direction="row" className={classes.topRow}>
                    {/* {Object.keys(moleculeProperty).map(key => (
                      <Grid item key={key} className={classes.rightBorder}>
                        {moleculeProperty[key]}
                      </Grid>
                    ))} */}
                    <Grid item xs>
                      <Grid
                        container
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="center"
                        className={classes.bottomRow}
                      >
                        <Grid item>
                          <Grid container direction="row" justifyContent="flex-start" alignItems="center" wrap="nowrap">
                            <Tooltip title="all ligands">
                              <Grid item>
                                <Button
                                  variant="outlined"
                                  className={classNames(classes.contColButton, {
                                    [classes.contColButtonSelected]: isLigandOnForClassname,
                                    [classes.contColButtonHalfSelected]: isLigandOnForClassname === null
                                  })}
                                  onClick={() => onButtonToggle('ligand')}
                                  disabled={
                                    groupNglControlButtonsDisabledState.ligand || allSelectedMolecules.length < 1
                                  }
                                >
                                  L
                                </Button>
                              </Grid>
                            </Tooltip>
                            <Tooltip title="all sidechains">
                              <Grid item>
                                <Button
                                  variant="outlined"
                                  className={classNames(classes.contColButton, {
                                    [classes.contColButtonSelected]: isProteinOnForClassname,
                                    [classes.contColButtonHalfSelected]: isProteinOnForClassname === null
                                  })}
                                  onClick={() => onButtonToggle('protein')}
                                  disabled={
                                    groupNglControlButtonsDisabledState.protein || allSelectedMolecules.length < 1
                                  }
                                >
                                  P
                                </Button>
                              </Grid>
                            </Tooltip>
                            <Tooltip title="all interactions">
                              <Grid item>
                                {/* C stands for contacts now */}
                                <Button
                                  variant="outlined"
                                  className={classNames(classes.contColButton, {
                                    [classes.contColButtonSelected]: isComplexOnForClassname,
                                    [classes.contColButtonHalfSelected]: isComplexOnForClassname === null
                                  })}
                                  onClick={() => onButtonToggle('complex')}
                                  disabled={
                                    groupNglControlButtonsDisabledState.complex || allSelectedMolecules.length < 1
                                  }
                                >
                                  C
                                </Button>
                              </Grid>
                            </Tooltip>
                          </Grid>
                        </Grid>
                        <Grid item>
                          <Button
                            onClick={handleSelectAllObservations}
                            color="inherit"
                            variant="text"
                            size="small"
                            data-id="selectAllObservations"
                            className={classNames(classes.contColButton, classes.contColButtonBottomRow)}
                          >
                            {areAllMoleculesSelected ? 'Unselect all' : 'Select all'}
                          </Button>
                        </Grid>
                        <Grid item>
                          <Button
                            onClick={handleSelectAllDisplayedObservations}
                            disabled={!(isLigandOn || isProteinOn || isComplexOn)}
                            color="inherit"
                            variant="text"
                            size="small"
                            data-id="selectAllDisplayedObservations"
                            className={classNames(classes.contColButton, classes.contColButtonBottomRow)}
                          >
                            Select all displayed
                          </Button>
                        </Grid>
                        {expandView && (
                          <Grid
                            item
                            xs
                            container
                            alignItems="center"
                            style={{ marginLeft: 95 }}
                          >
                            {XCA_TAGS_CATEGORIES.map(
                              (tagCategory, index) => (
                                <Grid item align="center" key={index} className={classes.headerCell} style={{ minWidth: headerWidths[tagCategory] }}>
                                  {PLURAL_TO_SINGULAR[tagCategory]}
                                </Grid>
                              )
                            )}
                            <Grid item align="center" className={classes.headerCell} style={{ minWidth: headerWidths.CentroidRes }}>
                              CentroidRes
                            </Grid>
                            <Grid item align="center" className={classes.headerCell} style={{ minWidth: headerWidths.LongCode }}>
                              LongCode
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                      <Tooltip title={expandView ? 'Show classic view' : 'Show expanded view'}>
                        <Grid item className={classes.popoutIcon}>
                          <IconButton color="inherit" size="small" onClick={() => setExpandView(!expandView)}>
                            {expandView ? <ArrowLeft /> : <ArrowRight />}
                          </IconButton>
                        </Grid>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item className={classes.content}>
                {moleculeList.length > 0 &&
                  moleculeList.map((molecule, index, array) => {
                    let data = molecule;
                    let previousData = index > 0 && { ...array[index - 1] };
                    let nextData = index < array?.length && { ...array[index + 1] };
                    const selected = allSelectedMolecules.some(molecule => molecule.id === data.id);

                    return (
                      <GroupNglControlButtonsContext.Provider key={index} value={groupNglControlButtonsDisabledState}>
                        <MoleculeView
                          key={index}
                          index={index}
                          imageHeight={imgHeight}
                          imageWidth={imgWidth}
                          data={data}
                          searchMoleculeGroup
                          previousItemData={previousData}
                          nextItemData={nextData}
                          removeSelectedTypes={removeSelectedTypes}
                          L={ligandList.includes(molecule.id)}
                          P={proteinList.includes(molecule.id)}
                          C={complexList.includes(molecule.id)}
                          S={surfaceList.includes(molecule.id)}
                          D={densityList.includes(molecule.id)}
                          D_C={densityListCustom.includes(data.id)}
                          Q={qualityList.includes(molecule.id)}
                          V={vectorOnList.includes(molecule.id)}
                          I={informationList.includes(data.id)}
                          selected={selected}
                          isTagEditorInvokedByMolecule={molForTagEditId.some(mid => mid === data.id)}
                          disableL={selected && groupNglControlButtonsDisabledState.ligand}
                          disableP={selected && groupNglControlButtonsDisabledState.protein}
                          disableC={selected && groupNglControlButtonsDisabledState.complex}
                          setRef={setTagEditorAnchorEl}
                          hideImage={true}
                          showExpandedView={expandView}
                          headerWidths={headerWidths}
                          setHeaderWidthsHandler={setHeaderWidthsHandler}
                        />
                      </GroupNglControlButtonsContext.Provider>
                    );
                  })}
                {!(moleculeList.length > 0) && (
                  <Grid
                    container
                    justifyContent="center"
                    alignItems="center"
                    direction="row"
                    className={classes.notFound}
                  >
                    <Grid item>
                      <Typography variant="body2">No molecules found!</Typography>
                    </Grid>
                  </Grid>
                )}
              </Grid>
              {DJANGO_CONTEXT.pk && (
                <Grid item>
                  <Grid
                    container
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    className={classNames(classes.bottomRow, classes.molHeader)}
                  >
                    <Grid item>
                      <Button
                        onClick={handleSetMainObservation}
                        disabled={allSelectedMolecules.length !== 1}
                        color="inherit"
                        variant="text"
                        size="small"
                        data-id="setMainObservation"
                        className={classNames(classes.contColButton, classes.contColButtonBottomRow)}
                      >
                        Set main observation
                      </Button>
                    </Grid>
                    <Grid item className={classNames({ [classes.dropdown]: allSelectedMolecules.length > 0 })}>
                      <Button
                        disabled={allSelectedMolecules.length < 1}
                        color="inherit"
                        variant="text"
                        size="small"
                        data-id="manageGrouping"
                        endIcon={<KeyboardArrowDown />}
                        className={classNames(classes.contColButton, classes.contColButtonBottomRow)}
                      >
                        Manage poses
                      </Button>
                      <Grid container direction="column" className={classes.dropdownContent}>
                        <Grid item className={classes.dropdownItem} onClick={() => handleManageGrouping(0)}>
                          new pose from selection
                        </Grid>
                        {/* TODO just a placeholder for poses here */}
                        {compatiblePoses?.map(pose => (
                          <Grid item className={classes.dropdownItem} onClick={() => handleManageGrouping(pose.id)}>
                            move selection to {pose.display_name}
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                    <Grid item className={classNames({ [classes.dropdown]: true })} style={{ marginRight: 9 }}>
                      <Button
                        color="inherit"
                        variant="text"
                        size="small"
                        data-id="manageGrouping"
                        endIcon={<KeyboardArrowDown />}
                        className={classNames(classes.contColButton, classes.contColButtonBottomRow)}
                      >
                        Change XCA tags
                      </Button>
                      <Grid container direction="row" className={classes.dropdownContent}>
                        {XCA_TAG_CATEGORIES.map(category =>
                          <Grid key={category} item className={classNames(classes.dropdown, classes.dropdownItem)}>
                            Change {PLURAL_TO_SINGULAR[category]}
                            <Grid container direction="row" className={classNames(classes.dropdownContent, classes.dropdownContentSide)}>
                              {getTagsForCategory(category)?.map(tag => (
                                <Grid key={tag.id} item className={classes.dropdownItem} onClick={() => handleXCAtagChange(tag)}>
                                  {tag.upload_name}
                                </Grid>
                              ))}
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          )}
          {isLoadingInspirationListOfMolecules === true && (
            <Grid container alignItems="center" justifyContent="center">
              <Grid item>
                <CircularProgress />
              </Grid>
            </Grid>
          )}
        </Panel>
      </Popper>
    );
  })
);
