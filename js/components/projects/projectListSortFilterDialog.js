import React, { memo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Popper, Tooltip, IconButton } from '@material-ui/core';
import { Close, Delete } from '@material-ui/icons';
import Grid from '@material-ui/core/Grid';
import ProjectListSortFilterItem from './projectListSortFilterItem';
import WarningIcon from '@material-ui/icons/Warning';
import { makeStyles } from '@material-ui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { MOL_ATTRIBUTES } from './redux/constants';
import { setFilter } from '../../reducers/selection/actions';
import { Panel } from '../common/Surfaces/Panel';
import { setSortDialogOpen, setListOfFilteredProjects, setListOfProjects, setDefaultFilter } from './redux/actions';
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
    overflow: 'none',
  }
}));

const widthPrio = 50;
const widthOrder = 60;
const widthProperty = 170;
const filterData = 160


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

        initObject.filter[attr.key] = {
          priority: 0,
          order: 1,
          isFloat: attr.isFloat,
        };
      }
      return initObject;
    });

    useEffect(() => {
      const init = initialize();
      setInitState(init);
    }, [])

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

    
    const handleItemChange = key => setting => {
      console.log(`handleItemChange attr: ${key} values: ${JSON.stringify(setting)}`);
      let newFilter = Object.assign({}, filter);
      newFilter.filter[key] = setting;
      newFilter.active = true;
      dispatch(setFilter(newFilter));
      handleFilterChange(newFilter);
    };

    const handlePrioChange = key => inc => () => {
      const maxPrio = 5;
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

    const handleClearFilter = debounce(() => {
      dispatch(setDefaultFilter(true));
      dispatch(setSortDialogOpen(false));
      dispatch(setListOfFilteredProjects(defaultListOfProjects));
      dispatch(setListOfProjects(defaultListOfProjects));
      dispatch(setSortDialogOpen(true));
    });
    dispatch(setFilter(filter));
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
              <IconButton onClick={handleClearFilter} color="inherit" className={classes.headerButton}>
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
                <ProjectListSortFilterItem
                  key={attr}
                  property={attrDef.name}
                  order={filter.filter[attr].order}
                  isFloat={initState.filter[attr].isFloat}
                  color={attrDef.color}
                  onChangePrio={handlePrioChange(attr)}
                  onChange={handleItemChange(attr)}
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
