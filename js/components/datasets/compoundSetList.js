/**
 * Created by abradley on 14/03/2018.
 */
import React, { useEffect, memo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearDatasetSettings, initializeDatasetFilter } from './redux/dispatchActions';
import { setExpandCompoundSets, setDataset, setSelectedDatasetIndex, setUpdatedDatasets } from './redux/actions';
import DatasetMoleculeList from './datasetMoleculeList';
import { makeStyles, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@material-ui/core';
import { Panel } from '../common/Surfaces/Panel';
import Radio from '@material-ui/core/Radio';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import SearchField from '../common/Components/SearchField';

const useStyles = makeStyles(theme => ({
  table: {
    tableLayout: 'auto',
    marginTop: '6px',
    overflow: 'auto'
  },
  tableCell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    padding: 0
  },
  search: {
    width: 140,
    paddingTop: '5px',
    margin: theme.spacing(1),
    '& .MuiInputBase-root': {
      color: 'white'
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: 'white'
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: 'white'
    }
  },
  chip: {
    margin: theme.spacing(1) / 2
  },
  sortButton: {
    width: '0.75em',
    height: '0.75em',
    padding: '0px'
  }
}));

export const CompoundSetList = () => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const selectedDatasetIndex = useSelector(state => state.datasetsReducers.selectedDatasetIndex);
  const customDatasets = useSelector(state => state.datasetsReducers.datasets);
  const updatedDatasets = useSelector(state => state.datasetsReducers.updatedDatasets);

  const [isExpanded, setIsExpanded] = useState(false);
  const [searchString, setSearchString] = useState(null);
  const [defaultSelectedValue, setDefaultSelectedValue] = useState();

  useEffect(() => {
    if (selectedDatasetIndex === 0) {
      const newDataset = customDatasets.map((dataSet, index) =>
        index === 0 ? { ...dataSet, visibility: true } : { ...dataSet, visibility: false }
      );
      setDefaultSelectedValue(newDataset);
      dispatch(setUpdatedDatasets(newDataset));
    }
  }, [customDatasets, dispatch, selectedDatasetIndex]);

  const handleExpandedChange = event => {
    if (event) {
      setIsExpanded(true);
      dispatch(setExpandCompoundSets(true));
    } else {
      setIsExpanded(false);
      dispatch(setExpandCompoundSets(false));
    }
  };

  const handleChangeVisibility = index => {
    const newDataset = customDatasets.map((dataSetValue, i) =>
      i === index ? { ...dataSetValue, visibility: true } : { ...dataSetValue, visibility: false }
    );

    dispatch(setSelectedDatasetIndex(index, index, index, index));
    dispatch(setUpdatedDatasets(newDataset));
  };

  const actualDataset = updatedDatasets === undefined ? defaultSelectedValue : updatedDatasets;
  return (
    <>
      <Panel
        onExpandChange={useCallback(handleExpandedChange, [dispatch])}
        hasHeader
        hasExpansion
        bodyOverflow
        defaultExpanded
        title="Compound sets"
        style={{ maxHeight: '150px', height: isExpanded === true ? '100%' : '30px', overflow: 'auto' }}
        headerActions={[
          <SearchField
            placeholder={'Search compound'}
            className={classes.search}
            id="search-compounds-sets"
            onChange={setSearchString}
          />
        ]}
      >
        <Table className={classes.table}>
          <TableHead>
            <TableRow style={{ padding: 0 }}>
              <TableCell style={{ width: 25, padding: 0 }}>
                {/* Select */}
              </TableCell>
              <TableCell style={{ width: 60, padding: 0 }}>
                Name
              </TableCell>
              <TableCell style={{ width: '50px', padding: 0 }}>
                #
              </TableCell>
              <TableCell style={{ width: '100px', padding: 0 }}>
                Submitter
              </TableCell>
              <TableCell style={{ width: '70px', padding: 0 }}>
                Institution
              </TableCell>
              <TableCell style={{ width: '70px', padding: 0 }}>
                Date
              </TableCell>
              <TableCell style={{ width: '70px', padding: 0 }}>
                Method
              </TableCell>
              <TableCell style={{ width: '30px', padding: 0 }}>
                CSV
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actualDataset?.map((dataset, index) => {
              return (
                <TableRow key={index} style={{ height: 10 }}>
                  <TableCell style={{ padding: 0 }}>
                    <Radio
                      onClick={() => {
                        handleChangeVisibility(index);
                      }}
                      checked={dataset.visibility}
                      value={true}
                      name="radio-button-demo"
                      style={{ width: 25, padding: 0 }}
                    />
                  </TableCell>
                  <Tooltip title={dataset.title}>
                    <TableCell className={classes.tableCell} style={{ maxWidth: 60 }} key={dataset.id}>
                      {/* {dataset.title.length > 13 ? dataset.title.slice(0, 13) + '...' : dataset.title} */}
                      {dataset.title}
                    </TableCell>
                  </Tooltip>
                  <TableCell className={classes.tableCell} style={{ maxWidth: 50 }}></TableCell>
                  <TableCell className={classes.tableCell} style={{ maxWidth: 100 }}></TableCell>
                  <TableCell className={classes.tableCell} style={{ maxWidth: 70 }}></TableCell>
                  <TableCell className={classes.tableCell} style={{ maxWidth: 70 }}></TableCell>
                  <TableCell className={classes.tableCell} style={{ maxWidth: 70 }}></TableCell>
                  <TableCell style={{ padding: 0 }}>
                    <CloudDownloadOutlinedIcon />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Panel>
    </>
  );
};
