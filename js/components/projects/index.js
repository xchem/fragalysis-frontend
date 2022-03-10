import React, { memo, useEffect } from 'react';
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
  Chip,
  Tooltip,
  Zoom
} from '@material-ui/core';
import { Delete, Add, Search, QuestionAnswer } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';
import { URLS } from '../routes/constants';
import moment from 'moment';
import { setProjectModalOpen } from './redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectModal } from './projectModal';
import { loadListOfAllProjects, removeProject, searchInProjects } from './redux/dispatchActions';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { isDiscourseAvailable, getExistingPost, openDiscourseLink } from '../../utils/discourse';
import { setOpenDiscourseErrorModal } from '../../reducers/api/actions';

const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 650
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
  }
}));

export const Projects = memo(({}) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const isLoadingListOfProjects = useSelector(state => state.projectReducers.isLoadingListOfProjects);
  const dispatch = useDispatch();

  const listOfProjects = useSelector(state => state.projectReducers.listOfProjects).map(project => {
    return {
      id: project.id,
      name: project.title,
      tags: JSON.parse(project.tags),
      target: project.target.title,
      createdAt: project.init_date,
      author: (project.author && project.author.email) || '-',
      description: project.description
    };
  });

  useEffect(() => {
    dispatch(loadListOfAllProjects()).catch(error => {
      throw new Error(error);
    });
  }, [dispatch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  let debouncedFn;

  const discourseAvailable = isDiscourseAvailable();

  const handleSearch = event => {
    /* signal to React not to nullify the event object */
    event.persist();
    if (!debouncedFn) {
      debouncedFn = debounce(() => {
        dispatch(searchInProjects(event.target.value)).catch(error => {
          throw new Error(error);
        });
      }, 350);
    }
    debouncedFn();
  };

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
            onChange={handleSearch}
          />,
          <IconButton
            color="inherit"
            onClick={() => dispatch(setProjectModalOpen(true))}
            disabled={DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN'}
          >
            <Add />
          </IconButton>
        ]}
        isLoading={isLoadingListOfProjects}
      >
        {isLoadingListOfProjects === false && (
          <Table className={classes.table} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="left">Target</TableCell>
                <TableCell align="left">Tags</TableCell>
                <TableCell align="left">Author</TableCell>
                <TableCell align="left">Created at</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listOfProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(project => (
                <TableRow hover>
                  <Tooltip title={`${project.description}`}>
                    <TableCell component="th" scope="row">
                      <Link to={`${URLS.projects}${project.id}`}>{project.name}</Link>
                    </TableCell>
                  </Tooltip>
                  <TableCell align="left">
                    <Link to={`${URLS.target}${project.target}`}>{project.target}</Link>
                  </TableCell>
                  <TableCell align="left">
                    {project.tags &&
                      project.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" className={classes.chip} />
                      ))}
                  </TableCell>
                  <TableCell align="left">{project.author}</TableCell>
                  <TableCell align="left">{moment(project.createdAt).format('LLL')}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete project">
                      <IconButton
                        disabled={DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN'}
                        onClick={() =>
                          dispatch(removeProject(project.id)).catch(error => {
                            throw new Error(error);
                          })
                        }
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                    {discourseAvailable && (
                      <Tooltip title="Go to Discourse">
                        <IconButton
                          onClick={() => {
                            getExistingPost(project.name)
                              .then(response => {
                                if (response.data['Post url']) {
                                  const link = response.data['Post url'];
                                  openDiscourseLink(link);
                                }
                              })
                              .catch(err => {
                                console.log(err);
                                dispatch(setOpenDiscourseErrorModal(true));
                              });
                          }}
                        >
                          <QuestionAnswer />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 15, 30, 50, 100]}
                  count={listOfProjects.length}
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
        )}
      </Panel>
      <ProjectModal />
    </>
  );
});
