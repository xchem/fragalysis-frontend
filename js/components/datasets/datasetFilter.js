import React, { memo, useState } from 'react';
import { Paper, Popper } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { MOL_ATTRIBUTES } from '../preview/molecule/redux/constants';
import Grid from '@material-ui/core/Grid';
import WarningIcon from '@material-ui/icons/Warning';
import Button from '@material-ui/core/Button';
import { Delete } from '@material-ui/icons';
import { getFilteredMoleculesCount } from '../preview/molecule/moleculeListSortFilterDialog';
import { setFilterProperty } from './redux/actions';
import { scoreListOfMolecules } from './redux/selectors';

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

export const DatasetFilter = memo(({ open, anchorEl, filter, datasetID }) => {
  let classes = useStyles();
  const dispatch = useDispatch();
  const id = open ? 'simple-popover-datasets' : undefined;
  const moleculeLists = useSelector(state => state.datasetsReducers.moleculeLists[datasetID]);
  const scoreDatasetList = useSelector(state => state.datasetsReducers.scoreDatasetMap[datasetID]);
  const scoreCompoundMap = useSelector(state => state.datasetsReducers.scoreCompoundMap);

  const scoresOfMolecules = useSelector(state => scoreListOfMolecules(state, datasetID));

  const initialize = () => {
    let initObject = {
      active: false,
      predefined: 'none',
      filter: {},
      priorityOrder: MOL_ATTRIBUTES.map(molecule => molecule.key)
    };

    for (let attr of MOL_ATTRIBUTES) {
      const lowAttr = attr.key.toLowerCase();
      let minValue = -999999;
      let maxValue = 0;
      for (let molecule of scoreDatasetList) {
        const attrValue = molecule[lowAttr];
        if (attrValue > maxValue) maxValue = attrValue;
        if (minValue === -999999) minValue = maxValue;
        if (attrValue < minValue) minValue = attrValue;
      }

      initObject.filter[attr.key] = {
        priority: 0,
        order: 1,
        minValue: minValue,
        maxValue: maxValue,
        isFloat: attr.isFloat
      };
    }
    return initObject;
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

  const [initState] = useState(initialize());
  const [filteredCount, setFilteredCount] = useState(filter && getFilteredMoleculesCount(scoreDatasetList, filter));
  const [predefinedFilter, setPredefinedFilter] = useState(filter && filter.predefined);

  const handleFilterChange = filter => {
    const filterSet = Object.assign({}, filter);
    for (let attr of MOL_ATTRIBUTES) {
      if (filterSet.filter[attr.key].priority === undefined || filterSet.filter[attr.key].priority === '') {
        filterSet.filter[attr.key].priority = 0;
      }
    }
    dispatch(setFilterProperty(datasetID, filterSet));
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
    const resetFilter = initialize();
    setPredefinedFilter('none');
    dispatch(setFilterProperty(datasetID, resetFilter));
    setFilteredCount(getFilteredMoleculesCount(getListedMolecules(), resetFilter));
    handleFilterChange(resetFilter);
  };

  // Check for multiple attributes with same sorting priority
  let prioWarning = false;
  let prioWarningTest = {};
  for (const attr of MOL_ATTRIBUTES) {
    const prioKey = filter.filter[attr.key].priority;
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
              # of hits matching selection: <b>{filteredCount}</b>
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
      </Paper>
    </Popper>
  );
});
