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
  setSearchDateLastEditTo
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
  compareVersionIdDesc
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

const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 360,
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
  const isTargetLoading = useSelector(state => state.targetReducers.isTargetLoading);
  const target_id_list = useSelector(state => state.apiReducers.target_id_list);
  const projectsList = useSelector(state => state.targetReducers.projects);

  let filteredListOfTargets = useSelector(state => state.targetReducers.listOfFilteredTargets);

  const [sortSwitch, setSortSwitch] = useState(0);
  const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);
  const sortDialogOpen = useSelector(state => state.targetReducers.targetListFilterDialog);

  let listOfAllTargetsDefault = target_id_list; // change after import real data
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

  let listOfFilteredTargetsByDate = useSelector(state => state.projectReducers.listOfFilteredTargetsByDate);
  const filterClean = useSelector(state => state.targetReducers.filterClean);
  let filter = useSelector(state => state.selectionReducers.targetFilter);

  const isActiveFilter = !!(filter || {}).active;

  let listOfAllTarget = [...listOfAllTargetsDefault];

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

      initObject.filter[attr.key] = {
        priority: 0,
        order: 1,
        isFloat: attr.isFloat
      };
    }
    return initObject;
  });

  useEffect(() => {
    const init = initialize();
    setInitState(init);
  }, []);

  const [initState, setInitState] = useState(initialize());

  filter = filter || initState;

  const render_item_method = (target, project) => {
    const preview = `${URLS.target}${target.title}/${URL_TOKENS.target_access_string}/${project.target_access_string}`;
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
        <TableCell
          align="left"
          style={{ minWidth: '100px', padding: '0px 10px 0px 0px', margin: '0px', padding: '0px' }}
        >
          <Link to={preview}>
            <div>{target.title}</div>
          </Link>
        </TableCell>
        <TableCell
          align="left"
          style={{ minWidth: '100px', padding: '0px 10px 0px 0px', margin: '0px', padding: '0px' }}
        >
          <div>{project.target_access_string} </div>
        </TableCell>
        <TableCell
          align="left"
          style={{ minWidth: '100px', padding: '0px 10px 0px 0px', margin: '0px', padding: '0px' }}
        >
          {sgcUploaded.includes(target.title) && (
            <a href={sgcUrl} target="new">
              Open SGC summary
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
              >
                <Chat />
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
      const newFilter = { ...filter };
      newFilter.priorityOrder = [
        'target',
        'targetAccessString'
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
        ['target', undefined],
        ['targetAccessString', undefined]
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
      newFilter.filter.target.order = 1;
      newFilter.filter.targetAccessString.order = 1;
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
  let targetListWindowHeight = windowHeight / 26 - 6;
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
      searchedByTargetAccessString = projectsList.filter(item =>
        item.target_access_string.toLowerCase().includes(searchString.toLowerCase())
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
      ...searchedNHits
    ];
    const uniqueArray = Array.from(new Set(mergedSearchList.map(JSON.stringify))).map(JSON.parse);
    dispatch(setListOfFilteredTargets(uniqueArray));
  };

  /* if (filteredListOfTargets === undefined) {
    filteredListOfTargets = [...listOfAllTarget];
  }*/

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
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareTargetAsc)));
          setSortSwitch(sortSwitch + 1);
        } else if (sortSwitch === offsetTarget + 2) {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareTargetAsc)));
          setSortSwitch(0);
        } else {
          dispatch(setListOfFilteredTargets([...listOfAllTarget].sort(compareTargetDesc)));
          setSortSwitch(offsetTarget + 1);
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
              <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedTarget}
                    onChange={() => setCheckedTarget(!checkedTarget)}
                  />
                  Target
                </Typography>
                <IconButton style={{ padding: '0px' }} onClick={() => handleHeaderSort('target')}>
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
              </TableCell>
              <TableCell style={{ padding: '0px' }}>
                <Typography variant="title">
                  <input
                    type="checkbox"
                    style={{ verticalAlign: 'middle' }}
                    checked={checkedTargetAccessString}
                    onChange={() => setCheckedTargetAccessString(!checkedTargetAccessString)}
                  />
                  Target access string
                </Typography>
              </TableCell>

              <TableCell style={{ padding: '0px' }}>SGC</TableCell>
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
              filteredListOfTargets !== undefined ? filteredListOfTargets : target_id_list,
              projectsList
            ).map(data => render_item_method(data.target, data.project))}
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
