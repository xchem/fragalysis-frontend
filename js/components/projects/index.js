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
import { setProjectModalOpen, setAddButton } from './redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectModal } from './projectModal';
import { loadListOfAllProjects, removeProject } from './redux/dispatchActions';
import { setListOfFilteredProjects, setListOfProjects } from './redux/actions';
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
import {
  setSortDialogOpen,
  setDefaultFilter,
  setSearchTarget,
  setSearchName,
  setSearchTargetAccessString,
  setSearchDescription,
  setSearchAuthority,
  setSearchDateFrom,
  setSearchDateTo
} from './redux/actions';
import { ProjectListSortFilterDialog, sortProjects } from './projectListSortFilterDialog';
import { setFilter } from '../../reducers/selection/actions';

const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 650,
    tableLayout: 'auto'
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

export const Projects = memo(({ }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [page, setPage] = React.useState(0);
  const isLoadingListOfProjects = useSelector(state => state.projectReducers.isLoadingListOfProjects);

  const [sortSwitch, setSortSwitch] = useState(0);
  const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);
  const sortDialogOpen = useSelector(state => state.projectReducers.projectListFilterDialog);

  // checkbox for search
  const [checkedName, setCheckedName] = React.useState(true);
  const [checkedTarget, setCheckedTarget] = React.useState(true);
  const [checkedDescription, setCheckedDescription] = React.useState(true);
  const [checkedTargetAccessString, setCheckedTargetAccessString] = React.useState(true);
  const [checkedAuthority, setCheckedAuthority] = React.useState(true);

  let filteredListOfProjects = useSelector(state => state.projectReducers.listOfFilteredProjects);
  let filteredListOfProjectsByDate = useSelector(state => state.projectReducers.listOfFilteredProjectsByDate);
  let listOfAllProjectsDefaultWithoutSort = useSelector(state => state.projectReducers.listOfProjects);
  let listOfAllProjectsDefault = [...listOfAllProjectsDefaultWithoutSort].sort(compareCreatedAtDateDesc);

  // window height for showing rows per page
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const defaultRowsPerPageOptions = [20, 30, 40, 50, 100];
  let projectListWindowHeight = windowHeight / 26 - 6;
  let projectListWindowHeightFinal = parseInt(projectListWindowHeight.toFixed(0), 10);
  if (defaultRowsPerPageOptions.indexOf(projectListWindowHeightFinal) === -1) {
    defaultRowsPerPageOptions.unshift(projectListWindowHeightFinal);
  }
  const [rowsPerPage, setRowsPerPage] = useState(projectListWindowHeightFinal);

  const projectItems = filteredListOfProjects ?? listOfAllProjects;

  let searchedByName = [];
  let searchedByTarget = [];
  let searchedByDescription = [];
  let searchedByTargetAccessString = [];
  let searchedByAuthority = [];

  let tags = [];
  let searchString = '';

  const filterClean = useSelector(state => state.projectReducers.filterClean);
  const filter = useSelector(state => state.selectionReducers.filter);

  const isActiveFilter = !!(filter || {}).active;

  let listOfAllProjects = [...listOfAllProjectsDefault];

  useEffect(() => {
    if (isActiveFilter) {
      listOfAllProjectsDefault = sortProjects(listOfAllProjectsDefault, filter);
      dispatch(setListOfProjects(listOfAllProjectsDefault));
      if (filteredListOfProjects !== undefined) {
        filteredListOfProjects = sortProjects(filteredListOfProjects, filter);
        dispatch(setListOfFilteredProjects(filteredListOfProjects));
      }
    }
  }, [filter]);

  useEffect(() => {
    dispatch(loadListOfAllProjects()).catch(error => {
      throw new Error(error);
    });
  }, [dispatch]);

  useEffect(() => {
    // remove filter data
    if (filterClean === true) {
      dispatch(setListOfFilteredProjects(listOfAllProjectsDefault));
      dispatch(setListOfProjects(listOfAllProjectsDefault));
      dispatch(setDefaultFilter(false));
      dispatch(setSearchTarget(''));
      dispatch(setSearchName(''));
      dispatch(setSearchTargetAccessString(''));
      dispatch(setSearchDescription(''));
      dispatch(setSearchAuthority(''));
      dispatch(setSearchDateFrom(''));
      dispatch(setSearchDateTo(''));
      const newFilter = { ...filter };
      newFilter.priorityOrder = ['init_date', 'title', 'target', 'targetAccessString', 'description', 'authority'];
      newFilter.sortOptions = [
        ['init_date', undefined],
        ['title', undefined],
        ['target', 'target.title'],
        ['targetAccessString', 'project.target_access_string'],
        ['description', undefined],
        ['authority', 'project.authority']
      ];
      newFilter.filter.authority.order = 1;
      newFilter.filter.description.order = 1;
      newFilter.filter.title.order = 1;
      newFilter.filter.target.order = 1;
      newFilter.filter.init_date.order = 1;
      newFilter.filter.targetAccessString.order = 1;
      dispatch(setFilter(newFilter));
    }
  }, [filterClean]);

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

  const changePrioOrder = (column, priorityOrder) => {
    const newPrioOrder = [...priorityOrder];
    const withoutColumn = newPrioOrder.filter(item => item !== column);
    return [column, ...withoutColumn];
  };

  const handleHeaderSort = type => {
    if (filteredListOfProjects === undefined) {
      switch (type) {
        case 'title':
          if (sortSwitch === offsetName + 1) {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareNameAsc)));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetName + 2) {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareNameAsc)));
            setSortSwitch(0);
          } else {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareNameDesc)));
            setSortSwitch(offsetName + 1);
          }
          break;
        case 'target':
          if (sortSwitch === offsetTarget + 1) {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareTargetAsc)));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetTarget + 2) {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareTargetAsc)));
            setSortSwitch(0);
          } else {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareTargetDesc)));
            setSortSwitch(offsetTarget + 1);
          }
          break;
        case 'description':
          if (sortSwitch === offsetDescription + 1) {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareDescriptionAsc)));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetDescription + 2) {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareDescriptionAsc)));
            setSortSwitch(0);
          } else {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareDescriptionDesc)));
            setSortSwitch(offsetDescription + 1);
          }
          break;
        case 'targetAccessString':
          if (sortSwitch === offsetTargetAccessString + 1) {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareTargetAccessStringAsc)));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetTargetAccessString + 2) {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareTargetAccessStringAsc)));
            setSortSwitch(0);
          } else {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareTargetAccessStringDesc)));
            setSortSwitch(offsetTargetAccessString + 1);
          }
          break;
        case 'authority':
          if (sortSwitch === offsetAuthority + 1) {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareAuthorityAsc)));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetAuthority + 2) {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareAuthorityAsc)));
            setSortSwitch(0);
          } else {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareAuthorityDesc)));
            setSortSwitch(offsetAuthority + 1);
          }
          break;
        case 'createdAt':
          if (sortSwitch === offsetCreatedAt + 1) {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareCreatedAtDateAsc)));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetCreatedAt + 2) {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareCreatedAtDateAsc)));
            setSortSwitch(0);
          } else {
            dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareCreatedAtDateDesc)));
            setSortSwitch(offsetCreatedAt + 1);
          }
          break;
        default:
          dispatch(setListOfFilteredProjects([...listOfAllProjects].sort(compareCreatedAtDateDesc)));
          break;
      }
    } else {
      filteredListOfProjects = [...filteredListOfProjects].sort(compareCreatedAtDateDesc);
      switch (type) {
        case 'title':
          if (filter !== undefined) {
            const newFilter = { ...filter };
            newFilter.priorityOrder = changePrioOrder(type, newFilter.priorityOrder);
            dispatch(setFilter(newFilter));
          }
          if (sortSwitch === offsetName + 1) {
            if (filter !== undefined) {
              // change radio button in project list filter
              const newFilter = { ...filter };
              newFilter.filter.title.order = -1;
              dispatch(setFilter(newFilter));
            }
            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareNameAsc)));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetName + 2) {
            if (filter !== undefined) {
              // change radio button in project list filter
              const newFilter = { ...filter };
              newFilter.filter.title.order = 1;
              dispatch(setFilter(newFilter));
            }
            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareNameAsc)));
            setSortSwitch(0);
          } else {
            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareNameDesc)));
            setSortSwitch(offsetName + 1);
          }
          break;
        case 'target':
          if (filter !== undefined) {
            const newFilter = { ...filter };
            newFilter.priorityOrder = changePrioOrder(type, newFilter.priorityOrder);
            dispatch(setFilter(newFilter));
          }
          if (sortSwitch === offsetTarget + 1) {
            if (filter !== undefined) {
              const newFilter = { ...filter };
              newFilter.filter.target.order = -1;
              dispatch(setFilter(newFilter));
            }
            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareTargetAsc)));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetTarget + 2) {
            if (filter !== undefined) {
              const newFilter = { ...filter };
              newFilter.filter.target.order = 1;
              dispatch(setFilter(newFilter));
            }

            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareTargetAsc)));
            setSortSwitch(0);
          } else {
            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareTargetDesc)));
            setSortSwitch(offsetTarget + 1);
          }
          break;
        case 'description':
          if (filter !== undefined) {
            const newFilter = { ...filter };
            newFilter.priorityOrder = changePrioOrder(type, newFilter.priorityOrder);
            dispatch(setFilter(newFilter));
          }
          if (sortSwitch === offsetDescription + 1) {
            if (filter !== undefined) {
              const newFilter = { ...filter };
              newFilter.filter.description.order = -1;
              dispatch(setFilter(newFilter));
            }

            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareDescriptionAsc)));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetDescription + 2) {
            if (filter !== undefined) {
              const newFilter = { ...filter };
              newFilter.filter.description.order = 1;
              dispatch(setFilter(newFilter));
            }

            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareDescriptionAsc)));
            setSortSwitch(0);
          } else {
            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareDescriptionDesc)));
            setSortSwitch(offsetDescription + 1);
          }
          break;
        case 'targetAccessString':
          if (filter !== undefined) {
            const newFilter = { ...filter };
            newFilter.priorityOrder = changePrioOrder(type, newFilter.priorityOrder);
            dispatch(setFilter(newFilter));
          }
          if (sortSwitch === offsetTargetAccessString + 1) {
            if (filter !== undefined) {
              const newFilter = { ...filter };
              newFilter.filter.targetAccessString.order = -1;
              dispatch(setFilter(newFilter));
            }

            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareTargetAccessStringAsc)));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetTargetAccessString + 2) {
            if (filter !== undefined) {
              const newFilter = { ...filter };
              newFilter.filter.targetAccessString.order = 1;
              dispatch(setFilter(newFilter));
            }

            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareTargetAccessStringAsc)));
            setSortSwitch(0);
          } else {
            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareTargetAccessStringDesc)));
            setSortSwitch(offsetTargetAccessString + 1);
          }
          break;
        case 'authority':
          if (filter !== undefined) {
            const newFilter = { ...filter };
            newFilter.priorityOrder = changePrioOrder(type, newFilter.priorityOrder);
            dispatch(setFilter(newFilter));
          }
          if (sortSwitch === offsetAuthority + 1) {
            if (filter !== undefined) {
              const newFilter = { ...filter };
              newFilter.filter.authority.order = -1;
              dispatch(setFilter(newFilter));
            }
            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareAuthorityAsc)));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetAuthority + 2) {
            if (filter !== undefined) {
              const newFilter = { ...filter };
              newFilter.filter.authority.order = 1;
              dispatch(setFilter(newFilter));
            }
            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareAuthorityAsc)));
            setSortSwitch(0);
          } else {
            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareAuthorityDesc)));
            setSortSwitch(offsetAuthority + 1);
          }
          break;
        case 'createdAt':
          if (filter !== undefined) {
            const newFilter = { ...filter };
            newFilter.priorityOrder = changePrioOrder(type, newFilter.priorityOrder);
            dispatch(setFilter(newFilter));
          }
          if (sortSwitch === offsetCreatedAt + 1) {
            if (filter !== undefined) {
              const newFilter = { ...filter };
              newFilter.filter.createdAt.order = -1;
              dispatch(setFilter(newFilter));
            }
            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareCreatedAtDateAsc)));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetCreatedAt + 2) {
            if (filter !== undefined) {
              const newFilter = { ...filter };
              newFilter.filter.createdAt.order = 1;
              dispatch(setFilter(newFilter));
            }
            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareCreatedAtDateAsc)));
            setSortSwitch(0);
          } else {
            dispatch(setListOfFilteredProjects([...filteredListOfProjects].sort(compareCreatedAtDateDesc)));
            setSortSwitch(offsetCreatedAt + 1);
          }
          break;
      }
    }
  };

  // search from project list
  const handleSearch = event => {
    searchString = event.target.value;
    if (checkedName === true) {
      searchedByName = listOfAllProjects.filter(item => item.title.toLowerCase().includes(searchString.toLowerCase()));
    } else {
      searchedByName = [];
    }

    if (checkedTarget === true) {
      searchedByTarget = listOfAllProjects.filter(item =>
        item.target.title.toLowerCase().includes(searchString.toLowerCase())
      );
    } else {
      searchedByTarget = [];
    }

    if (checkedDescription === true) {
      searchedByDescription = listOfAllProjects.filter(item =>
        item.description.toLowerCase().includes(searchString.toLowerCase())
      );
    } else {
      searchedByDescription = [];
    }

    if (checkedTargetAccessString === true) {
      searchedByTargetAccessString = listOfAllProjects.filter(item => {
        if (item.project !== null) {
          item.project.target_access_string.toLowerCase().includes(searchString.toLowerCase());
        }
      });
    } else {
      searchedByTargetAccessString = [];
    }

    if (checkedAuthority === true) {
      searchedByAuthority = listOfAllProjects.filter(item => {
        if (item.project !== null) {
          item.project.authority.toLowerCase().includes(searchString.toLowerCase());
        }
      });
    } else {
      searchedByAuthority = [];
    }

    const mergedSearchList = [
      ...searchedByName,
      ...searchedByTarget,
      ...searchedByDescription,
      ...searchedByTargetAccessString,
      ...searchedByAuthority
    ];
    const uniqueArray = Array.from(new Set(mergedSearchList.map(JSON.stringify))).map(JSON.parse);
    dispatch(setListOfFilteredProjects(uniqueArray));
  };

  if (filteredListOfProjects === undefined) {
    filteredListOfProjects = [...listOfAllProjects];
  }

  if (filteredListOfProjectsByDate !== undefined && filteredListOfProjects !== undefined) {
    filteredListOfProjects = filteredListOfProjects.filter(item1 =>
      filteredListOfProjectsByDate.some(item2 => item2.id === item1.id)
    );
  }

  const projectsToUse = filteredListOfProjects ? filteredListOfProjects : listOfAllProjects;

  return (
    <>
      <Panel
        hasHeader
        title="Project list"
        bodyOverflow
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
            onClick={() => {
              dispatch(setAddButton(true)), dispatch(setProjectModalOpen(true));
            }}
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
                <TableCell style={{ paddingLeft: '0px' }}>
                  <Grid container>
                    <Typography variant="inherit">
                      <input
                        type="checkbox"
                        style={{ verticalAlign: 'middle' }}
                        checked={checkedName}
                        onChange={() => setCheckedName(!checkedName)}
                      />
                      Name
                    </Typography>
                    <IconButton size="small" onClick={() => handleHeaderSort('title')}>
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
                </TableCell>
                <TableCell align="left" style={{ verticalAlign: 'middle', padding: '0px' }}>
                  <Grid container>
                    <Typography variant="inherit">
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
                    <Typography variant="inherit">
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
                    <Typography variant="inherit">
                      <input
                        type="checkbox"
                        style={{ verticalAlign: 'middle', padding: '0px' }}
                        checked={checkedTargetAccessString}
                        onChange={() => setCheckedTargetAccessString(!checkedTargetAccessString)}
                      />
                      Target access
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
                    <Typography variant="inherit">Tags</Typography>
                  </Grid>
                </TableCell>
                {/* <TableCell align="left">Author</TableCell> */}
                <TableCell align="left" style={{ verticalAlign: 'middle', padding: '0px' }}>
                  <Grid container>
                    <Typography variant="inherit">
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
                    <Typography variant="inherit">Created at</Typography>
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
                <TableCell align="center" style={{ verticalAlign: 'middle', padding: '0px' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectsToUse.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(
                project => (
                  (tags = JSON.parse(project.tags)),
                  (
                    <TableRow hover key={project.id}>
                      <Tooltip title={`${project.description}`}>
                        <TableCell
                          component="th"
                          scope="row"
                          style={{ minWidth: '150px', padding: '0px 10px 0px 0px', margin: '0px' }}
                        >
                          <Link to={`${URLS.projects}${project.id}`}>
                            <div>{project.title === undefined ? project.title : project.title}</div>
                          </Link>
                        </TableCell>
                      </Tooltip>
                      <TableCell align="left" style={{ minWidth: '100px', padding: '0px 10px 0px 0px', margin: '0px' }}>
                        <Link to={`${URLS.target}${project.target.title}`}>
                          <div>{project.target.title === undefined ? project.target : project.target.title}</div>
                        </Link>
                      </TableCell>
                      <TableCell align="left" style={{ minWidth: '100px', padding: '5px 10px 0px 0px', margin: '0px' }}>
                        <div>{project.description}</div>
                      </TableCell>
                      <TableCell align="left" style={{ minWidth: '150px', padding: '0px 10px 0px 0px', margin: '0px' }}>
                        <div>{project.project?.target_access_string}</div>
                      </TableCell>
                      <TableCell align="left" style={{ padding: '0px 10px 0px 0px', margin: '0px' }}>
                        <div>
                          {tags.map((tag, index) => (
                            <Chip key={index} label={tag} size="small" className={classes.chip} />
                          ))}
                        </div>
                      </TableCell>
                      {/*<TableCell align="left">{project.author}</TableCell> */}
                      <TableCell align="left" style={{ minWidth: '150px', padding: '0px 10px 0px 0px', margin: '0px' }}>
                        <div>{project.project?.authority} </div>
                      </TableCell>
                      <TableCell align="left" style={{ minWidth: '150px', padding: '0px 10px 0px 0px', margin: '0px' }}>
                        <div>{moment(project.init_date).format('LLL')}</div>
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ minWidth: '100px', padding: '0px 10px 0px 0px', margin: '0px' }}
                      >
                        <Tooltip title="Delete project">
                          <IconButton
                            style={{ padding: '0px' }}
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
                              style={{ padding: '0px' }}
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
                  rowsPerPageOptions={defaultRowsPerPageOptions}
                  count={listOfAllProjects.length}
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
          />
        )}
      </Panel>
      <ProjectModal />
    </>
  );
});
