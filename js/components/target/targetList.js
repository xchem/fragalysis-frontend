/**
 * Created by abradley on 13/03/2018.
 */

import React, { memo, useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ListItemText,
  ListItemSecondaryAction,
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
import { List, ListItem, Panel } from '../common';
import { Link } from 'react-router-dom';
import { URLS } from '../routes/constants';
import { isDiscourseAvailable, generateDiscourseTargetURL, openDiscourseLink } from '../../utils/discourse';
import { setOpenDiscourseErrorModal } from '../../reducers/api/actions';
import { Chat, Edit } from '@material-ui/icons';
import { URL_TOKENS } from '../direct/constants';
import {
  setListOfFilteredTargets,
  setSortTargetDialogOpen,
  setListOfTargets,
  setDefaultFilter,
  setSearchTarget,
  setSearchNumberOfChains,
  setSearchPrimaryChain,
  setSearchUniprot,
  setSearchRange,
  setSearchProteinName,
  setSearchGeneName,
  setSearchSpecies,
  setSearchDomain,
  setSearchECNumber,
  setSearchNHits,
  setSearchDateLastEditFrom,
  setSearchDateLastEditTo,
  setSearchTargetAccessString,
  setSearchInitDateFrom,
  setSearchInitDateTo,
  setEditTargetDialogOpen
} from './redux/actions';
import {
  compareIdAsc,
  compareIdDesc,
  compareTargetAsc,
  compareTargetDesc,
  compareNumberOfChainDesc,
  compareNumberOfChainAsc,
  comparePrimaryChainDesc,
  comparePrimaryChainAsc,
  compareUniprotAsc,
  compareUniprotDesc,
  compareRangeAsc,
  compareRangeDesc,
  compareProteinNameAsc,
  compareProteinNameDesc,
  compareGeneNameAsc,
  compareGeneNameDesc,
  compareSpeciesIdAsc,
  compareSpeciesIdDesc,
  compareSpeciesAsc,
  compareSpeciesDesc,
  compareDomainAsc,
  compareDomainDesc,
  compareECNumberAsc,
  compareECNumberDesc,
  compareNHitsAsc,
  compareNHitsDesc,
  compareDateLastEditAsc,
  compareDateLastEditDesc,
  compareVersionIdAsc,
  compareVersionIdDesc,
  compareTargetAccessStringAsc,
  compareTargetAccessStringDesc,
  compareInitDateAsc,
  compareInitDateDesc
} from './sortTargets/sortTargets';
import { TargetListSortFilterDialog } from './targetListSortFilterDialog';
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
import { setTargetFilter, setTargetToEdit } from '../../reducers/selection/actions';
import { MOCK_LIST_OF_TARGETS } from './MOCK';
import { TARGETS_ATTR } from './redux/constants';
import { getTargetProjectCombinations } from './redux/dispatchActions';
import moment from 'moment';
import { getCombinedTargetList } from '../../reducers/api/selectors';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';

const useStyles = makeStyles(theme => ({
  table: {
    // minWidth: 430,
    tableLayout: 'auto'
    // marginTop: '8px'
  },
  tableHeader: {
    padding: 0,
    paddingLeft: 3,
    verticalAlign: 'middle'
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
  arrowsWrapper: {
    paddingRight: 3
  },
  sortButton: {
    width: '0.75em',
    height: '0.75em',
    padding: '0px'
  }
}));

export const TargetList = memo(({ list = [], title = 'Target list', authRequired = false, legacy = false }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [initList, setInitList] = useState([]);
  const [targetList, setTargetList] = useState([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [searchString, setSearchString] = useState('');
  // checkbox for search
  const [checkedTarget, setCheckedTarget] = useState(true);
  const [checkedTargetAccessString, setCheckedTargetAccessString] = useState(true);

  const [page, setPage] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingTargetAccessString, setIsResizingTargetAccessString] = useState(false);
  const [isResizingInitDate, setIsResizingInitDate] = useState(false);
  const [isResizingSGC, setIsResizingSGC] = useState(false);
  const [isResizingForColumns, setIsResizingForColumns] = useState({
    target: false,
    tas: false,
    initDate: false,
    lastUpdatedDate: false,
    shortName: false,
    longName: false,
    organism: false,
    externalURL: false
  });
  const updateIsResizingForColumn = (column, isResizing) => {
    setIsResizingForColumns({
      ...isResizingForColumns,
      [column]: isResizing
    })
  };
  const [panelWidthForColumns, setPanelWidthForColumns] = useState({
    target: 110,
    tas: 110,
    initDate: 90,
    lastUpdatedDate: 90,
    shortName: 110,
    longName: 110,
    organism: 110,
    externalURL: 110
  });
  const updateWidthForColumn = (column, width) => {
    setPanelWidthForColumns({
      ...panelWidthForColumns,
      [column]: width
    })
  };
  const [panelWidth, setPanelWidth] = useState(110);
  const [panelWidthForTargetAccessString, setPanelWidthForTargetAccessString] = useState(140);
  const [panelWidthForInitDate, setPanelWidthForInitDate] = useState(90);
  const [panelWidthForSGC, setPanelWidthForSGC] = useState(130);

  const [sortSwitch, setSortSwitch] = useState(21);
  const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);
  const sortDialogOpen = useSelector(state => state.targetReducers.targetListFilterDialog);

  const initialize = useCallback(() => {
    let initObject = {
      active: false,
      predefined: 'none',
      filter: {},
      priorityOrder: TARGETS_ATTR.map(target => target.key),
      sortOptions: TARGETS_ATTR.map(target => [target.key, target.path])
    };

    for (let attr of TARGETS_ATTR) {
      const lowAttr = attr.key.toLowerCase();
      if (attr.key === 'display_name') {
        initObject.filter[attr.key] = {
          priority: 0,
          order: -1,
          isFloat: attr.isFloat
        };
      } else {
        initObject.filter[attr.key] = {
          priority: 0,
          order: 0,
          isFloat: attr.isFloat
        };
      }
    }
    return initObject;
  }, []);

  const initFilterState = {
    target: {
      priority: 1,
      order: 0,
      value: '',
      title: 'Target'
    },
    tas: {
      priority: 2,
      order: 0,
      value: '',
      title: 'TAS'
    },
    initDate: {
      priority: 3,
      order: 0,
      value: ['', ''],
      title: 'Init date'
    },
    ...(!legacy && {
      lastUpdatedDate: {
        priority: 4,
        order: 0,
        value: ['', ''],
        title: 'Last updated'
      },
      shortName: {
        priority: 5,
        order: 0,
        value: '',
        title: 'Short name'
      },
      longName: {
        priority: 6,
        order: 0,
        value: '',
        title: 'Long name'
      },
      organism: {
        priority: 7,
        order: 0,
        value: '',
        title: 'Organism'
      }
      // externalURL: {
      //   priority: 0,
      //   order: 0,
      //   value: ''
      // }
    })
  };

  const filterClean = useSelector(state => state.targetReducers.filterClean);
  const targetFilter = useSelector(state => state.selectionReducers.targetFilter);
  const [filter, setFilter] = useState(targetFilter || initialize());
  const [newFilter, setNewFilter] = useState(initFilterState);

  const updateFilter = (column, type, value) => {
    if (type === 'value' && column.toLowerCase().includes('date')) {
      const oldValue = newFilter[column].value;
      if (value[0] === '') {
        value = [oldValue[0], value[1]];
      } else if (value[1] === '') {
        value = [value[0], oldValue[1]];
      }
    }
    setNewFilter(old => {
      const updated = { ...old };
      updated[column] = {
        ...old[column],
        [type]: value
      };
      return updated;
      // return
      //   ...old,
      //   [column]: {
      //     ...[column],
      //     [type]: value
      //   }
      // };
      // return {
      //   ...old,
      //   [column]: {
      //     ...[column],
      //     [type]: value
      //   }
      // };
    });
  };

  // const target_id_list_unsorted = useSelector(state => state.apiReducers.target_id_list);
  const projectsList = useSelector(state => state.targetReducers.projects);
  let filteredListOfTargets = useSelector(state => state.targetReducers.listOfFilteredTargets);

  let target_id_list = filter === undefined ? list.sort(compareTargetAsc) : list;

  const filterProperty = (target, property, filterValue) => {
    switch (property) {
      case 'target':
        return target.display_name.toLowerCase().includes(filterValue.toLowerCase());
      case 'tas':
        return target.project.target_access_string.toLowerCase().includes(filterValue.toLowerCase());
      case 'initDate':
        const initDate = moment(target.project.init_date).format('YYYY-MM-DD');
        const initDateFrom = filterValue[0].length > 0 ? filterValue[0] <= initDate : true;
        const initDateTo = filterValue[1].length > 0 ? filterValue[1] >= initDate : true;
        return initDateFrom && initDateTo;
      case 'lastUpdatedDate':
        const lastUpdatedDate = target.last_updated ? moment(target.last_updated).format('YYYY-MM-DD') : '';
        const lastUpdatedDateFrom = filterValue[0].length > 0 ? filterValue[0] <= lastUpdatedDate : true;
        const lastUpdatedDateTo = filterValue[1].length > 0 ? filterValue[1] >= lastUpdatedDate : true;
        return lastUpdatedDate ? lastUpdatedDateFrom && lastUpdatedDateTo : true;
      case 'shortName':
        return target.short_name.toLowerCase().includes(filterValue.toLowerCase());
      case 'longName':
        return target.long_name.toLowerCase().includes(filterValue.toLowerCase());
      case 'organism':
        return target.organism.toLowerCase().includes(filterValue.toLowerCase());
    }
    return false;
  };

  const orderProperty = (a, b, property) => {
    switch (property) {
      case 'target':
        return a.display_name.toLowerCase() < b.display_name.toLowerCase() ? -1 : 1;
      case 'tas':
        return a.project.target_access_string.toLowerCase() < b.project.target_access_string.toLowerCase() ? -1 : 1;
      case 'initDate':
        return a.project.init_date < b.project.init_date ? -1 : 1;
      case 'lastUpdatedDate':
        return a.last_updated < b.last_updated ? -1 : 1;
      case 'shortName':
        return a.short_name.toLowerCase() < b.short_name.toLowerCase() ? -1 : 1;
      case 'longName':
        return a.long_name.toLowerCase() < b.long_name.toLowerCase() ? -1 : 1;
      case 'organism':
        return a.organism.toLowerCase() < b.organism.toLowerCase() ? -1 : 1;
    }
    return 0;
  };

  useEffect(() => {
    const combinations = getTargetProjectCombinations(list, projectsList);
    const updatedTargets = combinations.map(c => c.updatedTarget);
    setInitList(updatedTargets);
  }, [list, projectsList]);

  useEffect(() => {
    if (initList.length > 0) {
      let filteredList = initList;
      Object.keys(newFilter).map(property => {
        // apply filters
        if (newFilter[property].value) {
          filteredList = filteredList.filter(target => {
            return filterProperty(target, property, newFilter[property].value);
          }
          );
        }
        // apply ordering
        if (newFilter[property].order !== 0) {
          filteredList = filteredList.sort((a, b) => {
            if (newFilter[property].order === 1) {
              return orderProperty(a, b, property);
            } else {
              return orderProperty(b, a, property);
            }
          });
        }
      });

      console.log('pre searchString', searchString, checkedTarget, checkedTargetAccessString);
      if (searchString && (checkedTarget || checkedTargetAccessString)) {
        filteredList = filteredList.filter(item =>
          checkedTarget && item.display_name.toLowerCase().includes(searchString.toLowerCase())
          || checkedTargetAccessString && item.project.target_access_string.toLowerCase().includes(searchString.toLowerCase())
        );
        setTargetList(filteredList);
      } else {
        setTargetList(filteredList);
      }
    }
  }, [newFilter, searchString, checkedTarget, checkedTargetAccessString, initList]);

  if (filter) {
    // filter target
    if (sortSwitch > 20 && sortSwitch < 25) {
      if (filter.filter.title.order === 1) {
        target_id_list = target_id_list.sort(compareTargetDesc);
        if (filteredListOfTargets !== undefined) {
          filteredListOfTargets = [...filteredListOfTargets].sort(compareTargetDesc);
        }
      } else {
        if (filteredListOfTargets !== undefined) {
          filteredListOfTargets = filteredListOfTargets.sort(compareTargetAsc);
        }
        target_id_list = target_id_list.sort(compareTargetAsc);
      }
    }
    // filter target access string
    if (sortSwitch > 170 && sortSwitch < 175) {
      if (filter.filter.targetAccessString.order === 1) {
        target_id_list = target_id_list.sort(compareTargetAccessStringDesc);
        if (filteredListOfTargets !== undefined) {
          filteredListOfTargets = filteredListOfTargets.sort(compareTargetAccessStringDesc);
        }
      } else {
        if (filteredListOfTargets !== undefined) {
          filteredListOfTargets = filteredListOfTargets.sort(compareTargetAccessStringAsc);
        }
        target_id_list = target_id_list.sort(compareTargetAccessStringAsc);
      }
    }
    // filter init date
    if (sortSwitch > 180 && sortSwitch < 185) {
      if (filter.filter.initDate.order === 1) {
        target_id_list = target_id_list.sort(compareInitDateDesc);
        if (filteredListOfTargets !== undefined) {
          filteredListOfTargets = [...filteredListOfTargets].sort(compareInitDateDesc);
        }
      } else {
        if (filteredListOfTargets !== undefined) {
          filteredListOfTargets = filteredListOfTargets.sort(compareInitDateAsc);
        }
        target_id_list = target_id_list.sort(compareInitDateAsc);
      }
    }
  }

  const render_item_method = useCallback(target => {
    let preview;
    if (target.isLegacy) {
      preview = target.legacyUrl;
    } else {
      preview = `${URLS.target}${target.title}/${URL_TOKENS.target_access_string}/${target.project.target_access_string}`;
    }

    return (
      <TableRow hover key={target.isLegacy ? target.title + 'Legacy' : `${target.id}-${target.title}`}>
        <TableCell align="left" style={{ padding: '0px', margin: '0px' }} >
          {target.isLegacy ? (
            <a href={target.legacyUrl} target="new" style={{ wordBreak: 'break-all' }}>
              {target.display_name}
            </a>
          ) : (
            <>
              <Link to={preview}>{target.display_name}</Link>
            </>
          )}
        </TableCell>
        <TableCell style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>
        <TableCell align="left" style={{ padding: '0px', margin: '0px' }}>
          {target.project.target_access_string}
        </TableCell>
        <TableCell style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>
        <TableCell align="left" style={{ padding: '0px', margin: '0px' }}>
          {moment(target.project.init_date).format('YYYY-MM-DD')}
        </TableCell>
        <TableCell style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>
        {legacy === false && ([
          <TableCell key={'1'} align="left" style={{ padding: '0px', margin: '0px' }}>
            {target.last_updated ? moment(target.last_updated).format('YYYY-MM-DD') : ''}
          </TableCell>,
          <TableCell key={'2'} style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>,
          <TableCell key={'3'} align="left" style={{ padding: '0px', margin: '0px' }}>
            {target.short_name}
          </TableCell>,
          <TableCell key={'4'} style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>,
          <TableCell key={'5'} align="left" style={{ padding: '0px', margin: '0px' }}>
            {target.long_name}
          </TableCell>,
          <TableCell key={'6'} style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>,
          <TableCell key={'7'} align="left" style={{ padding: '0px', margin: '0px' }}>
            {target.organism}
          </TableCell>,
          <TableCell key={'8'} style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>,
          <TableCell key={'9'} align="left" style={{ padding: '0px', margin: '0px' }}>
            <a href={target.external_url} target="_blank">{target.external_url_display_name}</a>
          </TableCell>,
          <TableCell key={'10'} style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>
        ])}
        {DJANGO_CONTEXT['authenticated'] && !target.isLegacy && <TableCell style={{ width: '2px', padding: '0px', margin: '0px' }}>
          <IconButton
            style={{ padding: '0px' }}
            onClick={() => {
              dispatch(setTargetToEdit(target));
              dispatch(setEditTargetDialogOpen(true));
            }}
          >
            <Edit style={{ height: '15px' }} />
          </IconButton>
        </TableCell>}
      </TableRow>
    );
  }, [dispatch, legacy]);

  // window height for showing rows per page
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const defaultRowsPerPageOptions = [20, 30, 40, 50, 100];
  let targetListWindowHeight = windowHeight / 22.5;
  let targetListWindowHeightFinal = parseInt(targetListWindowHeight.toFixed(0), 10);
  if (defaultRowsPerPageOptions.indexOf(targetListWindowHeightFinal) === -1) {
    defaultRowsPerPageOptions.unshift(targetListWindowHeightFinal);
  }
  const [rowsPerPage, setRowsPerPage] = useState(targetListWindowHeightFinal);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // search from target list
  const handleSearch = event => {
    setSearchString(event.target.value);
  };

  const handleHeaderSort = property => {
    updateFilter(property, 'order', newFilter[property].order === 1 ? -1 : newFilter[property].order === -1 ? 0 : 1);
  };

  // START RESIZER FOR TARGET COLUMN
  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = useCallback(e => {
    if (!isResizing) return;
    const deltaX = e.clientX - 20;
    setPanelWidth(deltaX);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);
  // END RESIZER FOR TARGET COLUMN

  // START RESIZER FOR TARGET ACCESS STRING COLUMN
  const handleMouseDownResizerTargetAccessString = () => {
    setIsResizingTargetAccessString(true);
    panelWidth !== undefined ? setPanelWidth(panelWidth) : setPanelWidth(130);
  };

  const handleMouseMoveTargetAccessString = useCallback(e => {
    if (!isResizingTargetAccessString) return;
    const deltaX = e.clientX - 140;
    setPanelWidthForTargetAccessString(deltaX);
  }, [isResizingTargetAccessString]);

  const handleMouseUpTargetAccessString = useCallback(() => {
    setIsResizingTargetAccessString(false);
    window.removeEventListener('mousemove', handleMouseMoveTargetAccessString);
    window.removeEventListener('mouseup', handleMouseUpTargetAccessString);
  }, [handleMouseMoveTargetAccessString]);

  useEffect(() => {
    if (isResizingTargetAccessString) {
      window.addEventListener('mousemove', handleMouseMoveTargetAccessString);
      window.addEventListener('mouseup', handleMouseUpTargetAccessString);
    } else {
      window.removeEventListener('mousemove', handleMouseMoveTargetAccessString);
      window.removeEventListener('mouseup', handleMouseUpTargetAccessString);
    }
  }, [isResizingTargetAccessString, handleMouseMoveTargetAccessString, handleMouseUpTargetAccessString]);
  // END RESIZER FOR TARGET ACCESS STRING COLUMN

  const handleMouseDownResizer = (column) => {
    updateIsResizingForColumn(column, true);
    //panelWidth !== undefined ? setPanelWidth(panelWidth) : setPanelWidth(130);
  };

  // START RESIZER FOR INIT DATE COLUMN
  const handleMouseDownResizerInitDate = () => {
    setIsResizingInitDate(true);
    //panelWidth !== undefined ? setPanelWidth(panelWidth) : setPanelWidth(130);
  };

  const handleMouseMoveInitDate = e => {
    if (!isResizingInitDate) return;
    const deltaX = e.clientX - 240;
    setPanelWidthForInitDate(deltaX);
  };

  const handleMouseUpInitDate = () => {
    setIsResizingInitDate(false);
    window.removeEventListener('mousemove', handleMouseMoveInitDate);
    window.removeEventListener('mouseup', handleMouseUpInitDate);
  };

  useEffect(() => {
    if (isResizingInitDate) {
      window.addEventListener('mousemove', handleMouseMoveInitDate);
      window.addEventListener('mouseup', handleMouseUpInitDate);
    } else {
      window.removeEventListener('mousemove', handleMouseMoveInitDate);
      window.removeEventListener('mouseup', handleMouseUpInitDate);
    }
  }, [isResizingInitDate]);
  // END RESIZER FOR INIT DATE COLUMN
  // START RESIZER FOR SGC COLUMN
  const handleMouseDownResizerSGC = () => {
    setIsResizingSGC(true);
    panelWidth !== undefined ? setPanelWidth(panelWidth) : setPanelWidth(180);

    panelWidthForTargetAccessString !== undefined
      ? setPanelWidthForTargetAccessString(panelWidthForTargetAccessString)
      : setPanelWidthForTargetAccessString(130);
  };

  const handleMouseMoveSGC = e => {
    if (!isResizingSGC) return;
    const deltaX = e.clientX - 333;
    setPanelWidthForSGC(deltaX);
  };

  const handleMouseUpSGC = () => {
    setIsResizingSGC(false);
    window.removeEventListener('mousemove', handleMouseMoveSGC);
    window.removeEventListener('mouseup', handleMouseUpSGC);
  };

  useEffect(() => {
    if (isResizingSGC) {
      window.addEventListener('mousemove', handleMouseMoveSGC);
      window.addEventListener('mouseup', handleMouseUpSGC);
    } else {
      window.removeEventListener('mousemove', handleMouseMoveSGC);
      window.removeEventListener('mouseup', handleMouseUpSGC);
    }
  }, [isResizingSGC]);
  // END RESIZER FOR SGC COLUMN

  const needsAuthentication = authRequired && DJANGO_CONTEXT['authenticated'] === false;

  const itemsToRender = useCallback(() => {
    // const combinations = getTargetProjectCombinations(targetList, projectsList);
    // const slice = combinations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const slice = targetList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const result = slice.map(data => render_item_method(data));

    return slice.length > 0 ? result : [
      <TableRow key="empty">
        <TableCell colSpan={16} align="center">
          {needsAuthentication ? 'You need to log in to view your targets' : 'No targets found'}
        </TableCell>
      </TableRow>
    ];
  }, [targetList, page, rowsPerPage, render_item_method, needsAuthentication]);

  if (target_id_list) {
    return (
      <Panel
        hasHeader
        title={title}
        bodyOverflow
        headerActions={!needsAuthentication && [
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
            onClick={event => {
              if (filterDialogOpen === false || filterDialogOpen === undefined) {
                setSortDialogAnchorEl(event.currentTarget);
                setFilterDialogOpen(true);
              } else {
                setSortDialogAnchorEl(null);
                setFilterDialogOpen(false);
              }
            }}
            color={'inherit'}
          >
            <Tooltip title="Filter/Sort">
              <FilterList />
            </Tooltip>
          </IconButton>
        ]}
      >
        <Table className={classes.table} aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell
                className={classes.tableHeader}
              // style={{ width: panelWidthForColumns.target, padding: '0px' }}
              >
                <Tooltip title="Include Target name in Search">
                  <Typography variant="inherit">
                    <input
                      type="checkbox"
                      style={{ verticalAlign: 'middle' }}
                      checked={checkedTarget}
                      onChange={() => setCheckedTarget(!checkedTarget)}
                    />
                    {newFilter.target.title}
                  </Typography>
                </Tooltip>
              </TableCell>
              <div style={{ display: 'flex' }}>
                <div>
                  <IconButton
                    style={{ padding: '0px', paddingRight: '5px' }}
                    onClick={() => handleHeaderSort('target')}
                  >
                    <Tooltip title="Sort" className={classes.sortButton}>
                      {newFilter.target.order === -1 ? (
                        <KeyboardArrowDown />
                      ) : newFilter.target.order === 1 ? (
                        <KeyboardArrowUp />
                      ) : (
                        <UnfoldMore />
                      )}
                    </Tooltip>
                  </IconButton>
                </div>
                <div
                  style={{
                    cursor: 'col-resize',
                    width: 4,
                    height: '21px',
                    backgroundColor: '#cccccc',
                    borderRadius: '3px'
                  }}
                  onMouseDown={handleMouseDown}
                ></div>
              </div>
              <TableCell
                className={classes.tableHeader}
              // style={{ width: panelWidthForColumns.tas, padding: '0px' }}
              >
                <Tooltip title="Include Target access string in Search">
                  <Typography variant="inherit">
                    <input
                      type="checkbox"
                      style={{ verticalAlign: 'middle' }}
                      checked={checkedTargetAccessString}
                      onChange={() => setCheckedTargetAccessString(!checkedTargetAccessString)}
                    />
                    {newFilter.tas.title}
                  </Typography>
                </Tooltip>
              </TableCell>
              <div style={{ display: 'flex' }}>
                <div>
                  <IconButton
                    style={{ padding: '0px', paddingRight: '5px' }}
                    onClick={() => handleHeaderSort('tas')}
                  >
                    <Tooltip title="Sort" className={classes.sortButton}>
                      {newFilter.tas.order === -1 ? (
                        <KeyboardArrowDown />
                      ) : newFilter.tas.order === 1 ? (
                        <KeyboardArrowUp />
                      ) : (
                        <UnfoldMore />
                      )}
                    </Tooltip>
                  </IconButton>
                </div>
                <div
                  style={{
                    cursor: 'col-resize',
                    width: 4,
                    height: '21px',
                    backgroundColor: '#cccccc',
                    borderRadius: '3px'
                  }}
                  onMouseDown={handleMouseDownResizerTargetAccessString}
                ></div>
              </div>

              <TableCell
                className={classes.tableHeader}
              // style={{ width: panelWidthForColumns.initDate, padding: '0px', paddingLeft: '5px', verticalAlign: 'center' }}
              >
                {newFilter.initDate.title}
              </TableCell>
              <div style={{ display: 'flex' }}>
                <div className={classes.arrowsWrapper}>
                  <IconButton
                    style={{ padding: '0px', verticalAlign: 'center' }}
                    onClick={() => handleHeaderSort('initDate')}
                  >
                    <Tooltip title="Sort" className={classes.sortButton}>
                      {newFilter.initDate.order === -1 ? (
                        <KeyboardArrowDown />
                      ) : newFilter.initDate.order === 1 ? (
                        <KeyboardArrowUp />
                      ) : (
                        <UnfoldMore />
                      )}
                    </Tooltip>
                  </IconButton>
                </div>
                <div
                  style={{
                    cursor: 'col-resize',
                    width: 4,
                    height: '21px',
                    backgroundColor: '#cccccc',
                    borderRadius: '3px'
                  }}
                  onMouseDown={handleMouseDownResizerInitDate}
                ></div>
              </div>

              {legacy === false && ([
                <TableCell key={'1'}
                  className={classes.tableHeader}
                // style={{ width: panelWidthForColumns.lastUpdatedDate, padding: '0px', paddingLeft: '5px', verticalAlign: 'center' }}
                >
                  {newFilter.lastUpdatedDate.title}
                </TableCell>,
                <div key={'2'} style={{ display: 'flex' }}>
                  <div className={classes.arrowsWrapper}>
                    <IconButton
                      style={{ padding: '0px', verticalAlign: 'center' }}
                      onClick={() => handleHeaderSort('lastUpdatedDate')}
                    >
                      <Tooltip title="Sort" className={classes.sortButton}>
                        {newFilter.lastUpdatedDate?.order === -1 ? (
                          <KeyboardArrowDown />
                        ) : newFilter.lastUpdatedDate?.order === 1 ? (
                          <KeyboardArrowUp />
                        ) : (
                          <UnfoldMore />
                        )}
                      </Tooltip>
                    </IconButton>
                  </div>
                  <div
                    style={{
                      cursor: 'col-resize',
                      width: 4,
                      height: '21px',
                      backgroundColor: '#cccccc',
                      borderRadius: '3px'
                    }}
                    onMouseDown={() => handleMouseDown('lastUpdatedDate')}
                  ></div>
                </div>,

                <TableCell key={'3'}
                  className={classes.tableHeader}
                // style={{ width: panelWidthForColumns.shortName, padding: '0px', paddingLeft: '5px', verticalAlign: 'center' }}
                >
                  {newFilter.shortName.title}
                </TableCell>,
                <div key={'4'} style={{ display: 'flex' }}>
                  <div className={classes.arrowsWrapper}>
                    <IconButton
                      style={{ padding: '0px', verticalAlign: 'center' }}
                      onClick={() => handleHeaderSort('shortName')}
                    >
                      <Tooltip title="Sort" className={classes.sortButton}>
                        {newFilter.shortName.order === -1 ? (
                          <KeyboardArrowDown />
                        ) : newFilter.shortName.order === 1 ? (
                          <KeyboardArrowUp />
                        ) : (
                          <UnfoldMore />
                        )}
                      </Tooltip>
                    </IconButton>
                  </div>
                  <div
                    style={{
                      cursor: 'col-resize',
                      width: 4,
                      height: '21px',
                      backgroundColor: '#cccccc',
                      borderRadius: '3px'
                    }}
                    onMouseDown={() => handleMouseDownResizer('shortName')}
                  ></div>
                </div>,
                <TableCell key={'5'}
                  className={classes.tableHeader}
                // style={{ width: panelWidthForColumns.longName, padding: '0px', paddingLeft: '5px', verticalAlign: 'center' }}
                >
                  {newFilter.longName.title}
                </TableCell>,
                <div key={'6'} style={{ display: 'flex' }}>
                  <div className={classes.arrowsWrapper}>
                    <IconButton
                      style={{ padding: '0px', verticalAlign: 'center' }}
                      onClick={() => handleHeaderSort('longName')}
                    >
                      <Tooltip title="Sort" className={classes.sortButton}>
                        {newFilter.longName.order === -1 ? (
                          <KeyboardArrowDown />
                        ) : newFilter.longName.order === 1 ? (
                          <KeyboardArrowUp />
                        ) : (
                          <UnfoldMore />
                        )}
                      </Tooltip>
                    </IconButton>
                  </div>
                  <div
                    style={{
                      cursor: 'col-resize',
                      width: 4,
                      height: '21px',
                      backgroundColor: '#cccccc',
                      borderRadius: '3px'
                    }}
                    onMouseDown={() => handleMouseDownResizer('longName')}
                  ></div>
                </div>,
                <TableCell key={'7'}
                  className={classes.tableHeader}
                // style={{ width: panelWidthForColumns.organism, padding: '0px', paddingLeft: '5px', verticalAlign: 'center' }}
                >
                  {newFilter.organism.title}
                </TableCell>,
                <div key={'8'} style={{ display: 'flex' }}>
                  <div className={classes.arrowsWrapper}>
                    <IconButton
                      style={{ padding: '0px', verticalAlign: 'center' }}
                      onClick={() => handleHeaderSort('organism')}
                    >
                      <Tooltip title="Sort" className={classes.sortButton}>
                        {newFilter.organism.order === -1 ? (
                          <KeyboardArrowDown />
                        ) : newFilter.organism.order === 1 ? (
                          <KeyboardArrowUp />
                        ) : (
                          <UnfoldMore />
                        )}
                      </Tooltip>
                    </IconButton>
                  </div>
                  <div
                    style={{
                      cursor: 'col-resize',
                      width: 4,
                      height: '21px',
                      backgroundColor: '#cccccc',
                      borderRadius: '3px'
                    }}
                    onMouseDown={() => handleMouseDownResizer('organism')}
                  ></div>
                </div>,

                <TableCell key={'9'}
                  className={classes.tableHeader}
                // style={{ width: panelWidthForColumns.externalURL, padding: '0px', paddingLeft: '5px', verticalAlign: 'center' }}
                >
                  External URL
                </TableCell>,
                <div key={'10'} style={{ display: 'flex' }}>
                  <div className={classes.arrowsWrapper}>
                    <IconButton
                      style={{ padding: '0px', verticalAlign: 'center' }}
                      onClick={() => handleHeaderSort('externalURL')}
                    >
                      <Tooltip title="Sort" className={classes.sortButton}>
                        {filter.filter.externalURL?.order === -1 ? (
                          <KeyboardArrowDown />
                        ) : filter.filter.externalURL?.order === 1 ? (
                          <KeyboardArrowUp />
                        ) : (
                          <UnfoldMore />
                        )}
                      </Tooltip>
                    </IconButton>
                  </div>
                  <div
                    style={{
                      cursor: 'col-resize',
                      width: 4,
                      height: '21px',
                      backgroundColor: '#cccccc',
                      borderRadius: '3px'
                    }}
                    onMouseDown={() => handleMouseDownResizer('externalURL')}
                  ></div>
                </div>
              ])}

              {DJANGO_CONTEXT['authenticated'] && legacy === false &&
                <TableCell
                  className={classes.tableHeader}
                // style={{ width: 50, paddingLeft: '5px', verticalAlign: 'center' }}
                >
                  Edit
                </TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>{itemsToRender()}</TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={defaultRowsPerPageOptions}
                count={targetList.length}
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
        {filterDialogOpen && (
          <TargetListSortFilterDialog
            open={filterDialogOpen}
            anchorEl={sortDialogAnchorEl}
            filter={newFilter}
            resetFilter={() => setNewFilter(initFilterState)}
            setFilter={updateFilter}
            onClose={() => setFilterDialogOpen(false)}
          />
        )}
      </Panel>
    );
  }
});
