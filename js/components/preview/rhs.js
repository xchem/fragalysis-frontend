import { Button, ButtonGroup, Grid, makeStyles } from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TabPanel } from '../common/Tabs';
import { CustomDatasetList } from '../datasets/customDatasetList';
import { CompoundSetList } from '../datasets/compoundSetList';
import { DatasetSelectorMenuButton } from '../datasets/datasetSelectorMenuButton';
import { setSelectedDatasetIndex, setTabValue } from '../datasets/redux/actions';
import { SelectedCompoundList } from '../datasets/selectedCompoundsList';
import { CompoundList } from './compounds/compoundList';
import { SummaryView } from './summary/summaryView';

const useStyles = makeStyles(theme => ({
  rhsWrapperWithCloseCompoundSet: {
    display: 'flex',
    height: '100%'
  },
  rhsWrapperWithOpenCompoundSet: {
    display: 'flex',
    height: '91%'
  },
  rhs: {
    flexWrap: 'nowrap',
    overflow: 'auto'
  },
  tabButtonGroup: {
    height: 48
  },
  tabPanel: {
    flex: 1,
    minHeight: 0
  },
  rhsContainer: {
    height: '97%',
    flexWrap: 'nowrap',
    gap: theme.spacing()
  },
  summaryView: {
    flexGrow: 1
  }
}));

export const RHS = ({ hideProjects }) => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const tabValue = useSelector(state => state.datasetsReducers.tabValue);
  const selectedDatasetIndex = useSelector(state => state.datasetsReducers.selectedDatasetIndex);
  const customDatasets = useSelector(state => state.datasetsReducers.datasets);
  const currentDataset = customDatasets[selectedDatasetIndex];
  const sidesOpen = useSelector(state => state.previewReducers.viewerControls.sidesOpen);
  const compoundSetExpand = useSelector(state => state.datasetsReducers.expandCompoundSet);

  const [openDatasetDropdown, setOpenDatasetDropdown] = useState(false);
  const anchorRefDatasetDropdown = useRef(null);

  const getTabValue = () => {
    if (tabValue === 2) {
      return tabValue + selectedDatasetIndex;
    }
    return tabValue;
  };

  const getTabName = () => {
    if (tabValue === 0) {
      return 'Vector selector';
    }
    if (tabValue === 1) {
      return 'Selected compounds';
    }
    if (tabValue >= 2) {
      return 'COMPOUND SETS';
    }
    return '';
  };

  return (
    <div
      className={
        compoundSetExpand === true ? classes.rhsWrapperWithOpenCompoundSet : classes.rhsWrapperWithCloseCompoundSet
      }
    >
      <Grid container direction="column" className={classes.rhs}>
        <ButtonGroup
          color="primary"
          variant="contained"
          aria-label="outlined primary button group"
          className={classes.tabButtonGroup}
        >
          <Button
            size="small"
            variant={getTabValue() === 0 ? 'contained' : 'text'}
            onClick={() => dispatch(setTabValue(tabValue, 0, 'Vector selector', getTabName()))}
            style={{ width: '33%' }}
          >
            Vector selector
          </Button>
          <Button
            size="small"
            variant={getTabValue() === 1 ? 'contained' : 'text'}
            onClick={() => dispatch(setTabValue(tabValue, 1, 'Selected compounds', getTabName()))}
            style={{ width: '33%' }}
          >
            Selected compounds
          </Button>
          <Button
            size="small"
            variant={getTabValue() >= 2 ? 'contained' : 'text'}
            onClick={() => dispatch(setTabValue(tabValue, 2, currentDataset?.title, getTabName()))}
            style={{ width: '33%' }}
          >
            Compound sets
          </Button>
          {/*} <Button
            variant="text"
            size="small"
            onClick={() => {
              setOpenDatasetDropdown(prevOpen => !prevOpen);
            }}
            ref={anchorRefDatasetDropdown}
          >
            <ArrowDropDown />
          </Button>*/}
        </ButtonGroup>
        {/*<DatasetSelectorMenuButton
          anchorRef={anchorRefDatasetDropdown}
          open={openDatasetDropdown}
          setOpen={setOpenDatasetDropdown}
          customDatasets={customDatasets}
          selectedDatasetIndex={selectedDatasetIndex}
          setSelectedDatasetIndex={setSelectedDatasetIndex}
          />*/}
        <TabPanel value={getTabValue()} index={0} className={classes.tabPanel}>
          {/* Vector selector */}
          <Grid container direction="column" className={classes.rhsContainer}>
            <Grid item className={classes.summaryView}>
              <SummaryView />
            </Grid>
            <Grid item>
              <CompoundList />
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={getTabValue()} index={1} className={classes.tabPanel}>
          <SelectedCompoundList />
        </TabPanel>
        {customDatasets.map((dataset, index) => {
          return (
            <TabPanel key={index + 2} value={getTabValue()} index={index + 2} className={classes.tabPanel}>
              <Grid item style={{ height: compoundSetExpand?.compoundSets === true ? '85%' : '98%' }}>
                <CompoundSetList />
                <div key="place for resizer" style={{ paddingTop: '10px' }}></div>
                <CustomDatasetList
                  dataset={dataset}
                  hideProjects={hideProjects}
                  isActive={sidesOpen.RHS && index === selectedDatasetIndex}
                />
              </Grid>
            </TabPanel>
          );
        })}
      </Grid>
    </div>
  );
};
