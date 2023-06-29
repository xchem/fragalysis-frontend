import React, { memo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Popper, Tooltip, IconButton } from '@material-ui/core';
import { Close, Delete } from '@material-ui/icons';
import Grid from '@material-ui/core/Grid';
import MoleculeListSortFilterItem from './projectListSortFilterItem';
import WarningIcon from '@material-ui/icons/Warning';
import { makeStyles } from '@material-ui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { MOL_ATTRIBUTES } from './redux/constants';
import { setFilter } from '../../reducers/selection/actions';
import { Panel } from '../common/Surfaces/Panel';
import { setSortDialogOpen, setListOfFilteredProjects } from './redux/actions';
import { debounce } from 'lodash';

const useStyles = makeStyles(theme => ({
  title: {
    fontSize: 22
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
    width: 490,
    overflow: 'none'
  }
}));

const widthPrio = 50;
const widthOrder = 60;
const widthProperty = 212;
const filterData = 100


export const getAttrDefinition = attr => {
  return MOL_ATTRIBUTES.find(molAttr => molAttr.key === attr);
};

export const ProjectListSortFilterDialog = memo(
  ({
    filter,
    anchorEl,
    open,
    parentID = 'default',
    placement = 'right-start',
    joinedMoleculeLists
  }) => {
    let classes = useStyles();
    const dispatch = useDispatch();
    const initialize = useCallback(() => {
      let initObject = {
        active: false,
        predefined: 'none',
        filter: {},
        priorityOrder: MOL_ATTRIBUTES.map(molecule => molecule.key)
      };

      for (let attr of MOL_ATTRIBUTES) {
        const lowAttr = attr.key.toLowerCase();
        let minValue = -999999;
        let maxValue = -999999;

        joinedMoleculeLists.forEach(molecule => {
          const attrValue = molecule[lowAttr];
          if (attrValue > maxValue) maxValue = attrValue;
          if (minValue === -999999) minValue = maxValue;
          if (attrValue < minValue) minValue = attrValue;
        });

        initObject.filter[attr.key] = {
          priority: 0,
          order: 1,
          minValue: minValue,
          maxValue: maxValue,
          isFloat: attr.isFloat,
          value: ''
        };
      }
      return initObject;
    }, [joinedMoleculeLists]);

    const [initState, setInitState] = useState(initialize());
    const defaultListOfProjects = useSelector(state => state.projectReducers.listOfProjects);

    filter = filter || initState;

    const handleFilterChange = useCallback(
      filter => {
        const filterSet = Object.assign({}, filter);
        for (let attr of MOL_ATTRIBUTES) {
          if (filterSet.filter[attr.key].priority === undefined || filterSet.filter[attr.key].priority === '') {
            filterSet.filter[attr.key].priority = 0;
          }
        }
        dispatch(setFilter(filterSet));
      },
      [dispatch]
    );

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

    const handleClear = debounce(() => {
      dispatch(setSortDialogOpen(false));
      dispatch(setListOfFilteredProjects(defaultListOfProjects))
      dispatch(setSortDialogOpen(true));
    });

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
        <Panel
          hasHeader
          bodyOverflow
          secondaryBackground
          title={`Project list filter`}
          className={classes.paper}
          headerActions={[
            <Tooltip title="Clear filter">
              <IconButton onClick={handleClear} color="inherit" className={classes.headerButton}>
                <Delete />
              </IconButton>
            </Tooltip>,
            <Tooltip title="Close filter">
              <IconButton
                onClick={() => {
                  dispatch(setSortDialogOpen(false));
                }}
                color="inherit"
                className={classes.headerButton}
              >
                <Close />
              </IconButton>
            </Tooltip>
          ]}
        >
          {prioWarning && (
            <div>
              <WarningIcon className={classes.warningIcon} /> multiple attributes with same sorting priority
            </div>
          )}
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
              <Grid item className={classes.centered} style={{ width: filterData }}>
               Filter data
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
                  onChangePrio={handlePrioChange(attr)}
                  filter={attrDef.filter}
                  dateFilter={attrDef.dateFilter}
                />
              );
            })}
          </Grid>
        </Panel>
      </Popper>
    );
  }
);

ProjectListSortFilterDialog.propTypes = {
  filter: PropTypes.object,
  setFilter: PropTypes.func,
  anchorEl: PropTypes.object,
  open: PropTypes.bool.isRequired
};
