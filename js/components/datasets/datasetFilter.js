import React, { memo, useState } from 'react';
import { Paper, Popper, useTheme } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { MOL_ATTRIBUTES } from '../preview/molecule/redux/constants';
import Grid from '@material-ui/core/Grid';
import WarningIcon from '@material-ui/icons/Warning';
import Button from '@material-ui/core/Button';
import { Delete } from '@material-ui/icons';
import { setFilterProperty } from './redux/actions';
import { getInitialDatasetFilterObject, scoreListOfMolecules } from './redux/selectors';
import MoleculeListSortFilterItem from '../preview/molecule/moleculeListSortFilterItem';

const useStyles = makeStyles(theme => ({
  title: {
    fontSize: 22
  },
  numberOfHits: {
    flexGrow: 1
  },
  gridItemHeader: {
    height: '32px',
    fontSize: '12px',
    lineHeight: 1,
    color: '#7B7B7B',
    fontWeight: 'bold'
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  property: {
    fontSize: '10px',
    color: '#000'
  },
  min: {
    fontSize: '10px',
    color: '#7B7B7B'
  },
  warningIcon: {
    color: '#FFC107',
    position: 'relative',
    top: 2
  },
  paper: {
    width: 570,
    overflow: 'none',
    padding: theme.spacing(1)
  }
}));

const widthPrio = 50;
const widthOrder = 60;
const widthProperty = 212;
const widthMin = 30;
const widthSlider = 170;

export const DatasetFilter = memo(({ open, anchorEl, filter, datasetID }) => {
  let classes = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();
  const id = open ? 'simple-popover-datasets' : undefined;
  const initState = useSelector(state => getInitialDatasetFilterObject(state, datasetID));
  const moleculeLists = useSelector(state => state.datasetsReducers.moleculeLists[datasetID]);
  const scoreDatasetList = useSelector(state => state.datasetsReducers.scoreDatasetMap[datasetID]);
  const scoreCompoundMap = useSelector(state => state.datasetsReducers.scoreCompoundMap[datasetID]);

  const scoresOfMolecules = useSelector(state => scoreListOfMolecules(state, datasetID));

  // const [filteredCount, setFilteredCount] = useState(filter && getFilteredMoleculesCount(scoreDatasetList, filter));
  const [predefinedFilter, setPredefinedFilter] = useState(filter && filter.predefined);

  const getAttributeName = attr => {
    return scoreDatasetList.find(item => item.name === attr);
  };

  const getListedMolecules = () => {
    let molecules = [];
    for (let molgroupId of molGroupSelection) {
      // Selected molecule groups
      const molGroup = moleculeGroupList;
      if (molGroup) {
        molecules = molecules.concat(molGroup);
      } else {
        console.log(`Molecule group ${molgroupId} not found in cached list`);
      }
    }

    return molecules;
  };

  const handleFilterChange = filter => {
    const filterSet = Object.assign({}, filter);
    for (let attr of MOL_ATTRIBUTES) {
      if (filterSet.filter[attr.key].priority === undefined || filterSet.filter[attr.key].priority === '') {
        filterSet.filter[attr.key].priority = 0;
      }
    }
    dispatch(setFilterProperty(datasetID, filterSet));
  };

  const handleItemChange = key => setting => {
    let newFilter = Object.assign({}, filter);
    newFilter.filter[key] = setting;
    newFilter.active = true;
    dispatch(setFilterProperty(datasetID, newFilter));
    // setFilteredCount(getFilteredMoleculesCount(getListedMolecules(), newFilter));
    handleFilterChange(newFilter);
  };

  const handlePrioChange = key => inc => () => {
    const maxPrio = MOL_ATTRIBUTES.length - 1;
    const minPrio = 0;
    let priorityOrder = filter.priorityOrder;
    const index = filter.priorityOrder.indexOf(key);
    if (index > -1 && index + inc >= minPrio && index <= maxPrio) {
      priorityOrder.splice(index, 1);
      priorityOrder.splice(index + inc, 0, key);
      let newFilter = Object.assign({}, filter);
      newFilter.priorityOrder = priorityOrder;
      newFilter.active = true;
      dispatch(setFilterProperty(datasetID, newFilter));
      handleFilterChange(newFilter);
    }
  };

  const handleClear = () => {
    // const resetFilter = initialize();
    // setPredefinedFilter('none');
    // dispatch(setFilterProperty(datasetID, resetFilter));
    // setFilteredCount(getFilteredMoleculesCount(getListedMolecules(), resetFilter));
    // handleFilterChange(resetFilter);
  };

  // Check for multiple attributes with same sorting priority
  let prioWarning = false;
  let prioWarningTest = {};
  for (const attr of scoreCompoundMap) {
    const prioKey = filter.filter[attr.score.name].priority;
    if (prioKey > 0) {
      prioWarningTest[prioKey] = prioWarningTest[prioKey] ? prioWarningTest[prioKey] + 1 : 1;
      if (prioWarningTest[prioKey] > 1) prioWarning = true;
    }
  }

  return (
    <Popper id={id} open={open} anchorEl={anchorEl} placement="left-start">
      <Paper className={classes.paper} elevation={21}>
        <Grid container justify="space-between" direction="row" alignItems="center">
          <Grid item>
            <div className={classes.numberOfHits}>
              {/*# of hits matching selection: <b>{filteredCount}</b>*/}
              {prioWarning && (
                <div>
                  <WarningIcon className={classes.warningIcon} /> multiple attributes with same sorting priority
                </div>
              )}
            </div>
          </Grid>
          <Grid item>
            <Button onClick={handleClear} color="secondary" variant="contained" startIcon={<Delete />}>
              Clear
            </Button>
          </Grid>
        </Grid>
        <Grid container>
          <Grid container item className={classes.gridItemHeader}>
            <Grid item className={classes.centered} style={{ width: widthPrio }}>
              priority
            </Grid>
            <Grid item className={classes.centered} style={{ width: widthOrder }}>
              <div style={{ textAlign: 'center' }}>
                order
                <br />
                <span style={{ fontSize: 'smaller' }}>(up/down)</span>
              </div>
            </Grid>
            <Grid item className={classes.centered} style={{ width: widthProperty }}>
              property
            </Grid>
            <Grid item className={classes.centered} style={{ width: widthMin }}>
              min
            </Grid>
            <Grid item className={classes.centered} style={{ width: widthSlider }} />
            <Grid item className={classes.centered} style={{ width: widthMin }}>
              max
            </Grid>
          </Grid>

          {filter.priorityOrder.map(attr => {
            let attrDef = getAttributeName(attr);
            return (
              <MoleculeListSortFilterItem
                key={attr}
                property={attrDef.name}
                order={filter.filter[attr].order}
                minValue={filter.filter[attr].minValue}
                maxValue={filter.filter[attr].maxValue}
                min={initState.filter[attr].minValue}
                max={initState.filter[attr].maxValue}
                isFloat={initState.filter[attr].isFloat}
                color={theme.palette.primary.light}
                disabled={predefinedFilter !== 'none'}
                onChange={handleItemChange(attr)}
                onChangePrio={handlePrioChange(attr)}
                filter={attrDef.filter}
              />
            );
          })}
        </Grid>
      </Paper>
    </Popper>
  );
});
