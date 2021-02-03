import React, { forwardRef, memo, useContext, useEffect, useState } from 'react';
import { CircularProgress, Grid, Popper, IconButton, Typography, Tooltip } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadScoresOfCrossReferenceCompounds,
  handleAllLigandsOfCrossReferenceDialog,
  resetCrossReferenceDialog,
  removeOrAddAllHitProteinsOfList,
  removeOrAddAllComplexesOfList,
  removeDatasetLigand,
  removeDatasetHitProtein,
  removeDatasetComplex,
  removeDatasetSurface
} from './redux/dispatchActions';
import { Button } from '../common/Inputs/Button';
import classNames from 'classnames';
// import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';
import { colourList, DatasetMoleculeView } from './datasetMoleculeView';
import { NglContext } from '../nglView/nglProvider';
import { VIEWS } from '../../constants/constants';
import { Panel } from '../common/Surfaces/Panel';
import {
  getCrossReferenceCompoundListByCompoundName,
  getListOfSelectedComplexOfAllDatasets,
  getListOfSelectedLigandOfAllDatasets,
  getListOfSelectedProteinOfAllDatasets
} from './redux/selectors';
import { changeButtonClassname } from './helpers';

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
    height: 214,
    width: 'fit-content'
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

export const CrossReferenceDialog = memo(
  forwardRef(({ open = false, anchorEl, datasetID }, ref) => {
    const dispatch = useDispatch();
    const id = open ? 'simple-popover-compound-cross-reference' : undefined;
    const imgHeight = 34;
    const imgWidth = 150;
    const classes = useStyles();

    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
    // const disableUserInteraction = useDisableUserInteraction();

    const moleculeList = useSelector(state => getCrossReferenceCompoundListByCompoundName(state));
    const isLoadingCrossReferenceScores = useSelector(state => state.datasetsReducers.isLoadingCrossReferenceScores);

    const ligandList = useSelector(state => getListOfSelectedLigandOfAllDatasets(state));
    const proteinList = useSelector(state => getListOfSelectedProteinOfAllDatasets(state));
    const complexList = useSelector(state => getListOfSelectedComplexOfAllDatasets(state));

    const ligandListAllDatasets = useSelector(state => state.datasetsReducers.ligandLists);
    const proteinListAllDatasets = useSelector(state => state.datasetsReducers.proteinLists);
    const complexListAllDatasets = useSelector(state => state.datasetsReducers.complexLists);
    const surfaceListAllDatasets = useSelector(state => state.datasetsReducers.surfaceLists);

    const removeOfAllSelectedTypes = skipTracking => {
      Object.keys(ligandListAllDatasets).forEach(datasetKey => {
        ligandListAllDatasets[datasetKey]?.forEach(moleculeID => {
          const foundedMolecule = moleculeList?.find(mol => mol?.molecule?.id === moleculeID);
          dispatch(
            removeDatasetLigand(
              stage,
              foundedMolecule?.molecule,
              colourList[foundedMolecule?.molecule?.id % colourList.length],
              datasetKey,
              skipTracking
            )
          );
        });
      });
      Object.keys(proteinListAllDatasets).forEach(datasetKey => {
        proteinListAllDatasets[datasetKey]?.forEach(moleculeID => {
          const foundedMolecule = moleculeList?.find(mol => mol?.molecule?.id === moleculeID);
          dispatch(
            removeDatasetHitProtein(
              stage,
              foundedMolecule?.molecule,
              colourList[foundedMolecule?.molecule?.id % colourList.length],
              datasetKey,
              skipTracking
            )
          );
        });
      });
      Object.keys(complexListAllDatasets).forEach(datasetKey => {
        complexListAllDatasets[datasetKey]?.forEach(moleculeID => {
          const foundedMolecule = moleculeList?.find(mol => mol?.molecule?.id === moleculeID);
          dispatch(
            removeDatasetComplex(
              stage,
              foundedMolecule?.molecule,
              colourList[foundedMolecule?.molecule?.id % colourList.length],
              datasetKey,
              skipTracking
            )
          );
        });
      });
      Object.keys(surfaceListAllDatasets).forEach(datasetKey => {
        surfaceListAllDatasets[datasetKey]?.forEach(moleculeID => {
          const foundedMolecule = moleculeList?.find(mol => mol?.molecule?.id === moleculeID);
          dispatch(
            removeDatasetSurface(
              stage,
              foundedMolecule?.molecule,
              colourList[foundedMolecule?.molecule?.id % colourList.length],
              datasetKey,
              skipTracking
            )
          );
        });
      });
    };

    useEffect(() => {
      if (moleculeList && Array.isArray(moleculeList) && moleculeList.length > 0) {
        // moleculeList has following structure:
        // [
        // {molecule: {any data...}, datasetID: 1},
        // ...]
        dispatch(loadScoresOfCrossReferenceCompounds([...new Set(moleculeList.map(item => item.datasetID))]));
      }
    }, [dispatch, moleculeList]);

    const isLigandOn = changeButtonClassname(
      ligandList.filter(moleculeID => moleculeList.find(molecule => molecule.molecule.id === moleculeID) !== undefined),
      moleculeList
    );
    const isProteinOn = changeButtonClassname(
      proteinList.filter(
        moleculeID => moleculeList.find(molecule => molecule.molecule.id === moleculeID) !== undefined
      ),
      moleculeList
    );
    const isComplexOn = changeButtonClassname(
      complexList.filter(
        moleculeID => moleculeList.find(molecule => molecule.molecule.id === moleculeID) !== undefined
      ),
      moleculeList
    );

    if (anchorEl === null) {
      dispatch(resetCrossReferenceDialog());
    }

    return (
      <>
        {anchorEl && anchorEl !== null && (
          <>
            <Popper id={id} open={open} anchorEl={anchorEl} placement="left-start" ref={ref}>
              <Panel
                hasHeader
                secondaryBackground
                title="Cross Reference"
                className={classes.paper}
                headerActions={[
                  <Tooltip title="Close cross reference dialog">
                    <IconButton
                      color="inherit"
                      className={classes.headerButton}
                      onClick={() => dispatch(resetCrossReferenceDialog())}
                    >
                      <Close />
                    </IconButton>
                  </Tooltip>
                ]}
              >
                {isLoadingCrossReferenceScores === false && moleculeList && (
                  <>
                    <Grid container justify="flex-start" direction="row" className={classes.molHeader} wrap="nowrap">
                      <Grid item container justify="flex-start" direction="row">
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
                                    onClick={() =>
                                      dispatch(handleAllLigandsOfCrossReferenceDialog(isLigandOn, moleculeList, stage))
                                    }
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
                                    onClick={() =>
                                      dispatch(removeOrAddAllHitProteinsOfList(isProteinOn, moleculeList, stage))
                                    }
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
                                    onClick={() =>
                                      dispatch(removeOrAddAllComplexesOfList(isComplexOn, moleculeList, stage))
                                    }
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
                        moleculeList.map((data, index, array) => {
                          let molecule = Object.assign({ isCrossReference: true }, data.molecule);
                          let previousData = index > 0 && Object.assign({ isCrossReference: true }, array[index - 1]);
                          let nextData =
                            index < array?.length && Object.assign({ isCrossReference: true }, array[index + 1]);

                          return (
                            <DatasetMoleculeView
                              key={index}
                              index={index}
                              imageHeight={imgHeight}
                              imageWidth={imgWidth}
                              data={molecule}
                              datasetID={data.datasetID}
                              hideFButton
                              showDatasetName
                              previousItemData={previousData}
                              nextItemData={nextData}
                              removeOfAllSelectedTypes={removeOfAllSelectedTypes}
                              L={ligandList.includes(data.id)}
                              P={proteinList.includes(data.id)}
                              C={complexList.includes(data.id)}
                              S={false}
                              V={false}
                            />
                          );
                        })}
                      {!(moleculeList.length > 0) && (
                        <Grid
                          container
                          justify="center"
                          alignItems="center"
                          direction="row"
                          className={classes.notFound}
                        >
                          <Grid item>
                            <Typography variant="body2">No molecules found!</Typography>
                          </Grid>
                        </Grid>
                      )}
                    </div>
                  </>
                )}
                {isLoadingCrossReferenceScores === true && (
                  <Grid container alignItems="center" justify="center">
                    <Grid item>
                      <CircularProgress />
                    </Grid>
                  </Grid>
                )}
              </Panel>
            </Popper>
          </>
        )}
      </>
    );
  })
);
