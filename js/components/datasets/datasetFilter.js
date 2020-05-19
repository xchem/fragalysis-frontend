import React, { memo, useState } from 'react';
import { Paper, Popper, Button, Grid } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import WarningIcon from '@material-ui/icons/Warning';
import { Delete } from '@material-ui/icons';
import { setFilterProperties, setFilterSettings } from './redux/actions';
import { getInitialDatasetFilterProperties } from './redux/selectors';
import { DatasetMoleculeListSortFilter } from './datasetMoleculeListSortFilterItem';
import { createFilterSettingsObject } from './redux/constants';

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
    overflow: 'none',
    padding: theme.spacing(1)
  }
}));

const widthCheckbox = 70;
const widthPrio = 100;
const widthOrder = 60;
const widthProperty = 212;
const widthMin = 30;
const widthSlider = 170;

export const DatasetFilter = memo(
  ({ open, anchorEl, datasetID, active, predefined, priorityOrder, filterProperties }) => {
    let classes = useStyles();
    const dispatch = useDispatch();
    const id = open ? 'simple-popover-datasets' : undefined;
    const defaultFilterProperties = useSelector(state => getInitialDatasetFilterProperties(state, datasetID));
    //  const moleculeLists = useSelector(state => state.datasetsReducers.moleculeLists[datasetID]);
    const scoreDatasetList = useSelector(state => state.datasetsReducers.scoreDatasetMap[datasetID]);
    const scoreCompoundMap = useSelector(state => state.datasetsReducers.scoreCompoundMap[datasetID]);

    // const scoresOfMolecules = useSelector(state => scoreListOfMolecules(state, datasetID));

    // const [filteredCount, setFilteredCount] = useState(filter && getFilteredMoleculesCount(scoreDatasetList, filter));
    const [predefinedFilter, setPredefinedFilter] = useState(predefined);

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

    const handleFilterChange = (newFilterProperties, newFilterSettings) => {
      scoreDatasetList.forEach(attr => {
        if (newFilterProperties[attr.name].priority === undefined || newFilterProperties[attr.name].priority === '') {
          newFilterProperties[attr.name].priority = 0;
        }
      });
      dispatch(setFilterProperties(datasetID, newFilterProperties));
      dispatch(setFilterSettings(datasetID, newFilterSettings));
    };

    const handleItemChange = key => setting => {
      const newFilterSettings = createFilterSettingsObject({ active, predefined, priorityOrder });
      let newFilterProperties;
      const newSettings = { ...newFilter.filter[key], ...setting };
      delete newFilter.filter[key];
      newFilter.filter[key] = newSettings;
      newFilter.active = true;
      // setFilteredCount(getFilteredMoleculesCount(getListedMolecules(), newFilter));
      // missing priority
      handleFilterChange(newFilterProperties, newFilterSettings);
    };

    const handlePrioChange = key => inc => () => {
      const maxPrio = scoreDatasetList.length - 1;
      const minPrio = 0;
      let localPriorityOrder = priorityOrder;
      const index = localPriorityOrder.indexOf(key);
      if (index > -1 && index + inc >= minPrio && index <= maxPrio) {
        localPriorityOrder.splice(index, 1);
        localPriorityOrder.splice(index + inc, 0, key);
        let newFilterSettings = createFilterSettingsObject({ active, predefined, priorityOrder: localPriorityOrder });
        newFilterSettings.priorityOrder = localPriorityOrder;
        newFilterSettings.active = true;

        handleFilterChange(filterProperties, newFilterSettings);
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
      const prioKey = filterProperties[attr.score.name].priority;
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
              <Grid item className={classes.centered} style={{ width: widthCheckbox }}>
                Is showed
              </Grid>
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

            {priorityOrder.map(attr => {
              let attrDef = getAttributeName(attr);
              return (
                <DatasetMoleculeListSortFilter
                  key={attr}
                  datasetID={datasetID}
                  scoreName={attrDef.name}
                  scoreID={attrDef.id}
                  order={filterProperties[attr].order}
                  minValue={filterProperties[attr].minValue}
                  maxValue={filterProperties[attr].maxValue}
                  min={defaultFilterProperties[attr].minValue}
                  max={defaultFilterProperties[attr].maxValue}
                  isFloat={defaultFilterProperties[attr].isFloat}
                  disabled={predefinedFilter !== 'none' || defaultFilterProperties[attr].disabled}
                  onChange={handleItemChange(attr)}
                  onChangePrio={handlePrioChange(attr)}
                />
              );
            })}
          </Grid>
        </Paper>
      </Popper>
    );
  }
);
