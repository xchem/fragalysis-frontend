/**
 * Created by abradley on 13/03/2018.
 */

import React, { memo, useState, useEffect } from 'react';
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
import { getTargetProjectCombinations } from './redux/dispatchActions';
import { URL_TOKENS } from '../direct/constants';
import { setListOfFilteredTargets, setSortTargetDialogOpen, setListOfTargets } from './redux/actions';
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

const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 1600,
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
  const isTargetLoading = useSelector(state => state.targetReducers.isTargetLoading);
  const target_id_list = useSelector(state => state.apiReducers.target_id_list);
  const projectsList = useSelector(state => state.targetReducers.projects);
  const isLoadingListOfProjects = useSelector(state => state.projectReducers.isLoadingListOfProjects);

  let filteredListOfTargets = useSelector(state => state.targetReducers.listOfFilteredProject);

  const [sortSwitch, setSortSwitch] = useState(0);
  const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);
  const sortDialogOpen = useSelector(state => state.targetReducers.targetListFilterDialog);

  const listOfAllTargetsDefault = [];
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

  const filterClean = useSelector(state => state.projectReducers.filterClean);
  const filter = useSelector(state => state.selectionReducers.filter);

  const isActiveFilter = !!(filter || {}).active;

  let listOfAllTarget = [...listOfAllTargetsDefault];

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

  const render_item_method = (target, project) => {
    const preview = `${URLS.target}${target.title}/${URL_TOKENS.target_access_string}/${project.target_access_string}`;
    const sgcUrl = 'https://thesgc.org/sites/default/files/XChem/' + target.title + '/html/index.html';
    const sgcUploaded = ['BRD1A', 'DCLRE1AA', 'FALZA', 'FAM83BA', 'HAO1A', 'NUDT4A', 'NUDT5A', 'NUDT7A', 'PARP14A'];
    const discourseAvailable = isDiscourseAvailable();
    // const [discourseUrl, setDiscourseUrl] = useState();
    return (
      <ListItem key={`${target.id}_${project.id}`}>
        <Grid container direction="row" spacing={2}>
          <Grid item xs={4}>
            <Link
              to={preview}
              onClick={() => {
                // dispatch(setCurrentProject(project));
              }}
            >
              <ListItemText primary={target.title} />
            </Link>
          </Grid>
          <Grid item xs={4}>
            <ListItemText primary={project.target_access_string} />
          </Grid>
          <Grid item xs={4}>
            <Grid container direction="row" justify="center" alignItems="center">
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
            </Grid>
          </Grid>
        </Grid>
      </ListItem>
    );
  };

  // search from target list
  const handleSearch = event => {
    searchString = event.target.value;
    if (checkedId === true) {
      searchedById = listOfAllTarget.filter(item => item.id.toLowerCase().includes(searchString.toLowerCase()));
    } else {
      searchedById = [];
    }
    if (checkedTarget === true) {
      searchedByTarget = listOfAllTarget.filter(item =>
        item.target.title.toLowerCase().includes(searchString.toLowerCase())
      );
    } else {
      searchedByTarget = [];
    }
    if (checkedNumberOfChains === true) {
      searchedByNumberOfChains = listOfAllTarget.filter(item =>
        item.numberOfChains.toLowerCase().includes(searchString.toLowerCase())
      );
    } else {
      searchedByNumberOfChains = [];
    }
    if (checkedPrimaryChain === true) {
      searchedByPrimaryChain = listOfAllTarget.filter(item => {
        if (item.primaryChain !== null) {
          item.primaryChain.toLowerCase().includes(searchString.toLowerCase());
        }
      });
    } else {
      searchedByPrimaryChain = [];
    }
    if (checkedUniprot === true) {
      searchedByUniprot = listOfAllTarget.filter(item => {
        if (item.uniprot !== null) {
          item.uniprot.toLowerCase().includes(searchString.toLowerCase());
        }
      });
    } else {
      searchedByUniprot = [];
    }
    if (checkedRange === true) {
      searchedByRange = listOfAllTarget.filter(item => {
        if (item.range !== null) {
          item.range.toLowerCase().includes(searchString.toLowerCase());
        }
      });
    } else {
      searchedByRange = [];
    }
    if (checkedProteinName === true) {
      searchedByProteinName = listOfAllTarget.filter(item => {
        if (item.proteinName !== null) {
          item.proteinName.toLowerCase().includes(searchString.toLowerCase());
        }
      });
    } else {
      searchedByProteinName = [];
    }
    if (checkedGeneName === true) {
      searchedByGeneName = listOfAllTarget.filter(item => {
        if (item.geneName !== null) {
          item.geneName.toLowerCase().includes(searchString.toLowerCase());
        }
      });
    } else {
      searchedByGeneName = [];
    }
    if (checkedSpeciesId === true) {
      searchedBySpeciesId = listOfAllTarget.filter(item => {
        if (item.speciesId !== null) {
          item.speciesId.toLowerCase().includes(searchString.toLowerCase());
        }
      });
    } else {
      searchedBySpeciesId = [];
    }
    if (checkedSpecies === true) {
      searchedBySpecies = listOfAllTarget.filter(item => {
        if (item.species !== null) {
          item.species.toLowerCase().includes(searchString.toLowerCase());
        }
      });
    } else {
      searchedBySpecies = [];
    }
    if (checkedDomain === true) {
      searchedByDomain = listOfAllTarget.filter(item => {
        if (item.domain !== null) {
          item.domain.toLowerCase().includes(searchString.toLowerCase());
        }
      });
    } else {
      searchedByDomain = [];
    }
    if (checkedDateLastEdit === true) {
      searchedByDateLastEdit = listOfAllTarget.filter(item => {
        if (item.dateLastEdit !== null) {
          item.dateLastEdit.toLowerCase().includes(searchString.toLowerCase());
        }
      });
    } else {
      searchedByDateLastEdit = [];
    }
    if (checkedVersionId === true) {
      searchedVersionId = listOfAllTarget.filter(item => {
        if (item.versionId !== null) {
          item.versionId.toLowerCase().includes(searchString.toLowerCase());
        }
      });
    } else {
      searchedVersionId = [];
    }
    if (checkedECNumber === true) {
      searchedByECNumber = listOfAllTarget.filter(item => {
        if (item.ECNumber !== null) {
          item.ECNumber.toLowerCase().includes(searchString.toLowerCase());
        }
      });
    } else {
      searchedByECNumber = [];
    }
    if (checkedNHits === true) {
      searchedNHits = listOfAllTarget.filter(item => {
        if (item.NHits !== null) {
          item.NHits.toLowerCase().includes(searchString.toLowerCase());
        }
      });
    } else {
      searchedNHits = [];
    }

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
              if (sortDialogOpen === false) {
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
        isLoading={isTargetLoading}
      >
        <Table className={classes.table} aria-label="a dense table">
          <TableHead>
            <TableRow style={{ padding: '0px', paddingTop: '15px' }}>
              <TableCell style={{ padding: '0px' }}>
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
              </TableCell>
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
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>
        {sortDialogOpen && (
          <TargetListSortFilterDialog
            open={sortDialogOpen}
            anchorEl={sortDialogAnchorEl}
            filter={filter}
            setSortDialogAnchorEl={setSortDialogAnchorEl}
          />
        )}
      </Panel> /*}
            <TableBody>
              {projectsToUse.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(
                project => (
                  (tags = JSON.parse(project.tags)),
                  (
                    <TableRow hover key={project.id}>
                      <Tooltip title={`${project.description}`}>
                        <TableCell style={{padding: '0px'}}
                          component="th"
                          scope="row"
                          style={{ minWidth: '150px', padding: '0px 10px 0px 0px', margin: '0px' }}
                        >
                          <Link to={`${URLS.projects}${project.id}`}>
                            <div>{project.title === undefined ? project.title : project.title}</div>
                          </Link>
                        </TableCell>
                      </Tooltip>
                      <TableCell style={{padding: '0px'}} align="left" style={{ minWidth: '100px', padding: '0px 10px 0px 0px', margin: '0px' }}>
                        <Link to={`${URLS.target}${project.target}`}>
                          <div>{project.target.title === undefined ? project.target : project.target.title}</div>
                        </Link>
                      </TableCell>
                      <TableCell style={{padding: '0px'}} align="left" style={{ minWidth: '100px', padding: '5px 10px 0px 0px', margin: '0px' }}>
                        <div>{project.description}</div>
                      </TableCell>
                      <TableCell style={{padding: '0px'}} align="left" style={{ minWidth: '150px', padding: '0px 10px 0px 0px', margin: '0px' }}>
                        <div>{project.project?.target_access_string}</div>
                      </TableCell>
                      <TableCell style={{padding: '0px'}} align="left" style={{ padding: '0px 10px 0px 0px', margin: '0px' }}>
                        <div>
                          {tags.map((tag, index) => (
                            <Chip key={index} label={tag} className={classes.chip} />
                          ))}
                        </div>
                      </TableCell>
                      {/*<TableCell style={{padding: '0px'}} align="left">{project.author}</TableCell> */ /*}{
                      <TableCell style={{padding: '0px'}} align="left" style={{ minWidth: '150px', padding: '0px 10px 0px 0px', margin: '0px' }}>
                        <div>{project.project?.authority} </div>
                      </TableCell>
                      <TableCell style={{padding: '0px'}} align="left" style={{ minWidth: '150px', padding: '0px 10px 0px 0px', margin: '0px' }}>
                        <div>{moment(project.init_date).format('LLL')}</div>
                      </TableCell>
                      <TableCell style={{padding: '0px'}}
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
          </Table>*/

      /*
        {isTargetLoading === false && (
          <>
        {/* <Table className={classes.table} aria-label="a dense table">
            <TableHead>
              <TableRow>
                <div>
                  <TableCell style={{padding: '0px'}} style={{ paddingLeft: '0px' }}>
                    <div>
                      <Grid container>
                        <Typography variant="title">
                          <input
                            type="checkbox"
                            style={{ verticalAlign: 'middle' }}
                            checked={checkedName}
                            onChange={() => setCheckedName(!checkedName)}
                          />
                          Name
                        </Typography>
                         <IconButton style={{padding:'0px'}}onClick={() => handleHeaderSort('title')}>
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
                <TableCell style={{padding: '0px'}} align="left" style={{ verticalAlign: 'middle', padding: '0px' }}>
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
                     <IconButton style={{padding:'0px'}}onClick={() => handleHeaderSort('target')}>
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
                <TableCell style={{padding: '0px'}} align="left" style={{ verticalAlign: 'middle', padding: '0px' }}>
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
                     <IconButton style={{padding:'0px'}}onClick={() => handleHeaderSort('description')}>
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
                <TableCell style={{padding: '0px'}} align="left" style={{ verticalAlign: 'middle', padding: '0px' }}>
                  <Grid container>
                    <Typography variant="Target access string">
                      <input
                        type="checkbox"
                        style={{ verticalAlign: 'middle', padding: '0px' }}
                        checked={checkedTargetAccessString}
                        onChange={() => setCheckedTargetAccessString(!checkedTargetAccessString)}
                      />
                      Target access
                    </Typography>
                     <IconButton style={{padding:'0px'}}onClick={() => handleHeaderSort('targetAccessString')}>
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
                <TableCell style={{padding: '0px'}} align="left" style={{ verticalAlign: 'middle', padding: '0px' }}>
                  <Grid container>
                    <Typography variant="Tags">Tags</Typography>
                  </Grid>
                </TableCell>
                {/* <TableCell style={{padding: '0px'}} align="left">Author</TableCell> */
      /*
        </Panel> */
    );
  }
});
