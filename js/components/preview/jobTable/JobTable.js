import {
  Button as MUIButton,
  Checkbox,
  colors,
  FormControlLabel,
  FormGroup,
  makeStyles,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip
} from '@material-ui/core';
import { Button } from '../../common/Inputs/Button';
import { DynamicFeed, Refresh, ViewColumn } from '@material-ui/icons';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRowSelect, useSortBy, useTable } from 'react-table';
import { Panel } from '../../common/Surfaces/Panel';
import { JobVariablesDialog } from './JobVariablesDialog';
import { setSelectedRows } from './redux/actions';
import { refreshJobsData } from '../../projects/redux/actions';
import { PROJECTS_JOBS_PANEL_HEIGHT } from '../constants';
import { selectDatasetResultsForJob } from './redux/dispatchActions';
import moment from 'moment';
import { useContext } from 'react';
import { NglContext } from '../../nglView/nglProvider';
import { VIEWS } from '../../../constants/constants';
import { isSquonkProjectAccessible } from '../projectHistoryPanel/utils';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%'
  },
  table: {
    '& tr': {
      borderBottom: `1px solid ${theme.palette.divider}`,
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
    },
    '& th, td': {
      height: 42, // Prevents horizontal layout shifts when hiding columns
      border: 0,
      padding: 0
    }
  },
  containerExpanded: {
    height: PROJECTS_JOBS_PANEL_HEIGHT,
    width: '100%',
    overflow: 'auto'
  },
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
    marginTop: theme.spacing(),
    display: 'flex',
    gap: theme.spacing()
  },
  columnSelector: {
    padding: theme.spacing()
  },
  checkbox: {
    padding: 4
  },
  label: {
    marginLeft: 0
  }
}));

const getRowId = row => row.id;

export const JobTable = ({ expanded, onExpanded, onTabChange }) => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const currentSnapshotJobList = useSelector(state => state.projectReducers.currentSnapshotJobList);
  const jobSpecsList = useSelector(state => state.projectReducers.jobList);

  const [selectedJob, setSelectedJob] = useState(null);
  const [jobInputsDialogOpen, setJobInputsDialogOpen] = useState(false);
  const [jobOutputsDialogOpen, setJobOutputsDialogOpen] = useState(false);

  const [columnSelectorAnchor, setColumnSelectorAnchor] = useState(null);

  const { getNglView } = useContext(NglContext);
  const majorViewStage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const jobList = useMemo(() => {
    if (!currentSnapshotJobList) {
      return [];
    }
    const flatenedJobList = Object.values(currentSnapshotJobList).flat();
    const result = [];
    for (const job of flatenedJobList) {
      const jobSpec = jobSpecsList.find(js => js.slug === job.squonk_job_name);
      if (jobSpec) {
        result.push({
          ...job,
          category: jobSpec.spec.category,
          job_start_datetime: moment(job.job_start_datetime).format('LLL')
        });
      }
    }
    return result;
  }, [currentSnapshotJobList, jobSpecsList]);

  const columns = useMemo(
    () => [
      {
        accessor: 'squonk_job_name',
        Header: 'Name',
        displayName: 'Name'
      },
      {
        accessor: 'category',
        Header: 'Category',
        displayName: 'Category'
      },
      {
        accessor: 'job_start_datetime',
        Header: 'Date',
        displayName: 'Date'
      },
      {
        accessor: 'user',
        Header: 'User',
        displayName: 'User'
      },
      {
        id: 'inputs',
        disableSortBy: true,
        Header: 'Inputs',
        displayName: 'Inputs',
        Cell: ({ row }) => (
          <MUIButton
            variant="contained"
            color="primary"
            onClick={() => {
              console.log(`Open inputs for job ${JSON.stringify(row.original)}`);
              setSelectedJob(row.original);
              setJobInputsDialogOpen(true);
            }}
          >
            Open
          </MUIButton>
        )
      },
      {
        id: 'outputs',
        disableSortBy: true,
        Header: 'Outputs',
        displayName: 'Outputs',
        Cell: ({ row }) => (
          <MUIButton
            variant="contained"
            color="primary"
            disabled={row.original.computed_set == null}
            onClick={() => {
              console.log(`Open outputs for job ${JSON.stringify(row.original)}`);
              setSelectedJob(row.original);
              dispatch(selectDatasetResultsForJob(row.original, majorViewStage));
              // setJobOutputsDialogOpen(true);
            }}
          >
            Open
          </MUIButton>
        )
      },
      {
        id: 'job',
        disableSortBy: true,
        Header: 'Job',
        displayName: 'Job',
        Cell: ({ row }) => (
          <MUIButton
            variant="contained"
            color="primary"
            disabled={false}
            onClick={() => {
              isSquonkProjectAccessible(row.original.id).then(resp => {
                console.log(`OpenInSquonkFromTable resp: ${resp}`);
                if (resp && resp.data && resp.data.accessible) {
                  let jobLauncherSquonkUrl = null;
                  if (row.original?.squonk_url_ext) {
                    jobLauncherSquonkUrl =
                      DJANGO_CONTEXT['squonk_ui_url'] + row.original?.squonk_url_ext.replace('data-manager-ui', '');
                  }
                  if (jobLauncherSquonkUrl) {
                    window.open(jobLauncherSquonkUrl, '_blank');
                  } else {
                    console.log('Access to squonk job denied');
                    alert('Access to squonk job denied');
                  }
                }
              });
            }}
          >
            Open
          </MUIButton>
        )
      }
    ],
    [dispatch, majorViewStage]
  );

  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows, selectedFlatRows, allColumns } = useTable(
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
          displayName: 'Selection',
          Header: ({ getToggleAllRowsSelectedProps }) => {
            const { title, ...rest } = getToggleAllRowsSelectedProps();

            return (
              <Tooltip title="Select all rows">
                <Checkbox className={classes.checkbox} {...rest} />
              </Tooltip>
            );
          },
          Cell: ({ row }) => {
            const { title, ...rest } = row.getToggleRowSelectedProps();

            return (
              <Tooltip title="Select row">
                <Checkbox className={classes.checkbox} {...rest} />
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
    <div className={classes.root}>
      <Panel
        hasHeader
        title="Job Table"
        headerActions={[
          <Button
            color="inherit"
            variant="text"
            size="small"
            onClick={() => dispatch(refreshJobsData())}
            startIcon={<Refresh />}
          >
            Refresh
          </Button>,
          <Button
            color="inherit"
            variant="text"
            size="small"
            onClick={event => setColumnSelectorAnchor(event.currentTarget)}
            startIcon={<ViewColumn />}
          >
            Visible columns
          </Button>,
          <Button
            color="inherit"
            variant="text"
            size="small"
            onClick={() => onTabChange('projectHistory')}
            startIcon={<DynamicFeed />}
          >
            Project History
          </Button>
        ]}
        hasExpansion
        defaultExpanded={expanded}
        onExpandChange={expanded => onExpanded(expanded)}
      >
        <div className={classes.containerExpanded}>
          <Table className={classes.table} {...getTableProps()}>
            <TableHead>
              {headerGroups.map(headerGroup => (
                <TableRow {...headerGroup.getHeaderGroupProps()} className={classes.row}>
                  {headerGroup.headers.map(column => {
                    if (column.canSort) {
                      // Title is unused
                      const { title, ...rest } = column.getSortByToggleProps();

                      return (
                        <Tooltip title={`Sort by ${column.displayName}`} {...column.getHeaderProps()}>
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

          {/* <div className={classes.buttonRow}>
            <MUIButton variant="contained" color="primary" disabled={!selectedFlatRows.length}>
              Remove selected
            </MUIButton>
            <MUIButton variant="contained" color="primary" disabled={selectedFlatRows.length < 2}>
              Combine to new job
            </MUIButton>
          </div> */}

          <JobVariablesDialog
            open={jobInputsDialogOpen}
            onClose={() => setJobInputsDialogOpen(false)}
            title="Job Inputs"
            variableType="inputs"
            jobInfo={selectedJob}
          />
          <Popover
            open={!!columnSelectorAnchor}
            anchorEl={columnSelectorAnchor}
            onClose={() => setColumnSelectorAnchor(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left'
            }}
          >
            <FormGroup className={classes.columnSelector}>
              {allColumns.map(column => (
                <FormControlLabel
                  key={column.id}
                  className={classes.label}
                  control={<Checkbox className={classes.checkbox} {...column.getToggleHiddenProps()} />}
                  label={column.displayName}
                />
              ))}
            </FormGroup>
          </Popover>
        </div>
      </Panel>
    </div>
  );
};
