import React, { forwardRef, memo, useContext, useEffect, useRef, useState } from 'react';
import {
  CircularProgress,
  Grid,
  Popper,
  IconButton,
  Typography,
  InputAdornment,
  TextField,
  Tooltip
} from '@material-ui/core';
import { Close, Search } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useDispatch, useSelector } from 'react-redux';
import {
  addComplex,
  addLigand,
  addHitProtein,
  addSurface,
  removeComplex,
  removeLigand,
  removeHitProtein,
  removeSurface,
  removeSelectedMolTypes
} from '../preview/molecule/redux/dispatchActions';
import MoleculeView from '../preview/molecule/moleculeView';
import { moleculeProperty } from '../preview/molecule/helperConstants';
import { debounce } from 'lodash';
import { setIsOpenInspirationDialog } from './redux/actions';
import { Button } from '../common/Inputs/Button';
import classNames from 'classnames';
// import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';
import { colourList } from '../preview/molecule/utils/color';
import { NglContext } from '../nglView/nglProvider';
import { VIEWS } from '../../constants/constants';
import { Panel } from '../common/Surfaces/Panel';
import { changeButtonClassname } from './helpers';
import { setSelectedAllByType, setDeselectedAllByType } from '../../reducers/selection/actions';

const useStyles = makeStyles(theme => ({
  paper: {
    width: 472,
    height: 294,
    overflowY: 'hidden'
  },
  molHeader: {
    marginLeft: 19,
    width: 'calc(100% - 19px)'
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
  content: {
    overflowY: 'auto',
    height: 214
  },
  search: {
    margin: theme.spacing(1),
    width: 140,
    '& .MuiInputBase-root': {
      color: theme.palette.white
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: theme.palette.white
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: theme.palette.white
    }
  },
  notFound: {
    paddingTop: theme.spacing(2)
  },
  contButtonsMargin: {
    marginTop: theme.spacing(1) / 2,
    marginBottom: theme.spacing(1) / 2,
    marginLeft: theme.spacing(2)
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
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText
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
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.black
    }
  },
  contColButtonHalfSelected: {
    backgroundColor: theme.palette.primary.semidark,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.black
    }
  }
}));

export const InspirationDialog = memo(
  forwardRef(({ open = false, anchorEl, datasetID }, ref) => {
    const id = open ? 'simple-popover-compound-inspirations' : undefined;
    const imgHeight = 34;
    const imgWidth = 150;
    const classes = useStyles();
    const [searchString, setSearchString] = useState(null);
    const selectedAll = useRef(false);

    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    const isLoadingInspirationListOfMolecules = useSelector(
      state => state.datasetsReducers.isLoadingInspirationListOfMolecules
    );
    const inspirationMoleculeDataList = useSelector(state => state.datasetsReducers.inspirationMoleculeDataList);

    const ligandList = useSelector(state => state.selectionReducers.fragmentDisplayList);
    const proteinList = useSelector(state => state.selectionReducers.proteinList);
    const complexList = useSelector(state => state.selectionReducers.complexList);
    const surfaceList = useSelector(state => state.selectionReducers.surfaceList);
    const densityList = useSelector(state => state.selectionReducers.densityList);
    const densityListCustom = useSelector(state => state.selectionReducers.densityListCustom);
    const qualityList = useSelector(state => state.selectionReducers.qualityList);
    const vectorOnList = useSelector(state => state.selectionReducers.vectorOnList);
    const informationList = useSelector(state => state.selectionReducers.informationList);

    const dispatch = useDispatch();
    // const disableUserInteraction = useDisableUserInteraction();

    let debouncedFn;

    const handleSearch = event => {
      /* signal to React not to nullify the event object */
      event.persist();
      if (!debouncedFn) {
        debouncedFn = debounce(() => {
          setSearchString(event.target.value !== '' ? event.target.value : null);
        }, 350);
      }
      debouncedFn();
    };

    let moleculeList = [];
    if (searchString !== null) {
      moleculeList = inspirationMoleculeDataList.filter(molecule =>
        molecule.protein_code.toLowerCase().includes(searchString.toLowerCase())
      );
    } else {
      moleculeList = inspirationMoleculeDataList;
    }
    // TODO refactor from this line (duplicity in datasetMoleculeList.js)
    const isLigandOn = changeButtonClassname(
      ligandList.filter(moleculeID => moleculeList.find(molecule => molecule.id === moleculeID) !== undefined),
      moleculeList
    );
    const isProteinOn = changeButtonClassname(
      proteinList.filter(moleculeID => moleculeList.find(molecule => molecule.id === moleculeID) !== undefined),
      moleculeList
    );
    const isComplexOn = changeButtonClassname(
      complexList.filter(moleculeID => moleculeList.find(molecule => molecule.id === moleculeID) !== undefined),
      moleculeList
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

    const selectMoleculeSite = moleculeGroupSite => {};

    const removeOfAllSelectedTypes = (skipTracking = false) => {
      dispatch(removeSelectedMolTypes(stage, moleculeList, skipTracking, true));
    };

    const removeSelectedType = (type, skipTracking = false) => {
      if (type === 'ligand') {
        moleculeList.forEach(molecule => {
          dispatch(removeType[type](stage, molecule, skipTracking));
        });
      } else {
        moleculeList.forEach(molecule => {
          dispatch(removeType[type](stage, molecule, colourList[molecule.id % colourList.length], skipTracking));
        });
      }

      selectedAll.current = false;
    };

    const addNewType = (type, skipTracking = false) => {
      if (type === 'ligand') {
        moleculeList.forEach(molecule => {
          dispatch(
            addType[type](stage, molecule, colourList[molecule.id % colourList.length], false, true, skipTracking)
          );
        });
      } else {
        moleculeList.forEach(molecule => {
          dispatch(addType[type](stage, molecule, colourList[molecule.id % colourList.length], skipTracking));
        });
      }
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
      let molecules = moleculeList.filter(m => !list.includes(m.id));
      return molecules;
    };

    const getMoleculesToDeselect = list => {
      let molecules = moleculeList.filter(m => list.includes(m.id));
      return molecules;
    };

    //  TODO refactor to this line

    return (
      <Popper id={id} open={open} anchorEl={anchorEl} placement="left-start" ref={ref}>
        <Panel
          hasHeader
          secondaryBackground
          title="Inspirations"
          className={classes.paper}
          headerActions={[
            <TextField
              className={classes.search}
              id="search-inspiration-dialog"
              placeholder="Search"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="inherit" />
                  </InputAdornment>
                )
              }}
              onChange={handleSearch}
              disabled={!(isLoadingInspirationListOfMolecules === false && moleculeList)}
            />,
            <Tooltip title="Close inspirations">
              <IconButton
                color="inherit"
                className={classes.headerButton}
                onClick={() => dispatch(setIsOpenInspirationDialog(false))}
              >
                <Close />
              </IconButton>
            </Tooltip>
          ]}
        >
          {isLoadingInspirationListOfMolecules === false && moleculeList && (
            <>
              <Grid container justify="flex-start" direction="row" className={classes.molHeader} wrap="nowrap">
                <Grid item container justify="flex-start" direction="row">
                  {Object.keys(moleculeProperty).map(key => (
                    <Grid item key={key} className={classes.rightBorder}>
                      {moleculeProperty[key]}
                    </Grid>
                  ))}
                  {moleculeList.length > 0 && (
                    <Grid item>
                      <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="center"
                        wrap="nowrap"
                        className={classes.contButtonsMargin}
                      >
                        <Tooltip title="all ligands">
                          <Grid item>
                            <Button
                              variant="outlined"
                              className={classNames(classes.contColButton, {
                                [classes.contColButtonSelected]: isLigandOn,
                                [classes.contColButtonHalfSelected]: isLigandOn === null
                              })}
                              onClick={() => onButtonToggle('ligand')}
                              disabled={false}
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
                                [classes.contColButtonSelected]: isProteinOn,
                                [classes.contColButtonHalfSelected]: isProteinOn === null
                              })}
                              onClick={() => onButtonToggle('protein')}
                              disabled={false}
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
                                [classes.contColButtonSelected]: isComplexOn,
                                [classes.contColButtonHalfSelected]: isComplexOn === null
                              })}
                              onClick={() => onButtonToggle('complex')}
                              disabled={false}
                            >
                              C
                            </Button>
                          </Grid>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <div className={classes.content}>
                {moleculeList.length > 0 &&
                  moleculeList.map((molecule, index, array) => {
                    let data = Object.assign({ isInspiration: true }, molecule);
                    let previousData = index > 0 && Object.assign({ isInspiration: true }, array[index - 1]);
                    let nextData = index < array?.length && Object.assign({ isInspiration: true }, array[index + 1]);

                    return (
                      <MoleculeView
                        key={index}
                        index={index}
                        imageHeight={imgHeight}
                        imageWidth={imgWidth}
                        data={data}
                        searchMoleculeGroup
                        previousItemData={previousData}
                        nextItemData={nextData}
                        removeOfAllSelectedTypes={removeOfAllSelectedTypes}
                        selectMoleculeSite={selectMoleculeSite}
                        L={ligandList.includes(molecule.id)}
                        P={proteinList.includes(molecule.id)}
                        C={complexList.includes(molecule.id)}
                        S={surfaceList.includes(molecule.id)}
                        D={densityList.includes(molecule.id)}
                        D_C={densityListCustom.includes(data.id)}
                        Q={qualityList.includes(molecule.id)}
                        V={vectorOnList.includes(molecule.id)}
                        I={informationList.includes(data.id)}
                      />
                    );
                  })}
                {!(moleculeList.length > 0) && (
                  <Grid container justify="center" alignItems="center" direction="row" className={classes.notFound}>
                    <Grid item>
                      <Typography variant="body2">No molecules found!</Typography>
                    </Grid>
                  </Grid>
                )}
              </div>
            </>
          )}
          {isLoadingInspirationListOfMolecules === true && (
            <Grid container alignItems="center" justify="center">
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
