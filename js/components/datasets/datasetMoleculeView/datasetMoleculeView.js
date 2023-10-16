/**
 * Created by abradley on 14/03/2018.
 */

import React, { memo, useEffect, useState, useRef, useContext, forwardRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Grid, Button, makeStyles, Tooltip, IconButton } from '@material-ui/core';
import {
  ClearOutlined,
  CheckOutlined,
  Assignment,
  AssignmentTurnedIn,
  KeyboardReturnOutlined
} from '@material-ui/icons';
import SVGInline from 'react-svg-inline';
import classNames from 'classnames';
import { VIEWS, ARROW_TYPE } from '../../../constants/constants';
import { NglContext } from '../../nglView/nglProvider';
import {
  addDatasetLigand,
  removeDatasetLigand,
  addDatasetHitProtein,
  removeDatasetHitProtein,
  addDatasetComplex,
  removeDatasetComplex,
  addDatasetSurface,
  removeDatasetSurface,
  clickOnInspirations,
  getDatasetMoleculeID,
  getInspirationsForMol,
  withDisabledDatasetMoleculeNglControlButton,
  moveDatasetMoleculeUpDown,
  getFirstUnlockedCompoundAfter,
  getFirstUnlockedCompoundBefore,
  isDatasetCompoundIterrable,
  isDatasetCompoundLocked,
  getAllVisibleButNotLockedCompounds,
  getAllVisibleButNotLockedSelectedCompounds,
  isCompoundLocked,
  getFirstUnlockedSelectedCompoundAfter,
  moveSelectedDatasetMoleculeUpDown,
  getFirstUnlockedSelectedCompoundBefore
} from '../redux/dispatchActions';

import { isAnyInspirationTurnedOn, getFilteredDatasetMoleculeList } from '../redux/selectors';
import {
  setCrossReferenceCompoundName,
  setIsOpenCrossReferenceDialog,
  setSelectedAll,
  setDeselectedAll,
  appendCompoundToSelectedCompoundsByDataset,
  removeCompoundFromSelectedCompoundsByDataset,
  appendMoleculeToCompoundsOfDatasetToBuy,
  removeMoleculeFromCompoundsOfDatasetToBuy,
  appendCompoundColorOfDataset,
  removeCompoundColorOfDataset,
  setIsOpenLockVisibleCompoundsDialogLocal,
  setCmpForLocalLockVisibleCompoundsDialog,
  setAskLockCompoundsQuestion,
  setCompoundToSelectedCompoundsByDataset
} from '../redux/actions';
import { centerOnLigandByMoleculeID } from '../../../reducers/ngl/dispatchActions';
import { ArrowDownward, ArrowUpward, MyLocation } from '@material-ui/icons';
import { isString } from 'lodash';
import { SvgTooltip } from '../../common';
import { getMolImage } from '../../preview/molecule/redux/dispatchActions';
import { MOL_TYPE } from '../../preview/molecule/redux/constants';
import {
  deselectVectorCompound,
  isCompoundFromVectorSelector,
  showHideLigand
} from '../../preview/compounds/redux/dispatchActions';
import { colourList, getRandomColor } from '../../preview/molecule/utils/color';
import { useDragDropMoleculeView } from '../useDragDropMoleculeView';
import DatasetMoleculeSelectCheckbox from './datasetMoleculeSelectCheckbox';
import useCopyClipboard from 'react-use-clipboard';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { compoundsColors } from '../../preview/compounds/redux/constants';
import { LockVisibleCompoundsDialog } from '../lockVisibleCompoundsDialog';
import { fabClasses } from '@mui/material';

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(1) / 4,
    color: 'black',
    height: 54
  },
  dragDropCursor: {
    cursor: 'move'
  },
  contButtonsMargin: {
    margin: theme.spacing(1) / 2
  },
  colorButton: {
    minWidth: '15px',
    maxWidth: '15px'
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
      // color: theme.palette.primary.contrastText
    },
    '&:disabled': {
      borderRadius: 0,
      borderColor: 'white'
    }
  },
  contColButtonSelected: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.main
      // color: theme.palette.black
    }
  },
  contColButtonHalfSelected: {
    backgroundColor: theme.palette.primary.semidark,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.semidark
      // color: theme.palette.black
    }
  },
  detailsCol: {
    border: 'solid 1px',
    borderColor: theme.palette.background.divider,
    borderStyle: 'solid none solid solid'
  },
  image: {
    border: 'solid 1px',
    borderColor: theme.palette.background.divider,
    borderStyle: 'solid solid solid none',
    position: 'relative'
  },
  imageMargin: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  rightBorder: {
    borderRight: '1px solid',
    borderRightColor: theme.palette.background.divider,
    fontWeight: 'bold',
    fontSize: 11,
    paddingLeft: theme.spacing(1) / 2,
    paddingRight: theme.spacing(1) / 2,
    //paddingBottom: theme.spacing(1) / 4,
    width: 32,
    textAlign: 'center',
    '&:last-child': {
      borderRight: 'none',
      width: 32
    }
  },
  fullHeight: {
    height: '100%'
  },
  site: {
    width: theme.spacing(3),
    textAlign: 'center',
    backgroundColor: theme.palette.background.default,
    border: `solid 1px`,
    borderColor: theme.palette.background.divider,
    paddingBottom: theme.spacing(1) / 2
  },
  qualityLabel: {
    paddingLeft: theme.spacing(1) / 4,
    paddingRight: theme.spacing(1) / 4
  },
  matchingValue: {
    backgroundColor: theme.palette.success.lighter
  },
  unmatchingValue: {
    backgroundColor: theme.palette.error.lighter
  },
  moleculeTitleLabel: {
    ...theme.typography.button,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    paddingLeft: theme.spacing(1) / 4
  },
  datasetTitleLabel: {
    ...theme.typography.caption,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    paddingLeft: theme.spacing(1) / 4,
    paddingRight: theme.spacing(1) / 4,
    marginTop: -theme.spacing(1)
  },
  selectedMolecule: {
    color: theme.palette.primary.main
  },
  loadingProgress: {
    height: 2,
    width: '100%'
  },
  checkbox: {
    padding: 0
  },
  inheritWidth: {
    width: 'inherit'
  },
  widthOverflow: {
    maxWidth: '180px',
    overflow: 'hidden'
  },
  rank: {
    fontStyle: 'italic',
    fontSize: 7
  },
  myLocation: {
    width: 10.328,
    height: 15
  },
  myLocationButton: {
    minWidth: 'fit-content',
    paddingLeft: theme.spacing(1) / 4,
    paddingRight: theme.spacing(1) / 4,
    paddingBottom: 0,
    paddingTop: 0,
    fontWeight: 'bold',
    fontSize: 9,
    borderRadius: 0,
    borderStyle: 'none',
    borderColor: theme.palette.white,
    '&:disabled': {
      borderRadius: 0,
      borderStyle: 'none',
      borderColor: theme.palette.white
    }
  },
  arrows: {
    height: '100%',
    border: 'solid 1px',
    borderColor: theme.palette.background.divider,
    borderStyle: 'solid solid solid solid'
  },
  arrowsHighlight: {
    borderColor: theme.palette.primary.main,
    border: 'solid 2px',
    backgroundColor: theme.palette.primary.main
  },
  arrow: {
    width: 12,
    height: 15,
    color: 'white',
    stroke: 'white',
    strokeWidth: 2
  },
  invisArrow: {
    width: 12,
    height: 15,
    visibility: 'hidden'
  },
  cancelIcon: {
    color: theme.palette.primary.main,
    width: theme.spacing(2),
    height: theme.spacing(2)
  },
  checkIcon: {
    color: theme.palette.primary.main,
    width: theme.spacing(2),
    height: theme.spacing(2)
  },
  copyIcon: {
    padding: 0,
    color: theme.palette.success.main,
    '&:hover': {
      color: theme.palette.success.dark
    }
  },
  addToShoppingCartIcon: {
    padding: 0,
    color: theme.palette.success.main,
    '&:hover': {
      color: theme.palette.success.dark
    }
  },
  removeFromShoppingCartIcon: {
    padding: 0,
    color: theme.palette.error.main,
    '&:hover': {
      color: theme.palette.error.dark
    }
  },
  imageActions: {
    position: 'absolute',
    top: 0,
    right: 0
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
  [`border-${compoundsColors.blue.key}`]: {
    border: `2px solid ${compoundsColors.blue.color}`
  },
  [`border-${compoundsColors.red.key}`]: {
    border: `2px solid ${compoundsColors.red.color}`
  },
  [`border-${compoundsColors.green.key}`]: {
    border: `2px solid ${compoundsColors.green.color}`
  },
  [`border-${compoundsColors.purple.key}`]: {
    border: `2px solid ${compoundsColors.purple.color}`
  },
  [`border-${compoundsColors.apricot.key}`]: {
    border: `2px solid ${compoundsColors.apricot.color}`
  },
  unselectedButton: {
    backgroundColor: 'white'
  }
}));

export const img_data_init = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="25px" height="25px"><g>
  <circle cx="50" cy="50" fill="none" stroke="#3f51b5" stroke-width="4" r="26" stroke-dasharray="150.79644737231007 52.26548245743669" transform="rotate(238.988 50 50)">
    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.689655172413793s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
  </circle>  '</svg>`;

const DatasetMoleculeView = memo(
  forwardRef(
    (
      {
        imageHeight,
        imageWidth,
        data,
        datasetID,
        setRef,
        showCrossReferenceModal,
        hideFButton,
        showDatasetName,
        index,
        previousItemData,
        nextItemData,
        L,
        P,
        C,
        S,
        V,
        arrowsHidden = false,
        dragDropEnabled = false,
        moveMolecule,
        isLocked,
        isAddedToShoppingCart,
        shoppingCartColors = [],
        disableL,
        disableP,
        disableC,
        inSelectedCompoundsList = false,
        colorButtonsEnabled = true,
        getNode
      },
      outsideRef
    ) => {
      const ref = useRef(null);
      const lockVisibleCompoundsDialogRef = useRef();

      const { handlerId, isDragging } = useDragDropMoleculeView(ref, datasetID, data, index, moveMolecule);
      const opacity = isDragging ? 0 : 1;

      const selectedAll = useRef(false);
      const currentID = (data && data.id) || (data && data.smiles) || undefined;
      const isFromVectorSelector = isCompoundFromVectorSelector(data);
      const classes = useStyles();
      const dispatch = useDispatch();

      const datasets = useSelector(state => state.datasetsReducers.datasets);
      const filteredScoreProperties = useSelector(state => state.datasetsReducers.filteredScoreProperties);
      const filter = useSelector(state => state.selectionReducers.filter);
      const isAnyInspirationOn = useSelector(state =>
        isAnyInspirationTurnedOn(state, (data && data.computed_inspirations) || [])
      );

      const currentCompoundClass = useSelector(state => state.previewReducers.compounds.currentCompoundClass);

      const selectedCompounds = useSelector(state => state.datasetsReducers.selectedCompounds);

      const disableMoleculeNglControlButtons =
        useSelector(state => state.datasetsReducers.disableDatasetsNglControlButtons[datasetID]?.[currentID]) || {};

      const filteredDatasetMoleculeList = useSelector(state => getFilteredDatasetMoleculeList(state, datasetID));

      const [image, setImage] = useState(img_data_init);

      const { getNglView } = useContext(NglContext);
      const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

      const isLigandOn = L;
      const isProteinOn = P;
      const isComplexOn = C;
      const isSurfaceOn = S;

      const askLockCompoundsQuestion = useSelector(state => state.datasetsReducers.askLockCompoundsQuestion);
      const askLockSelectedCompoundsQuestion = useSelector(
        state => state.datasetsReducers.askLockSelectedCompoundsQuestion
      );

      const isLockVisibleCompoundsDialogOpenLocal = useSelector(
        state => state.datasetsReducers.isLockVisibleCompoundsDialogOpenLocal
      );

      const cmpForLocalLockVisibleCompoundsDialog = useSelector(
        state => state.datasetsReducers.cmpForLocalLockVisibleCompoundsDialog
      );

      const [lockCompoundsDialogAnchorE1, setLockCompoundsDialogAnchorE1] = useState(null);

      const [isCopied, setCopied] = useCopyClipboard(data.smiles, { successDuration: 5000 });

      const hasAllValuesOn = isLigandOn && isProteinOn && isComplexOn;
      const hasSomeValuesOn = !hasAllValuesOn && (isLigandOn || isProteinOn || isComplexOn || isSurfaceOn);

      let areArrowsVisible =
        (isLigandOn || isProteinOn || isComplexOn || isSurfaceOn) && !isLocked && !isCompoundFromVectorSelector(data);

      if (arrowsHidden) {
        areArrowsVisible = false;
      }

      const colourToggle = getRandomColor(data);

      const [moleculeTooltipOpen, setMoleculeTooltipOpen] = useState(false);
      const moleculeImgRef = useRef(null);

      // componentDidMount
      useEffect(() => {
        dispatch(getMolImage(data.smiles, MOL_TYPE.DATASET, imageWidth, imageHeight)).then(i => {
          setImage(i);
        });
      }, [C, currentID, data, L, imageHeight, imageWidth, data.smiles, data.id, filteredDatasetMoleculeList, dispatch]);

      const svg_image = (
        <SVGInline
          component="div"
          svg={image}
          // className={classes.imageMargin}
          style={{
            height: `${imageHeight}px`,
            width: `${imageWidth}px`
          }}
        />
      );
      // Here add the logic that updates this based on the information
      // const refinement = <Label bsStyle="success">{"Refined"}</Label>;
      const selected_style = {
        backgroundColor: colourToggle
      };
      const not_selected_style = {};
      const current_style =
        isLigandOn || isProteinOn || isComplexOn || isSurfaceOn ? selected_style : not_selected_style;

      const addNewLigand = (skipTracking = false) => {
        dispatch(
          withDisabledDatasetMoleculeNglControlButton(datasetID, currentID, 'ligand', async () => {
            await dispatch(addDatasetLigand(stage, data, colourToggle, datasetID, skipTracking));
          })
        );
      };

      const removeSelectedLigand = (skipTracking = false) => {
        dispatch(removeDatasetLigand(stage, data, colourToggle, datasetID, skipTracking));
        selectedAll.current = false;
      };

      const onLigand = calledFromSelectAll => {
        if (calledFromSelectAll === true && selectedAll.current === true) {
          if (isLigandOn === false) {
            addNewLigand(calledFromSelectAll);
          }
        } else if (calledFromSelectAll && selectedAll.current === false) {
          removeSelectedLigand(calledFromSelectAll);
        } else if (!calledFromSelectAll) {
          if (isFromVectorSelector) {
            dispatch(showHideLigand(data, stage));
          } else {
            if (isLigandOn === false) {
              addNewLigand();
            } else {
              removeSelectedLigand();
            }
          }
        }
      };

      const removeSelectedProtein = (skipTracking = false) => {
        dispatch(removeDatasetHitProtein(stage, data, colourToggle, datasetID, skipTracking));
        selectedAll.current = false;
      };

      const addNewProtein = (skipTracking = false) => {
        dispatch(
          withDisabledDatasetMoleculeNglControlButton(datasetID, currentID, 'protein', async () => {
            await dispatch(addDatasetHitProtein(stage, data, colourToggle, datasetID, skipTracking));
          })
        );
      };

      const onProtein = calledFromSelectAll => {
        if (calledFromSelectAll === true && selectedAll.current === true) {
          if (isProteinOn === false) {
            addNewProtein(calledFromSelectAll);
          }
        } else if (calledFromSelectAll && selectedAll.current === false) {
          removeSelectedProtein(calledFromSelectAll);
        } else if (!calledFromSelectAll) {
          if (isProteinOn === false) {
            addNewProtein();
          } else {
            removeSelectedProtein();
          }
        }
      };

      const removeSelectedComplex = (skipTracking = false) => {
        dispatch(removeDatasetComplex(stage, data, colourToggle, datasetID, skipTracking));
        selectedAll.current = false;
      };

      const addNewComplex = (skipTracking = false) => {
        dispatch(
          withDisabledDatasetMoleculeNglControlButton(datasetID, currentID, 'complex', async () => {
            await dispatch(addDatasetComplex(stage, data, colourToggle, datasetID, skipTracking));
          })
        );
      };

      const onComplex = calledFromSelectAll => {
        if (calledFromSelectAll === true && selectedAll.current === true) {
          if (isComplexOn === false) {
            addNewComplex(calledFromSelectAll);
          }
        } else if (calledFromSelectAll && selectedAll.current === false) {
          removeSelectedComplex(calledFromSelectAll);
        } else if (!calledFromSelectAll) {
          if (isComplexOn === false) {
            addNewComplex();
          } else {
            removeSelectedComplex();
          }
        }
      };

      const removeSelectedSurface = () => {
        dispatch(removeDatasetSurface(stage, data, colourToggle, datasetID));
        selectedAll.current = false;
      };

      const addNewSurface = async () => {
        dispatch(
          withDisabledDatasetMoleculeNglControlButton(datasetID, currentID, 'surface', async () => {
            await dispatch(addDatasetSurface(stage, data, colourToggle, datasetID));
          })
        );
      };

      const onSurface = calledFromSelectAll => {
        if (calledFromSelectAll === true && selectedAll.current === true) {
          if (isSurfaceOn === false) {
            addNewSurface();
          }
        } else if (calledFromSelectAll && selectedAll.current === false) {
          removeSelectedSurface();
        } else if (!calledFromSelectAll) {
          if (isSurfaceOn === false) {
            addNewSurface();
          } else {
            removeSelectedSurface();
          }
        }
      };

      const setCalledFromAll = () => {
        let isSelected = selectedAll.current === true;
        if (isSelected) {
          dispatch(setSelectedAll(datasetID, data, true, true, true));
        } else {
          dispatch(setDeselectedAll(datasetID, data, isLigandOn, isProteinOn, isComplexOn));
        }
      };

      /**
       * Check if given molecule is matching current filter
       * @param Object item - item.name is attribute name, item.value is its value
       * @return boolean
       */
      const isMatchingValue = item => {
        let match = false;
        if (!(item.value < filter.filter[item.name].minValue || item.value > filter.filter[item.name].maxValue)) {
          match = true;
        }
        return match;
      };

      /**
       * Get css class for value regarding to its filter match
       * @param Object item - item.name is attribute name, item.value is its value
       * @return string - css class
       */
      const getValueMatchingClass = item => {
        let cssClass = '';
        if (filter && filter.predefined !== 'none') {
          cssClass = isMatchingValue(item) ? classes.matchingValue : classes.unmatchingValue;
        }
        return cssClass;
      };

      const scrollToElement = element => {
        element.scrollIntoView({
          behavior: 'auto',
          block: 'nearest',
          inline: 'nearest'
        });
      };

      const handleColorGroupButtonClick = event => {
        if (shoppingCartColors?.includes(event.target.id)) {
          // if (shoppingCartColors?.length === 1) {
          //   dispatch(removeMoleculeFromCompoundsOfDatasetToBuy(datasetID, currentID, moleculeTitle));
          // }
          dispatch(removeCompoundColorOfDataset(datasetID, currentID, event.target.id, moleculeTitle, false));
        } else {
          // dispatch(appendMoleculeToCompoundsOfDatasetToBuy(datasetID, currentID, moleculeTitle));
          dispatch(appendCompoundColorOfDataset(datasetID, currentID, event.target.id, moleculeTitle, false));
        }
      };

      const handleRemoveColorFromCompound = event => {
        if (shoppingCartColors?.length === 1) {
          dispatch(removeMoleculeFromCompoundsOfDatasetToBuy(datasetID, currentID, moleculeTitle));
        }
        dispatch(removeCompoundColorOfDataset(datasetID, currentID, event.target.id, moleculeTitle, false));
      };

      const handleShoppingCartClick = () => {
        if (currentCompoundClass) {
          // if (!isAddedToShoppingCart) {
          //   dispatch(appendMoleculeToCompoundsOfDatasetToBuy(datasetID, currentID, moleculeTitle));
          // }
          dispatch(appendCompoundColorOfDataset(datasetID, currentID, currentCompoundClass, moleculeTitle, false));
        }
      };

      const moveDownSelectedCompound = anchorEl => {
        //check if there are unlocked but visible compounds in the selected compounds list
        const unlockedVisibleCompounds = dispatch(getAllVisibleButNotLockedSelectedCompounds(datasetID, currentID));
        if (unlockedVisibleCompounds?.length > 0 && askLockSelectedCompoundsQuestion) {
          dispatch(setCmpForLocalLockVisibleCompoundsDialog(data));
          setLockCompoundsDialogAnchorE1(anchorEl);
          dispatch(setIsOpenLockVisibleCompoundsDialogLocal(true));
        } else {
          let refNext = ref.current.nextSibling;
          scrollToElement(refNext);

          let nextItem = (nextItemData.hasOwnProperty('molecule') && nextItemData.molecule) || nextItemData;
          let nextDatasetID = (nextItemData.hasOwnProperty('datasetID') && nextItemData.datasetID) || datasetID;
          if (dispatch(isCompoundLocked(nextDatasetID, nextItem)) || isCompoundFromVectorSelector(nextItem)) {
            const unlockedCmp = dispatch(getFirstUnlockedSelectedCompoundAfter(nextDatasetID, nextItem.id));
            if (!unlockedCmp) {
              return;
            }
            nextItem = unlockedCmp.molecule;
            nextDatasetID = unlockedCmp.datasetID;
          }
          if (getNode) {
            refNext = getNode(nextItem.id);
          }
          const moleculeTitleNext = nextItem && nextItem.name;

          let dataValue = { colourToggle, isLigandOn, isProteinOn, isComplexOn, isSurfaceOn };

          dispatch(setCrossReferenceCompoundName(moleculeTitleNext));
          if (setRef && ref.current) {
            setRef(refNext);
          }

          dispatch(
            moveSelectedDatasetMoleculeUpDown(
              stage,
              datasetID,
              data,
              nextDatasetID,
              nextItem,
              dataValue,
              ARROW_TYPE.DOWN
            )
          );
        }
      };

      const handleClickOnDownArrow = async event => {
        if (inSelectedCompoundsList) {
          moveDownSelectedCompound(event.currentTarget);
        } else {
          const unlockedVisibleCompounds = dispatch(getAllVisibleButNotLockedCompounds(datasetID, currentID));
          if (unlockedVisibleCompounds?.length > 0 && askLockCompoundsQuestion) {
            dispatch(setCmpForLocalLockVisibleCompoundsDialog(data));
            setLockCompoundsDialogAnchorE1(event.currentTarget);
            dispatch(setIsOpenLockVisibleCompoundsDialogLocal(true));
          } else {
            let refNext = ref.current.nextSibling;
            scrollToElement(refNext);

            let nextItem = (nextItemData.hasOwnProperty('molecule') && nextItemData.molecule) || nextItemData;
            const nextDatasetID = (nextItemData.hasOwnProperty('datasetID') && nextItemData.datasetID) || datasetID;
            if (dispatch(isDatasetCompoundLocked(nextDatasetID, nextItem.id))) {
              nextItem = dispatch(getFirstUnlockedCompoundAfter(nextDatasetID, nextItem.id));
            }
            if (getNode) {
              refNext = getNode(nextItem.id);
            }
            const moleculeTitleNext = nextItem && nextItem.name;

            let dataValue = { colourToggle, isLigandOn, isProteinOn, isComplexOn, isSurfaceOn };

            dispatch(setCrossReferenceCompoundName(moleculeTitleNext));
            if (setRef && ref.current) {
              setRef(refNext);
            }

            dispatch(
              moveDatasetMoleculeUpDown(stage, datasetID, data, nextDatasetID, nextItem, dataValue, ARROW_TYPE.DOWN)
            );
          }
        }
      };

      const moveUpSelectedCompound = anchorEl => {
        const unlockedVisibleCompounds = dispatch(getAllVisibleButNotLockedSelectedCompounds(datasetID, currentID));
        if (unlockedVisibleCompounds?.length > 0 && askLockSelectedCompoundsQuestion) {
          dispatch(setCmpForLocalLockVisibleCompoundsDialog(data));
          setLockCompoundsDialogAnchorE1(anchorEl);
          dispatch(setIsOpenLockVisibleCompoundsDialogLocal(true));
        } else {
          let refPrevious = ref.current.previousSibling;
          scrollToElement(refPrevious);

          let previousItem =
            (previousItemData.hasOwnProperty('molecule') && previousItemData.molecule) || previousItemData;
          let previousDatasetID =
            (previousItemData.hasOwnProperty('datasetID') && previousItemData.datasetID) || datasetID;
          if (dispatch(isCompoundLocked(previousDatasetID, previousItem))) {
            const unlockedCmp = dispatch(getFirstUnlockedSelectedCompoundBefore(previousDatasetID, previousItem.id));
            if (!unlockedCmp) {
              return;
            }
            previousItem = unlockedCmp.molecule;
            previousDatasetID = unlockedCmp.datasetID;
          }
          if (getNode) {
            refPrevious = getNode(previousItem.id);
          }
          const moleculeTitlePrev = previousItem && previousDatasetID.name;

          let dataValue = { colourToggle, isLigandOn, isProteinOn, isComplexOn, isSurfaceOn };

          dispatch(setCrossReferenceCompoundName(moleculeTitlePrev));
          if (setRef && ref.current) {
            setRef(refPrevious);
          }

          dispatch(
            moveSelectedDatasetMoleculeUpDown(
              stage,
              datasetID,
              data,
              previousDatasetID,
              previousItem,
              dataValue,
              ARROW_TYPE.UP
            )
          );
        }
      };

      const handleClickOnUpArrow = async event => {
        if (inSelectedCompoundsList) {
          moveUpSelectedCompound(event.currentTarget);
        } else {
          const unlockedVisibleCompounds = dispatch(getAllVisibleButNotLockedCompounds(datasetID, currentID));
          if (unlockedVisibleCompounds?.length > 0 && askLockCompoundsQuestion) {
            dispatch(setCmpForLocalLockVisibleCompoundsDialog(data));
            setLockCompoundsDialogAnchorE1(event.currentTarget);
            dispatch(setIsOpenLockVisibleCompoundsDialogLocal(true));
          } else {
            let refPrevious = ref.current.previousSibling;
            scrollToElement(refPrevious);

            let previousItem =
              (previousItemData.hasOwnProperty('molecule') && previousItemData.molecule) || previousItemData;
            const previousDatasetID =
              (previousItemData.hasOwnProperty('datasetID') && previousItemData.datasetID) || datasetID;
            if (dispatch(isDatasetCompoundLocked(previousDatasetID, previousItem.id))) {
              previousItem = dispatch(getFirstUnlockedCompoundBefore(previousDatasetID, previousItem.id));
            }
            if (getNode) {
              refPrevious = getNode(previousItem.id);
            }
            const moleculeTitlePrev = previousItem && previousItem.name;

            let dataValue = { colourToggle, isLigandOn, isProteinOn, isComplexOn, isSurfaceOn };

            dispatch(setCrossReferenceCompoundName(moleculeTitlePrev));
            if (setRef && ref.current) {
              setRef(refPrevious);
            }

            dispatch(
              moveDatasetMoleculeUpDown(
                stage,
                datasetID,
                data,
                previousDatasetID,
                previousItem,
                dataValue,
                ARROW_TYPE.UP
              )
            );
          }
        }
      };

      const moleculeTitle = data && data.name;
      const datasetTitle = datasets?.find(item => `${item.id}` === `${datasetID}`)?.title;

      const allScores = { ...data?.numerical_scores, ...data?.text_scores };

      const moleculeLPCControlButtonDisabled = ['ligand', 'protein', 'complex'].some(
        type => disableMoleculeNglControlButtons[type]
      );

      const groupMoleculeLPCControlButtonDisabled = disableL || disableP || disableC;

      return (
        <>
          <Grid
            container
            justify="space-between"
            direction="row"
            className={classNames(classes.container, dragDropEnabled ? classes.dragDropCursor : undefined)}
            wrap="nowrap"
            ref={node => {
              if (dragDropEnabled) {
                ref.current = node;
              }
              if (outsideRef) {
                outsideRef(data.id, node);
              }
            }}
            data-handler-id={dragDropEnabled ? handlerId : undefined}
            style={{ opacity }}
          >
            {askLockCompoundsQuestion &&
              isLockVisibleCompoundsDialogOpenLocal &&
              cmpForLocalLockVisibleCompoundsDialog?.id === currentID && (
                <LockVisibleCompoundsDialog
                  open
                  ref={lockVisibleCompoundsDialogRef}
                  anchorEl={lockCompoundsDialogAnchorE1}
                  datasetId={datasetID}
                  currentCmp={data}
                  isSelectedCompounds={inSelectedCompoundsList}
                />
              )}
            {/*Site number*/}
            <Grid item container justify="space-between" direction="column" className={classes.site}>
              <Grid item>
                {!isCompoundFromVectorSelector(data) && (
                  <DatasetMoleculeSelectCheckbox
                    checked={isLocked}
                    className={classes.checkbox}
                    size="small"
                    color="primary"
                    onChange={e => {
                      const result = e.target.checked;
                      if (result) {
                        dispatch(appendCompoundToSelectedCompoundsByDataset(datasetID, currentID, moleculeTitle));
                        dispatch(setCompoundToSelectedCompoundsByDataset(currentID));
                      } else {
                        dispatch(removeCompoundFromSelectedCompoundsByDataset(datasetID, currentID, moleculeTitle));
                        dispatch(deselectVectorCompound(data));
                      }
                    }}
                  />
                )}
              </Grid>
              <Grid item className={classes.rank}>
                {index + 1}.
              </Grid>
            </Grid>
            <Grid item container className={classes.detailsCol} justify="space-between" direction="row">
              {/* Title label */}
              <Grid
                item
                xs={!showCrossReferenceModal && hideFButton ? 8 : 7}
                container
                direction="column"
                className={!showCrossReferenceModal && hideFButton ? classes.widthOverflow : ''}
              >
                <Grid item className={classes.inheritWidth}>
                  <Tooltip title={moleculeTitle} placement="bottom-start">
                    <div className={classNames(classes.moleculeTitleLabel, isLocked && classes.selectedMolecule)}>
                      {moleculeTitle}
                    </div>
                  </Tooltip>
                </Grid>
                {showDatasetName && (
                  <Grid item className={classes.inheritWidth}>
                    <Tooltip title={datasetTitle} placement="bottom-start">
                      <div className={classes.datasetTitleLabel}>{datasetTitle}</div>
                    </Tooltip>
                  </Grid>
                )}
              </Grid>
              {/* Control Buttons A, L, C, V */}
              <Grid item>
                <Grid
                  container
                  direction="row"
                  justify="flex-start"
                  alignItems="center"
                  wrap="nowrap"
                  className={classes.contButtonsMargin}
                >
                  <Tooltip title="centre on">
                    <Grid item>
                      <Button
                        variant="outlined"
                        className={classes.myLocationButton}
                        onClick={() => {
                          dispatch(centerOnLigandByMoleculeID(stage, getDatasetMoleculeID(datasetID, currentID)));
                        }}
                        disabled={false || !isLigandOn || isCompoundFromVectorSelector(data)}
                      >
                        <MyLocation className={classes.myLocation} />
                      </Button>
                    </Grid>
                  </Tooltip>
                  <Tooltip title="all">
                    <Grid item>
                      <Button
                        variant="outlined"
                        className={classNames(
                          classes.contColButton,
                          {
                            [classes.contColButtonSelected]: hasAllValuesOn
                          },
                          {
                            [classes.contColButtonHalfSelected]: hasSomeValuesOn
                          }
                        )}
                        onClick={() => {
                          // always deselect all if are selected only some of options
                          dispatch(setAskLockCompoundsQuestion(true));
                          selectedAll.current = hasSomeValuesOn ? false : !selectedAll.current;

                          setCalledFromAll();
                          onLigand(true);
                          onProtein(true);
                          onComplex(true);
                        }}
                        disabled={
                          isFromVectorSelector ||
                          groupMoleculeLPCControlButtonDisabled ||
                          moleculeLPCControlButtonDisabled
                        }
                      >
                        A
                      </Button>
                    </Grid>
                  </Tooltip>
                  <Tooltip title="ligand">
                    <Grid item>
                      <Button
                        variant="outlined"
                        className={classNames(classes.contColButton, {
                          [classes.contColButtonSelected]: isLigandOn
                        })}
                        onClick={() => {
                          dispatch(setAskLockCompoundsQuestion(true));
                          onLigand();
                        }}
                        disabled={disableL || disableMoleculeNglControlButtons.ligand}
                      >
                        L
                      </Button>
                    </Grid>
                  </Tooltip>
                  <Tooltip title="sidechains">
                    <Grid item>
                      <Button
                        variant="outlined"
                        className={classNames(classes.contColButton, {
                          [classes.contColButtonSelected]: isProteinOn
                        })}
                        onClick={() => {
                          dispatch(setAskLockCompoundsQuestion(true));
                          onProtein();
                        }}
                        disabled={isFromVectorSelector || disableP || disableMoleculeNglControlButtons.protein}
                      >
                        P
                      </Button>
                    </Grid>
                  </Tooltip>
                  <Tooltip title="interactions">
                    <Grid item>
                      {/* C stands for contacts now */}
                      <Button
                        variant="outlined"
                        className={classNames(classes.contColButton, {
                          [classes.contColButtonSelected]: isComplexOn
                        })}
                        onClick={() => {
                          dispatch(setAskLockCompoundsQuestion(true));
                          onComplex();
                        }}
                        disabled={isFromVectorSelector || disableC || disableMoleculeNglControlButtons.complex}
                      >
                        C
                      </Button>
                    </Grid>
                  </Tooltip>
                  <Tooltip title="surface">
                    <Grid item>
                      <Button
                        variant="outlined"
                        className={classNames(classes.contColButton, {
                          [classes.contColButtonSelected]: isSurfaceOn
                        })}
                        onClick={() => {
                          dispatch(setAskLockCompoundsQuestion(true));
                          onSurface();
                        }}
                        disabled={isFromVectorSelector || disableMoleculeNglControlButtons.surface}
                      >
                        S
                      </Button>
                    </Grid>
                  </Tooltip>
                  {!hideFButton && (
                    <Tooltip title="computed inspirations">
                      <Grid item>
                        <Button
                          variant="outlined"
                          className={classNames(classes.contColButton, {
                            [classes.contColButtonSelected]: isAnyInspirationOn
                          })}
                          onClick={() => {
                            dispatch((dispatch, getState) => {
                              const allInspirations = getState().datasetsReducers.allInspirations;

                              dispatch(
                                clickOnInspirations({
                                  datasetID,
                                  currentID,
                                  computed_inspirations: getInspirationsForMol(allInspirations, datasetID, currentID)
                                })
                              );
                            });
                            if (setRef) {
                              setRef(ref.current);
                            }
                          }}
                          disabled={isFromVectorSelector}
                        >
                          F
                        </Button>
                      </Grid>
                    </Tooltip>
                  )}
                  {showCrossReferenceModal && (
                    <Tooltip title="cross reference">
                      <Grid item>
                        <Button
                          variant="outlined"
                          className={classNames(classes.contColButton, {
                            // [classes.contColButtonSelected]: isAnyInspirationOn
                          })}
                          onClick={() => {
                            dispatch(setCrossReferenceCompoundName(moleculeTitle));
                            dispatch(setIsOpenCrossReferenceDialog(true));
                            if (setRef) {
                              setRef(ref.current);
                            }
                          }}
                          disabled={isFromVectorSelector}
                        >
                          X
                        </Button>
                      </Grid>
                    </Tooltip>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                {/* Molecule properties */}
                <Grid
                  item
                  container
                  justify="flex-start"
                  alignItems="flex-end"
                  direction="row"
                  wrap="nowrap"
                  className={classes.fullHeight}
                >
                  {filteredScoreProperties &&
                    datasetID &&
                    filteredScoreProperties[datasetID] &&
                    filteredScoreProperties[datasetID].map(score => {
                      //const item = scoreCompoundMap && scoreCompoundMap[data?.compound]?.find(o => o.score.id === score.id);
                      let value = allScores[score.name];
                      if (!value) {
                        value = data[score.name];
                      }
                      return (
                        <Tooltip title={`${score.name} - ${score.description} : ${value}`} key={score.name}>
                          {(value && (
                            <Grid
                              item
                              className={classNames(
                                classes.rightBorder
                                // getValueMatchingClass(item)
                              )}
                            >
                              {/*{item.value && Math.round(item.value)}*/}
                              {(value === 'N' && <ClearOutlined className={classes.cancelIcon} />) ||
                                (value === 'Y' && <CheckOutlined className={classes.checkIcon} />) ||
                                (isString(value) && value?.slice(0, 4)) ||
                                (!isNaN(value) && `${value}`?.slice(0, 4)) ||
                                null}
                            </Grid>
                          )) || (
                            <Grid item className={classes.rightBorder}>
                              -
                            </Grid>
                          )}
                        </Tooltip>
                      );
                    })}
                  {Object.keys(compoundsColors).map(color => {
                    const colorIncluded = shoppingCartColors?.includes(color);
                    return (
                      <Tooltip title={color} key={`${color}-${classes[data.id]}`} placement="top">
                        <Grid>
                          <Button
                            id={color}
                            className={classNames(
                              colorIncluded ? classes[color] : classes.unselectedButton,
                              classes[`border-${color}`],
                              classes.colorButton
                            )}
                            onClick={event => {
                              handleColorGroupButtonClick(event);
                            }}
                            disabled={!colorButtonsEnabled}
                          >
                            {' '}
                          </Button>
                        </Grid>
                      </Tooltip>
                    );
                  })}
                </Grid>
              </Grid>
            </Grid>
            {/* Up/Down arrows */}
            <Grid item>
              <Grid
                container
                direction="column"
                justify="space-between"
                className={classNames(classes.arrows, areArrowsVisible && classes.arrowsHighlight)}
              >
                <Grid item>
                  <IconButton
                    color="primary"
                    size="small"
                    disabled={false || !previousItemData || !areArrowsVisible}
                    onClick={handleClickOnUpArrow}
                  >
                    <ArrowUpward className={areArrowsVisible ? classes.arrow : classes.invisArrow} />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    color="primary"
                    size="small"
                    disabled={false || !nextItemData || !areArrowsVisible}
                    onClick={handleClickOnDownArrow}
                  >
                    <ArrowDownward className={areArrowsVisible ? classes.arrow : classes.invisArrow} />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
            {/* Image */}
            <div
              style={{
                ...current_style,
                width: imageWidth
              }}
              className={classes.image}
              onMouseEnter={() => setMoleculeTooltipOpen(true)}
              onMouseLeave={() => setMoleculeTooltipOpen(false)}
              ref={moleculeImgRef}
            >
              {svg_image}
              <div className={classes.imageActions}>
                {moleculeTooltipOpen && (
                  <Tooltip title={!isCopied ? 'Copy smiles' : 'Copied'}>
                    <IconButton className={classes.copyIcon} onClick={setCopied}>
                      {!isCopied ? <Assignment /> : <AssignmentTurnedIn />}
                    </IconButton>
                  </Tooltip>
                )}
                {moleculeTooltipOpen && !inSelectedCompoundsList && (
                  <Tooltip>
                    <IconButton className={classes.addToShoppingCartIcon} onClick={handleShoppingCartClick}>
                      <AddShoppingCartIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>
          </Grid>
          <SvgTooltip
            open={moleculeTooltipOpen}
            anchorEl={moleculeImgRef.current}
            imgData={image}
            width={imageWidth}
            height={imageHeight}
          />
        </>
      );
    }
  )
);

DatasetMoleculeView.displayName = 'DatasetMoleculeView';
export default DatasetMoleculeView;
