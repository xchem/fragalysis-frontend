import React, { forwardRef, memo, useContext, useEffect, useRef, useState } from 'react';
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
import {
  loadScoresOfCrossReferenceCompounds,
  loadInspirationMoleculesDataList,
  resetCrossReferenceDialog
} from './redux/dispatchActions';
import MoleculeView from '../preview/molecule/moleculeView';
import { moleculeProperty } from '../preview/molecule/helperConstants';
import { debounce } from 'lodash';
import { Button } from '../common/Inputs/Button';
import classNames from 'classnames';
import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';
import { colourList } from './datasetMoleculeView';
import { NglContext } from '../nglView/nglProvider';
import { VIEWS } from '../../constants/constants';
import { Panel } from '../common/Surfaces/Panel';
import { getCrossReferenceCompoundListByCompoundName } from './redux/selectors';
import { setCrossReferenceCompoundsDataList, setIsLoadingCrossReferenceScores } from './redux/actions';

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

export const CrossReferenceDialog = memo(
  forwardRef(({ open = false, anchorEl, datasetID }, ref) => {
    const dispatch = useDispatch();
    const id = open ? 'simple-popover-compound-cross-reference' : undefined;
    const imgHeight = 34;
    const imgWidth = 150;
    const classes = useStyles();
    const [searchString, setSearchString] = useState(null);

    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
    const disableUserInteraction = useDisableUserInteraction();

    const inspirationMoleculeDataList = useSelector(state => getCrossReferenceCompoundListByCompoundName(state));
    const isLoadingCrossReferenceScores = useSelector(state => state.datasetsReducers.isLoadingCrossReferenceScores);

    // TODO load scores in case when inspirationMoleculeDataList is not empty
    useEffect(() => {
      if (
        inspirationMoleculeDataList &&
        Array.isArray(inspirationMoleculeDataList) &&
        inspirationMoleculeDataList.length > 0
      ) {
        // moleculeList has following structure:
        // [
        // {molecule: {any data...}, datasetID: 1},
        // ...]
        dispatch(
          loadScoresOfCrossReferenceCompounds([...new Set(inspirationMoleculeDataList.map(item => item.datasetID))])
        );
      }
    }, [dispatch, inspirationMoleculeDataList]);

    let moleculeList = inspirationMoleculeDataList.map(item => item.molecule);

    return (
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
                {/*<Grid item container justify="flex-start" direction="row">*/}
                {/*{Object.keys(moleculeProperty).map(key => (*/}
                {/*  <Grid item key={key} className={classes.rightBorder}>*/}
                {/*    {moleculeProperty[key]}*/}
                {/*  </Grid>*/}
                {/*))}*/}
                {/*{moleculeList.length > 0 && (*/}
                {/*  <Grid item>*/}
                {/*    <Grid*/}
                {/*      container*/}
                {/*      direction="row"*/}
                {/*      justify="flex-start"*/}
                {/*      alignItems="center"*/}
                {/*      wrap="nowrap"*/}
                {/*      className={classes.contButtonsMargin}*/}
                {/*    >*/}
                {/*      <Tooltip title="all ligands">*/}
                {/*        <Grid item>*/}
                {/*          <Button*/}
                {/*            variant="outlined"*/}
                {/*            className={classNames(classes.contColButton, {*/}
                {/*              [classes.contColButtonSelected]: isLigandOn,*/}
                {/*              [classes.contColButtonHalfSelected]: isLigandOn === null*/}
                {/*            })}*/}
                {/*            onClick={() => onButtonToggle('ligand')}*/}
                {/*            disabled={disableUserInteraction}*/}
                {/*          >*/}
                {/*            L*/}
                {/*          </Button>*/}
                {/*        </Grid>*/}
                {/*      </Tooltip>*/}
                {/*      <Tooltip title="all sidechains">*/}
                {/*        <Grid item>*/}
                {/*          <Button*/}
                {/*            variant="outlined"*/}
                {/*            className={classNames(classes.contColButton, {*/}
                {/*              [classes.contColButtonSelected]: isProteinOn,*/}
                {/*              [classes.contColButtonHalfSelected]: isProteinOn === null*/}
                {/*            })}*/}
                {/*            onClick={() => onButtonToggle('protein')}*/}
                {/*            disabled={disableUserInteraction}*/}
                {/*          >*/}
                {/*            P*/}
                {/*          </Button>*/}
                {/*        </Grid>*/}
                {/*      </Tooltip>*/}
                {/*      <Tooltip title="all interactions">*/}
                {/*        <Grid item>*/}
                {/*          /!* C stands for contacts now *!/*/}
                {/*          <Button*/}
                {/*            variant="outlined"*/}
                {/*            className={classNames(classes.contColButton, {*/}
                {/*              [classes.contColButtonSelected]: isComplexOn,*/}
                {/*              [classes.contColButtonHalfSelected]: isComplexOn === null*/}
                {/*            })}*/}
                {/*            onClick={() => onButtonToggle('complex')}*/}
                {/*            disabled={disableUserInteraction}*/}
                {/*          >*/}
                {/*            C*/}
                {/*          </Button>*/}
                {/*        </Grid>*/}
                {/*      </Tooltip>*/}
                {/*    </Grid>*/}
                {/*  </Grid>*/}
                {/*)}*/}
                {/*</Grid>*/}
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
          {isLoadingCrossReferenceScores === true && (
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
