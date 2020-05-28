import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import {
  CircularProgress,
  Grid,
  Paper,
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
  removeSurface
} from '../preview/molecule/redux/dispatchActions';
import { loadInspirationMoleculesDataList } from './redux/dispatchActions';
import MoleculeView from '../preview/molecule/moleculeView';
import { moleculeProperty } from '../preview/molecule/helperConstants';
import { debounce } from 'lodash';
import { setInspirationMoleculeDataList, setIsOpenInspirationDialog } from './redux/actions';
import { Button } from '../common/Inputs/Button';
import classNames from 'classnames';
import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';
import { colourList } from './datasetMoleculeView';
import { NglContext } from '../nglView/nglProvider';
import { VIEWS } from '../../constants/constants';

const useStyles = makeStyles(theme => ({
  paper: {
    width: 472,
    height: 500,
    overflowY: 'hidden',
    padding: theme.spacing(1)
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
  closeButton: {
    paddingTop: 0,
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  content: {
    overflowY: 'auto',
    height: 422
  },
  title: {
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  search: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  notFound: {
    paddingTop: theme.spacing(2)
  },
  contButtonsMargin: {
    margin: theme.spacing(1) / 2
  },
  contColButton: {
    minWidth: 'fit-content',
    paddingLeft: theme.spacing(1) / 2,
    paddingRight: theme.spacing(1) / 2,
    paddingBottom: theme.spacing(1) / 8,
    paddingTop: theme.spacing(1) / 8,
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

export const InspirationDialog = memo(({ open = false, anchorEl, datasetID }) => {
  const id = open ? 'simple-popover-compound-cross-reference' : undefined;
  const imgHeight = 34;
  const imgWidth = 150;
  const classes = useStyles();
  const [searchString, setSearchString] = useState(null);
  const selectedAll = useRef(false);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const inspirationList = useSelector(state => state.datasetsReducers.inspirationLists[datasetID]);
  const isLoadingInspirationListOfMolecules = useSelector(
    state => state.datasetsReducers.isLoadingInspirationListOfMolecules
  );
  const inspirationMoleculeDataList = useSelector(state => state.datasetsReducers.inspirationMoleculeDataList);

  const ligandList = useSelector(state => state.selectionReducers.fragmentDisplayList);
  const proteinList = useSelector(state => state.selectionReducers.proteinList);
  const complexList = useSelector(state => state.selectionReducers.complexList);

  const dispatch = useDispatch();
  const disableUserInteraction = useDisableUserInteraction();

  useEffect(() => {
    const setOfInspirations = new Set(inspirationList);
    const arrayOfInspirations = [...setOfInspirations];
    if (arrayOfInspirations && arrayOfInspirations.length > 0) {
      dispatch(loadInspirationMoleculesDataList([...setOfInspirations])).catch(error => {
        throw new Error(error);
      });
    } else {
      dispatch(setInspirationMoleculeDataList([]));
    }
  }, [dispatch, inspirationList]);

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
  const changeButtonClassname = (givenList = []) => {
    if (moleculeList.length === givenList.length) {
      return true;
    } else if (givenList.length > 0) {
      return null;
    }
    return false;
  };

  const isLigandOn = changeButtonClassname(ligandList);
  const isProteinOn = changeButtonClassname(proteinList);
  const isComplexOn = changeButtonClassname(complexList);

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

  const removeSelectedType = type => {
    moleculeList.forEach(molecule => {
      dispatch(removeType[type](stage, molecule, colourList[molecule.id % colourList.length], datasetID));
    });
    selectedAll.current = false;
  };

  const addNewType = type => {
    moleculeList.forEach(molecule => {
      dispatch(addType[type](stage, molecule, colourList[molecule.id % colourList.length], datasetID));
    });
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
        addNewType(type);
      } else {
        removeSelectedType(type);
      }
    }
  };
  //  TODO refactor to this line

  return (
    <Popper id={id} open={open} anchorEl={anchorEl} placement="left-start">
      <Paper className={classes.paper} elevation={21}>
        <Grid container justify="space-between" direction="row">
          <Grid item>
            <Typography variant="h6" className={classes.title}>
              Inspirations
            </Typography>
          </Grid>
          <Grid item>
            <Grid container justify="space-between" direction="row">
              <Grid item>
                <TextField
                  className={classes.search}
                  id="search-inspiration-dialog"
                  placeholder="Search"
                  size="small"
                  // color="primary"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="inherit" />
                      </InputAdornment>
                    )
                  }}
                  onChange={handleSearch}
                  disabled={!(isLoadingInspirationListOfMolecules === false && moleculeList)}
                />
              </Grid>
              <Grid item>
                <IconButton className={classes.closeButton} onClick={() => dispatch(setIsOpenInspirationDialog(false))}>
                  <Close />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
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
                            disabled={disableUserInteraction}
                          >
                            <Typography variant="subtitle2">L</Typography>
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
                            disabled={disableUserInteraction}
                          >
                            <Typography variant="subtitle2">P</Typography>
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
                            disabled={disableUserInteraction}
                          >
                            <Typography variant="subtitle2">C</Typography>
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
                moleculeList.map((molecule, index) => (
                  <MoleculeView key={index} imageHeight={imgHeight} imageWidth={imgWidth} data={molecule} />
                ))}
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
      </Paper>
    </Popper>
  );
});
