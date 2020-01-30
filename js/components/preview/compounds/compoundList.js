/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CompoundView from './compoundView';
import { Panel } from '../../common/Surfaces/Panel';
import { Button } from '../../common/Inputs/Button';
import { Grid, Box, makeStyles, TextField, useTheme, CircularProgress } from '@material-ui/core';
import { SelectAll, Delete } from '@material-ui/icons';
import {
  clearAllSelectedCompounds,
  loadNextPageOfCompounds,
  onChangeCompoundClassValue,
  selectAllCompounds
} from './redux/dispatchActions';
import { compoundsColors } from './redux/constants';
import { getCompoundsList, getTotalCountOfMolecules } from '../../../reducers/selection/selectors';
import InfiniteScroll from 'react-infinite-scroller';
import { getCanLoadMoreCompounds } from './redux/selectors';

const useStyles = makeStyles(theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 50
  },
  paddingProgress: {
    padding: theme.spacing(1),
    width: 100,
    height: 100
  },
  infinityContainer: {
    width: '100%',
    overflow: 'auto',
    padding: theme.spacing(1)
  }
}));

export const CompoundList = memo(({ height }) => {
  const classes = useStyles();
  const panelRef = useRef(null);
  const theme = useTheme();
  const dispatch = useDispatch();

  const to_query = useSelector(state => state.selectionReducers.to_query);
  const compoundClasses = useSelector(state => state.selectionReducers.compoundClasses);
  const currentCompoundClass = useSelector(state => state.selectionReducers.currentCompoundClass);
  const totalCountOfMolecules = useSelector(state => getTotalCountOfMolecules(state));
  const canLoadMoreCompounds = useSelector(state => getCanLoadMoreCompounds(state));
  const querying = useSelector(state => state.selectionReducers.querying);
  const currentVector = useSelector(state => state.selectionReducers.currentVector);
  const currentCompounds = useSelector(state => state.previewReducers.compounds.currentCompounds);
  const compoundsList = useSelector(state => getCompoundsList(state));

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
    mol_string = compoundsList.length + ' Compounds on vector to pick. Mol total: ' + totalCountOfMolecules;
  }
  if (to_query === '' || to_query === undefined) {
    mol_string = '';
  }

  if (currentVector !== undefined && to_query !== undefined) {
    return (
      <Panel hasHeader title={querying ? 'Loading....' : mol_string} ref={panelRef}>
        {currentCompounds && (
          <Box height={height} width="100%">
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
            <Grid container justify="flex-start" className={classes.infinityContainer}>
              <Box width="inherit" style={{ height: `calc(${height} - 114px)` }} overflow="auto">
                <InfiniteScroll
                  pageStart={0}
                  loadMore={() => dispatch(loadNextPageOfCompounds())}
                  hasMore={canLoadMoreCompounds}
                  loader={
                    <div className="loader" key={0}>
                      <div className={classes.paddingProgress}>
                        <CircularProgress />
                      </div>
                    </div>
                  }
                  useWindow={false}
                >
                  {currentCompounds.map(key => (
                    <CompoundView key={key} id={key} height={100} width={100} data={currentCompounds[key]} />
                  ))}
                </InfiniteScroll>
              </Box>
            </Grid>
            <Button color="primary" onClick={() => dispatch(selectAllCompounds())} startIcon={<SelectAll />}>
              Select All
            </Button>
            <Button color="primary" onClick={() => dispatch(clearAllSelectedCompounds())} startIcon={<Delete />}>
              Clear Selection
            </Button>
          </Box>
        )}
      </Panel>
    );
  } else {
    return null;
  }
});
