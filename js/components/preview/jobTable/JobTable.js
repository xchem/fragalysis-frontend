import {
  Button,
  Checkbox,
  colors,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip
} from '@material-ui/core';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRowSelect, useSortBy, useTable } from 'react-table';
import { JobVariablesDialog } from './JobVariablesDialog';
import { setSelectedRows } from './redux/actions';

const useStyles = makeStyles(theme => ({
  flexCell: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(1 / 2)
  },
  sortIconInactive: {
    '& svg': {
      color: `${colors.grey[400]} !important`
    }
  },
  buttonRow: {
    display: 'flex',
    gap: theme.spacing()
  }
}));

const getRowId = row => row.id;

export const JobTable = () => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const currentSnapshotJobList = useSelector(state => state.projectReducers.currentSnapshotJobList);

  const [selectedJob, setSelectedJob] = useState(null);
  const [jobInputsDialogOpen, setJobInputsDialogOpen] = useState(false);
  const [jobOutputsDialogOpen, setJobOutputsDialogOpen] = useState(false);

  const jobList = useMemo(() => {
    if (!currentSnapshotJobList) {
      return [];
    }

    return Object.values(currentSnapshotJobList).flat();
  }, [currentSnapshotJobList]);

  const columns = useMemo(
    () => [
      {
        accessor: 'squonk_job_name',
        Header: 'Name'
      },
      {
        accessor: 'user',
        Header: 'User'
      },
      {
        id: 'inputs',
        disableSortBy: true,
        Header: 'Inputs',
        Cell: ({ row }) => (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSelectedJob(row.original);
              setJobInputsDialogOpen(true);
            }}
          >
            Open
          </Button>
        )
      },
      {
        id: 'outputs',
        disableSortBy: true,
        Header: 'Outputs',
        Cell: ({ row }) => (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSelectedJob(row.original);
              setJobOutputsDialogOpen(true);
            }}
          >
            Open
          </Button>
        )
      }
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows, selectedFlatRows } = useTable(
    {
      columns,
      data: jobList,
      getRowId
    },
    useSortBy,
    useRowSelect,
    hooks =>
      hooks.visibleColumns.push(columns => [
        {
          id: 'selection',
          Header: ({ getToggleAllRowsSelectedProps }) => {
            const { title, ...rest } = getToggleAllRowsSelectedProps();

            return (
              <Tooltip title="Select all rows">
                <Checkbox {...rest} />
              </Tooltip>
            );
          },
          Cell: ({ row }) => {
            const { title, ...rest } = row.getToggleRowSelectedProps();

            return (
              <Tooltip title="Select row">
                <Checkbox {...rest} />
              </Tooltip>
            );
          }
        },
        ...columns
      ])
  );

  useLayoutEffect(() => {
    dispatch(setSelectedRows(selectedFlatRows));
  }, [dispatch, selectedFlatRows]);

  return (
    <div>
      <Table className={classes.table} {...getTableProps()}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()} className={classes.row}>
              {headerGroup.headers.map(column => {
                if (column.canSort) {
                  // Title is unused
                  const { title, ...rest } = column.getSortByToggleProps();

                  return (
                    <Tooltip title={`Sort by ${column.Header}`} {...column.getHeaderProps()}>
                      <TableCell {...rest}>
                        <div className={classes.flexCell}>
                          {column.render('Header')}
                          <TableSortLabel
                            className={!column.isSorted ? classes.sortIconInactive : undefined}
                            active={true}
                            direction={column.isSortedDesc ? 'desc' : 'asc'}
                          />
                        </div>
                      </TableCell>
                    </Tooltip>
                  );
                }
                return <TableCell {...column.getHeaderProps()}>{column.render('Header')}</TableCell>;
              })}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);

            return (
              <TableRow {...row.getRowProps()} className={classes.row}>
                {row.cells.map(cell => (
                  <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className={classes.buttonRow}>
        <Button variant="contained" color="primary" disabled={!selectedFlatRows.length}>
          Remove selected
        </Button>
        <Button variant="contained" color="primary" disabled={selectedFlatRows.length < 2}>
          Combine to new job
        </Button>
      </div>

      <JobVariablesDialog
        open={jobInputsDialogOpen}
        onClose={() => setJobInputsDialogOpen(false)}
        title="Job Inputs"
        variableType="inputs"
        jobInfo={selectedJob}
      />
      <JobVariablesDialog
        open={jobOutputsDialogOpen}
        onClose={() => setJobOutputsDialogOpen(false)}
        title="Job Outputs"
        variableType="outputs"
        jobInfo={selectedJob}
      />
    </div>
  );
};
