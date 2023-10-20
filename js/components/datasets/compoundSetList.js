/**
 * Created by abradley on 14/03/2018.
 */
import React, { useEffect, memo } from 'react';
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

  return (
    <>
      <Panel hasHeader hasExpansion defaultExpanded title="Compound sets" style={{ maxHeight: '150px' }}>
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
                    {dataset.title.length > 30 ? dataset.title.slice(0, 20) + '...' : dataset.title}
                  </TableCell>
                  <TableCell style={{ padding: '0px' }}></TableCell>
                  <TableCell style={{ padding: '0px' }}></TableCell>
                  <TableCell style={{ padding: '0px' }}></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Panel>
    </>
  );
};
