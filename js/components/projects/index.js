import React, { memo } from 'react';
import { Panel } from '../common/Surfaces/Panel';
import {
  Table,
  makeStyles,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
  TablePagination,
  TableFooter,
  IconButton,
  InputAdornment,
  TextField,
  Chip
} from '@material-ui/core';
import { Delete, Add, Search } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { URLS } from '../routes/constants';
import moment from 'moment';
import { setProjectModalOpen } from './redux/actions';
import { useDispatch } from 'react-redux';
import { ProjectModal } from './projectModal';

const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 650
  },
  search: {
    margin: theme.spacing(1)
  },
  chip: {
    margin: theme.spacing(1) / 2
  }
}));

export const Projects = memo(({ history }) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const dispatch = useDispatch();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function createData(name, target, lastModification, author, id, tags) {
    return { name, target, lastModification, author, id, tags };
  }

  const rows = [
    createData('Best coumpounds ever', 'NUDT5A', moment().format('LLL'), 'tibor.postek@m2ms.sk', 1, [
      'red',
      'green',
      'blue'
    ]),
    createData('Cheapest molecules', 'EPB41L3A', moment().format('LLL'), 'pavol.brunclik@m2ms.sk', 2, [
      'red',
      'green',
      'blue'
    ]),
    createData('Apoximation of electon', 'EPB41L3A', moment().format('LLL'), 'james.smith@diamond.co.uk', 3, [
      'red',
      'green',
      'blue'
    ]),
    createData('My fake project', 'EPB41L3A', moment().format('LLL'), 'jane.jackson@gmail.com', 4, []),
    createData('Unique science', 'EPB41L3A', moment().format('LLL'), 'jane.jackson@gmail.com', 5, []),
    createData('Cheapest molecules', 'EPB41L3A', moment().format('LLL'), 'jane.jackson@gmail.com', 7, []),
    createData('Apoximation of electon', 'EPB41L3A', moment().format('LLL'), 'pavol.brunclik@m2ms.sk', 8, []),
    createData('Best coumpounds ever', 'NUDT5A', moment().format('LLL'), 'pavol.brunclik@m2ms.sk', 6, []),
    createData('Unique science', 'EPB41L3A', moment().format('LLL'), 'tibor.postek@m2ms.sk', 10, []),
    createData('My fake project', 'EPB41L3A', moment().format('LLL'), 'tibor.postek@m2ms.sk', 9, []),
    createData('Best coumpounds ever', 'EPB41L3A', moment().format('LLL'), 'tibor.postek@m2ms.sk', 11, []),
    createData('Apoximation of electon', 'EPB41L3A', moment().format('LLL'), 'pavol.brunclik@m2ms.sk', 18, []),
    createData('Cheapest molecules', 'EPB41L3A', moment().format('LLL'), 'pavol.brunclik@m2ms.sk', 12, []),
    createData('My fake project', 'EPB41L3A', moment().format('LLL'), 'jane.jackson@gmail.com', 14, []),
    createData('Unique science', 'EPB41L3A', moment().format('LLL'), 'jane.jackson@gmail.com', 15, []),
    createData('Apoximation of electon', 'EPB41L3A', moment().format('LLL'), 'james.smith@diamond.co.uk', 13, []),
    createData('Cheapest molecules', 'EPB41L3A', moment().format('LLL'), 'jane.jackson@gmail.com', 17, []),
    createData('Best coumpounds ever', 'NUDT5A', moment().format('LLL'), 'pavol.brunclik@m2ms.sk', 16, []),
    createData('Unique science', 'EPB41L3A', moment().format('LLL'), 'tibor.postek@m2ms.sk', 20, []),
    createData('My fake project', 'EPB41L3A', moment().format('LLL'), 'tibor.postek@m2ms.sk', 19, []),
    createData('Best coumpounds ever', 'NUDT5A', moment().format('LLL'), 'tibor.postek@m2ms.sk', 21, []),
    createData('Apoximation of electon', 'EPB41L3A', moment().format('LLL'), 'james.smith@diamond.co.uk', 23, []),
    createData('Cheapest molecules', 'EPB41L3A', moment().format('LLL'), 'pavol.brunclik@m2ms.sk', 22, []),
    createData('Unique science', 'CAMK1DA', moment().format('LLL'), 'jane.jackson@gmail.com', 25, []),
    createData('My fake project', 'XX02KALRNA', moment().format('LLL'), 'jane.jackson@gmail.com', 24, []),
    createData('Cheapest molecules', 'ATAD', moment().format('LLL'), 'jane.jackson@gmail.com', 27, []),
    createData('Best coumpounds ever', 'NUDT5A', moment().format('LLL'), 'pavol.brunclik@m2ms.sk', 26, []),
    createData('Apoximation of electon', 'NUDT4A', moment().format('LLL'), 'pavol.brunclik@m2ms.sk', 28, []),
    createData('Unique science', 'CAMK1DA', moment().format('LLL'), 'tibor.postek@m2ms.sk', 30, []),
    createData('My fake project', 'XX02KALRNA', moment().format('LLL'), 'tibor.postek@m2ms.sk', 29, []),
    createData('Best coumpounds ever', 'NUDT5A', moment().format('LLL'), 'pavol.brunclik@m2ms.sk', 36, []),
    createData('Cheapest molecules', 'ATAD', moment().format('LLL'), 'pavol.brunclik@m2ms.sk', 32, []),
    createData('Apoximation of electon', 'NUDT4A', moment().format('LLL'), 'james.smith@diamond.co.uk', 33, []),
    createData('My fake project', 'XX02KALRNA', moment().format('LLL'), 'jane.jackson@gmail.com', 34, []),
    createData('Unique science', 'CAMK1DA', moment().format('LLL'), 'jane.jackson@gmail.com', 35, []),
    createData('Cheapest molecules', 'ATAD', moment().format('LLL'), 'jane.jackson@gmail.com', 37, []),
    createData('Best coumpounds ever', 'NUDT5A', moment().format('LLL'), 'tibor.postek@m2ms.sk', 31, []),
    createData('Apoximation of electon', 'NUDT4A', moment().format('LLL'), 'pavol.brunclik@m2ms.sk', 38, []),
    createData('Unique science', 'CAMK1DA', moment().format('LLL'), 'tibor.postek@m2ms.sk', 40, []),
    createData('My fake project', 'XX02KALRNA', moment().format('LLL'), 'tibor.postek@m2ms.sk', 39, [])
  ];
  return (
    <>
      <Panel
        hasHeader
        title="Project list"
        headerActions={[
          <TextField
            className={classes.search}
            id="input-with-icon-textfield"
            placeholder="Search"
            size="small"
            color="primary"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />,
          <IconButton color="inherit" onClick={() => dispatch(setProjectModalOpen(true))}>
            <Add />
          </IconButton>
        ]}
      >
        <Table className={classes.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="left">Target</TableCell>
              <TableCell align="left">Tags</TableCell>
              <TableCell align="left">Author</TableCell>
              <TableCell align="left">Last modification</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(project => (
              <TableRow key={project.id} hover>
                <TableCell component="th" scope="row">
                  <Link to={`${URLS.projects}${project.id}`}>{project.name}</Link>
                </TableCell>
                <TableCell align="left">
                  <Link to={`${URLS.target}${project.target}`}>{project.target}</Link>
                </TableCell>
                <TableCell align="left">
                  {project.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" className={classes.chip} />
                  ))}
                </TableCell>
                <TableCell align="left">{project.author}</TableCell>
                <TableCell align="left">{project.lastModification}</TableCell>
                <TableCell align="right">
                  <IconButton>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 15, 30, 50, 100]}
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </Panel>
      <ProjectModal />
    </>
  );
});
