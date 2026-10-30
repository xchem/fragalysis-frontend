/**
 * Created by abradley on 13/03/2018.
 */

import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
  TablePagination,
  TableFooter,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress
} from '@mui/material';
import { makeStyles } from '../../ui/styles';
import { Link } from 'react-router-dom';
import { URLS } from '../routes/constants';
import { Edit } from '@mui/icons-material';
import { URL_TOKENS } from '../direct/constants';
import { setEditTargetDialogOpen } from './redux/actions';
import {
  compareTargetAsc,
  compareTargetDesc,
  compareTargetAccessStringAsc,
  compareTargetAccessStringDesc,
  getTargetAccessStringDisplayValue,
  compareInitDateAsc,
  compareInitDateDesc
} from './sortTargets/sortTargets';
import { TargetListSortFilterDialog } from './targetListSortFilterDialog';
import { Search, KeyboardArrowDown, KeyboardArrowUp, UnfoldMore, FilterList } from '@mui/icons-material';
import { setTargetToEdit } from '../../reducers/selection/actions';
import { TARGETS_ATTR } from './redux/constants';
import { getTargetProjectCombinations } from './redux/dispatchActions';
import moment from 'moment';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { Panel } from '../common';
import RichTooltip from '../tooltip/RichTooltip';
import { TooltipPathProvider } from '../tooltip/TooltipPathContext';
import { TargetAccessAction } from '../access/TargetAccessAction';
import { canInspectAccess } from '../access/accessUtils';
import { TargetDetails } from './TargetDetails';
import { fetchTargetBlog } from './targetBlogApi';
import {
  downloadStructuresZip,
  getDownloadStructuresTaskOrUrl,
  getDownloadTaskStatusObject
} from '../snapshot/api/api';

const DOWNLOAD_STATUS_POLL_INTERVAL = 5000;

const getTargetKey = target =>
  target.isLegacy ? `${target.title}-legacy` : `${target.id}-${target.project.target_access_string}`;

const createDefaultTargetDownloadRequest = target => ({
  target_name: target.title,
  target_access_string: target.project?.target_access_string,
  proteins: '',
  event_file: false,
  sigmaa_file: false,
  diff_file: false,
  trans_matrix_info: false,
  pdb_info: false,
  mtz_info: false,
  cif_info: false,
  map_info: false,
  single_sdf_file: true,
  compound_sets: true,
  soakdb_files: false,
  all_aligned_structures: true,
  metadata_info: true,
  static_link: false,
  file_url: '',
  use_zip: true
});

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
    margin: theme.spacing(0.5)
  },
  arrowsWrapper: {
    paddingRight: 3
  },
  sortButton: {
    width: '0.75em',
    height: '0.75em',
    padding: '0px'
  },
  expandCell: {
    width: 32,
    padding: '0px !important',
    textAlign: 'center'
  },
  expandButton: {
    padding: 0
  },
  toggleAllButton: {
    marginRight: theme.spacing(1),
    textTransform: 'none',
    whiteSpace: 'nowrap'
  },
  dropdownCell: {
    padding: '0px !important',
    borderBottom: '1px solid #e6e8ef',
    backgroundColor: '#ffffff'
  },
  dropdownContent: {
    display: 'grid',
    gridTemplateColumns: '260px minmax(360px, 1fr) minmax(420px, 0.8fr)',
    alignItems: 'start',
    gap: theme.spacing(3),
    boxSizing: 'border-box',
    padding: theme.spacing(2, 2, 0),
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '260px 1fr'
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr'
    }
  },
  dropdownImage: {
    width: 260,
    height: 172,
    objectFit: 'cover',
    borderRadius: 12
  },
  dropdownWithoutImage: {
    gridTemplateColumns: 'minmax(360px, 1fr) minmax(420px, 0.8fr)',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr'
    }
  },
  dropdownBlog: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    maxHeight: 260
  },
  dropdownOverview: {
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  dropdownDate: {
    color: '#0077a5',
    fontStyle: 'italic'
  },
  dropdownTitle: {
    display: 'block',
    color: '#003b60',
    lineHeight: 1.1,
    marginBottom: theme.spacing(1),
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  dropdownText: {
    color: '#0077a5',
    whiteSpace: 'pre-wrap'
  },
  dropdownActions: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(3),
    alignItems: 'center'
  },
  dropdownButton: {
    padding: theme.spacing(1.5, 3),
    flexShrink: 0,
    whiteSpace: 'nowrap',
    backgroundColor: '#3f51b5',
    color: '#ffffff',
    fontSize: 20,
    lineHeight: 1.5,
    fontWeight: 700,
    fontStyle: 'italic',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: '#3346af'
    }
  }
}));

const HeaderControlCell = ({ children }) => (
  <TableCell style={{ width: '2px', padding: '0px', margin: '0px' }}>
    <div style={{ display: 'flex' }}>{children}</div>
  </TableCell>
);

export const TargetList = memo(({ list = [], title = 'Target list', authRequired = false, legacy = false }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  // Keep blog reads and image URLs stable for this landing-page visit, including across pagination.
  const blogCache = useRef(new Map());
  const imageRefreshToken = useRef(Date.now());
  const loadBlog = useCallback(targetId => {
    if (!blogCache.current.has(targetId)) {
      const request = fetchTargetBlog(targetId).catch(error => {
        blogCache.current.delete(targetId);
        throw error;
      });
      blogCache.current.set(targetId, request);
    }
    return blogCache.current.get(targetId);
  }, []);
  const [initList, setInitList] = useState([]);
  const [targetList, setTargetList] = useState([]);
  const [expandedTargets, setExpandedTargets] = useState({});
  const detailTargets = initList.filter(target => !target.isLegacy);
  const hasExpandedTargets = detailTargets.some(target => expandedTargets[getTargetKey(target)] !== false);
  const toggleAllTargetDetails = () => {
    setExpandedTargets(current => {
      const expand = !detailTargets.some(target => current[getTargetKey(target)] !== false);
      const updated = { ...current };
      detailTargets.forEach(target => {
        updated[getTargetKey(target)] = expand;
      });
      return updated;
    });
  };
  const [targetToDownload, setTargetToDownload] = useState(null);
  const [downloadPreparing, setDownloadPreparing] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const openTargetDownloadConfirmation = useCallback(target => {
    setDownloadError('');
    setTargetToDownload(target);
  }, []);

  const closeTargetDownloadConfirmation = () => {
    if (!downloadPreparing) {
      setDownloadError('');
      setTargetToDownload(null);
    }
  };

  const downloadDefaultTargetData = () => {
    if (targetToDownload && !downloadPreparing) {
      setDownloadError('');
      setDownloadPreparing(true);
    }
  };

  useEffect(() => {
    if (!downloadPreparing || !targetToDownload) return;
    let active = true;
    let timer;
    const fail = error => {
      if (!active) return;
      setDownloadError(error?.response?.data?.message || error.message || 'Download failed. Please try again later.');
      setDownloadPreparing(false);
    };
    const download = url => {
      if (!active) return;
      downloadStructuresZip(url);
      setTargetToDownload(null);
      setDownloadPreparing(false);
    };
    const poll = async taskUrl => {
      try {
        const response = await getDownloadTaskStatusObject(taskUrl);
        if (!active) return;
        const task = response?.data;
        if (!task) throw new Error('The server returned an unexpected response.');
        if (task.finished) {
          if (task.status !== 'SUCCESS' || !task.messages) {
            throw new Error(task.messages || 'The download could not be prepared.');
          }
          download(task.messages);
        } else {
          timer = setTimeout(() => poll(taskUrl), DOWNLOAD_STATUS_POLL_INTERVAL);
        }
      } catch (error) {
        fail(error);
      }
    };
    const start = async () => {
      try {
        const response = await getDownloadStructuresTaskOrUrl(createDefaultTargetDownloadRequest(targetToDownload));
        if (!active) return;
        if (response.status === 208) {
          throw new Error('The same download is already being prepared. Please try again in a minute.');
        }
        if (response?.data?.file_url) {
          download(response.data.file_url);
        } else if (response?.data?.task_status_url) {
          await poll(response.data.task_status_url);
        } else {
          throw new Error('The server returned an unexpected response.');
        }
      } catch (error) {
        fail(error);
      }
    };
    start();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [downloadPreparing, targetToDownload]);

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
    dataVersion: false,
    shortName: false,
    longName: false,
    organism: false,
    externalURL: false
  });
  const updateIsResizingForColumn = (column, isResizing) => {
    setIsResizingForColumns({
      ...isResizingForColumns,
      [column]: isResizing
    });
  };
  const [panelWidthForColumns, setPanelWidthForColumns] = useState({
    target: 110,
    tas: 110,
    initDate: 90,
    lastUpdatedDate: 90,
    dataVersion: 90,
    shortName: 110,
    longName: 110,
    organism: 110,
    externalURL: 110
  });
  const updateWidthForColumn = (column, width) => {
    setPanelWidthForColumns({
      ...panelWidthForColumns,
      [column]: width
    });
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
    ...(!legacy && {
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
      },
      dataVersion: {
        priority: 8,
        order: 0,
        value: 0,
        title: 'Data version'
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
        return getTargetAccessStringDisplayValue(target)
          .toLowerCase()
          .includes(filterValue.toLowerCase());
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
      case 'dataVersion':
        return target.data_version
          ? filterValue[0] <= target.data_version && filterValue[1] >= target.data_version
          : true;
    }
    return false;
  };

  const orderProperty = (a, b, property) => {
    switch (property) {
      case 'target':
        return a.display_name.toLowerCase() < b.display_name.toLowerCase() ? -1 : 1;
      case 'tas':
        return getTargetAccessStringDisplayValue(a).toLowerCase() < getTargetAccessStringDisplayValue(b).toLowerCase()
          ? -1
          : 1;
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
      case 'dataVersion':
        return a.data_version < b.data_version ? -1 : 1;
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
          });
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
        filteredList = filteredList.filter(
          item =>
            (checkedTarget && item.display_name.toLowerCase().includes(searchString.toLowerCase())) ||
            (checkedTargetAccessString &&
              getTargetAccessStringDisplayValue(item)
                .toLowerCase()
                .includes(searchString.toLowerCase()))
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

  const render_item_method = useCallback(
    (target, index) => {
      let preview;
      if (target.isLegacy) {
        preview = target.legacyUrl;
      } else {
        preview = `${URLS.target}${target.title}/${URL_TOKENS.target_access_string}/${target.project.target_access_string}`;
      }
      const targetTitleId = title.replace(/\s+/g, '-').toLowerCase();
      const targetKey = getTargetKey(target);
      const isExpanded = expandedTargets[targetKey] !== false;

      return (
        <React.Fragment key={targetKey}>
          <TableRow hover>
            <TableCell align="left" style={{ padding: '0px', margin: '0px' }}>
              {target.isLegacy ? (
                <a
                  href={target.legacyUrl}
                  id={targetTitleId + '-item-' + index}
                  target="new"
                  style={{ wordBreak: 'break-all' }}
                >
                  {target.display_name}
                </a>
              ) : (
                <>
                  <Link to={preview} id={targetTitleId + '-item-' + index}>
                    {target.display_name}
                  </Link>
                </>
              )}
            </TableCell>
            <TableCell style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>
            {legacy === false && [
              <TableCell
                key={'14'}
                align="left"
                style={{ padding: '0px', margin: '0px' }}
                id={targetTitleId + '-tas-' + index}
              >
                {getTargetAccessStringDisplayValue(target)}
              </TableCell>,
              <TableCell key={'13'} style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>,
              <TableCell
                key={'12'}
                align="left"
                style={{ padding: '0px', margin: '0px' }}
                id={targetTitleId + '-init_date-' + index}
              >
                {moment(target.project.init_date).format('YYYY-MM-DD')}
              </TableCell>,
              <TableCell key={'11'} style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>,
              <TableCell
                key={'1'}
                align="left"
                style={{ padding: '0px', margin: '0px' }}
                id={targetTitleId + '-last_updated-' + index}
              >
                {target.last_updated ? moment(target.last_updated).format('YYYY-MM-DD') : ''}
              </TableCell>,
              <TableCell key={'2'} style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>,
              <TableCell
                key={'3'}
                align="left"
                style={{ padding: '0px', margin: '0px' }}
                id={targetTitleId + '-short_name-' + index}
              >
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
                <a href={target.external_url} target="_blank">
                  {target.external_url_display_name}
                </a>
              </TableCell>,
              <TableCell key={'10'} style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>,
              <TableCell key={'15'} align="center" style={{ padding: '0px', margin: '0px' }}>
                {target.data_version}
              </TableCell>,
              <TableCell key={'16'} style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>,
              <TableCell key="expand" className={classes.expandCell}>
                <IconButton
                  className={classes.expandButton}
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${target.display_name}`}
                  aria-expanded={isExpanded}
                  onClick={() => setExpandedTargets(current => ({ ...current, [targetKey]: current[targetKey] === false }))}
                >
                  {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </IconButton>
              </TableCell>
            ]}
            {canInspectAccess() && !legacy && (
              <TableCell align="center" style={{ padding: '0px', margin: '0px' }}>
                <TargetAccessAction target={target} compact />
              </TableCell>
            )}
            {DJANGO_CONTEXT['authenticated'] && !target.isLegacy && (
              <TableCell style={{ width: '2px', padding: '0px', margin: '0px' }}>
                <IconButton
                  style={{ padding: '0px' }}
                  onClick={() => {
                    dispatch(setTargetToEdit(target));
                    dispatch(setEditTargetDialogOpen(true));
                  }}
                >
                  <Edit style={{ height: '15px' }} />
                </IconButton>
              </TableCell>
            )}
          </TableRow>
          {!target.isLegacy && (
            <TableRow>
              <TableCell className={classes.dropdownCell} colSpan={100}>
                <Collapse in={isExpanded} timeout={240} unmountOnExit>
                  <TargetDetails
                    target={target}
                    preview={preview}
                    classes={classes}
                    onDownload={openTargetDownloadConfirmation}
                    loadBlog={loadBlog}
                    imageRefreshToken={imageRefreshToken.current}
                  />
                </Collapse>
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      );
    },
    [classes, dispatch, expandedTargets, legacy, title, openTargetDownloadConfirmation, loadBlog]
  );

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

  const handleMouseMove = useCallback(
    e => {
      if (!isResizing) return;
      const deltaX = e.clientX - 20;
      setPanelWidth(deltaX);
    },
    [isResizing]
  );

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

  const handleMouseMoveTargetAccessString = useCallback(
    e => {
      if (!isResizingTargetAccessString) return;
      const deltaX = e.clientX - 140;
      setPanelWidthForTargetAccessString(deltaX);
    },
    [isResizingTargetAccessString]
  );

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

  const handleMouseDownResizer = column => {
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
    const result = slice.map((data, index) => render_item_method(data, index));

    return slice.length > 0
      ? result
      : [
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
        headerActions={
          !needsAuthentication && [
            <TextField
              className={classes.search}
              id="input-with-icon-textfield"
              placeholder="Search"
              size="small"
              color="primary"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }
              }}
              onChange={handleSearch}
            />,
            !legacy && (
              <Button
                className={classes.toggleAllButton}
                variant="text"
                color="inherit"
                size="small"
                aria-label={`${hasExpandedTargets ? 'Collapse' : 'Expand'} all ${title.toLowerCase()}`}
                disabled={detailTargets.length === 0}
                onClick={toggleAllTargetDetails}
              >
                {hasExpandedTargets ? 'Collapse all' : 'Expand all'}
              </Button>
            ),
            <IconButton
              id={title.replace(/\s+/g, '-').toLowerCase() + '-filter'}
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
              <RichTooltip path="filterSort">
                <FilterList />
              </RichTooltip>
            </IconButton>
          ]
        }
      >
        <Table className={classes.table} aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell
                className={classes.tableHeader}
                // style={{ width: panelWidthForColumns.target, padding: '0px' }}
              >
                <RichTooltip path="includeTargetName">
                  <Typography variant="inherit">
                    <input
                      type="checkbox"
                      style={{ verticalAlign: 'middle' }}
                      checked={checkedTarget}
                      onChange={() => setCheckedTarget(!checkedTarget)}
                    />
                    {newFilter.target.title}
                  </Typography>
                </RichTooltip>
              </TableCell>
              <HeaderControlCell>
                <div>
                  <IconButton
                    style={{ padding: '0px', paddingRight: '5px' }}
                    onClick={() => handleHeaderSort('target')}
                  >
                    <RichTooltip path="sort" className={classes.sortButton}>
                      {newFilter.target.order === -1 ? (
                        <KeyboardArrowDown />
                      ) : newFilter.target.order === 1 ? (
                        <KeyboardArrowUp />
                      ) : (
                        <UnfoldMore />
                      )}
                    </RichTooltip>
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
              </HeaderControlCell>
              {legacy === false && [
                <TableCell
                  key={20}
                  className={classes.tableHeader}
                  // style={{ width: panelWidthForColumns.tas, padding: '0px' }}
                >
                  <RichTooltip path="includeTAS">
                    <Typography variant="inherit">
                      <input
                        type="checkbox"
                        style={{ verticalAlign: 'middle' }}
                        checked={checkedTargetAccessString}
                        onChange={() => setCheckedTargetAccessString(!checkedTargetAccessString)}
                      />
                      {newFilter.tas.title}
                    </Typography>
                  </RichTooltip>
                </TableCell>,
                <HeaderControlCell key={21}>
                  <div>
                    <IconButton style={{ padding: '0px', paddingRight: '5px' }} onClick={() => handleHeaderSort('tas')}>
                      <RichTooltip path="sort" className={classes.sortButton}>
                        {newFilter.tas.order === -1 ? (
                          <KeyboardArrowDown />
                        ) : newFilter.tas.order === 1 ? (
                          <KeyboardArrowUp />
                        ) : (
                          <UnfoldMore />
                        )}
                      </RichTooltip>
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
                </HeaderControlCell>,

                <TableCell
                  key={22}
                  className={classes.tableHeader}
                  // style={{ width: panelWidthForColumns.initDate, padding: '0px', paddingLeft: '5px', verticalAlign: 'center' }}
                >
                  {newFilter.initDate.title}
                </TableCell>,
                <HeaderControlCell key={23}>
                  <div className={classes.arrowsWrapper}>
                    <IconButton
                      style={{ padding: '0px', verticalAlign: 'center' }}
                      onClick={() => handleHeaderSort('initDate')}
                    >
                      <RichTooltip path="sort" className={classes.sortButton}>
                        {newFilter.initDate.order === -1 ? (
                          <KeyboardArrowDown />
                        ) : newFilter.initDate.order === 1 ? (
                          <KeyboardArrowUp />
                        ) : (
                          <UnfoldMore />
                        )}
                      </RichTooltip>
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
                </HeaderControlCell>,
                <TableCell
                  key={'1'}
                  className={classes.tableHeader}
                  // style={{ width: panelWidthForColumns.lastUpdatedDate, padding: '0px', paddingLeft: '5px', verticalAlign: 'center' }}
                >
                  {newFilter.lastUpdatedDate.title}
                </TableCell>,
                <HeaderControlCell key={'2'}>
                  <div className={classes.arrowsWrapper}>
                    <IconButton
                      style={{ padding: '0px', verticalAlign: 'center' }}
                      onClick={() => handleHeaderSort('lastUpdatedDate')}
                    >
                      <RichTooltip path="sort" className={classes.sortButton}>
                        {newFilter.lastUpdatedDate?.order === -1 ? (
                          <KeyboardArrowDown />
                        ) : newFilter.lastUpdatedDate?.order === 1 ? (
                          <KeyboardArrowUp />
                        ) : (
                          <UnfoldMore />
                        )}
                      </RichTooltip>
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
                </HeaderControlCell>,

                <TableCell
                  key={'3'}
                  className={classes.tableHeader}
                  // style={{ width: panelWidthForColumns.shortName, padding: '0px', paddingLeft: '5px', verticalAlign: 'center' }}
                >
                  {newFilter.shortName.title}
                </TableCell>,
                <HeaderControlCell key={'4'}>
                  <div className={classes.arrowsWrapper}>
                    <IconButton
                      style={{ padding: '0px', verticalAlign: 'center' }}
                      onClick={() => handleHeaderSort('shortName')}
                    >
                      <RichTooltip path="sort" className={classes.sortButton}>
                        {newFilter.shortName.order === -1 ? (
                          <KeyboardArrowDown />
                        ) : newFilter.shortName.order === 1 ? (
                          <KeyboardArrowUp />
                        ) : (
                          <UnfoldMore />
                        )}
                      </RichTooltip>
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
                </HeaderControlCell>,
                <TableCell
                  key={'5'}
                  className={classes.tableHeader}
                  // style={{ width: panelWidthForColumns.longName, padding: '0px', paddingLeft: '5px', verticalAlign: 'center' }}
                >
                  {newFilter.longName.title}
                </TableCell>,
                <HeaderControlCell key={'6'}>
                  <div className={classes.arrowsWrapper}>
                    <IconButton
                      style={{ padding: '0px', verticalAlign: 'center' }}
                      onClick={() => handleHeaderSort('longName')}
                    >
                      <RichTooltip path="sort" className={classes.sortButton}>
                        {newFilter.longName.order === -1 ? (
                          <KeyboardArrowDown />
                        ) : newFilter.longName.order === 1 ? (
                          <KeyboardArrowUp />
                        ) : (
                          <UnfoldMore />
                        )}
                      </RichTooltip>
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
                </HeaderControlCell>,
                <TableCell
                  key={'7'}
                  className={classes.tableHeader}
                  // style={{ width: panelWidthForColumns.organism, padding: '0px', paddingLeft: '5px', verticalAlign: 'center' }}
                >
                  {newFilter.organism.title}
                </TableCell>,
                <HeaderControlCell key={'8'}>
                  <div className={classes.arrowsWrapper}>
                    <IconButton
                      style={{ padding: '0px', verticalAlign: 'center' }}
                      onClick={() => handleHeaderSort('organism')}
                    >
                      <RichTooltip path="sort" className={classes.sortButton}>
                        {newFilter.organism.order === -1 ? (
                          <KeyboardArrowDown />
                        ) : newFilter.organism.order === 1 ? (
                          <KeyboardArrowUp />
                        ) : (
                          <UnfoldMore />
                        )}
                      </RichTooltip>
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
                </HeaderControlCell>,

                <TableCell
                  key={'9'}
                  className={classes.tableHeader}
                  // style={{ width: panelWidthForColumns.externalURL, padding: '0px', paddingLeft: '5px', verticalAlign: 'center' }}
                >
                  External URL
                </TableCell>,
                <HeaderControlCell key={'10'}>
                  <div className={classes.arrowsWrapper}>
                    <IconButton
                      style={{ padding: '0px', verticalAlign: 'center' }}
                      onClick={() => handleHeaderSort('externalURL')}
                    >
                      <RichTooltip path="sort" className={classes.sortButton}>
                        {filter.filter.externalURL?.order === -1 ? (
                          <KeyboardArrowDown />
                        ) : filter.filter.externalURL?.order === 1 ? (
                          <KeyboardArrowUp />
                        ) : (
                          <UnfoldMore />
                        )}
                      </RichTooltip>
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
                </HeaderControlCell>,

                <TableCell
                  key={'11'}
                  className={classes.tableHeader}
                  // style={{ width: panelWidthForColumns.externalURL, padding: '0px', paddingLeft: '5px', verticalAlign: 'center' }}
                >
                  Data version
                </TableCell>,
                <HeaderControlCell key={'12'}>
                  <div className={classes.arrowsWrapper}>
                    <IconButton
                      style={{ padding: '0px', verticalAlign: 'center' }}
                      onClick={() => handleHeaderSort('dataVersion')}
                    >
                      <RichTooltip path="sort" className={classes.sortButton}>
                        {filter.filter.dataVersion?.order === -1 ? (
                          <KeyboardArrowDown />
                        ) : filter.filter.dataVersion?.order === 1 ? (
                          <KeyboardArrowUp />
                        ) : (
                          <UnfoldMore />
                        )}
                      </RichTooltip>
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
                    onMouseDown={() => handleMouseDownResizer('dataVersion')}
                  ></div>
                </HeaderControlCell>
              ]}

              {!legacy && <TableCell aria-label="Target details" />}
              {canInspectAccess() && !legacy && <TableCell className={classes.tableHeader}>Access</TableCell>}
              {DJANGO_CONTEXT['authenticated'] && legacy === false && (
                <TableCell
                  className={classes.tableHeader}
                  // style={{ width: 50, paddingLeft: '5px', verticalAlign: 'center' }}
                >
                  Edit
                </TableCell>
              )}
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
                slotProps={{
                  select: {
                    inputProps: { 'aria-label': 'rows per page' },
                    native: true
                  }
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
        {filterDialogOpen && (
          <TooltipPathProvider path="sortFilterDialog">
            <TargetListSortFilterDialog
              open={filterDialogOpen}
              anchorEl={sortDialogAnchorEl}
              filter={newFilter}
              resetFilter={() => setNewFilter(initFilterState)}
              setFilter={updateFilter}
              onClose={() => setFilterDialogOpen(false)}
            />
          </TooltipPathProvider>
        )}
        <Dialog
          open={Boolean(targetToDownload)}
          onClose={closeTargetDownloadConfirmation}
          aria-labelledby="target-download-confirmation-title"
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle id="target-download-confirmation-title">Download target data?</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Do you want to download the default dataset for{' '}
              <strong>{targetToDownload?.display_name || targetToDownload?.title}</strong>?
            </Typography>
            {downloadPreparing && <LinearProgress sx={{ marginTop: 2 }} />}
            {downloadPreparing && (
              <Typography variant="body2" sx={{ marginTop: 1 }}>
                Preparing download…
              </Typography>
            )}
            {downloadError && (
              <Typography color="error" variant="body2" sx={{ marginTop: 2 }}>
                {downloadError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeTargetDownloadConfirmation} disabled={downloadPreparing}>
              Cancel
            </Button>
            <Button onClick={downloadDefaultTargetData} disabled={downloadPreparing} variant="contained">
              Download
            </Button>
          </DialogActions>
        </Dialog>
      </Panel>
    );
  }
});
