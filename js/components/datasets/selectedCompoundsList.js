import React, { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Panel } from '../common/Surfaces/Panel';
import {
  CircularProgress,
  Grid,
  makeStyles,
  Typography,
  Button,
  TextField,
  Checkbox,
  InputAdornment,
  IconButton
} from '@material-ui/core';
import { ArrowDownward, ArrowUpward, CloudDownload, Edit } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  getMoleculesObjectIDListOfCompoundsToBuy,
  getListOfSelectedComplexOfAllDatasets,
  getListOfSelectedLigandOfAllDatasets,
  getListOfSelectedProteinOfAllDatasets,
  getListOfSelectedSurfaceOfAllDatasets
} from './redux/selectors';
import InfiniteScroll from 'react-infinite-scroller';
import DatasetMoleculeView from './datasetMoleculeView';
import { InspirationDialog } from './inspirationDialog';
import {
  setCrossReferenceCompoundName,
  setIsOpenInspirationDialog,
  setIsOpenLockVisibleCompoundsDialogGlobal,
  setSelectedCompoundsList
} from './redux/actions';
import { CrossReferenceDialog } from './crossReferenceDialog';
import {
  autoHideDatasetDialogsOnScroll,
  getAllVisibleButNotLockedSelectedCompounds,
  getInspirationsForMol,
  isCompoundLocked,
  isCompoundVisible,
  moveDatasetMoleculeUpDown,
  moveSelectedDatasetMoleculeUpDown,
  resetCrossReferenceDialog
} from './redux/dispatchActions';
import { NglContext } from '../nglView/nglProvider';
import FileSaver from 'file-saver';
import JSZip from 'jszip';
import {
  isCompoundFromVectorSelector,
  onChangeCompoundClassValue,
  onClickFilterClass,
  onClickFilterClassCheckBox,
  onKeyDownCompoundClass,
  onKeyDownFilterClass,
  onStartEditColorClassName
} from '../preview/compounds/redux/dispatchActions';
import { saveAndShareSnapshot } from '../snapshot/redux/dispatchActions';
import { setDontShowShareSnapshot, setSharedSnapshot } from '../snapshot/redux/actions';
import { initSharedSnapshot } from '../snapshot/redux/reducer';
import { base_url } from '../routes/constants';
import { api, METHOD } from '../../utils/api';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { compoundsColors } from '../preview/compounds/redux/constants';
import classNames from 'classnames';
import { fabClasses } from '@mui/material';
import { is } from 'date-fns/locale';
import { LockVisibleCompoundsDialog } from './lockVisibleCompoundsDialog';
import { BreakfastDiningOutlined } from '@mui/icons-material';
import { getRandomColor } from '../preview/molecule/utils/color';
import { ARROW_TYPE, VIEWS } from '../../constants/constants';
import { useScrollToCompound } from './useScrollToCompound';
import useDisableNglControlButtons from '../preview/molecule/useDisableNglControlButtons';
import useDisableDatasetNglControlButtons from './useDisableDatasetNglControlButtons';

const useStyles = makeStyles(theme => ({
  container: {
    height: '100%',
    width: 'inherit',
    color: theme.palette.black
  },
  paddingProgress: {
    padding: theme.spacing(1)
  },
  gridItemList: {
    overflow: 'auto',
    height: `calc(100% - ${theme.spacing(6)}px)`
  },
  notFound: {
    paddingTop: theme.spacing(2)
  },
  sdfButton: {
    marginRight: theme.spacing(1)
  },
  [compoundsColors.blue.key]: {
    backgroundColor: compoundsColors.blue.color
  },
  [compoundsColors.red.key]: {
    backgroundColor: compoundsColors.red.color
  },
  [compoundsColors.green.key]: {
    backgroundColor: compoundsColors.green.color
  },
  [compoundsColors.purple.key]: {
    backgroundColor: compoundsColors.purple.color
  },
  [compoundsColors.apricot.key]: {
    backgroundColor: compoundsColors.apricot.color
  },
  textField: {
    marginLeft: theme.spacing(0.5),
    // marginRight: theme.spacing(1),
    width: 90,
    borderRadius: 10,

    '& .MuiFormLabel-root': {
      paddingLeft: theme.spacing(1)
    },
    '& .MuiInput-underline:before': {
      borderBottom: '0px solid'
    },
    '& .MuiInput-underline:after': {
      borderBottom: '0px solid'
    }
  },
  selectedInput: {
    border: `2px groove ${theme.palette.primary.main}`
  },
  classCheckbox: {
    padding: '0px'
  },
  editClassNameIcon: {
    padding: '0px',
    color: 'inherit'
  },
  editClassNameIconSelected: {
    padding: '0px',
    color: 'red'
  },
  arrowsHighlight: {
    borderColor: theme.palette.primary.main,
    border: 'solid 2px',
    backgroundColor: theme.palette.primary.main
  },
  arrow: {
    width: 20,
    height: 25,
    color: 'white',
    stroke: 'white',
    strokeWidth: 2
  },
  iconButton: {
    padding: 0,
    marginTop: '2px'
  },
  invisArrow: {
    width: 20,
    height: 25,
    visibility: 'hidden'
  },
  arrows: {
    height: '100%',
    border: 'solid 1px',
    borderColor: theme.palette.background.divider,
    borderStyle: 'solid solid solid solid'
  }
}));

export const SelectedCompoundList = memo(() => {
  const classes = useStyles();

  const imgHeight = 49;
  const imgWidth = 150;
  const moleculesPerPage = 5;
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const moleculesObjectIDListOfCompoundsToBuy = useSelector(getMoleculesObjectIDListOfCompoundsToBuy);
  const isOpenInspirationDialog = useSelector(state => state.datasetsReducers.isOpenInspirationDialog);
  const isOpenCrossReferenceDialog = useSelector(state => state.datasetsReducers.isOpenCrossReferenceDialog);
  const [selectedMoleculeRef, setSelectedMoleculeRef] = useState(null);
  const inspirationDialogRef = useRef();
  const crossReferenceDialogRef = useRef();
  const scrollBarRef = useRef();
  const editedColorGroup = useSelector(state => state.datasetsReducers.editedColorGroup);

  const { nglViewList } = useContext(NglContext);

  const loadNextMolecules = () => {
    setCurrentPage(currentPage + 1);
  };

  const listItemOffset = (currentPage + 1) * moleculesPerPage;
  const currentMolecules = moleculesObjectIDListOfCompoundsToBuy.slice(0, listItemOffset);
  const canLoadMore = listItemOffset < moleculesObjectIDListOfCompoundsToBuy.length;

  const ligandList = useSelector(state => getListOfSelectedLigandOfAllDatasets(state));
  const proteinList = useSelector(state => getListOfSelectedProteinOfAllDatasets(state));
  const complexList = useSelector(state => getListOfSelectedComplexOfAllDatasets(state));
  const surfaceList = useSelector(state => getListOfSelectedSurfaceOfAllDatasets(state));

  const showedCompoundList = useSelector(state => state.previewReducers.compounds.showedCompoundList);
  const filteredScoreProperties = useSelector(state => state.datasetsReducers.filteredScoreProperties);

  const moleculeLists = useSelector(state => state.datasetsReducers.moleculeLists);
  const compoundsToBuyList = useSelector(state => state.datasetsReducers.compoundsToBuyDatasetMap);
  let selectedMolecules = [];
  Object.keys(compoundsToBuyList).forEach(datasetId => {
    const datasetCmpsToBuy = compoundsToBuyList[datasetId] || [];
    const molsOfDataset = moleculeLists[datasetId] || [];
    selectedMolecules = [...selectedMolecules, ...molsOfDataset.filter(mol => datasetCmpsToBuy?.includes(mol.id))];
  });

  const { addMoleculeViewRef, setScrollToMoleculeId, getNode } = useScrollToCompound();

  const currentCompoundClass = useSelector(state => state.previewReducers.compounds.currentCompoundClass);

  // const groupDatasetsNglControlButtonsDisabledState = useDisableDatasetNglControlButtons(
  //   lockedMolecules.map(cid => ({ datasetID, molecule: getCompoundForId(cid) }))
  // );

  const askLockSelectedCompoundsQuestion = useSelector(
    state => state.datasetsReducers.askLockSelectedCompoundsQuestion
  );

  const lockVisibleCompoundsDialogRef = useRef();
  const isLockVisibleCompoundsDialogOpenGlobal = useSelector(
    state => state.datasetsReducers.isLockVisibleCompoundsDialogOpenGlobal
  );

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const blueInput = useSelector(state => state.previewReducers.compounds[compoundsColors.blue.key]);
  const redInput = useSelector(state => state.previewReducers.compounds[compoundsColors.red.key]);
  const greenInput = useSelector(state => state.previewReducers.compounds[compoundsColors.green.key]);
  const purpleInput = useSelector(state => state.previewReducers.compounds[compoundsColors.purple.key]);
  const apricotInput = useSelector(state => state.previewReducers.compounds[compoundsColors.apricot.key]);

  const inputs = {
    [compoundsColors.blue.key]: blueInput,
    [compoundsColors.red.key]: redInput,
    [compoundsColors.green.key]: greenInput,
    [compoundsColors.purple.key]: purpleInput,
    [compoundsColors.apricot.key]: apricotInput
  };

  const inputRefs = {
    [compoundsColors.blue.key]: useRef(),
    [compoundsColors.red.key]: useRef(),
    [compoundsColors.green.key]: useRef(),
    [compoundsColors.purple.key]: useRef(),
    [compoundsColors.apricot.key]: useRef()
  };

  const compoundColors = useSelector(state => state.datasetsReducers.compoundColorByDataset);

  const colorFilterSettings = useSelector(state => state.datasetsReducers.selectedColorsInFilter);

  const [lockCompoundsDialogAnchorE1, setLockCompoundsDialogAnchorE1] = useState(null);

  //we need to add also lists to dependancy array because isCompoundVisible depends on them
  useEffect(() => {
    dispatch(setSelectedCompoundsList(moleculesObjectIDListOfCompoundsToBuy));
  }, [moleculesObjectIDListOfCompoundsToBuy, dispatch]);

  let areArrowsVisible = useMemo(() => {
    let result = false;
    if (moleculesObjectIDListOfCompoundsToBuy) {
      for (let i = 0; i < moleculesObjectIDListOfCompoundsToBuy.length; i++) {
        const cmp = moleculesObjectIDListOfCompoundsToBuy[i];
        const dataset = cmp.datasetID;
        const molecule = cmp.molecule;
        const isVisible = dispatch(isCompoundVisible(dataset, molecule.id));
        if (isVisible) {
          result = true;
          break;
        }
      }
    }
    return result;
  }, [dispatch, moleculesObjectIDListOfCompoundsToBuy]);
  // if (!moleculesObjectIDListOfCompoundsToBuy) {
  //   for (let i = 0; i < moleculesObjectIDListOfCompoundsToBuy.length; i++) {
  //     const cmp = moleculesObjectIDListOfCompoundsToBuy[i];
  //     const dataset = cmp.datasetID;
  //     const molecule = cmp.molecule;
  //     const isVisible = dispatch(isCompoundVisible(dataset, molecule.id));
  //     if (isVisible) {
  //       areArrowsVisible = true;
  //       break;
  //     }
  //   }
  // }

  useEffect(() => {
    return () => {
      dispatch(setIsOpenInspirationDialog(false));
      dispatch(resetCrossReferenceDialog());
    };
  }, [dispatch]);

  const getSetOfProps = filteredCompounds => {
    const unionOfProps = new Set();
    const usedDatasets = {};

    unionOfProps.add('smiles');

    Object.keys(filteredScoreProperties).forEach(datasetName => {
      if (usedDatasets.hasOwnProperty(datasetName)) {
        const dataset = filteredScoreProperties[datasetName];
        dataset.forEach(prop => {
          if (prop.hasOwnProperty('computed_set')) {
            unionOfProps.add(prop.name);
          }
        });
      }
    });

    filteredCompounds.forEach(compound => {
      const datasetName = compound.datasetID;
      if (!usedDatasets.hasOwnProperty(datasetName)) {
        const mol = compound.molecule;
        if (mol.hasOwnProperty('numerical_scores')) {
          const numericalScores = mol['numerical_scores'];
          Object.keys(numericalScores).forEach(key => {
            unionOfProps.add(key);
          });
        }
        if (mol.hasOwnProperty('text_scores')) {
          const textScores = mol['text_scores'];
          Object.keys(textScores).forEach(key => {
            unionOfProps.add(key);
          });
        }
        usedDatasets[datasetName] = true;
      }
    });

    return [...unionOfProps];
  };

  const populateMolObject = (molObj, compound, props, ids) => {
    const molecule = compound.molecule;

    molObj = populateMolIds(molObj, compound, ids);

    let value = '';
    for (let i = 0; i < props.length; i++) {
      value = '';
      const prop = props[i];
      if (molecule.hasOwnProperty(prop)) {
        value = molecule[prop];
      } else {
        let mapOfNumScores = undefined;
        let mapOfTextScores = undefined;
        if (molecule.hasOwnProperty('numerical_scores')) {
          mapOfNumScores = molecule['numerical_scores'];
        }
        if (molecule.hasOwnProperty('text_scores')) {
          mapOfTextScores = molecule['text_scores'];
        }
        if (mapOfNumScores !== undefined) {
          if (mapOfNumScores.hasOwnProperty(prop)) {
            value = mapOfNumScores[prop];
          }
        }
        if (mapOfTextScores !== undefined) {
          if (mapOfTextScores.hasOwnProperty(prop)) {
            value = mapOfTextScores[prop];
          }
        }
      }

      molObj[prop] = value;
    }

    return molObj;
  };

  const populateMolIds = (molObj, compound, idsGlobal) => {
    if (compound.molecule.hasOwnProperty('compound_ids')) {
      const ids = compound.molecule['compound_ids'];
      let vendorsPerMol = {};
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const splitId = id.split(':');
        const vendorId = splitId[0];
        const idVal = splitId[1];
        if (vendorsPerMol.hasOwnProperty(vendorId)) {
          vendorsPerMol[vendorId] += 1;
        } else {
          vendorsPerMol[vendorId] = 0;
        }

        molObj[idsGlobal.diffIds[vendorId].fieldsArray[vendorsPerMol[vendorId]]] = idVal;
      }
    }

    return molObj;
  };

  const getCompoundIds = mols => {
    let result = { diffIds: {}, namesToIds: {}, idsInOrder: new Set() };

    mols.forEach(mol => {
      if (mol.molecule.hasOwnProperty('compound_ids')) {
        const ids = mol.molecule['compound_ids'];
        const perMolVendors = {};
        ids.forEach(id => {
          let vendorId = id.split(':')[0];
          if (!result.diffIds.hasOwnProperty(vendorId)) {
            perMolVendors[vendorId] = 1;
            const idFieldName = vendorId;
            result.diffIds[vendorId] = { count: 1, name: vendorId, fields: {}, fieldsArray: [] };
            result.diffIds[vendorId].fields[idFieldName] = idFieldName;
            result.diffIds[vendorId].fieldsArray.push(idFieldName);
            result.namesToIds[idFieldName] = vendorId;
            result.idsInOrder.add(idFieldName);
          } else {
            if (perMolVendors.hasOwnProperty(vendorId)) {
              const perMolVendorCount = perMolVendors[vendorId];
              const globalVendor = result.diffIds[vendorId];
              if (perMolVendorCount >= globalVendor.count) {
                const idFieldName = `${vendorId}_${perMolVendorCount}`;
                perMolVendors[vendorId] = perMolVendorCount + 1;
                globalVendor.count = globalVendor.count + 1;
                result.diffIds[vendorId].fields[idFieldName] = idFieldName;
                result.diffIds[vendorId].fieldsArray.push(idFieldName);
                result.namesToIds[idFieldName] = vendorId;
                result.idsInOrder.add(idFieldName);
              }
            } else {
              perMolVendors[vendorId] = 1;
            }
          }
        });
      }
    });

    return result;
  };

  const getEmptyMolObject = (props, ids) => {
    let molObj = {};

    ids.idsInOrder.forEach(id => {
      molObj[id] = '';
    });

    props.forEach(prop => {
      molObj[prop] = '';
    });

    return molObj;
  };

  const downloadAsCsv = () => (dispatch, getState) => {
    dispatch(setDontShowShareSnapshot(true));
    dispatch(saveAndShareSnapshot(nglViewList, false, {})).then(() => {
      const state = getState();
      const sharedSnapshot = state.snapshotReducers.sharedSnapshot;

      dispatch(setSharedSnapshot(initSharedSnapshot));
      dispatch(setDontShowShareSnapshot(false));

      const filteredCompounds = moleculesObjectIDListOfCompoundsToBuy.filter(data => {
        let isVisible = false;
        const cmpColorsForDataset = compoundColors[data.datasetID];
        if (cmpColorsForDataset && cmpColorsForDataset.hasOwnProperty(data.molecule.id)) {
          const shoppingCartColors = cmpColorsForDataset[data.molecule.id];
          for (let i = 0; i < shoppingCartColors.length; i++) {
            const color = shoppingCartColors[i];
            isVisible = colorFilterSettings.hasOwnProperty(color);
            if (isVisible) {
              break;
            }
          }
        } else if (isCompoundFromVectorSelector(data.molecule)) {
          isVisible = colorFilterSettings.hasOwnProperty(data.molecule.class);
        }

        return isVisible;
      });

      const props = getSetOfProps(filteredCompounds);
      const ids = getCompoundIds(filteredCompounds);

      const listOfMols = [];

      let colorsTemplate = {};
      filteredCompounds.forEach(compound => {
        let shoppingCartColors = [];
        if (isCompoundFromVectorSelector(compound.molecule)) {
          shoppingCartColors = [compound.molecule.class];
        } else {
          const cmpColorsForDataset = compoundColors[compound.datasetID];
          shoppingCartColors = cmpColorsForDataset[compound.molecule.id];
        }
        shoppingCartColors.forEach(color => {
          if (!colorsTemplate.hasOwnProperty(color)) {
            colorsTemplate[color] = '';
            if (inputs.hasOwnProperty(color) && inputs[color]) {
              colorsTemplate[`${color}-text`] = inputs[color];
            }
          }
        });
      });

      const hasName = filteredCompounds.find(cmp => !!cmp.molecule.name);
      let maxNumOfInspirations = 0;
      const allInspirations = state.datasetsReducers.allInspirations;
      filteredCompounds.forEach(cmp => {
        const inspirations = getInspirationsForMol(allInspirations, cmp.datasetID, cmp.molecule.id);
        if (inspirations?.length > maxNumOfInspirations) {
          maxNumOfInspirations = inspirations.length;
        }
      });

      filteredCompounds.forEach(compound => {
        let molObj = getEmptyMolObject(props, ids);

        if (hasName) {
          molObj['name'] = compound.molecule.name ? compound.molecule.name : '';
        }

        molObj['compound_set'] = compound.datasetID;

        molObj = populateMolObject(molObj, compound, props, ids);

        if (maxNumOfInspirations) {
          const inspirations = getInspirationsForMol(allInspirations, compound.datasetID, compound.molecule.id);
          for (let i = 0; i < maxNumOfInspirations; i++) {
            if (inspirations?.[i]) {
              molObj[`inspiration_${i + 1}`] = inspirations[i].code;
            } else {
              molObj[`inspiration_${i + 1}`] = '';
            }
          }
        }

        let shoppingCartColors = [];
        if (isCompoundFromVectorSelector(compound.molecule)) {
          shoppingCartColors = [compound.molecule.class];
        } else {
          const cmpColorsForDataset = compoundColors[compound.datasetID];
          shoppingCartColors = cmpColorsForDataset[compound.molecule.id];
        }
        let colorsTemplateCopy = { ...colorsTemplate };
        shoppingCartColors.forEach(color => {
          colorsTemplateCopy[color] = true;
        });

        Object.keys(colorsTemplateCopy)
          .filter(key => key.includes('-text'))
          .forEach(key => {
            const color = key.split('-')[0];
            if (colorsTemplateCopy.hasOwnProperty(color) && !colorsTemplateCopy[color]) {
              colorsTemplateCopy[key] = '';
            }
          });

        molObj = { ...molObj, ...colorsTemplateCopy };

        listOfMols.push(molObj);
      });

      const reqObj = { title: sharedSnapshot.url, dict: listOfMols };
      const jsonString = JSON.stringify(reqObj);

      api({
        url: `${base_url}/api/dicttocsv/`,
        method: METHOD.POST,
        data: jsonString
      }).then(resp => {
        var anchor = document.createElement('a');
        anchor.href = `${base_url}/api/dicttocsv/?file_url=${resp.data['file_url']}`;
        anchor.target = '_blank';
        anchor.download = 'download';
        anchor.click();
      });
    });
  };

  const downloadAsSdf = async () => {
    const zip = new JSZip();
    const folders = {};

    moleculesObjectIDListOfCompoundsToBuy.forEach(compound => {
      const datasetID = compound.datasetID;
      let folder = folders[datasetID];
      if (!folder) {
        folder = zip.folder(datasetID);
        folders[datasetID] = folder;
      }

      const { name, sdf_info } = compound.molecule;
      folder.file(`${name}.sdf`, sdf_info);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    FileSaver.saveAs(zipBlob, 'selectedCompounds.zip');
  };

  const getFirstItemForIterationStart = () => {
    let result = null;
    for (let i = 0; i < moleculesObjectIDListOfCompoundsToBuy.length; i++) {
      const cmp = moleculesObjectIDListOfCompoundsToBuy[i];
      if (!dispatch(isCompoundLocked(cmp.datasetID, cmp.molecule)) && !isCompoundFromVectorSelector(cmp.molecule)) {
        const isVisible = dispatch(isCompoundVisible(cmp.datasetID, cmp.molecule.id));
        if (isVisible) {
          result = cmp;
          break;
        }
      }
    }

    return result;
  };

  const getNextItemForIteration = currentItem => {
    let result = null;

    const currentItemIndex = moleculesObjectIDListOfCompoundsToBuy.findIndex(
      cmp => cmp.molecule.id === currentItem.molecule.id && cmp.datasetID === currentItem.datasetID
    );
    for (let i = currentItemIndex + 1; i < moleculesObjectIDListOfCompoundsToBuy.length; i++) {
      const cmp = moleculesObjectIDListOfCompoundsToBuy[i];
      if (!dispatch(isCompoundLocked(cmp.datasetID, cmp.molecule)) && !isCompoundFromVectorSelector(cmp.molecule)) {
        result = cmp;
        break;
      }
    }

    return result;
  };

  const getPrevItemForIteration = currentItem => {
    let result = null;

    const currentItemIndex = moleculesObjectIDListOfCompoundsToBuy.findIndex(
      cmp => cmp.molecule.id === currentItem.molecule.id && cmp.datasetID === currentItem.datasetID
    );
    for (let i = currentItemIndex - 1; i >= 0; i--) {
      const cmp = moleculesObjectIDListOfCompoundsToBuy[i];
      if (!dispatch(isCompoundLocked(cmp.datasetID, cmp.molecule)) && !isCompoundFromVectorSelector(cmp.molecule)) {
        result = cmp;
        break;
      }
    }

    return result;
  };

  const handleClickOnDownArrow = async event => {
    const unlockedVisibleCompounds = dispatch(getAllVisibleButNotLockedSelectedCompounds());
    //one unlocked compound is what we want because it designate where the iteration will start
    if (unlockedVisibleCompounds?.length > 1 && askLockSelectedCompoundsQuestion) {
      setLockCompoundsDialogAnchorE1(event.currentTarget);
      dispatch(setIsOpenLockVisibleCompoundsDialogGlobal(true));
    } else {
      const firstItem = getFirstItemForIterationStart();
      const nextItem = getNextItemForIteration(firstItem);

      if (firstItem && nextItem) {
        const moleculeTitleNext = nextItem && nextItem.molecule?.name;
        const node = getNode(nextItem.molecule?.id);
        setScrollToMoleculeId(nextItem.molecule?.id);

        let dataValue = {
          colourToggle: getRandomColor(firstItem.molecule),
          isLigandOn: ligandList.includes(firstItem.molecule?.id),
          isProteinOn: proteinList.includes(firstItem.molecule?.id),
          isComplexOn: complexList.includes(firstItem.molecule?.id),
          isSurfaceOn: surfaceList.includes(firstItem.molecule?.id)
        };

        dispatch(setCrossReferenceCompoundName(moleculeTitleNext));

        if (node) {
          setSelectedMoleculeRef(node);
        }
        dispatch(
          moveSelectedDatasetMoleculeUpDown(
            stage,
            firstItem.datasetID,
            firstItem.molecule,
            nextItem.datasetID,
            nextItem.molecule,
            dataValue,
            ARROW_TYPE.DOWN
          )
        );
      }
    }
  };

  const handleClickOnUpArrow = async event => {
    const unlockedVisibleCompounds = dispatch(getAllVisibleButNotLockedSelectedCompounds());
    //one unlocked compound is what we want because it designate where the iteration will start
    if (unlockedVisibleCompounds?.length > 1 && askLockSelectedCompoundsQuestion) {
      setLockCompoundsDialogAnchorE1(event.currentTarget);
      dispatch(setIsOpenLockVisibleCompoundsDialogGlobal(true));
    } else {
      const firstItem = getFirstItemForIterationStart();
      const prevItem = getPrevItemForIteration(firstItem);

      if (firstItem && prevItem) {
        const moleculeTitleNext = prevItem && prevItem.molecule?.name;
        const node = getNode(prevItem.molecule?.id);
        setScrollToMoleculeId(prevItem.molecule?.id);

        let dataValue = {
          colourToggle: getRandomColor(firstItem.molecule),
          isLigandOn: ligandList.includes(firstItem.molecule?.id),
          isProteinOn: proteinList.includes(firstItem.molecule?.id),
          isComplexOn: complexList.includes(firstItem.molecule?.id),
          isSurfaceOn: surfaceList.includes(firstItem.molecule?.id)
        };

        dispatch(setCrossReferenceCompoundName(moleculeTitleNext));

        if (node) {
          setSelectedMoleculeRef(node);
        }
        dispatch(
          moveSelectedDatasetMoleculeUpDown(
            stage,
            firstItem.datasetID,
            firstItem.molecule,
            prevItem.datasetID,
            prevItem.molecule,
            dataValue,
            ARROW_TYPE.UP
          )
        );
      }
    }
  };

  return (
    <Panel
      hasHeader
      title="Selected Compounds"
      withTooltip
      headerActions={[
        <Button color="inherit" variant="text" onClick={() => dispatch(downloadAsCsv())} startIcon={<CloudDownload />}>
          Download CSV
        </Button>,
        <Button
          color="inherit"
          variant="text"
          className={classes.sdfButton}
          onClick={downloadAsSdf}
          startIcon={<CloudDownload />}
          disabled={true}
        >
          Download SDF
        </Button>
      ]}
    >
      {isOpenInspirationDialog && (
        <InspirationDialog
          open
          anchorEl={selectedMoleculeRef}
          //     datasetID={datasetID}
          ref={inspirationDialogRef}
        />
      )}
      {askLockSelectedCompoundsQuestion && isLockVisibleCompoundsDialogOpenGlobal && (
        <LockVisibleCompoundsDialog
          open
          ref={lockVisibleCompoundsDialogRef}
          anchorEl={lockCompoundsDialogAnchorE1}
          isSelectedCompounds={true}
        />
      )}
      {isOpenCrossReferenceDialog && (
        <CrossReferenceDialog open anchorEl={selectedMoleculeRef} ref={crossReferenceDialogRef} />
      )}
      <Grid container direction="row" justifyContent="flex-start" className={classes.container}>
        <Grid container direction="column">
          {/* Selection */}
          <Grid container direction="row" justifyContent="space-between" alignItems="center">
            {Object.keys(compoundsColors).map(item => (
              <Grid item key={item}>
                <TextField
                  InputProps={{
                    readOnly: editedColorGroup !== item,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          className={
                            editedColorGroup !== item ? classes.editClassNameIcon : classes.editClassNameIconSelected
                          }
                          color={'inherit'}
                          value={`${item}`}
                          onClick={e => {
                            dispatch(onStartEditColorClassName(e));
                            inputRefs[item].current.focus();
                            inputRefs[item].current.select();
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </InputAdornment>
                    ),
                    startAdornment: (
                      <InputAdornment position="start">
                        <Checkbox
                          className={classes.classCheckbox}
                          key={`CHCK_${item}`}
                          value={`${item}`}
                          onChange={e => dispatch(onClickFilterClassCheckBox(e))}
                          checked={colorFilterSettings.hasOwnProperty(item)}
                        ></Checkbox>
                      </InputAdornment>
                    )
                  }}
                  autoComplete="off"
                  inputRef={inputRefs[item]}
                  id={`${item}`}
                  key={`CLASS_${item}`}
                  variant="standard"
                  className={classNames(
                    classes.textField,
                    classes[item],
                    colorFilterSettings.hasOwnProperty(item) && classes.selectedInput
                  )}
                  onChange={e => dispatch(onChangeCompoundClassValue(e))}
                  onKeyDown={e => dispatch(onKeyDownCompoundClass(e))}
                  // onKeyDown={e => dispatch(onKeyDownFilterClass(e))}
                  // onClick={e => dispatch(onClickFilterClass(e))}
                  value={inputs[item] || ''}
                />
              </Grid>
            ))}
          </Grid>
          <Grid item>
            <Grid container direction="row" /*className={classes.arrows}*/>
              <Grid item>
                <IconButton
                  color="primary"
                  size="medium"
                  // disabled={false || !previousItemData || !areArrowsVisible}
                  disabled={false}
                  onClick={handleClickOnUpArrow}
                  className={classes.iconButton}
                >
                  <ArrowUpward
                    className={classNames(
                      areArrowsVisible ? classes.arrow : classes.invisArrow,
                      areArrowsVisible && classes.arrowsHighlight
                    )}
                  />
                </IconButton>
              </Grid>
              <Grid item>
                <IconButton
                  color="primary"
                  size="medium"
                  // disabled={false || !nextItemData || !areArrowsVisible}
                  disabled={false}
                  onClick={handleClickOnDownArrow}
                  className={classes.iconButton}
                >
                  <ArrowDownward
                    className={classNames(
                      areArrowsVisible ? classes.arrow : classes.invisArrow,
                      areArrowsVisible && classes.arrowsHighlight
                    )}
                  />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {currentMolecules.length > 0 && (
          <Grid item className={classes.gridItemList} ref={scrollBarRef}>
            <InfiniteScroll
              getScrollParent={() => {
                dispatch(
                  autoHideDatasetDialogsOnScroll({ inspirationDialogRef, crossReferenceDialogRef, scrollBarRef })
                );
              }}
              pageStart={0}
              loadMore={loadNextMolecules}
              hasMore={canLoadMore}
              loader={
                <div className="loader" key={0}>
                  <Grid
                    container
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    className={classes.paddingProgress}
                  >
                    <CircularProgress />
                  </Grid>
                </div>
              }
              useWindow={false}
            >
              <DndProvider backend={HTML5Backend}>
                {currentMolecules.map((data, index, array) => {
                  const isFromVectorSelector = isCompoundFromVectorSelector(data.molecule);
                  let isVisible = false;
                  let isLigandOn = false;
                  let shoppingCartColors = null;
                  let areColorButtonsEnabled = true;
                  let isAddedToShoppingCart = false;
                  if (isFromVectorSelector) {
                    isAddedToShoppingCart = true;
                    areColorButtonsEnabled = false;
                    isVisible = colorFilterSettings.hasOwnProperty(data.molecule.class);
                    shoppingCartColors = [data.molecule.class];
                    if (showedCompoundList.find(item => item === data.molecule.smiles) !== undefined) {
                      isLigandOn = true;
                    }
                  } else {
                    isLigandOn = ligandList.includes(data.molecule.id);
                  }
                  // const isAddedToShoppingCart = selectedMolecules.some(molecule => molecule.id === data.molecule.id);

                  // if (isAddedToShoppingCart) {
                  if (compoundColors && compoundColors.hasOwnProperty(data.datasetID)) {
                    const cmpColorsForDataset = compoundColors[data.datasetID];
                    if (cmpColorsForDataset && cmpColorsForDataset.hasOwnProperty(data.molecule.id)) {
                      isAddedToShoppingCart = true;
                      shoppingCartColors = cmpColorsForDataset[data.molecule.id];
                      for (let i = 0; i < shoppingCartColors.length; i++) {
                        const color = shoppingCartColors[i];
                        isVisible = colorFilterSettings.hasOwnProperty(color);
                        if (isVisible) {
                          break;
                        }
                      }
                    }
                  }

                  const isLocked = dispatch(isCompoundLocked(data.datasetID, data.molecule));
                  // }
                  return (
                    isVisible && (
                      <DatasetMoleculeView
                        key={index}
                        index={index}
                        imageHeight={imgHeight}
                        imageWidth={imgWidth}
                        data={data.molecule}
                        datasetID={data.datasetID}
                        // setRef={setSelectedMoleculeRef}
                        ref={addMoleculeViewRef}
                        showCrossReferenceModal
                        previousItemData={index > 0 && array[index - 1]}
                        nextItemData={index < array?.length && array[index + 1]}
                        L={isLigandOn}
                        P={proteinList.includes(data.molecule.id)}
                        C={complexList.includes(data.molecule.id)}
                        S={surfaceList.includes(data.molecule.id)}
                        V={false}
                        arrowsHidden={false}
                        dragDropEnabled
                        shoppingCartColors={shoppingCartColors}
                        isAddedToShoppingCart={isAddedToShoppingCart}
                        inSelectedCompoundsList
                        showDatasetName
                        colorButtonsEnabled={areColorButtonsEnabled}
                        isLocked={isLocked}
                        setRef={setSelectedMoleculeRef}
                        getNode={getNode}
                      />
                    )
                  );
                })}
              </DndProvider>
            </InfiniteScroll>
          </Grid>
        )}
        {!(currentMolecules.length > 0) && (
          <Grid container justifyContent="center" alignItems="center" direction="row" className={classes.notFound}>
            <Grid item>
              <Typography variant="body2">No molecules found!</Typography>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Panel>
  );
});
