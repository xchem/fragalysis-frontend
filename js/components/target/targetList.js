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
import { Chat } from '@material-ui/icons';
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
  setSearchInitDateTo
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
import { TargetListSortFilterDialog, sortTargets } from './targetListSortFilterDialog';
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
import { setTargetFilter } from '../../reducers/selection/actions';
import { MOCK_LIST_OF_TARGETS } from './MOCK';
import { TARGETS_ATTR } from './redux/constants';
import { getTargetProjectCombinations } from './redux/dispatchActions';
import moment from 'moment';

const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 430,
    tableLayout: 'auto',
    marginTop: '8px'
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

export const TargetList = memo(() => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingTargetAccessString, setIsResizingTargetAccessString] = useState(false);
  const [isResizingInitDate, setIsResizingInitDate] = useState(false);
  const [isResizingSGC, setIsResizingSGC] = useState(false);
  const [panelWidth, setPanelWidth] = useState(110);
  const [panelWidthForTargetAccessString, setPanelWidthForTargetAccessString] = useState(140);
  const [panelWidthForInitDate, setPanelWidthForInitDate] = useState(90);
  const [panelWidthForSGC, setPanelWidthForSGC] = useState(130);

  const [sortSwitch, setSortSwitch] = useState(21);
  const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);
  const sortDialogOpen = useSelector(state => state.targetReducers.targetListFilterDialog);

  const filterClean = useSelector(state => state.targetReducers.filterClean);
  let filter = useSelector(state => state.selectionReducers.targetFilter);

  const target_id_list_unsorted = useSelector(state => state.apiReducers.target_id_list);
  const projectsList = useSelector(state => state.targetReducers.projects);
  let listOfTargets = useSelector(state => state.targetReducers.listOfTargets);
  let filteredListOfTargets = useSelector(state => state.targetReducers.listOfFilteredTargets);

  let target_id_list = filter === undefined ? target_id_list_unsorted.sort(compareTargetAsc) : target_id_list_unsorted;
  let listOfAllTargetsDefault = target_id_list;

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

  let searchString = '';

  // checkbox for search
  const [checkedId, setCheckedId] = useState(true);
  const [checkedTarget, setCheckedTarget] = useState(true);
  const [checkedNumberOfChains, setCheckedNumberOfChains] = useState(true);
  const [checkedPrimaryChain, setCheckedPrimaryChain] = useState(true);
  const [checkedUniprot, setCheckedUniprot] = useState(true);
  const [checkedRange, setCheckedRange] = useState(true);
  const [checkedProteinName, setCheckedProteinName] = useState(true);
  const [checkedGeneName, setCheckedGeneName] = useState(true);
  const [checkedSpeciesId, setCheckedSpeciesId] = useState(true);
  const [checkedSpecies, setCheckedSpecies] = useState(true);
  const [checkedDomain, setCheckedDomain] = useState(true);
  const [checkedECNumber, setCheckedECNUmber] = useState(true);
  const [checkedNHits, setCheckedNHits] = useState(true);
  const [checkedDateLastEdit, setCheckedDateLastEdit] = useState(true);
  const [checkedVersionId, setCheckedVersionId] = useState(true);
  const [checkedTargetAccessString, setCheckedTargetAccessString] = useState(true);

  const offsetId = 10;
  const offsetTarget = 20;
  const offsetNumberOfChains = 30;
  const offsetPrimaryChain = 40;
  const offsetUniprot = 60;
  const offsetRange = 70;
  const offsetProteinName = 80;
  const offsetGeneName = 90;
  const offsetSpeciesId = 100;
  const offsetSpecies = 110;
  const offsetDomain = 120;
  const offsetECNumber = 130;
  const offsetNHits = 140;
  const offsetDateLastEdit = 150;
  const offsetVersionId = 160;
  const offsetTargetAccessString = 170;
  const offsetInitDate = 180;

  let searchedById = [];
  let searchedByTarget = [];
  let searchedByNumberOfChains = [];
  let searchedByPrimaryChain = [];
  let searchedByUniprot = [];
  let searchedByRange = [];
  let searchedByProteinName = [];
  let searchedByGeneName = [];
  let searchedBySpeciesId = [];
  let searchedBySpecies = [];
  let searchedByDomain = [];
  let searchedByDateLastEdit = [];
  let searchedVersionId = [];
  let searchedByECNumber = [];
  let searchedNHits = [];
  let searchedByTargetAccessString = [];

  let listOfFilteredTargetsByDate = useSelector(state => state.targetReducers.listOfFilteredTargetsByDate);

  const isActiveFilter = !!(filter || {}).active;
  let listOfAllTarget = [...listOfAllTargetsDefault].sort(compareTargetAsc);

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
      if (attr.key === 'title') {
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
  });

  useEffect(() => {
    const init = initialize();
    setInitState(init);
  }, []);

  const [initState, setInitState] = useState(initialize());

  filter = filter || initState;

  const render_item_method = target => {
    const preview = `${URLS.target}${target.title}/${URL_TOKENS.target_access_string}/${target.project.target_access_string}`;
    const sgcUrl = 'https://thesgc.org/sites/default/files/XChem/' + target.title + '/html/index.html';
    const sgcUploaded = ['BRD1A', 'DCLRE1AA', 'FALZA', 'FAM83BA', 'HAO1A', 'NUDT4A', 'NUDT5A', 'NUDT7A', 'PARP14A'];
    const discourseAvailable = isDiscourseAvailable();
    // const [discourseUrl, setDiscourseUrl] = useState();
    return (
      <TableRow hover key={target.id}>
        {/*<Tooltip title={`${target.id}`}>
        <TableCell
          component="th"
          scope="row"
          style={{ minWidth: '150px', padding: '0px 10px 0px 0px', margin: '0px', padding: '0px' }}
        >
          <div>{target.id}</div>
        </TableCell>
      </Tooltip> */}
        <TableCell align="left" style={{ padding: '0px 10px 0px 0px', margin: '0px', padding: '0px' }}>
          <Link to={preview}>
            <div style={{ wordBreak: 'break-all' }}>{target.title}</div>
          </Link>
        </TableCell>
        <TableCell style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>
        <TableCell align="left" style={{ padding: '0px 10px 0px 0px', margin: '0px', padding: '0px' }}>
          <div>{target.project.target_access_string} </div>
        </TableCell>
        <TableCell style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>
        <TableCell align="left" style={{ padding: '0px 10px 0px 0px', margin: '0px', padding: '0px' }}>
          <div>{moment(target.project.init_date).format('YYYY-MM-DD')} </div>
        </TableCell>
        <TableCell style={{ width: '2px', padding: '0px', margin: '0px' }}></TableCell>
        <TableCell align="left" style={{ padding: '0px 10px 0px 0px', margin: '0px', padding: '0px' }}>
          {sgcUploaded.includes(target.title) && (
            <a href={sgcUrl} target="new">
              SGC summary
            </a>
          )}
          {discourseAvailable && (
            <Tooltip title="Go to Discourse">
              <IconButton
                disabled={!isDiscourseAvailable()}
                onClick={() => {
                  generateDiscourseTargetURL(target.title)
                    .then(response => {
                      const link = response.data['Post url'];
                      openDiscourseLink(link);
                    })
                    .catch(err => {
                      console.log(err);
                      dispatch(setOpenDiscourseErrorModal(true));
                    });
                }}
                style={{ padding: '0px' }}
              >
                <Chat style={{ height: '15px' }} />
              </IconButton>
            </Tooltip>
          )}
        </TableCell>
        {/*
      <TableCell
        align="left"
        style={{ minWidth: '100px', padding: '5px 10px 0px 0px', margin: '0px', padding: '0px' }}
      >
        <div>{target.numberOfChains}</div>
      </TableCell>
      <TableCell
        align="left"
        style={{ minWidth: '150px', padding: '0px 10px 0px 0px', margin: '0px', padding: '0px' }}
      >
        <div>{target.primaryChain}</div>
      </TableCell>
      <TableCell style={{ padding: '0px' }} align="left">
        <Link to={`${URLS.target}${target.uniprot}`}>
          <div>{target.uniprot} </div>
        </Link>
      </TableCell>
      <TableCell style={{ padding: '0px' }} align="left">
        {target.range}
      </TableCell>{' '}
      <TableCell style={{ padding: '0px' }} align="left">
        {target.proteinName}
      </TableCell>{' '}
      <TableCell style={{ padding: '0px' }} align="left">
        {target.geneName}
      </TableCell>{' '}
      <TableCell style={{ padding: '0px' }} align="left">
        {target.speciesId}
      </TableCell>
      <TableCell align="left" style={{ padding: '0px' }}>
        <Link to={`${URLS.target}${target.species}`}>
          <div>{target.species} </div>
        </Link>
      </TableCell>
      <TableCell style={{ padding: '0px' }} align="left">
        {target.domain}
      </TableCell>
      <TableCell style={{ padding: '0px' }} align="left">
        {target.ECNumber}
      </TableCell>
      <TableCell
        align="left"
        style={{ minWidth: '150px', padding: '0px 10px 0px 0px', margin: '0px', padding: '0px' }}
      >
        <div> {target.NHits}</div>
      </TableCell>
      <TableCell
        align="left"
        style={{ minWidth: '150px', padding: '0px 10px 0px 0px', margin: '0px', padding: '0px' }}
      >
        <div> {target.dateLastEdit}</div>
      </TableCell>
      <TableCell
        align="left"
        style={{ minWidth: '150px', padding: '0px 10px 0px 0px', margin: '0px', padding: '0px' }}
      >
        <div> {target.versionId}</div>
      </TableCell>
    */}
      </TableRow>
    );
  };

  useEffect(() => {
    // remove filter data
    if (filterClean === true) {
      dispatch(setDefaultFilter(false));
      dispatch(setSearchTarget(''));
      dispatch(setSearchNumberOfChains(''));
      dispatch(setSearchPrimaryChain(''));
      dispatch(setSearchUniprot(''));
      dispatch(setSearchRange(''));
      dispatch(setSearchProteinName(''));
      dispatch(setSearchGeneName(''));
      dispatch(setSearchSpecies(''));
      dispatch(setSearchDomain(''));
      dispatch(setSearchECNumber(''));
      dispatch(setSearchNHits(''));
      dispatch(setSearchDateLastEditFrom(''));
      dispatch(setSearchDateLastEditTo(''));
      dispatch(setSearchTargetAccessString(''));
      dispatch(setSearchInitDateFrom(''));
      dispatch(setSearchInitDateTo(''));
      const newFilter = { ...filter };
      newFilter.priorityOrder = [
        'title',
        'targetAccessString',
        'initDate'
        //'numberOfChains',
        //'primaryChain',
        //'uniprot',
        //'range',
        //'proteinName',
        //'geneName',
        //'species',
        //'domain',
        //'ECNumber',
        //'NHits',
        //'dateLastEdit'
      ];
      newFilter.sortOptions = [
        ['title', undefined],
        ['targetAccessString', 'project_target_access_string'],
        ['initDate', 'project.init_date']
        //['numberOfChains', undefined],
        //['primaryChain', undefined],
        //['uniprot', undefined],
        //['range', undefined],
        //['geneName', undefined],
        //['species', undefined],
        //['domain', undefined],
        //['ECNumber', undefined],
        //['NHits', undefined],
        //['dateLastEdit', undefined]
      ];
      //newFilter.filter.numberOfChains.order = 1;
      newFilter.filter.title.order = -1;
      newFilter.filter.targetAccessString.order = 0;
      newFilter.filter.initDate.order = 0;
      //newFilter.filter.primaryChain.order = 1;
      //newFilter.filter.uniprot.order = 1;
      //newFilter.filter.range.order = 1;
      //newFilter.filter.geneName.order = 1;
      //newFilter.filter.species.order = 1;
      //newFilter.filter.domain.order = 1;
      //newFilter.filter.ECNumber.order = 1;
      //newFilter.filter.NHits.order = 1;
      //newFilter.filter.dateLastEdit.order = 1;
      dispatch(setTargetFilter(newFilter));
    }
  }, [filterClean]);

  // window height for showing rows per page
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  let targetListWindowHeight = windowHeight / 22.5;
  let targetListWindowHeightFinal = parseInt(targetListWindowHeight.toFixed(0), 10);
  const [rowsPerPage, setRowsPerPage] = useState(targetListWindowHeightFinal);
  const [rowsPerPagePerPageSize, setRowsPerPagePerPageSize] = useState(targetListWindowHeightFinal);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    if (isActiveFilter) {
      listOfAllTargetsDefault = sortTargets(listOfAllTargetsDefault, filter);
      dispatch(setListOfTargets(listOfAllTargetsDefault));
      if (filteredListOfTargets !== undefined) {
        filteredListOfTargets = sortTargets(filteredListOfTargets, filter);
        dispatch(setListOfFilteredTargets(filteredListOfTargets));
      }
    }
  }, [filter]);

  // search from target list
  const handleSearch = event => {
    searchString = event.target.value;
    /* if (checkedId === true) {
      searchedById = listOfAllTarget.filter(item => item.id.toString().includes(searchString));
    } else {
      searchedById = [];
    }*/
    if (checkedTarget === true) {
      searchedByTarget = listOfAllTarget.filter(item => item.title.toLowerCase().includes(searchString.toLowerCase()));
    } else {
      searchedByTarget = [];
    }
    if (checkedTargetAccessString === true) {
      searchedByTargetAccessString = listOfAllTarget.filter(item =>
        item.project.target_access_string.toLowerCase().includes(searchString.toLowerCase())
      );
    } else {
      searchedByTargetAccessString = [];
    }
    /* if (checkedNumberOfChains === true) {
      searchedByNumberOfChains = listOfAllTarget.filter(item => item.numberOfChains.toString().includes(searchString));
    } else {
      searchedByNumberOfChains = [];
    }
    if (checkedPrimaryChain === true) {
      searchedByPrimaryChain = listOfAllTarget.filter(item => {
        return item.primaryChain.toLowerCase().includes(searchString.toLowerCase());
      });
    } else {
      searchedByPrimaryChain = [];
    }
    if (checkedUniprot === true) {
      searchedByUniprot = listOfAllTarget.filter(item => {
        return item.uniprot.toLowerCase().includes(searchString.toLowerCase());
      });
    } else {
      searchedByUniprot = [];
    }
    if (checkedRange === true) {
      searchedByRange = listOfAllTarget.filter(item => {
        return item.range.toString().includes(searchString);
      });
    } else {
      searchedByRange = [];
    }
    if (checkedProteinName === true) {
      searchedByProteinName = listOfAllTarget.filter(item => {
        return item.proteinName.toLowerCase().includes(searchString.toLowerCase());
      });
    } else {
      searchedByProteinName = [];
    }
    if (checkedGeneName === true) {
      searchedByGeneName = listOfAllTarget.filter(item => {
        return item.geneName
          .toLowerCase()
          .toString()
          .includes(searchString.toLowerCase());
      });
    } else {
      searchedByGeneName = [];
    }
    if (checkedSpeciesId === true) {
      searchedBySpeciesId = listOfAllTarget.filter(item => {
        return item.speciesId.toString().includes(searchString);
      });
    } else {
      searchedBySpeciesId = [];
    }
    if (checkedSpecies === true) {
      searchedBySpecies = listOfAllTarget.filter(item => {
        return item.species.toLowerCase().includes(searchString.toLowerCase());
      });
    } else {
      searchedBySpecies = [];
    }
    if (checkedDomain === true) {
      searchedByDomain = listOfAllTarget.filter(item => {
        return item.domain.toLowerCase().includes(searchString.toLowerCase());
      });
    } else {
      searchedByDomain = [];
    }
    if (checkedECNumber === true) {
      searchedByECNumber = listOfAllTarget.filter(item => {
        return item.ECNumber.toLowerCase().includes(searchString.toLowerCase());
      });
    } else {
      searchedByECNumber = [];
    }
    if (checkedNHits === true) {
      searchedNHits = listOfAllTarget.filter(item => {
        return item.NHits.toString().includes(searchString);
      });
    } else {
      searchedNHits = [];
    }
    if (checkedDateLastEdit === true) {
      searchedByDateLastEdit = listOfAllTarget.filter(item => {
        return item.dateLastEdit.toLowerCase().includes(searchString.toLowerCase());
      });
    } else {
      searchedByDateLastEdit = [];
    }
    if (checkedVersionId === true) {
      searchedVersionId = listOfAllTarget.filter(item => {
        return item.versionId.toString().includes(searchString);
      });
    } else {
      searchedVersionId = [];
    }
*/
    const mergedSearchList = [
      ...searchedById,
      ...searchedByTarget,
      ...searchedByNumberOfChains,
      ...searchedByPrimaryChain,
      ...searchedByUniprot,
      ...searchedByRange,
      ...searchedByProteinName,
      ...searchedByGeneName,
      ...searchedBySpeciesId,
      ...searchedBySpecies,
      ...searchedByDomain,
      ...searchedByDateLastEdit,
      ...searchedVersionId,
      ...searchedByECNumber,
      ...searchedNHits,
      ...searchedByTargetAccessString
    ];
    const uniqueArray = Array.from(new Set(mergedSearchList.map(JSON.stringify))).map(JSON.parse);
    dispatch(setListOfFilteredTargets(uniqueArray));
  };

  if (filteredListOfTargets === undefined) {
    filteredListOfTargets = [...listOfAllTarget];
  }

  if (listOfFilteredTargetsByDate !== undefined && filteredListOfTargets !== undefined) {
    filteredListOfTargets = filteredListOfTargets.filter(item1 =>
      listOfFilteredTargetsByDate.some(item2 => item2.id === item1.id)
    );
  }

  const handleHeaderSort = type => {
    switch (type) {
      case 'id':
        if (sortSwitch === offsetId + 1) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareIdAsc)));
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetId + 2) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareIdAsc)));
          setSortSwitch(0);
        } else {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareIdDesc)));
          setSortSwitch(offsetId + 1);
        }
        break;
      case 'target':
        if (sortSwitch === offsetTarget + 1) {
          if (filter !== undefined) {
            const newFilter = { ...filter };
            newFilter.filter.title.order = 1;
            dispatch(setTargetFilter(newFilter));
          }
          dispatch(
            setListOfFilteredTargets(
              filteredListOfTargets === undefined
                ? [...listOfAllTarget].sort(compareTargetAsc)
                : filteredListOfTargets.sort(compareTargetAsc)
            )
          );
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetTarget + 2) {
          if (filter !== undefined) {
            const newFilter = { ...filter };
            newFilter.filter.title.order = 0;
            dispatch(setTargetFilter(newFilter));
          }
          dispatch(
            setListOfFilteredTargets(
              filteredListOfTargets === undefined
                ? [...listOfAllTarget].sort(compareTargetAsc)
                : filteredListOfTargets.sort(compareTargetAsc)
            )
          );
          setSortSwitch(0);
        } else {
          if (filter !== undefined) {
            // change radio button in project list filter
            const newFilter = { ...filter };
            newFilter.filter.title.order = -1;
            dispatch(setTargetFilter(newFilter));
          }
          dispatch(
            setListOfFilteredTargets(
              filteredListOfTargets === undefined
                ? [...listOfAllTarget].sort(compareTargetDesc)
                : [...filteredListOfTargets].sort(compareTargetDesc)
            )
          );
          setSortSwitch(offsetTarget + 1);
        }
        break;
      case 'targetAccessString':
        if (sortSwitch === offsetTargetAccessString + 1) {
          if (filter !== undefined) {
            const newFilter = { ...filter };
            newFilter.filter.targetAccessString.order = 1;
            dispatch(setTargetFilter(newFilter));
          }
          dispatch(
            setListOfFilteredTargets(
              filteredListOfTargets === undefined
                ? [...listOfAllTarget].sort(compareTargetAccessStringAsc)
                : [...filteredListOfTargets].sort(compareTargetAccessStringAsc)
            )
          );
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetTargetAccessString + 2) {
          if (filter !== undefined) {
            const newFilter = { ...filter };
            newFilter.filter.targetAccessString.order = 0;
            dispatch(setTargetFilter(newFilter));
          }
          dispatch(
            setListOfFilteredTargets(
              filteredListOfTargets === undefined
                ? [...listOfAllTarget].sort(compareTargetAccessStringAsc)
                : [...filteredListOfTargets].sort(compareTargetAccessStringAsc)
            )
          );
          setSortSwitch(0);
        } else {
          if (filter !== undefined) {
            const newFilter = { ...filter };
            newFilter.filter.targetAccessString.order = -1;
            dispatch(setTargetFilter(newFilter));
          }
          dispatch(
            setListOfFilteredTargets(
              filteredListOfTargets === undefined
                ? [...listOfAllTarget].sort(compareTargetAccessStringDesc)
                : [...filteredListOfTargets].sort(compareTargetAccessStringDesc)
            )
          );
          setSortSwitch(offsetTargetAccessString + 1);
        }
        break;
      case 'initDate':
        if (sortSwitch === offsetInitDate + 1) {
          if (filter !== undefined) {
            const newFilter = { ...filter };
            newFilter.filter.initDate.order = 1;
            dispatch(setTargetFilter(newFilter));
          }
          dispatch(
            setListOfFilteredTargets(
              filteredListOfTargets === undefined
                ? [...listOfAllTarget].sort(compareInitDateAsc)
                : [...filteredListOfTargets].sort(compareInitDateAsc)
            )
          );
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetInitDate + 2) {
          if (filter !== undefined) {
            const newFilter = { ...filter };
            newFilter.filter.initDate.order = 0;
            dispatch(setTargetFilter(newFilter));
          }
          dispatch(
            setListOfFilteredTargets(
              filteredListOfTargets === undefined
                ? [...listOfAllTarget].sort(compareInitDateAsc)
                : [...filteredListOfTargets].sort(compareInitDateAsc)
            )
          );
          setSortSwitch(0);
        } else {
          if (filter !== undefined) {
            const newFilter = { ...filter };
            newFilter.filter.initDate.order = -1;
            dispatch(setTargetFilter(newFilter));
          }
          dispatch(
            setListOfFilteredTargets(
              filteredListOfTargets === undefined
                ? [...listOfAllTarget].sort(compareInitDateDesc)
                : [...filteredListOfTargets].sort(compareInitDateDesc)
            )
          );
          setSortSwitch(offsetInitDate + 1);
        }
        break;
      case 'numberOfChains':
        if (sortSwitch === offsetNumberOfChains + 1) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareNumberOfChainAsc)));
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetNumberOfChains + 2) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareNumberOfChainAsc)));
          setSortSwitch(0);
        } else {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareNumberOfChainDesc)));
          setSortSwitch(offsetNumberOfChains + 1);
        }
        break;
      case 'primaryChain':
        if (sortSwitch === offsetPrimaryChain + 1) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(comparePrimaryChainAsc)));
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetPrimaryChain + 2) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(comparePrimaryChainAsc)));
          setSortSwitch(0);
        } else {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(comparePrimaryChainDesc)));
          setSortSwitch(offsetPrimaryChain + 1);
        }
        break;
      case 'uniprot':
        if (sortSwitch === offsetUniprot + 1) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareUniprotAsc)));
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetUniprot + 2) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareUniprotAsc)));
          setSortSwitch(0);
        } else {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareUniprotDesc)));
          setSortSwitch(offsetUniprot + 1);
        }
        break;
      case 'range':
        if (sortSwitch === offsetRange + 1) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareRangeAsc)));
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetRange + 2) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareRangeAsc)));
          setSortSwitch(0);
        } else {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareRangeDesc)));
          setSortSwitch(offsetRange + 1);
        }
        break;
      case 'proteinName':
        if (sortSwitch === offsetProteinName + 1) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareProteinNameAsc)));
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetProteinName + 2) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareProteinNameAsc)));
          setSortSwitch(0);
        } else {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareProteinNameDesc)));
          setSortSwitch(offsetProteinName + 1);
        }
        break;
      case 'geneName':
        if (sortSwitch === offsetGeneName + 1) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareGeneNameAsc)));
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetGeneName + 2) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareGeneNameAsc)));
          setSortSwitch(0);
        } else {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareGeneNameDesc)));
          setSortSwitch(offsetGeneName + 1);
        }
        break;
      case 'speciesId':
        if (sortSwitch === offsetSpeciesId + 1) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareSpeciesIdAsc)));
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetSpeciesId + 2) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareSpeciesIdAsc)));
          setSortSwitch(0);
        } else {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareSpeciesIdDesc)));
          setSortSwitch(offsetSpeciesId + 1);
        }
        break;
      case 'species':
        if (sortSwitch === offsetSpecies + 1) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareSpeciesAsc)));
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetSpecies + 2) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareSpeciesAsc)));
          setSortSwitch(0);
        } else {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareSpeciesDesc)));
          setSortSwitch(offsetSpecies + 1);
        }
        break;
      case 'domain':
        if (sortSwitch === offsetDomain + 1) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareDomainAsc)));
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetDomain + 2) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareDomainAsc)));
          setSortSwitch(0);
        } else {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareDomainDesc)));
          setSortSwitch(offsetDomain + 1);
        }
        break;
      case 'ECNumber':
        if (sortSwitch === offsetECNumber + 1) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareECNumberAsc)));
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetECNumber + 2) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareECNumberAsc)));
          setSortSwitch(0);
        } else {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareECNumberDesc)));
          setSortSwitch(offsetECNumber + 1);
        }
        break;
      case 'NHits':
        if (sortSwitch === offsetNHits + 1) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareECNumberAsc)));
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetNHits + 2) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareNHitsAsc)));
          setSortSwitch(0);
        } else {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareNHitsDesc)));
          setSortSwitch(offsetNHits + 1);
        }
        break;
      case 'dateLastEdit':
        if (sortSwitch === offsetDateLastEdit + 1) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareDateLastEditAsc)));
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetDateLastEdit + 2) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareDateLastEditAsc)));
          setSortSwitch(0);
        } else {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareDateLastEditDesc)));
          setSortSwitch(offsetDateLastEdit + 1);
        }
        break;
      case 'versionId':
        if (sortSwitch === offsetVersionId + 1) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareVersionIdAsc)));
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetVersionId + 2) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareVersionIdAsc)));
          setSortSwitch(0);
        } else {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareVersionIdDesc)));
          setSortSwitch(offsetVersionId + 1);
        }
        break;
      default:
        dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareTargetDesc)));
        break;
    }
  };

  // START RESIZER FOR TARGET COLUMN
  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = e => {
    if (!isResizing) return;
    const deltaX = e.clientX - 20;
    setPanelWidth(deltaX);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isResizing]);
  // END RESIZER FOR TARGET COLUMN

  // START RESIZER FOR TARGET ACCESS STRING COLUMN
  const handleMouseDownResizerTargetAccessString = () => {
    setIsResizingTargetAccessString(true);
    panelWidth !== undefined ? setPanelWidth(panelWidth) : setPanelWidth(130);
  };

  const handleMouseMoveTargetAccessString = e => {
    if (!isResizingTargetAccessString) return;
    const deltaX = e.clientX - 140;
    setPanelWidthForTargetAccessString(deltaX);
  };

  const handleMouseUpTargetAccessString = () => {
    setIsResizingTargetAccessString(false);
    window.removeEventListener('mousemove', handleMouseMoveTargetAccessString);
    window.removeEventListener('mouseup', handleMouseUpTargetAccessString);
  };

  useEffect(() => {
    if (isResizingTargetAccessString) {
      window.addEventListener('mousemove', handleMouseMoveTargetAccessString);
      window.addEventListener('mouseup', handleMouseUpTargetAccessString);
    } else {
      window.removeEventListener('mousemove', handleMouseMoveTargetAccessString);
      window.removeEventListener('mouseup', handleMouseUpTargetAccessString);
    }
  }, [isResizingTargetAccessString]);
  // END RESIZER FOR TARGET ACCESS STRING COLUMN

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
  const targetsToUse = filteredListOfTargets ? filteredListOfTargets : listOfAllTarget;
  if (target_id_list) {
    return (
      <Panel
        hasHeader
        title="Target list"
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
            onClick={event => {
              if (sortDialogOpen === false || sortDialogOpen === undefined) {
                setSortDialogAnchorEl(event.currentTarget);
                dispatch(setSortTargetDialogOpen(true));
              } else {
                setSortDialogAnchorEl(null);
                dispatch(setSortTargetDialogOpen(false));
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
            <TableRow style={{ padding: '0px', paddingTop: '15px' }}>
              {/*} <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedId}
                    onChange={() => setCheckedId(!checkedId)}
                  />
                  Id
                </Typography>
                <IconButton style={{ padding: '0px' }} onClick={() => handleHeaderSort('id')}>
                  <Tooltip title="Sort" className={classes.sortButton}>
                    {[1, 2].includes(sortSwitch - offsetId) ? (
                      sortSwitch % offsetId < 2 ? (
                        <KeyboardArrowDown style={{ padding: '0px' }} />
                      ) : (
                        <KeyboardArrowUp style={{ padding: '0px' }} />
                      )
                    ) : (
                      <UnfoldMore style={{ padding: '0px' }} />
                    )}
                  </Tooltip>
                </IconButton>
                    </TableCell>*/}
              <TableCell style={{ width: panelWidth, padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedTarget}
                    onChange={() => setCheckedTarget(!checkedTarget)}
                  />
                  Target
                </Typography>
              </TableCell>
              <div style={{ display: 'flex' }}>
                <div>
                  <IconButton
                    style={{ padding: '0px', paddingRight: '5px' }}
                    onClick={() => handleHeaderSort('target')}
                  >
                    <Tooltip title="Sort" className={classes.sortButton}>
                    {filter.filter.title.order === -1 ? (
                      <KeyboardArrowDown />
                    ) : filter.filter.title.order === 1 ? (
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
              <TableCell style={{ width: panelWidthForTargetAccessString, padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedTargetAccessString}
                    onChange={() => setCheckedTargetAccessString(!checkedTargetAccessString)}
                  />
                  Target access
                </Typography>
              </TableCell>
              <div style={{ display: 'flex' }}>
                <div>
                  <IconButton
                    style={{ padding: '0px', paddingRight: '5px' }}
                    onClick={() => handleHeaderSort('targetAccessString')}
                  >
                    <Tooltip title="Sort" className={classes.sortButton}>
                    {filter.filter.targetAccessString.order === -1 ? (
                      <KeyboardArrowDown />
                    ) : filter.filter.targetAccessString.order === 1 ? (
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
                style={{ width: panelWidthForInitDate, padding: '0px', paddingLeft: '5px', verticalAlign: 'center' }}
              >
                Init date
              </TableCell>
              <div style={{ display: 'flex' }}>
                <div style={{ paddingRight: '5px' }}>
                  <IconButton
                    style={{ padding: '0px', verticalAlign: 'center' }}
                    onClick={() => handleHeaderSort('initDate')}
                  >
                    <Tooltip title="Sort" className={classes.sortButton}>
                    {filter.filter.initDate.order === -1 ? (
                      <KeyboardArrowDown />
                    ) : filter.filter.initDate.order === 1 ? (
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
              <TableCell
                style={{ width: panelWidthForSGC, padding: '0px', paddingLeft: '5px', verticalAlign: 'center' }}
              >
                SGC
              </TableCell>
              {/*<div style={{ display: 'flex' }}>
                <div
                  style={{ cursor: 'col-resize', width: 3, height: '18px', backgroundColor: '#cccccc' }}
                  onMouseDown={handleMouseDownResizerSGC}
                ></div>
                </div>*/}
              {/*   <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedNumberOfChains}
                    onChange={() => setCheckedNumberOfChains(!checkedNumberOfChains)}
                  />
                  Number of chains
                </Typography>
                <IconButton style={{ padding: '0px' }} onClick={() => handleHeaderSort('numberOfChains')}>
                  <Tooltip title="Sort" className={classes.sortButton}>
                    {[1, 2].includes(sortSwitch - offsetNumberOfChains) ? (
                      sortSwitch % offsetNumberOfChains < 2 ? (
                        <KeyboardArrowDown />
                      ) : (
                        <KeyboardArrowUp />
                      )
                    ) : (
                      <UnfoldMore />
                    )}
                  </Tooltip>
                </IconButton>
              </TableCell>
              <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedPrimaryChain}
                    onChange={() => setCheckedPrimaryChain(!checkedPrimaryChain)}
                  />
                  Primary chains
                </Typography>
                <IconButton style={{ padding: '0px' }} onClick={() => handleHeaderSort('primaryChain')}>
                  <Tooltip title="Sort" className={classes.sortButton}>
                    {[1, 2].includes(sortSwitch - offsetPrimaryChain) ? (
                      sortSwitch % offsetPrimaryChain < 2 ? (
                        <KeyboardArrowDown />
                      ) : (
                        <KeyboardArrowUp />
                      )
                    ) : (
                      <UnfoldMore />
                    )}
                  </Tooltip>
                </IconButton>
              </TableCell>
              <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedUniprot}
                    onChange={() => setCheckedUniprot(!checkedUniprot)}
                  />
                  Uniprot
                </Typography>
                <IconButton style={{ padding: '0px' }} onClick={() => handleHeaderSort('uniprot')}>
                  <Tooltip title="Sort" className={classes.sortButton}>
                    {[1, 2].includes(sortSwitch - offsetUniprot) ? (
                      sortSwitch % offsetUniprot < 2 ? (
                        <KeyboardArrowDown />
                      ) : (
                        <KeyboardArrowUp />
                      )
                    ) : (
                      <UnfoldMore />
                    )}
                  </Tooltip>
                </IconButton>
              </TableCell>
              <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedRange}
                    onChange={() => setCheckedRange(!checkedRange)}
                  />
                  Range
                </Typography>
                <IconButton style={{ padding: '0px' }} onClick={() => handleHeaderSort('range')}>
                  <Tooltip title="Sort" className={classes.sortButton}>
                    {[1, 2].includes(sortSwitch - offsetRange) ? (
                      sortSwitch % offsetRange < 2 ? (
                        <KeyboardArrowDown />
                      ) : (
                        <KeyboardArrowUp />
                      )
                    ) : (
                      <UnfoldMore />
                    )}
                  </Tooltip>
                </IconButton>
              </TableCell>
              <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedProteinName}
                    onChange={() => setCheckedProteinName(!checkedProteinName)}
                  />
                  Protein Name
                </Typography>
                <IconButton style={{ padding: '0px' }} onClick={() => handleHeaderSort('proteinName')}>
                  <Tooltip title="Sort" className={classes.sortButton}>
                    {[1, 2].includes(sortSwitch - offsetProteinName) ? (
                      sortSwitch % offsetProteinName < 2 ? (
                        <KeyboardArrowDown />
                      ) : (
                        <KeyboardArrowUp />
                      )
                    ) : (
                      <UnfoldMore />
                    )}
                  </Tooltip>
                </IconButton>
              </TableCell>
              <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedGeneName}
                    onChange={() => setCheckedGeneName(!checkedGeneName)}
                  />
                  Gene name
                </Typography>
                <IconButton style={{ padding: '0px' }} onClick={() => handleHeaderSort('geneName')}>
                  <Tooltip title="Sort" className={classes.sortButton}>
                    {[1, 2].includes(sortSwitch - offsetGeneName) ? (
                      sortSwitch % offsetGeneName < 2 ? (
                        <KeyboardArrowDown />
                      ) : (
                        <KeyboardArrowUp />
                      )
                    ) : (
                      <UnfoldMore />
                    )}
                  </Tooltip>
                </IconButton>
              </TableCell>
              <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedSpeciesId}
                    onChange={() => setCheckedSpeciesId(!checkedSpeciesId)}
                  />
                  Species id
                </Typography>
                <IconButton style={{ padding: '0px' }} onClick={() => handleHeaderSort('speciesId')}>
                  <Tooltip title="Sort" className={classes.sortButton}>
                    {[1, 2].includes(sortSwitch - offsetSpeciesId) ? (
                      sortSwitch % offsetSpeciesId < 2 ? (
                        <KeyboardArrowDown />
                      ) : (
                        <KeyboardArrowUp />
                      )
                    ) : (
                      <UnfoldMore />
                    )}
                  </Tooltip>
                </IconButton>
              </TableCell>
              <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedSpecies}
                    onChange={() => setCheckedSpecies(!checkedSpecies)}
                  />
                  Species
                </Typography>
                <IconButton style={{ padding: '0px' }} onClick={() => handleHeaderSort('species')}>
                  <Tooltip title="Sort" className={classes.sortButton}>
                    {[1, 2].includes(sortSwitch - offsetSpecies) ? (
                      sortSwitch % offsetSpecies < 2 ? (
                        <KeyboardArrowDown />
                      ) : (
                        <KeyboardArrowUp />
                      )
                    ) : (
                      <UnfoldMore />
                    )}
                  </Tooltip>
                </IconButton>
              </TableCell>
              <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedDomain}
                    onChange={() => setCheckedDomain(!checkedDomain)}
                  />
                  Domain
                </Typography>
                <IconButton style={{ padding: '0px' }} onClick={() => handleHeaderSort('domain')}>
                  <Tooltip title="Sort" className={classes.sortButton}>
                    {[1, 2].includes(sortSwitch - offsetDomain) ? (
                      sortSwitch % offsetDomain < 2 ? (
                        <KeyboardArrowDown />
                      ) : (
                        <KeyboardArrowUp />
                      )
                    ) : (
                      <UnfoldMore />
                    )}
                  </Tooltip>
                </IconButton>
              </TableCell>
              <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedECNumber}
                    onChange={() => setCheckedECNUmber(!checkedECNumber)}
                  />
                  EC number
                </Typography>
                <IconButton style={{ padding: '0px' }} onClick={() => handleHeaderSort('ECNumber')}>
                  <Tooltip title="Sort" className={classes.sortButton}>
                    {[1, 2].includes(sortSwitch - offsetECNumber) ? (
                      sortSwitch % offsetECNumber < 2 ? (
                        <KeyboardArrowDown />
                      ) : (
                        <KeyboardArrowUp />
                      )
                    ) : (
                      <UnfoldMore />
                    )}
                  </Tooltip>
                </IconButton>
              </TableCell>
              <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedNHits}
                    onChange={() => setCheckedNHits(!checkedNHits)}
                  />
                  N hits
                </Typography>
                <IconButton style={{ padding: '0px' }} onClick={() => handleHeaderSort('NHits')}>
                  <Tooltip title="Sort" className={classes.sortButton}>
                    {[1, 2].includes(sortSwitch - offsetNHits) ? (
                      sortSwitch % offsetNHits < 2 ? (
                        <KeyboardArrowDown />
                      ) : (
                        <KeyboardArrowUp />
                      )
                    ) : (
                      <UnfoldMore />
                    )}
                  </Tooltip>
                </IconButton>
              </TableCell>
              <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedDateLastEdit}
                    onChange={() => setCheckedDateLastEdit(!checkedDateLastEdit)}
                  />
                  Date last edit
                </Typography>
                <IconButton style={{ padding: '0px' }} onClick={() => handleHeaderSort('dateLastEdit')}>
                  <Tooltip title="Sort" className={classes.sortButton}>
                    {[1, 2].includes(sortSwitch - offsetDateLastEdit) ? (
                      sortSwitch % offsetDateLastEdit < 2 ? (
                        <KeyboardArrowDown />
                      ) : (
                        <KeyboardArrowUp />
                      )
                    ) : (
                      <UnfoldMore />
                    )}
                  </Tooltip>
                </IconButton>
              </TableCell>
              <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedVersionId}
                    onChange={() => setCheckedVersionId(!checkedVersionId)}
                  />
                  Version ID
                </Typography>
                <IconButton style={{ padding: '0px' }} onClick={() => handleHeaderSort('versionId')}>
                  <Tooltip title="Sort" className={classes.sortButton}>
                    {[1, 2].includes(sortSwitch - offsetVersionId) ? (
                      sortSwitch % offsetVersionId < 2 ? (
                        <KeyboardArrowDown />
                      ) : (
                        <KeyboardArrowUp />
                      )
                    ) : (
                      <UnfoldMore />
                    )}
                  </Tooltip>
                </IconButton>
                    </TableCell>*/}
            </TableRow>
          </TableHead>
          <TableBody>
            {getTargetProjectCombinations(
              filteredListOfTargets !== undefined
                ? filteredListOfTargets
                : listOfTargets !== undefined
                ? listOfTargets
                : target_id_list,
              projectsList
            )
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(data => render_item_method(data.updatedTarget))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[rowsPerPagePerPageSize, 20, 30, 40, 50, 100]}
                count={listOfAllTarget.length}
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
        {sortDialogOpen && (
          <TargetListSortFilterDialog
            open={sortDialogOpen}
            anchorEl={sortDialogAnchorEl}
            filter={filter}
            setSortDialogAnchorEl={setSortDialogAnchorEl}
          />
        )}
      </Panel>
    );
  }
});
