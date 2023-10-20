import React, { memo, useState, useCallback } from 'react';
import { Typography, Popper, Grid, FormControlLabel, Checkbox, IconButton, Tooltip } from '@material-ui/core';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import WarningIcon from '@material-ui/icons/Warning';
import { Delete, Close } from '@material-ui/icons';
import {
  setFilterDialogOpen,
  setFilterProperties,
  setFilterSettings,
  setDatasetFilter,
  setFilterWithInspirations,
  setDragDropState
} from './redux/actions';
import {
  getFilteredDatasetMoleculeList,
  getInitialDatasetFilterProperties,
  getInitialDatasetFilterSettings
} from './redux/selectors';
import { DatasetMoleculeListSortFilter } from './datasetMoleculeListSortFilterItem';
import { createFilterSettingsObject } from './redux/constants';
import { Panel } from '../common/Surfaces/Panel';
import { useEffectDebugger } from '../../utils/effects';

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
    width: 700,
    overflow: 'none'
  },
  withInspirations: {
    paddingTop: theme.spacing(1) / 4,
    visibility: 'hidden'
  },
  checkboxHeader: {
    color: theme.palette.white,
    '&$checked': {
      color: theme.palette.white
    }
  },
  checked: {},
  headerButton: {
    paddingTop: 10
  }
}));

const widthCheckbox = 70;
const widthPrio = 100;
const widthOrder = 60;
const widthProperty = 212;
const widthMin = 30;
const widthSlider = 170;

export const DatasetFilter = memo(
  ({ open, anchorEl, datasetID, active, predefined, priorityOrder, filterProperties, setSortDialogAnchorEl }) => {
    let classes = useStyles();
    const dispatch = useDispatch();
    const id = open ? 'simple-popover-datasets' : undefined;
    const defaultFilterSettings = useSelector(state => getInitialDatasetFilterSettings(state, datasetID));
    const defaultFilterProperties = useSelector(state => getInitialDatasetFilterProperties(state, datasetID));
    const scoreDatasetList = useSelector(state => state.datasetsReducers.scoreDatasetMap[datasetID]);
    const scoreCompoundMap = useSelector(state => state.datasetsReducers.scoreCompoundMap[datasetID]);
    const filterWithInspirations = useSelector(state => state.datasetsReducers.filterWithInspirations);
    const filteredDatasetMoleculeList = useSelector(
      state => getFilteredDatasetMoleculeList(state, datasetID),
      shallowEqual
    );

    const [predefinedFilter, setPredefinedFilter] = useState(predefined);

    // console.log('DatasetFilter - update');

    // useEffectDebugger(
    //   () => {},
    //   [
    //     open,
    //     anchorEl,
    //     datasetID,
    //     active,
    //     predefined,
    //     priorityOrder,
    //     filterProperties,
    //     setSortDialogAnchorEl,
    //     defaultFilterSettings,
    //     defaultFilterProperties,
    //     scoreDatasetList,
    //     scoreCompoundMap,
    //     filterWithInspirations,
    //     filteredDatasetMoleculeList,
    //     predefinedFilter
    //   ],
    //   [
    //     'open',
    //     'anchorEl',
    //     'datasetID',
    //     'active',
    //     'predefined',
    //     'priorityOrder',
    //     'filterProperties',
    //     'setSortDialogAnchorEl',
    //     'defaultFilterSettings',
    //     'defaultFilterProperties',
    //     'scoreDatasetList',
    //     'scoreCompoundMap',
    //     'filterWithInspirations',
    //     'filteredDatasetMoleculeList',
    //     'predefinedFilter'
    //   ],
    //   'DatasetFilter'
    // );

    const getScoreDefinitionObject = attr => {
      return scoreDatasetList[Object.keys(scoreDatasetList).find(attrName => attrName === attr)];
    };

    const handleFilterChange = useCallback(
      (newFilterProperties, newFilterSettings, key, prio, oldPrio) => {
        // console.log('DatasetFilter - handleFilterChange');
        Object.keys(scoreDatasetList).forEach(attrKey => {
          if (newFilterProperties[attrKey].priority === undefined || newFilterProperties[attrKey].priority === '') {
            newFilterProperties[attrKey].priority = 0;
          }
          if (attrKey === key && prio !== undefined && prio !== null) {
            newFilterProperties[attrKey].newPrio = prio;
            newFilterProperties[attrKey].oldPrio = oldPrio;
          }
        });
        const newDragDropState = null;
        dispatch(setDatasetFilter(datasetID, newFilterProperties, newFilterSettings, key, newDragDropState));
        dispatch(setFilterProperties(datasetID, newFilterProperties));
        dispatch(setFilterSettings(datasetID, newFilterSettings));
        dispatch(setDragDropState(datasetID, newDragDropState));
      },
      [datasetID, dispatch, scoreDatasetList]
    );

    const handleItemChange = useCallback(
      (key, setting) => {
        const newFilterSettings = createFilterSettingsObject({ active: true, predefined, priorityOrder });
        const newFilterProperties = { ...filterProperties, [key]: setting };
        handleFilterChange(newFilterProperties, newFilterSettings, key);
      },
      [filterProperties, handleFilterChange, predefined, priorityOrder]
    );

    const handlePrioChange = useCallback(
      (key, inc) => {
        const maxPrio = Object.keys(scoreDatasetList).length - 1;
        const minPrio = 0;
        let localPriorityOrder = JSON.parse(JSON.stringify(priorityOrder));
        const index = localPriorityOrder.indexOf(key);
        if (index > -1 && index + inc >= minPrio && index <= maxPrio) {
          localPriorityOrder.splice(index, 1);
          localPriorityOrder.splice(index + inc, 0, key);
          let newFilterSettings = createFilterSettingsObject({ active, predefined, priorityOrder: localPriorityOrder });
          newFilterSettings.priorityOrder = localPriorityOrder;
          newFilterSettings.active = true;

          let oldPrio = index;
          let newPrio = index + inc;
          let newFilterProperties = { ...filterProperties };
          handleFilterChange(newFilterProperties, newFilterSettings, key, newPrio, oldPrio);
        }
      },
      [active, filterProperties, handleFilterChange, predefined, priorityOrder, scoreDatasetList]
    );

    const handleClear = () => {
      setPredefinedFilter('none');
      handleFilterChange(defaultFilterProperties, defaultFilterSettings, 'clear');
    };

    // Check for multiple attributes with same sorting priority
    let prioWarning = false;
    let prioWarningTest = {};

    if (scoreCompoundMap) {
      for (const attr of scoreCompoundMap) {
        const prioKey = filterProperties[attr.score.name].priority;
        if (prioKey > 0) {
          prioWarningTest[prioKey] = prioWarningTest[prioKey] ? prioWarningTest[prioKey] + 1 : 1;
          if (prioWarningTest[prioKey] > 1) {
            prioWarning = true;
          }
        }
      }
    }

    return (
      <Popper id={id} open={open} anchorEl={anchorEl} placement="left-start">
        <Panel
          hasHeader
          bodyOverflow
          secondaryBackground
          title={`Right filter: ${(filteredDatasetMoleculeList || []).length} matches`}
          className={classes.paper}
          headerActions={[
            <FormControlLabel
              value="end"
              control={
                <Checkbox
                  color="default"
                  className={classes.checkboxHeader}
                  checked={filterWithInspirations}
                  onChange={() => {
                    dispatch(setFilterWithInspirations(!filterWithInspirations));
                    handleItemChange()();
                  }}
                />
              }
              label="With inspirations"
              labelPlacement="end"
              className={classes.withInspirations}
            />,
            <Tooltip title="Clear filter">
              <IconButton onClick={handleClear} color="inherit" className={classes.headerButton}>
                <Delete />
              </IconButton>
            </Tooltip>,
            <Tooltip title="Close filter">
              <IconButton
                onClick={() => {
                  setSortDialogAnchorEl(null);
                  dispatch(setFilterDialogOpen(false));
                }}
                color="inherit"
                className={classes.headerButton}
              >
                <Close />
              </IconButton>
            </Tooltip>
          ]}
        >
          <Grid container justifyContent="space-between" direction="row" alignItems="center">
            <Grid item>
              <div className={classes.numberOfHits}>
                {prioWarning && (
                  <div>
                    <Typography variant="body2">
                      <WarningIcon className={classes.warningIcon} />
                      Multiple attributes with same sorting priority
                    </Typography>
                  </div>
                )}
              </div>
            </Grid>
          </Grid>
          <Grid container>
            <Grid container item className={classes.gridItemHeader}>
              <Grid item className={classes.centered} style={{ width: widthCheckbox }}>
                Is shown
              </Grid>
              <Grid item className={classes.centered} style={{ width: widthPrio }}>
                priority
              </Grid>
              <Grid item className={classes.centered} style={{ width: widthOrder }}>
                <div style={{ textAlign: 'center' }}>
                  order
                  <br />
                  <span style={{ fontSize: 'smaller' }}>(up/down/ignore)</span>
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

            {priorityOrder?.map(attr => {
              let scoreDefinition = getScoreDefinitionObject(attr);
              const disabled = predefinedFilter !== 'none';

              return (
                !disabled && (
                  <DatasetMoleculeListSortFilter
                    key={attr}
                    // scoreKey={attr}
                    datasetID={datasetID}
                    scoreName={scoreDefinition.name}
                    scoreDescription={scoreDefinition.description}
                    scoreID={scoreDefinition.id}
                    order={filterProperties[attr].order}
                    minValue={filterProperties[attr].minValue}
                    maxValue={filterProperties[attr].maxValue}
                    min={defaultFilterProperties[attr].minValue}
                    max={defaultFilterProperties[attr].maxValue}
                    isFloat={defaultFilterProperties[attr].isFloat}
                    isBoolean={defaultFilterProperties[attr].isBoolean}
                    isChecked={defaultFilterProperties[attr].isChecked}
                    isString={defaultFilterProperties[attr].isString}
                    onChange={handleItemChange}
                    onChangePrio={handlePrioChange}
                  />
                )
              );
            })}
          </Grid>
        </Panel>
      </Popper>
    );
  }
);
