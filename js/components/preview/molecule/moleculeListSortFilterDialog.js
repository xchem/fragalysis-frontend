import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { Popper, Paper } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import Grid from '@material-ui/core/Grid';
import MoleculeListSortFilterItem from './moleculeListSortFilterItem';
import WarningIcon from '@material-ui/icons/Warning';
import { makeStyles } from '@material-ui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { MOL_ATTRIBUTES } from './redux/constants';
import { setFilter } from '../../../reducers/selection/actions';

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

export const getFilteredMoleculesCount = (molecules, filter) => {
  let count = 0;
  for (let molecule of molecules) {
    let add = true; // By default molecule passes filter
    for (let attr of MOL_ATTRIBUTES) {
      const lowAttr = attr.key.toLowerCase();
      const attrValue = molecule[lowAttr];
      if (attrValue < filter.filter[attr.key].minValue || attrValue > filter.filter[attr.key].maxValue) {
        add = false;
        break; // Do not loop over other attributes
      }
    }
    if (add) {
      count = count + 1;
    }
  }
  return count;
};

export const getAttrDefinition = attr => {
  return MOL_ATTRIBUTES.find(molAttr => molAttr.key === attr);
};

export const filterMolecules = (molecules, filter) => {
  // 1. Filter
  let filteredMolecules = [];
  for (let molecule of molecules) {
    let add = true; // By default molecule passes filter
    for (let attr of MOL_ATTRIBUTES) {
      if (!attr.filter) continue;
      const lowAttr = attr.key.toLowerCase();
      const attrValue = molecule[lowAttr];
      if (attrValue < filter.filter[attr.key].minValue || attrValue > filter.filter[attr.key].maxValue) {
        add = false;
        break; // Do not loop over other attributes
      }
    }
    if (add) {
      filteredMolecules.push(molecule);
    }
  }

  // 2. Sort
  let sortedAttributes = filter.priorityOrder.map(attr => attr);

  return filteredMolecules.sort((a, b) => {
    for (let prioAttr of sortedAttributes) {
      const order = filter.filter[prioAttr].order;

      const attrLo = prioAttr.toLowerCase();
      let diff = order * (a[attrLo] - b[attrLo]);
      if (diff !== 0) {
        return diff;
      }
    }
  });
};

export const MoleculeListSortFilterDialog = memo(
  ({ molGroupSelection, filter, anchorEl, open, parentID = 'default', placement = 'right-start' }) => {
    let classes = useStyles();
    const dispatch = useDispatch();
    const moleculeGroupList = useSelector(state => state.apiReducers.mol_group_list);

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
        for (let molecule of getListedMolecules()) {
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
    const [filteredCount, setFilteredCount] = useState(getFilteredMoleculesCount(getListedMolecules(), filter));
    const [predefinedFilter, setPredefinedFilter] = useState(filter.predefined);

    const handleFilterChange = filter => {
      const filterSet = Object.assign({}, filter);
      for (let attr of MOL_ATTRIBUTES) {
        if (filterSet.filter[attr.key].priority === undefined || filterSet.filter[attr.key].priority === '') {
          filterSet.filter[attr.key].priority = 0;
        }
      }
      dispatch(setFilter(filterSet));
    };

    const handleItemChange = key => setting => {
      let newFilter = Object.assign({}, filter);
      newFilter.filter[key] = setting;
      newFilter.active = true;
      dispatch(setFilter(newFilter));
      setFilteredCount(getFilteredMoleculesCount(getListedMolecules(), newFilter));
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
        dispatch(setFilter(newFilter));
        handleFilterChange(newFilter);
      }
    };

    const handleClear = () => {
      const resetFilter = initialize();
      setPredefinedFilter('none');
      dispatch(setFilter(resetFilter));
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

    const id = open ? 'simple-popover-' + parentID : undefined;

    return (
      <Popper id={id} open={open} anchorEl={anchorEl} placement={placement}>
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
              let attrDef = getAttrDefinition(attr);
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
                  color={attrDef.color}
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
  }
);

MoleculeListSortFilterDialog.propTypes = {
  molGroupSelection: PropTypes.arrayOf(PropTypes.number).isRequired,
  cachedMolList: PropTypes.object.isRequired,
  filter: PropTypes.object,
  setFilter: PropTypes.func,
  anchorEl: PropTypes.object,
  open: PropTypes.bool.isRequired
};
