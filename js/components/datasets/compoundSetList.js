/**
 * Created by abradley on 14/03/2018.
 */
import React, { useEffect, memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearDatasetSettings, initializeDatasetFilter } from './redux/dispatchActions';
import DatasetMoleculeList from './datasetMoleculeList';
import {
  Button,
  ButtonGroup,
  Grid,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography
} from '@material-ui/core';
import { Panel } from '../common/Surfaces/Panel';
import Radio from '@material-ui/core/Radio';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles(theme => ({
  table: {
    tableLayout: 'auto',
    marginTop: '6px'
  },
  search: {
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
  const isLoadingMoleculeList = useSelector(state => state.datasetsReducers.isLoadingMoleculeList);

  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpandedChange = (event, isExpanded) => {
    // Tu môžete vykonať akcie na základe zmeny stavu
    if (event) {
      setIsExpanded(true);
      console.log('Panel je roztiahnutý');
    } else {
      setIsExpanded(false);
      console.log('Panel je stiahnutý');
    }
  };
console.log("isExpanded",isExpanded)
  return (
    <>
      <Panel
        onExpandChange={handleExpandedChange}
        hasHeader
        hasExpansion
        defaultExpanded
        title="Compound sets"
        style={{ maxHeight: '150px', height: isExpanded === true ? '100%': '30px'}}
      >
        <Table className={classes.table}>
          <TableHead>
            <TableRow style={{ padding: '0px' }}>
              <TableCell item style={{ width: '30px', padding: '0px' }}>
                Select
              </TableCell>
              <TableCell item style={{ width: '50px', padding: '0px' }}>
                Name
              </TableCell>
              <TableCell item style={{ width: '50px', padding: '0px' }}>
                #
              </TableCell>
              <TableCell item style={{ width: '100px', padding: '0px' }}>
                Submitter
              </TableCell>
              <TableCell item style={{ width: '70px', padding: '0px' }}>
                Institution
              </TableCell>
              <TableCell item style={{ width: '70px', padding: '0px' }}>
                Date
              </TableCell>
              <TableCell item style={{ width: '70px', padding: '0px' }}>
                Method
              </TableCell>
              <TableCell item style={{ width: '30px', padding: '0px' }}>
                CSV
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customDatasets.map(dataset => {
              return (
                <TableRow container key={dataset.id}>
                  <TableCell style={{ width: '30px', padding: '0px' }}>
                    <Radio
                      checked={true}
                      //onChange={handleChangeOrder}
                      value={1}
                      name="radio-button-demo"
                    />
                  </TableCell>
                  <TableCell style={{ width: '50px', padding: '0px' }} key={dataset.id}>
                    {dataset.title.length > 30 ? dataset.title.slice(0, 15) + '...' : dataset.title}
                  </TableCell>
                  <TableCell style={{ padding: '0px' }}></TableCell>
                  <TableCell style={{ padding: '0px' }}></TableCell>
                  <TableCell style={{ padding: '0px' }}></TableCell>
                  <TableCell style={{ padding: '0px' }}></TableCell>
                  <TableCell style={{ padding: '0px' }}></TableCell>
                  <TableCell style={{ padding: '0px' }}>
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
