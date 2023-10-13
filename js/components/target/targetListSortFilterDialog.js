import React, { memo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Popper, Tooltip, IconButton } from '@material-ui/core';
import { Close, Delete } from '@material-ui/icons';
import Grid from '@material-ui/core/Grid';
import TargetListSortFilterItem from './targetListSortFilterItem';
import WarningIcon from '@material-ui/icons/Warning';
import { makeStyles } from '@material-ui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { TARGETS_ATTR } from './redux/constants';
import { Panel } from '../common/Surfaces/Panel';
import {
  setSortTargetDialogOpen,
  setListOfFilteredTargets,
  setListOfTargets,
  setDefaultFilter,
  setListOfFilteredTargetsByDate
} from './redux/actions';
import { setTargetFilter } from '../../reducers/selection/actions';
import { debounce } from 'lodash';
import { compareTargetAsc } from './sortTargets/sortTargets';
import { MOCK_LIST_OF_TARGETS } from './MOCK';

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
    width: 520,
    overflow: 'none'
  }
}));

const widthPrio = 50;
const widthOrder = 90;
const widthProperty = 170;
const filterData = 160;

export const getAttrDefinition = attr => {
  return TARGETS_ATTR.find(molAttr => molAttr.key === attr);
};

const getNestedAttributeValue = (object, attribute, path) => {
  if (!path) {
    return object[attribute];
  }

  const pathAttributes = path.split('.');
  let attributeValue = object;
  for (const pathAttribute of pathAttributes) {
    attributeValue = attributeValue[pathAttribute];
    if (attributeValue === undefined) return undefined;
  }
  return attributeValue;
};

export const sortTargets = (targets, filter) => {
  let sortedAttributes = filter?.sortOptions.map(attr => attr);
  return targets.sort((a, b) => {
    for (const [attrName, path] of sortedAttributes) {
      const order = filter.filter[attrName].order;
      const val1 = getNestedAttributeValue(a, attrName, path);
      const val2 = getNestedAttributeValue(b, attrName, path);
      if (order === -1) {
        return val1 < val2 ? 1 : -1; // !! TODO these return stop for...of loop!
      } else {
        return val1 > val2 ? 1 : -1;
      }
    }
    return 0;
  });
};

export const TargetListSortFilterDialog = memo(
  ({ filter, anchorEl, open, parentID = 'default', placement = 'right-start' }) => {
    let classes = useStyles();
    const dispatch = useDispatch();
    const initialize = useCallback(() => {
      let initObject = {
        active: false,
        predefined: 'none',
        filter: {},
        priorityOrder: TARGETS_ATTR.map(target => target.key),
        sortOptions: TARGETS_ATTR.map(target => [target.key, target.path])
      };

      for (let attr of TARGETS_ATTR) {
        const lowAttr = attr.key.toLowerCase();

        initObject.filter[attr.key] = {
          priority: 0,
          order: 1,
          isFloat: attr.isFloat
        };
      }
      return initObject;
    });

    useEffect(() => {
      const init = initialize();
      setInitState(init);
    }, []);

    const target_id_list = useSelector(state => state.apiReducers.target_id_list);
    const [initState, setInitState] = useState(initialize());
    //let defaultListOfTargetsWithoutSort = useSelector(state => state.targetReducers.listOfTargets);
    let defaultListOfTargetsWithoutSort = target_id_list; // remove after real data
    let defaultListOfTargets = [...defaultListOfTargetsWithoutSort].sort(compareTargetAsc);

    filter = filter || initState;

    const handleFilterChange = useCallback(
      filter => {
        const filterSet = Object.assign({}, filter);
        for (let attr of TARGETS_ATTR) {
          if (filterSet.filter[attr.key].priority === undefined || filterSet.filter[attr.key].priority === '') {
            filterSet.filter[attr.key].priority = 0;
          }
        }
        dispatch(setTargetFilter(filterSet));
      },
      [dispatch]
    );

    const handleItemChange = key => setting => {
      console.log(`handleItemChange attr: ${key} values: ${JSON.stringify(setting)}`);
      let newFilter = Object.assign({}, filter);
      newFilter.filter[key] = setting;
      newFilter.active = true;
      dispatch(setTargetFilter(newFilter));
      handleFilterChange(newFilter);
    };

    const findIndexByKey = key => {
      const sortIndex = filter.sortOptions.findIndex(item => item[0] === key);
      return sortIndex;
    };

    const handlePrioChange = key => inc => () => {
      const maxPrio = 12;
      const minPrio = 0;
      let priorityOrder = filter.priorityOrder;
      let sortOptions = filter.sortOptions;
      const index = filter.priorityOrder.indexOf(key);
      const sortIndex = findIndexByKey(key);
      if (index > -1 && index + inc >= minPrio && index <= maxPrio) {
        priorityOrder.splice(index, 1);
        priorityOrder.splice(index + inc, 0, key);
        let newFilter = Object.assign({}, filter);
        newFilter.priorityOrder = priorityOrder;
        newFilter.active = true;
        dispatch(setTargetFilter(newFilter));
        handleFilterChange(newFilter);
      }
      if (sortIndex > -1 && sortIndex + inc >= minPrio && sortIndex <= maxPrio) {
        const path = sortOptions[sortIndex][1];
        sortOptions.splice(sortIndex, 1);
        sortOptions.splice(sortIndex + inc, 0, [key, path]);
        let newFilter = Object.assign({}, filter);
        newFilter.sortOptions = sortOptions;
        newFilter.active = true;
        dispatch(setTargetFilter(newFilter));
        handleFilterChange(newFilter);
      }
    };

    const handleClearFilter = debounce(() => {
      dispatch(setDefaultFilter(true));
      dispatch(setTargetFilter(filter));
      dispatch(setSortTargetDialogOpen(false));
      dispatch(setListOfFilteredTargets(defaultListOfTargets.sort(compareTargetAsc)));
      dispatch(setListOfFilteredTargetsByDate(defaultListOfTargets.sort(compareTargetAsc)));
      dispatch(setListOfTargets(defaultListOfTargets.sort(compareTargetAsc)));
      dispatch(setSortTargetDialogOpen(true));
    });

    // Check for multiple attributes with same sorting priority
    let prioWarning = false;
    let prioWarningTest = {};
    for (const attr of TARGETS_ATTR) {
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
          title={`Target list filter`}
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
                  dispatch(setSortTargetDialogOpen(false));
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
                  <span style={{ fontSize: 'smaller' }}>(up/down/none)</span>
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
                <TargetListSortFilterItem
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

TargetListSortFilterDialog.propTypes = {
  filter: PropTypes.object,
  setFilter: PropTypes.func,
  anchorEl: PropTypes.object,
  open: PropTypes.bool.isRequired
};
