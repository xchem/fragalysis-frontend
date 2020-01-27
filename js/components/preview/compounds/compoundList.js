/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CompoundView from './compoundView';
import { Panel } from '../../common/Surfaces/Panel';
import { Button } from '../../common/Inputs/Button';
import { Grid, Box, makeStyles, TextField, useTheme, CircularProgress } from '@material-ui/core';
import { SelectAll, Delete } from '@material-ui/icons';
import { clearAllSelectedCompounds, onChangeCompoundClassValue, selectAllCompounds } from './redux/dispatchActions';
import { compoundsColors } from './redux/constants';
import { getCompoundsList, getTotalCountOfMolecules } from '../../../reducers/selection/selectors';
import InfiniteScroll from 'react-infinite-scroller';

const useStyles = makeStyles(theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 50
  }
}));

export const CompoundList = memo(({ height }) => {
  const classes = useStyles();
  const panelRef = useRef(null);
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(0);

  const dispatch = useDispatch();

  const to_query = useSelector(state => state.selectionReducers.to_query);
  const compoundClasses = useSelector(state => state.selectionReducers.compoundClasses);
  const currentCompoundClass = useSelector(state => state.selectionReducers.currentCompoundClass);
  const totalCountOfMolecules = useSelector(state => getTotalCountOfMolecules(state));
  const compoundsList = useSelector(state => getCompoundsList(state));
  const querying = useSelector(state => state.selectionReducers.querying);
  const currentVector = useSelector(state => state.selectionReducers.currentVector);

  // Reset Infinity scroll
  useEffect(() => {
    setCurrentPage(0);
  }, [compoundsList]);

  const loadNextCompounds = () => {
    setCurrentPage(currentPage + 1);
  };
  const compoundsPerPage = 12;
  const listItemOffset = (currentPage + 1) * compoundsPerPage;
  const currentCompounds = compoundsList.slice(0, listItemOffset);
  const canLoadMore = listItemOffset < compoundsList.length;

  Object.keys(compoundsColors).forEach(item => {
    if (!!document.getElementById(item)) {
      let inputId = document.getElementById(item);
      inputId.style.backgroundColor = compoundsColors[item].color;
      inputId.style.border = `1px solid ${theme.palette.primary.contrastText}`;
      if (currentCompoundClass === item) {
        inputId.style.border = `2px solid ${theme.palette.primary.main}`;
      }
    }
  });

  let mol_string = 'No molecules found!';
  if (totalCountOfMolecules) {
    mol_string = 'Compounds to pick. Mol total: ' + totalCountOfMolecules;
  }
  if (to_query === '' || to_query === undefined) {
    mol_string = '';
  }

  if (to_query !== undefined) {
    return (
      <Panel hasHeader title={querying ? 'Loading....' : mol_string} ref={panelRef}>
        <Box height={height} overflow="auto">
          <Grid container direction="row" justify="space-between" alignItems="center">
            {Object.keys(compoundsColors).map(item => (
              <Grid item key={item}>
                <TextField
                  id={`${item}`}
                  key={`CLASS_${item}`}
                  className={classes.textField}
                  label={compoundsColors[item].text}
                  onKeyDown={e => dispatch(onChangeCompoundClassValue(e))}
                  defaultValue={compoundClasses[item]}
                />
              </Grid>
            ))}
          </Grid>
          <Box overflow="auto">
            <Grid container justify="flex-start">
              {currentVector !== undefined && currentCompounds && currentCompounds.length > 0 && (
                <InfiniteScroll
                  pageStart={0}
                  loadMore={loadNextCompounds}
                  hasMore={canLoadMore}
                  loader={
                    <div className="loader" key={0}>
                      <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                        className={classes.paddingProgress}
                      >
                        <CircularProgress />
                      </Grid>
                    </div>
                  }
                  useWindow={false}
                >
                  {compoundsList.map((data, index) => (
                    <Grid item key={index}>
                      <CompoundView height={100} width={100} data={data} />
                    </Grid>
                  ))}
                </InfiniteScroll>
              )}
            </Grid>
          </Box>
        </Box>
        <Button color="primary" onClick={() => dispatch(selectAllCompounds())} startIcon={<SelectAll />}>
          Select All
        </Button>
        <Button color="primary" onClick={() => dispatch(clearAllSelectedCompounds())} startIcon={<Delete />}>
          Clear Selection
        </Button>
      </Panel>
    );
  } else {
    return null;
  }
});
