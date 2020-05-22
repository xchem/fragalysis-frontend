import React, { memo, useEffect } from 'react';
import { CircularProgress, Grid, Paper, Popper } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { loadInspirationMoleculesDataList } from './redux/dispatchActions';
import MoleculeView from '../preview/molecule/moleculeView';
import { moleculeProperty } from '../preview/molecule/helperConstants';

const useStyles = makeStyles(theme => ({
  paper: {
    width: 700,
    height: 500,
    overflowY: 'auto',
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
  }
}));

export const InspirationDialog = memo(({ open, anchorEl, inspirationList }) => {
  const id = open ? 'simple-popover-compound-cross-reference' : undefined;
  const imgHeight = 34;
  const imgWidth = 150;
  const classes = useStyles();
  const isLoadingInspirationListOfMolecules = useSelector(
    state => state.datasetsReducers.isLoadingInspirationListOfMolecules
  );
  const inspirationMoleculeDataList = useSelector(state => state.datasetsReducers.inspirationMoleculeDataList);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadInspirationMoleculesDataList(inspirationList)).catch(error => {
      throw new Error(error);
    });
  }, [dispatch, inspirationList]);

  return (
    <Popper id={id} open={open} anchorEl={anchorEl} placement="left-start">
      <Paper className={classes.paper} elevation={21}>
        {isLoadingInspirationListOfMolecules === false &&
          inspirationMoleculeDataList &&
          inspirationMoleculeDataList.length > 0 && (
            <>
              <Grid container justify="flex-start" direction="row" className={classes.molHeader} wrap="nowrap">
                <Grid item container justify="flex-start" direction="row">
                  {Object.keys(moleculeProperty).map(key => (
                    <Grid item key={key} className={classes.rightBorder}>
                      {moleculeProperty[key]}
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              {inspirationMoleculeDataList.map(molecule => (
                <MoleculeView key={molecule.id} imageHeight={imgHeight} imageWidth={imgWidth} data={molecule} />
              ))}
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
