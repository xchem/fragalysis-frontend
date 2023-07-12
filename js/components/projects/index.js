import React, { memo, useEffect, useState, useCallback, useMemo } from 'react';
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
  Typography,
  Grid
} from '@material-ui/core';
import {
  Delete,
  Add,
  Search,
  QuestionAnswer,
  KeyboardArrowDown,
  KeyboardArrowUp,
  UnfoldMore,
  FilterList
} from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { URLS } from '../routes/constants';
import moment from 'moment';
import { setProjectModalOpen } from './redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectModal } from './projectModal';
import { loadListOfAllProjects, removeProject } from './redux/dispatchActions';
import { setListOfFilteredProjects } from './redux/actions';
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
  compareCreatedAtDateAsc,
  compareCreatedAtDateDesc
} from './sortProjects/sortProjects';
import { DEFAULT_FILTER } from '../../reducers/selection/constants';
import { setSortDialogOpen } from './redux/actions';
import { ProjectListSortFilterDialog } from './projectListSortFilterDialog';
import { selectJoinedMoleculeList, selectAllMoleculeList } from '../preview/molecule/redux/selectors';

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
  },
  sortButton: {
    width: '0.75em',
    height: '0.75em'
  }
}));

export const Projects = memo(({}) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const isLoadingListOfProjects = useSelector(state => state.projectReducers.isLoadingListOfProjects);
  const dispatch = useDispatch();

  const [sortSwitch, setSortSwitch] = useState(0);
  const [listOfProjects, setListOfProjects] = useState([]); // used for sort project list
  const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);
  const sortDialogOpen = useSelector(state => state.projectReducers.projectListFilterDialog);

  const filter = useSelector(state => state.selectionReducers.filter);
  const [predefinedFilter, setPredefinedFilter] = useState(filter !== undefined ? filter.predefined : DEFAULT_FILTER);

  const [searchString, setSearchString] = useState(null);
  const getJoinedMoleculeList = useSelector(state => selectJoinedMoleculeList(state));
  const allMoleculesList = useSelector(state => selectAllMoleculeList(state));

  // checkbox for search
  const [checkedName, setCheckedName] = React.useState(true);
  const [checkedTarget, setCheckedTarget] = React.useState(true);
  const [checkedDescription, setCheckedDescription] = React.useState(true);
  const [checkedTargetAccessString, setCheckedTargetAccessString] = React.useState(true);
  const [checkedAuthority, setCheckedAuthority] = React.useState(true);

  // window height for showing rows per page
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  let projectListWindowHeight = windowHeight / 65;
  let projectListWindowHeightFinal = projectListWindowHeight.toFixed(0);
  const [rowsPerPage, setRowsPerPage] = useState(projectListWindowHeightFinal);

  let searchedByName = [];
  let searchedByTarget = [];
  let searchedByDescription = [];
  let searchedByTargetAccessString = [];
  let searchedByAuthority = [];

  let tags = [];

  const filteredListOfProjects = useSelector(state => state.projectReducers.listOfFilteredProjects);
  const defaultListOfProjects = useSelector(state => state.projectReducers.listOfProjects);

  let joinedMoleculeLists = useMemo(() => {
    if (searchString) {
      return allMoleculesList.filter(molecule =>
        molecule.protein_code.toLowerCase().includes(searchString.toLowerCase())
      );
    } else {
      return getJoinedMoleculeList;
    }
  }, [getJoinedMoleculeList, allMoleculesList, searchString]);

  const joinedMoleculeListsCopy = useMemo(() => [...joinedMoleculeLists], [joinedMoleculeLists]);

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

  const discourseAvailable = isDiscourseAvailable();

  // sort by default project list
  const offsetName = 10;
  const offsetTarget = 20;
  const offsetDescription = 30;
  const offsetTargetAccessString = 40;
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
          break;
      }
    },
    [sortSwitch, defaultListOfProjects, listOfProjects]
  );

  // search from project list
  const handleSearch = event => {
    const value = event.target.value;
    if (checkedName === true) {
      searchedByName = defaultListOfProjects.filter(item => item.title.toLowerCase().includes(value.toLowerCase()));
    } else {
      searchedByName = [];
    }

    if (checkedTarget === true) {
      searchedByTarget = defaultListOfProjects.filter(item =>
        item.target.title.toLowerCase().includes(value.toLowerCase())
      );
    } else {
      searchedByTarget = [];
    }

    if (checkedDescription === true) {
      searchedByDescription = defaultListOfProjects.filter(item =>
        item.description.toLowerCase().includes(value.toLowerCase())
      );
    } else {
      searchedByDescription = [];
    }

    if (checkedTargetAccessString === true) {
      searchedByTargetAccessString = defaultListOfProjects.filter(item =>
        item.project.target_access_string.toLowerCase().includes(value.toLowerCase())
      );
    } else {
      searchedByTargetAccessString = [];
    }

    if (checkedAuthority === true) {
      searchedByAuthority = defaultListOfProjects.filter(item =>
        item.project.authority.toLowerCase().includes(value.toLowerCase())
      );
    } else {
      searchedByAuthority = [];
    }

    const mergedArray = [
      ...searchedByName,
      ...searchedByTarget,
      ...searchedByDescription,
      ...searchedByTargetAccessString,
      ...searchedByAuthority
    ];
    const uniqueArray = Array.from(new Set(mergedArray.map(JSON.stringify))).map(JSON.parse);
    dispatch(setListOfFilteredProjects(uniqueArray));
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
          </IconButton>,
          <IconButton
            onClick={event => {
              if (sortDialogOpen === false) {
                setSortDialogAnchorEl(event.currentTarget);
                dispatch(setSortDialogOpen(true));
              } else {
                setSortDialogAnchorEl(null);
                dispatch(setSortDialogOpen(false));
              }
            }}
            color={'inherit'}
            disabled={predefinedFilter !== 'none'}
          >
            <Tooltip title="Filter/Sort">
              <FilterList />
            </Tooltip>
          </IconButton>
        ]}
        isLoading={isLoadingListOfProjects}
      >
        {isLoadingListOfProjects === false && (
          <Table className={classes.table} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <div>
                  <TableCell style={{ paddingLeft: '0px' }}>
                    <div>
                      <Grid container>
                        <Typography variant="Name">
                          <input
                            type="checkbox"
                            style={{ verticalAlign: 'middle' }}
                            checked={checkedName}
                            onChange={() => setCheckedName(!checkedName)}
                          />
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
                <TableCell align="left" style={{ verticalAlign: 'middle', padding: '0px' }}>
                  <Grid container>
                    <Typography variant="Target">
                      <input
                        type="checkbox"
                        style={{ verticalAlign: 'middle' }}
                        checked={checkedTarget}
                        onChange={() => setCheckedTarget(!checkedTarget)}
                      />
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
                <TableCell align="left" style={{ verticalAlign: 'middle', padding: '0px' }}>
                  <Grid container>
                    <Typography variant="Description">
                      <input
                        type="checkbox"
                        style={{ verticalAlign: 'middle' }}
                        checked={checkedDescription}
                        onChange={() => setCheckedDescription(!checkedDescription)}
                      />
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
                <TableCell align="left" style={{ verticalAlign: 'middle', padding: '0px' }}>
                  <Grid container>
                    <Typography variant="  Target access string">
                      <input
                        type="checkbox"
                        style={{ verticalAlign: 'middle', padding: '0px' }}
                        checked={checkedTargetAccessString}
                        onChange={() => setCheckedTargetAccessString(!checkedTargetAccessString)}
                      />
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
                <TableCell align="left" style={{ verticalAlign: 'middle', padding: '0px' }}>
                  <Grid container>
                    <Typography variant="Tags">Tags</Typography>
                  </Grid>
                </TableCell>
                {/* <TableCell align="left">Author</TableCell> */}
                <TableCell align="left" style={{ verticalAlign: 'middle', padding: '0px' }}>
                  <Grid container>
                    <Typography variant="Authority">
                      <input
                        type="checkbox"
                        style={{ verticalAlign: 'middle' }}
                        checked={checkedAuthority}
                        onChange={() => setCheckedAuthority(!checkedAuthority)}
                      />
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
                <TableCell align="left" style={{ verticalAlign: 'middle', padding: '0px' }}>
                  <Grid container>
                    <Typography variant=" Created at">Created at</Typography>
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
              {listOfProjects.length === 0
                ? filteredListOfProjects === undefined
                  ? defaultListOfProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(
                      project => (
                        (tags = JSON.parse(project.tags)),
                        (
                          <TableRow hover>
                            <Tooltip title={`${project.description}`}>
                              <TableCell
                                component="th"
                                scope="row"
                                style={{ height: '20px', padding: '0px', width: '150px !important' }}
                              >
                                <Link to={`${URLS.projects}${project.id}`}>
                                  <div style={{ width: '100px' }}>
                                    {project.title === undefined ? project.title : project.title}
                                  </div>
                                </Link>
                              </TableCell>
                            </Tooltip>
                            <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                              <Link to={`${URLS.target}${project.target}`}>
                                <div style={{ width: '60px' }}>
                                  {project.target.title === undefined ? project.target : project.target.title}
                                </div>
                              </Link>
                            </TableCell>
                            <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                              <div style={{ width: '110px' }}>{project.description}</div>
                            </TableCell>
                            <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                              <div style={{ width: '50px' }}>{project.project?.target_access_string}</div>
                            </TableCell>
                            <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                              <div style={{ width: '150px' }}>
                                {tags.map((tag, index) => (
                                  <Chip key={index} label={tag} size="small" className={classes.chip} />
                                ))}
                              </div>
                            </TableCell>
                            {/*<TableCell align="left">{project.author}</TableCell> */}
                            <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                              <div style={{ width: '100px' }}>{project.project?.authority} </div>
                            </TableCell>
                            <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                              <div style={{ width: '150px' }}>{moment(project.init_date).format('LLL')}</div>
                            </TableCell>
                            <TableCell align="right" style={{ height: '20px', padding: '0px' }}>
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
                        )
                      )
                    )
                  : filteredListOfProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(
                      project => (
                        (tags = JSON.parse(project.tags)),
                        (
                          <TableRow hover>
                            <Tooltip title={`${project.description}`}>
                              <TableCell
                                component="th"
                                scope="row"
                                style={{ height: '20px', padding: '0px', width: '150px !important' }}
                              >
                                <Link to={`${URLS.projects}${project.id}`}>
                                  <div style={{ width: '100px' }}>
                                    {project.title === undefined ? project.title : project.title}
                                  </div>
                                </Link>
                              </TableCell>
                            </Tooltip>
                            <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                              <Link to={`${URLS.target}${project.target}`}>
                                <div style={{ width: '60px' }}>{project.target.title}</div>
                              </Link>
                            </TableCell>
                            <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                              <div style={{ width: '100px' }}>{project.description}</div>
                            </TableCell>
                            <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                              <div style={{ width: '50px' }}>{project.project?.target_access_string}</div>
                            </TableCell>
                            <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                              <div style={{ width: '150px' }}>
                                {tags.map((tag, index) => (
                                  <Chip key={index} label={tag} size="small" className={classes.chip} />
                                ))}
                              </div>
                            </TableCell>
                            {/*<TableCell align="left">{project.author}</TableCell> */}
                            <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                              <div style={{ width: '60px' }}>{project.project?.authority} </div>
                            </TableCell>
                            <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                              <div style={{ width: '150px' }}>{moment(project.init_date).format('LLL')}</div>
                            </TableCell>
                            <TableCell align="right" style={{ height: '20px', padding: '0px' }}>
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
                        )
                      )
                    )
                : filteredListOfProjects === undefined
                ? listOfProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(
                    project => (
                      (tags = JSON.parse(project.tags)),
                      (
                        <TableRow hover>
                          <Tooltip title={`${project.description}`}>
                            <TableCell
                              component="th"
                              scope="row"
                              style={{ height: '20px', padding: '0px', width: '150px !important' }}
                            >
                              <Link to={`${URLS.projects}${project.id}`}>
                                <div style={{ width: '100px' }}>
                                  {project.title === undefined ? project.title : project.title}
                                </div>
                              </Link>
                            </TableCell>
                          </Tooltip>
                          <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                            <Link to={`${URLS.target}${project.target}`}>
                              <div style={{ width: '60px' }}>
                                {project.target.title === undefined ? project.target : project.target.title}
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                            <div style={{ width: '110px' }}>{project.description}</div>
                          </TableCell>
                          <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                            <div style={{ width: '50px' }}>{project.project?.target_access_string}</div>
                          </TableCell>
                          <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                            <div style={{ width: '150px' }}>
                              {tags.map((tag, index) => (
                                <Chip key={index} label={tag} size="small" className={classes.chip} />
                              ))}
                            </div>
                          </TableCell>
                          {/*<TableCell align="left">{project.author}</TableCell> */}
                          <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                            <div style={{ width: '100px' }}>{project.project?.authority} </div>
                          </TableCell>
                          <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                            <div style={{ width: '150px' }}>{moment(project.init_date).format('LLL')}</div>
                          </TableCell>
                          <TableCell align="right" style={{ height: '20px', padding: '0px' }}>
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
                      )
                    )
                  )
                : listOfProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(
                    project => (
                      (tags = JSON.parse(project.tags)),
                      (
                        <TableRow hover>
                          <Tooltip title={`${project.description}`}>
                            <TableCell
                              component="th"
                              scope="row"
                              style={{ height: '20px', padding: '0px', width: '150px !important' }}
                            >
                              <Link to={`${URLS.projects}${project.id}`}>
                                <div style={{ width: '100px' }}>
                                  {project.title === undefined ? project.title : project.title}
                                </div>
                              </Link>
                            </TableCell>
                          </Tooltip>
                          <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                            <Link to={`${URLS.target}${project.target}`}>
                              <div style={{ width: '60px' }}>{project.target.title}</div>
                            </Link>
                          </TableCell>
                          <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                            <div style={{ width: '100px' }}>{project.description}</div>
                          </TableCell>
                          <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                            <div style={{ width: '50px' }}>{project.project?.target_access_string}</div>
                          </TableCell>
                          <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                            <div style={{ width: '150px' }}>
                              {tags.map((tag, index) => (
                                <Chip key={index} label={tag} size="small" className={classes.chip} />
                              ))}
                            </div>
                          </TableCell>
                          {/*<TableCell align="left">{project.author}</TableCell> */}
                          <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                            <div style={{ width: '60px' }}>{project.project?.authority} </div>
                          </TableCell>
                          <TableCell align="left" style={{ height: '20px', padding: '0px' }}>
                            <div style={{ width: '150px' }}>{moment(project.init_date).format('LLL')}</div>
                          </TableCell>
                          <TableCell align="right" style={{ height: '20px', padding: '0px' }}>
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
                      )
                    )
                  )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[rowsPerPage, 20, 30, 40, 50, 100]}
                  count={defaultListOfProjects.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  SelectProps={{
                    inputProps: { 'aria-label': 'rows per page' },
                    native: true
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          </Table>
        )}
        {sortDialogOpen && (
          <ProjectListSortFilterDialog
            open={sortDialogOpen}
            anchorEl={sortDialogAnchorEl}
            filter={filter}
            setSortDialogAnchorEl={setSortDialogAnchorEl}
            joinedMoleculeLists={joinedMoleculeListsCopy}
          />
        )}
      </Panel>
      <ProjectModal />
    </>
  );
});
