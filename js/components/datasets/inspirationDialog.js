import React, { memo, useEffect, useState } from 'react';
import {
  CircularProgress,
  Grid,
  Paper,
  Popper,
  IconButton,
  Typography,
  InputAdornment,
  TextField
} from '@material-ui/core';
import { Close, Search } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { loadInspirationMoleculesDataList } from './redux/dispatchActions';
import MoleculeView from '../preview/molecule/moleculeView';
import { moleculeProperty } from '../preview/molecule/helperConstants';
import { debounce } from 'lodash';
import { setIsOpenInspirationDialog, setSearchStringOfCompoundSet } from './redux/actions';

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
  }
}));

export const InspirationDialog = memo(({ open = false, anchorEl, inspirationList }) => {
  const id = open ? 'simple-popover-compound-cross-reference' : undefined;
  const imgHeight = 34;
  const imgWidth = 150;
  const classes = useStyles();
  const [searchString, setSearchString] = useState(null);

  const isLoadingInspirationListOfMolecules = useSelector(
    state => state.datasetsReducers.isLoadingInspirationListOfMolecules
  );
  const inspirationMoleculeDataList = useSelector(state => state.datasetsReducers.inspirationMoleculeDataList);
  const dispatch = useDispatch();

  useEffect(() => {
    const setOfInspirations = new Set(inspirationList);
    const arrayOfInspirations = [...setOfInspirations];
    if (arrayOfInspirations && arrayOfInspirations.length > 0) {
      dispatch(loadInspirationMoleculesDataList([...setOfInspirations])).catch(error => {
        throw new Error(error);
      });
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
  const hasMolecules = isLoadingInspirationListOfMolecules === false && moleculeList && moleculeList.length > 0;

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
                  id="input-with-icon-textfield"
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
                  disabled={!hasMolecules}
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
        {hasMolecules && (
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
            <div className={classes.content}>
              {moleculeList.map((molecule, index) => (
                <MoleculeView key={index} imageHeight={imgHeight} imageWidth={imgWidth} data={molecule} />
              ))}
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
