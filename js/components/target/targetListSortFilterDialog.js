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
import { getCombinedTargetList } from '../../reducers/api/selectors';

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
    width: 530,
    overflow: 'none'
  }
}));

const widthPrio = 50;

const widthOrder = 110;
const widthProperty = 150;

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
  ({ filter, setFilter, resetFilter, anchorEl, open, parentID = 'default', placement = 'right-start', onClose }) => {
    let classes = useStyles();

    // Check for multiple attributes with same sorting priority
    let prioWarning = false;

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
              <IconButton onClick={resetFilter} color="inherit" className={classes.headerButton}>
                <Delete />
              </IconButton>
            </Tooltip>,
            <Tooltip title="Close filter">
              <IconButton
                onClick={onClose}
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
              {/* <Grid item className={classes.centered} style={{ width: widthPrio }}>
                priority
              </Grid> */}
              <Grid item className={classes.centered} style={{ width: widthOrder }}>
                <div style={{ textAlign: 'center' }}>
                  order
                  <br />
                  <span style={{ fontSize: 'smaller' }}>(asc/desc/none)</span>
                </div>
              </Grid>
              <Grid item className={classes.centered} style={{ width: widthProperty }}>
                property
              </Grid>
              <Grid item className={classes.centered} style={{ width: filterData }}>
                Filter data
              </Grid>
            </Grid>
            {Object.keys(filter).map(property => {
              return (
                <TargetListSortFilterItem
                  key={property}
                  property={property}
                  order={filter[property].order}
                  isFloat={false}
                  color={filter[property].color ?? 'yellow'}
                  onChangePrio={setFilter}
                  onChange={setFilter}
                  filter={filter}
                  dateFilter={property.toLowerCase().includes('date')}
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
