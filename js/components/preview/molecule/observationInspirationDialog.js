import React, { forwardRef, memo, useCallback, useContext, useRef, useState } from 'react';
import { CircularProgress, Grid, Popper, IconButton, Typography } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { Panel } from '../../common/Surfaces/Panel';
import RichTooltip from '../../tooltip/RichTooltip';
import { TooltipPathProvider } from '../../tooltip/TooltipPathContext';
import {
  setIsObsInspirationDialogOpen,
  setObsInspirationDialogObsIds,
  setObsInspirationDialogPoseId,
  setDeselectedAllByType,
  setSelectedAllByType
} from '../../../reducers/selection/actions';
import MoleculeView from './moleculeView';
import { colourList } from './utils/color';
import { NglContext } from '../../nglView/nglProvider';
import { VIEWS } from '../../../constants/constants';
import {
  addLigand,
  addHitProtein,
  addComplex,
  addSurface,
  removeLigand,
  removeHitProtein,
  removeComplex,
  removeSurface,
  removeSelectedMolTypes,
  withDisabledMoleculesNglControlButtons
} from './redux/dispatchActions';
import { changeButtonClassname } from '../../datasets/helpers';
import { Button } from '../../common/Inputs/Button';
import classNames from 'classnames';
import GroupNglControlButtonsContext from './groupNglControlButtonsContext';
import useDisableNglControlButtons from './useDisableNglControlButtons';

const useStyles = makeStyles(theme => ({
  paper: {
    width: 505,
    overflowY: 'hidden'
  },
  content: {
    overflowY: 'auto',
    height: 214
  },
  notFound: {
    paddingTop: theme.spacing(2)
  },
  molHeader: {
    marginLeft: 19,
    width: 'calc(100% - 19px)'
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
      backgroundColor: theme.palette.primary.light
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
    }
  },
  contColButtonHalfSelected: {
    backgroundColor: theme.palette.primary.semidark,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.semidark
    }
  },
  headerButton: {
    paddingTop: 10
  }
}));

export const ObservationInspirationDialog = memo(
  forwardRef(({ open = false, anchorEl, ligandRepresentations = undefined }, ref) => {
    const id = open ? 'obs-inspiration-dialog' : undefined;
    const classes = useStyles();
    const dispatch = useDispatch();
    const selectedAll = useRef(false);

    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    const obsIds = useSelector(state => state.selectionReducers.obsInspirationDialogObsIds);
    const allMolLists = useSelector(state => state.apiReducers.all_mol_lists);

    const moleculeList = React.useMemo(() => {
      if (!obsIds || !allMolLists) return [];
      return obsIds.map(id => allMolLists.find(mol => mol.id === id)).filter(Boolean);
    }, [obsIds, allMolLists]);

    const ligandList = useSelector(state => state.selectionReducers.fragmentDisplayList);
    const proteinList = useSelector(state => state.selectionReducers.proteinList);
    const complexList = useSelector(state => state.selectionReducers.complexList);
    const surfaceList = useSelector(state => state.selectionReducers.surfaceList);
    const densityList = useSelector(state => state.selectionReducers.densityList);
    const qualityList = useSelector(state => state.selectionReducers.qualityList);
    const vectorOnList = useSelector(state => state.selectionReducers.vectorOnList);
    const informationList = useSelector(state => state.selectionReducers.informationList);
    const molForTagEditId = useSelector(state => state.selectionReducers.molForTagEdit);
    const moleculesToEditIds = useSelector(state => state.selectionReducers.moleculesToEdit);

    const allSelectedMolecules = moleculeList.filter(mol => moleculesToEditIds.includes(mol?.id));

    const isLigandOn = changeButtonClassname(
      ligandList.filter(id => allSelectedMolecules.find(mol => mol.id === id) !== undefined),
      allSelectedMolecules
    );
    const isProteinOn = changeButtonClassname(
      proteinList.filter(id => allSelectedMolecules.find(mol => mol.id === id) !== undefined),
      allSelectedMolecules
    );
    const isComplexOn = changeButtonClassname(
      complexList.filter(id => allSelectedMolecules.find(mol => mol.id === id) !== undefined),
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
        const molecules = [...moleculeList].filter(mol => !skipMolecules.some(s => s.id === mol.id));
        dispatch(removeSelectedMolTypes(stage, molecules, skipTracking, true));
      },
      [dispatch, moleculeList, stage]
    );

    const removeSelectedType = (type, skipTracking = false) => {
      if (type === 'ligand') {
        allSelectedMolecules.forEach(mol => dispatch(removeType[type](stage, mol, skipTracking)));
      } else {
        allSelectedMolecules.forEach(mol =>
          dispatch(removeType[type](stage, mol, colourList[mol.id % colourList.length], skipTracking))
        );
      }
      selectedAll.current = false;
    };

    const addNewType = (type, skipTracking = false) => {
      dispatch(
        withDisabledMoleculesNglControlButtons(
          allSelectedMolecules.map(mol => mol.id),
          type,
          async () => {
            const promises = allSelectedMolecules.map(mol =>
              type === 'ligand'
                ? dispatch(
                    addType[type](
                      stage,
                      mol,
                      colourList[mol.id % colourList.length],
                      false,
                      true,
                      skipTracking,
                      ligandRepresentations
                    )
                  )
                : dispatch(addType[type](stage, mol, colourList[mol.id % colourList.length], skipTracking))
            );
            await Promise.all(promises);
          }
        )
      );
    };

    const getMoleculesToSelect = list => allSelectedMolecules.filter(m => !list.includes(m.id));
    const getMoleculesToDeselect = list => allSelectedMolecules.filter(m => list.includes(m.id));

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

    const ucfirst = s => s.charAt(0).toUpperCase() + s.slice(1);

    const onButtonToggle = (type, calledFromSelectAll = false) => {
      if (calledFromSelectAll && selectedAll.current) {
        if (eval('is' + ucfirst(type) + 'On') === false) addNewType(type);
      } else if (calledFromSelectAll && !selectedAll.current) {
        removeSelectedType(type);
      } else if (!calledFromSelectAll) {
        if (eval('is' + ucfirst(type) + 'On') === false) {
          const molecules = getSelectedMoleculesByType(type, true);
          dispatch(setSelectedAllByType(type, molecules, true));
          addNewType(type);
        } else {
          const molecules = getSelectedMoleculesByType(type, false);
          dispatch(setDeselectedAllByType(type, molecules, true));
          removeSelectedType(type);
        }
      }
    };

    const groupNglControlButtonsDisabledState = useDisableNglControlButtons(allSelectedMolecules);

    const handleClose = () => {
      dispatch(setIsObsInspirationDialogOpen(false));
      dispatch(setObsInspirationDialogObsIds([]));
      dispatch(setObsInspirationDialogPoseId(0));
    };

    return (
      <Popper id={id} open={open} anchorEl={anchorEl} placement="left-start" ref={ref}>
        <Panel
          hasHeader
          secondaryBackground
          title="Computed Inspirations"
          className={classes.paper}
          headerActions={[
            <RichTooltip key="close" path="close">
              <IconButton color="inherit" className={classes.headerButton} onClick={handleClose}>
                <Close />
              </IconButton>
            </RichTooltip>
          ]}
        >
          <Grid container justifyContent="flex-start" direction="row" className={classes.molHeader} wrap="nowrap">
            {allSelectedMolecules.length > 0 && (
              <Grid item>
                <Grid
                  container
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  wrap="nowrap"
                  className={classes.contButtonsMargin}
                >
                  <RichTooltip path="allLigands">
                    <Grid item>
                      <Button
                        variant="outlined"
                        className={classNames(classes.contColButton, {
                          [classes.contColButtonSelected]: isLigandOn,
                          [classes.contColButtonHalfSelected]: isLigandOn === null
                        })}
                        onClick={() => onButtonToggle('ligand')}
                        disabled={groupNglControlButtonsDisabledState.ligand}
                      >
                        L
                      </Button>
                    </Grid>
                  </RichTooltip>
                  <RichTooltip path="allSidechains">
                    <Grid item>
                      <Button
                        variant="outlined"
                        className={classNames(classes.contColButton, {
                          [classes.contColButtonSelected]: isProteinOn,
                          [classes.contColButtonHalfSelected]: isProteinOn === null
                        })}
                        onClick={() => onButtonToggle('protein')}
                        disabled={groupNglControlButtonsDisabledState.protein}
                      >
                        P
                      </Button>
                    </Grid>
                  </RichTooltip>
                  <RichTooltip path="allInteractions">
                    <Grid item>
                      <Button
                        variant="outlined"
                        className={classNames(classes.contColButton, {
                          [classes.contColButtonSelected]: isComplexOn,
                          [classes.contColButtonHalfSelected]: isComplexOn === null
                        })}
                        onClick={() => onButtonToggle('complex')}
                        disabled={groupNglControlButtonsDisabledState.complex}
                      >
                        C
                      </Button>
                    </Grid>
                  </RichTooltip>
                </Grid>
              </Grid>
            )}
          </Grid>
          <div className={classes.content}>
            {moleculeList.length > 0 &&
              moleculeList.map((molecule, index, array) => {
                if (!molecule) return null;
                const data = { ...molecule, isInspiration: true };
                const previousData = index > 0 ? { ...array[index - 1], isInspiration: true } : undefined;
                const nextData =
                  index < array.length - 1 ? { ...array[index + 1], isInspiration: true } : undefined;
                const selected = allSelectedMolecules.some(m => m.id === data.id);

                return (
                  <GroupNglControlButtonsContext.Provider key={molecule.id} value={groupNglControlButtonsDisabledState}>
                    <TooltipPathProvider path="observation">
                      <MoleculeView
                        index={index}
                        imageHeight={49}
                        imageWidth={150}
                        data={data}
                        searchMoleculeGroup
                        previousItemData={previousData}
                        nextItemData={nextData}
                        removeSelectedTypes={removeSelectedTypes}
                        L={ligandList.includes(molecule.id)}
                        P={proteinList.includes(molecule.id)}
                        C={complexList.includes(molecule.id)}
                        S={surfaceList.includes(molecule.id)}
                        D={densityList.some(d => d.id === molecule.id)}
                        Q={qualityList.includes(molecule.id)}
                        V={vectorOnList.includes(molecule.id)}
                        I={informationList.includes(molecule.id)}
                        selected={selected}
                        isTagEditorInvokedByMolecule={molForTagEditId.some(mid => molecule.id === mid)}
                        disableL={selected && groupNglControlButtonsDisabledState.ligand}
                        disableP={selected && groupNglControlButtonsDisabledState.protein}
                        disableC={selected && groupNglControlButtonsDisabledState.complex}
                      />
                    </TooltipPathProvider>
                  </GroupNglControlButtonsContext.Provider>
                );
              })}
            {moleculeList.length === 0 && (
              <Grid
                container
                justifyContent="center"
                alignItems="center"
                direction="row"
                className={classes.notFound}
              >
                <Grid item>
                  <Typography variant="body2">No inspirations found!</Typography>
                </Grid>
              </Grid>
            )}
          </div>
        </Panel>
      </Popper>
    );
  })
);
