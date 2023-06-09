import React, { memo, useEffect, useState, useCallback } from 'react';
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
  Zoom,
  Typography,
  Grid
} from '@material-ui/core';
import { Delete, Add, Search, QuestionAnswer, KeyboardArrowDown, KeyboardArrowUp, UnfoldMore } from '@material-ui/icons';
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
import { 
   compareNameAsc,
   compareNameDesc,
   compareTargetAsc,
   compareTargetDesc,
   compareDescriptionDesc,
   compareDescriptionAsc,
   compareTargetAccessStringDesc,
   compareTargetAccessStringAsc,
   compareAuthorityAsc,
   compareAuthorityDesc,
   compareTagsAsc,
   compareTagsDesc,
   compareCreatedAtDateAsc,
   compareCreatedAtDateDesc } from './sortProjects/sortProjects';

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
    margin: theme.spacing(1) / 2,
  },
  columnLabel: {
    display: 'flex'
  },
  sortButton: {
    width: '0.75em',
    height: '0.75em'
  }
}));

export const Projects = memo(({}) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const isLoadingListOfProjects = useSelector(state => state.projectReducers.isLoadingListOfProjects);
  const dispatch = useDispatch();

  const [sortSwitch, setSortSwitch] = useState(0);
  const [listOfProjects, setListOfProjects] = useState([]);

  const defaultListOfProjects = useSelector(state => state.projectReducers.listOfProjects).map(project => {
    return {
      id: project.id,
      name: project.title,
      tags: JSON.parse(project.tags),
      target: project.target.title,
      createdAt: project.init_date,
      author: (project.author && project.author.email) || '-',
      authority: project.project !== null ? project.project.authority : '-',
      description: project.description,
      targetAccessString: project.project !== null ? project.project.target_access_string : '-',
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

  const offsetName = 10;
  const offsetTarget = 20;
  const offsetDescription = 30;
  const offsetTargetAccessString = 40;
  const offsetTags = 50;
  const offsetAuthority = 60;
  const offsetCreatedAt = 70;
  const handleHeaderSort = useCallback(
    type => {
      switch (type) {
        case 'name':
          if (sortSwitch === offsetName + 1) {
            // change direction
            setListOfProjects([...defaultListOfProjects].sort(compareNameAsc));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetName + 2) {
            // reset sort
            setListOfProjects([...defaultListOfProjects].sort(compareNameAsc));
            setSortSwitch(0);
          } else {
            // start sorting
            setListOfProjects([...defaultListOfProjects].sort(compareNameDesc));
            setSortSwitch(offsetName + 1);
          }
          break;
        case 'target':
          if (sortSwitch === offsetTarget + 1) {
            // change direction
            setListOfProjects([...defaultListOfProjects].sort(compareTargetAsc));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetTarget + 2) {
            // reset sort
            setListOfProjects([...defaultListOfProjects].sort(compareTargetAsc));
            setSortSwitch(0);
          } else {
            // start sorting
            setListOfProjects([...defaultListOfProjects].sort(compareTargetDesc));
            setSortSwitch(offsetTarget + 1);
          }
          break;
        case 'description':
          if (sortSwitch === offsetDescription + 1) {
            // change direction
            setListOfProjects([...defaultListOfProjects].sort(compareDescriptionAsc));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetDescription + 2) {
            // reset sort
            setListOfProjects([...defaultListOfProjects].sort(compareDescriptionAsc));
            setSortSwitch(0);
          } else {
            // start sorting
            setListOfProjects([...defaultListOfProjects].sort(compareDescriptionDesc));
            setSortSwitch(offsetDescription + 1);
          }
          break;
        case 'targetAccessString':
          if (sortSwitch === offsetTargetAccessString + 1) {
            // change direction
            setListOfProjects([...defaultListOfProjects].sort(compareTargetAccessStringAsc));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetTargetAccessString + 2) {
            // reset sort
            setListOfProjects([...defaultListOfProjects].sort(compareTargetAccessStringAsc));
            setSortSwitch(0);
          } else {
            // start sorting
            setListOfProjects([...defaultListOfProjects].sort(compareTargetAccessStringDesc));
            setSortSwitch(offsetTargetAccessString + 1);
          }
          break;
          case 'tags':
            if (sortSwitch === offsetTags + 1) {
              // change direction
              setListOfProjects([...defaultListOfProjects].sort(compareTagsAsc));
              setSortSwitch(sortSwitch + 1);
            } else if (sortSwitch === offsetTags + 2) {
              // reset sort
              setListOfProjects([...defaultListOfProjects].sort(compareTagsAsc));
              setSortSwitch(0);
            } else {
              // start sorting
              setListOfProjects([...defaultListOfProjects].sort(compareTagsDesc));
              setSortSwitch(offsetTags + 1);
            }
          break;
          case 'authority':
            if (sortSwitch === offsetAuthority + 1) {
              // change direction
              setListOfProjects([...defaultListOfProjects].sort(compareAuthorityAsc));
              setSortSwitch(sortSwitch + 1);
            } else if (sortSwitch === offsetAuthority + 2) {
              // reset sort
              setListOfProjects([...defaultListOfProjects].sort(compareAuthorityAsc));
              setSortSwitch(0);
            } else {
              // start sorting
              setListOfProjects([...defaultListOfProjects].sort(compareAuthorityDesc));
              setSortSwitch(offsetAuthority + 1);
            }
            break;
            case 'createdAt':
              if (sortSwitch === offsetCreatedAt + 1) {
                // change direction
                setListOfProjects([...defaultListOfProjects].sort(compareCreatedAtDateAsc));
                setSortSwitch(sortSwitch + 1);
              } else if (sortSwitch === offsetCreatedAt + 2) {
                // reset sort
                setListOfProjects([...defaultListOfProjects].sort(compareCreatedAtDateAsc));
                setSortSwitch(0);
              } else {
                // start sorting
                setListOfProjects([...defaultListOfProjects].sort(compareCreatedAtDateDesc));
                setSortSwitch(offsetCreatedAt + 1);
              }
              break;
        default:
          // tagList = tagList.sort(compareTagsAsc);
          break;
      }
    },
    [sortSwitch, defaultListOfProjects, listOfProjects]
  );

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
              <div style={{ padding: '0px !important' }}>
                  <TableCell>
                  <div style={{ padding: '0px !important' }}>
                    <Grid container>
                      <Typography variant="Name">
                        Name
                      </Typography>
                      <IconButton size="small" onClick={() => handleHeaderSort('name')}>
                        <Tooltip title="Sort" className={classes.sortButton}>
                          {[1, 2].includes(sortSwitch - offsetName) ? (
                            sortSwitch % offsetName < 2 ? (
                              <KeyboardArrowDown />
                            ) : (
                              <KeyboardArrowUp />
                            )
                          ) : (
                            <UnfoldMore />
                          )}
                        </Tooltip>
                      </IconButton>
                    </Grid>
                    </div>
                  </TableCell>
                  </div>
                <TableCell align="left">
                  <Grid container>
                    <Typography variant="Target">
                      Target
                    </Typography>
                    <IconButton size="small" onClick={() => handleHeaderSort('target')}>
                      <Tooltip title="Sort" className={classes.sortButton}>
                        {[1, 2].includes(sortSwitch - offsetTarget) ? (
                          sortSwitch % offsetTarget < 2 ? (
                            <KeyboardArrowDown />
                          ) : (
                            <KeyboardArrowUp />
                          )
                        ) : (
                          <UnfoldMore />
                        )}
                      </Tooltip>
                    </IconButton>
                  </Grid>
                </TableCell>
                <TableCell align="left">
                  <Grid container>
                    <Typography variant="Description">
                      Description
                    </Typography>
                    <IconButton size="small" onClick={() => handleHeaderSort('description')}>
                      <Tooltip title="Sort" className={classes.sortButton}>
                        {[1, 2].includes(sortSwitch - offsetDescription) ? (
                          sortSwitch % offsetDescription < 2 ? (
                            <KeyboardArrowDown />
                          ) : (
                            <KeyboardArrowUp />
                          )
                        ) : (
                          <UnfoldMore />
                        )}
                      </Tooltip>
                    </IconButton>
                  </Grid>
                </TableCell>
                <TableCell align="left">
                  <Grid container>
                    <Typography variant="  Target access string">
                      Target access string
                    </Typography>
                    <IconButton size="small" onClick={() => handleHeaderSort('targetAccessString')}>
                      <Tooltip title="Sort" className={classes.sortButton}>
                        {[1, 2].includes(sortSwitch - offsetTargetAccessString) ? (
                          sortSwitch % offsetTargetAccessString < 2 ? (
                            <KeyboardArrowDown />
                          ) : (
                            <KeyboardArrowUp />
                          )
                        ) : (
                          <UnfoldMore />
                        )}
                      </Tooltip>
                    </IconButton>
                  </Grid>
                </TableCell>
                <TableCell align="left">                
                  <Grid container>
                    <Typography variant="Tags">
                      Tags
                    </Typography>
                    <IconButton size="small" onClick={() => handleHeaderSort('tags')}>
                      <Tooltip title="Sort" className={classes.sortButton}>
                        {[1, 2].includes(sortSwitch - offsetTags) ? (
                          sortSwitch % offsetTags < 2 ? (
                            <KeyboardArrowDown />
                          ) : (
                            <KeyboardArrowUp />
                          )
                        ) : (
                          <UnfoldMore />
                        )}
                      </Tooltip>
                    </IconButton>
                  </Grid>
                </TableCell>
                {/* <TableCell align="left">Author</TableCell> */}
                <TableCell align="left"> 
                  <Grid container>
                    <Typography variant="Authority">
                        Authority
                    </Typography>
                    <IconButton size="small" onClick={() => handleHeaderSort('authority')}>
                      <Tooltip title="Sort" className={classes.sortButton}>
                        {[1, 2].includes(sortSwitch - offsetAuthority) ? (
                          sortSwitch % offsetAuthority < 2 ? (
                            <KeyboardArrowDown />
                          ) : (
                            <KeyboardArrowUp />
                          )
                        ) : (
                          <UnfoldMore />
                        )}
                        </Tooltip>
                      </IconButton>
                    </Grid>
                </TableCell>
                <TableCell align="left">                  
                  <Grid container>
                    <Typography variant=" Created at">
                        Created at
                    </Typography>
                    <IconButton size="small" onClick={() => handleHeaderSort('createdAt')}>
                      <Tooltip title="Sort" className={classes.sortButton}>
                        {[1, 2].includes(sortSwitch - offsetCreatedAt) ? (
                          sortSwitch % offsetCreatedAt < 2 ? (
                            <KeyboardArrowDown />
                          ) : (
                            <KeyboardArrowUp />
                          )
                        ) : (
                          <UnfoldMore />
                        )}
                        </Tooltip>
                      </IconButton>
                    </Grid>
                  </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listOfProjects.length === 0 ? defaultListOfProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(project => (
                <TableRow hover>
                  <Tooltip title={`${project.description}`}>
                    <TableCell component="th" scope="row" style={{ height: '20px', padding: '0px', width: '150px !important' }}>
                      <Link to={`${URLS.projects}${project.id}`}><div style={{width: '100px'}}>{project.name}</div></Link>
                    </TableCell>
                  </Tooltip>
                  <TableCell align="left">
                    <Link to={`${URLS.target}${project.target}`}><div style={{width: '60px'}}>{project.target}</div></Link>
                  </TableCell>
                  <TableCell align="left"><div style={{width: '100px'}}>{project.description}</div></TableCell>
                  <TableCell align="left"><div style={{width: '100px'}}>{project.targetAccessString}</div></TableCell>
                  <TableCell align="left">
                  <div style={{width: '70px'}}>
                    {
                      project.tags &&
                      project.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" className={classes.chip} />
                      ))}
                      </div>
                  </TableCell>
                  { /*<TableCell align="left">{project.author}</TableCell> */}
                  <TableCell align="left"><div style={{width: '60px'}}>{project.authority} </div></TableCell>
                  <TableCell align="left"><div style={{width: '150px'}}>{moment(project.createdAt).format('LLL')}</div></TableCell>
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
              )) : listOfProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(project => (
                <TableRow hover>
                  <Tooltip title={`${project.description}`}>
                    <TableCell component="th" scope="row" style={{ paddingTop: '0px' }}>
                      <Link to={`${URLS.projects}${project.id}`}><div style={{width: '70px'}}>{project.name}</div></Link>
                    </TableCell>
                  </Tooltip>
                  <TableCell align="left">
                    <Link to={`${URLS.target}${project.target}`}><div style={{width: '70px'}}>{project.target}</div></Link>
                  </TableCell>
                  <TableCell align="left"><div style={{width: '100px'}}>{project.description}</div></TableCell>
                  <TableCell align="left"><div style={{width: '100px'}}>{project.targetAccessString}</div></TableCell>
                  <TableCell align="left">
                   <div style={{width: '70px'}}>
                     {project.tags &&
                      project.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" className={classes.chip} />
                      ))}
                    </div>
                  </TableCell>
                  { /*<TableCell align="left">{project.author}</TableCell> */}
                  <TableCell align="left"><div style={{width: '60px'}}>{project.authority}</div></TableCell>
                  <TableCell align="left"><div style={{width: '150px'}}>{moment(project.createdAt).format('LLL')}</div></TableCell>
                  <TableCell align="center">
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
                  count={defaultListOfProjects.length}
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
