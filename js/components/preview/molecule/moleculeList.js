/**
 * Created by abradley on 14/03/2018.
 */

import { Grid, Chip, Tooltip, makeStyles, CircularProgress, Divider, Typography } from '@material-ui/core';
import { FilterList } from '@material-ui/icons';
import React, { useState, useEffect, memo, useRef } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../../../reducers/api/actions';
import * as listType from '../../../constants/listTypes';
import { deleteObject, loadObject } from '../../../reducers/ngl/dispatchActions';
import MoleculeView from './moleculeView';
import { MoleculeListSortFilterDialog, filterMolecules, getAttrDefinition } from './moleculeListSortFilterDialog';
import { getJoinedMoleculeList } from './redux/selectors';
import { getUrl, loadFromServer } from '../../../utils/genericList';
import InfiniteScroll from 'react-infinite-scroller';
import { Button } from '../../common/Inputs/Button';
import { Panel } from '../../common/Surfaces/Panel';
import { ComputeSize } from '../../../utils/computeSize';
import { setSortDialogOpen } from './redux/actions';

const useStyles = makeStyles(theme => ({
  container: {
    height: '100%',
    width: 'inherit',
    color: theme.palette.black
  },
  gridItemHeader: {
    height: '32px',
    fontSize: '8px',
    color: '#7B7B7B'
  },
  gridItemHeaderVert: {
    transform: 'rotate(-90deg)',
    height: 'fit-content'
  },
  gridItemHeaderHoriz: {
    width: 'fit-content'
  },
  gridItemList: {
    overflow: 'auto',
    height: `calc(100% - ${theme.spacing(6)}px)`
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    minWidth: 'unset'
  },
  buttonActive: {
    border: 'solid 1px #009000',
    color: '#009000',
    '&:hover': {
      backgroundColor: '#E3EEDA',
      borderColor: '#003f00',
      color: '#003f00'
    }
  },
  paddingProgress: {
    padding: theme.spacing(1)
  },
  filterSection: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  filterTitle: {
    transform: 'rotate(-90deg)'
  },
  molHeader: {
    padding: theme.spacing(1) / 4,
    backgroundColor: 'red'
  }
}));

const MoleculeList = memo(
  ({
    object_selection,
    height,
    cached_mol_lists,
    target_on,
    mol_group_on,
    setObjectList,
    setCachedMolLists,
    setFilterItemsHeight,
    filterItemsHeight,
    getJoinedMoleculeList,
    filterSettings,
    sortDialogOpen,
    setSortDialogOpen
  }) => {
    const classes = useStyles();
    const list_type = listType.MOLECULE;
    const oldUrl = useRef('');
    const [state, setState] = useState();
    const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);
    const setOldUrl = url => {
      oldUrl.current = url;
    };
    const moleculesPerPage = 5;
    const [currentPage, setCurrentPage] = useState(0);
    const imgHeight = 130;
    const imgWidth = 150;

    const isActiveFilter = !!(filterSettings || {}).active;

    const filterRef = useRef();

    let joinedMoleculeLists = getJoinedMoleculeList;

    // Reset Infinity scroll
    useEffect(() => {
      setCurrentPage(0);
    }, [object_selection]);

    if (isActiveFilter) {
      joinedMoleculeLists = filterMolecules(joinedMoleculeLists, filterSettings);
    } else {
      joinedMoleculeLists.sort((a, b) => a.site - b.site);
    }

    const loadNextMolecules = () => {
      setCurrentPage(currentPage + 1);
    };

    useEffect(() => {
      loadFromServer({
        url: getUrl({ list_type, target_on, mol_group_on }),
        setOldUrl: url => setOldUrl(url),
        old_url: oldUrl.current,
        list_type,
        setObjectList,
        setCachedMolLists,
        mol_group_on,
        cached_mol_lists
      }).catch(error => {
        setState(() => {
          throw error;
        });
      });
    }, [list_type, mol_group_on, setObjectList, target_on, setCachedMolLists, cached_mol_lists]);

    const listItemOffset = (currentPage + 1) * moleculesPerPage;
    const currentMolecules = joinedMoleculeLists.slice(0, listItemOffset);
    const canLoadMore = listItemOffset < joinedMoleculeLists.length;

    useEffect(() => {
      if (isActiveFilter === false) {
        setFilterItemsHeight(0);
      }
    }, [isActiveFilter, setFilterItemsHeight]);

    return (
      <ComputeSize
        componentRef={filterRef.current}
        setHeight={setFilterItemsHeight}
        height={filterItemsHeight}
        forceCompute={isActiveFilter}
      >
        <Panel
          hasHeader
          title="Hit navigator"
          headerActions={[
            <Button
              onClick={event => {
                if (sortDialogOpen === false) {
                  setSortDialogAnchorEl(event.currentTarget);
                  setSortDialogOpen(true);
                } else {
                  setSortDialogAnchorEl(null);
                  setSortDialogOpen(false);
                }
              }}
              color={'inherit'}
              disabled={!(object_selection || []).length}
              variant="text"
              startIcon={<FilterList />}
              size="small"
            >
              sort/filter
            </Button>
          ]}
        >
          {sortDialogOpen && (
            <MoleculeListSortFilterDialog
              open={sortDialogOpen}
              anchorEl={sortDialogAnchorEl}
              molGroupSelection={object_selection}
              cachedMolList={cached_mol_lists}
              filterSettings={filterSettings}
            />
          )}
          <div ref={filterRef}>
            {isActiveFilter && (
              <>
                <div className={classes.filterSection}>
                  <Grid container spacing={1}>
                    <Grid item xs={1} container alignItems="center">
                      <Typography variant="subtitle2" className={classes.filterTitle}>
                        Filters
                      </Typography>
                    </Grid>
                    <Grid item xs={11}>
                      <Grid container direction="row" justify="flex-start" spacing={1}>
                        {filterSettings.priorityOrder.map(attr => (
                          <Grid item key={`Mol-Tooltip-${attr}`}>
                            <Tooltip
                              title={`${filterSettings.filter[attr].minValue}-${filterSettings.filter[attr].maxValue} ${
                                filterSettings.filter[attr].order === 1 ? '\u2191' : '\u2193'
                              }`}
                              placement="top"
                            >
                              <Chip
                                size="small"
                                label={attr}
                                style={{ backgroundColor: getAttrDefinition(attr).color }}
                              />
                            </Tooltip>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                </div>
                <Divider />
              </>
            )}
          </div>
          <Grid
            container
            direction="column"
            justify="flex-start"
            className={classes.container}
            style={{ height: height }}
          >
            {/*<Grid item container direction="row" alignItems="center" className={classes.gridItemHeader}>
              <Grid item className={classes.gridItemHeaderVert}>
                site
              </Grid>
              <Grid item className={classes.gridItemHeaderVert}>
                cont.
              </Grid>
              <Grid
                item
                xs={3}
                container
                direction="column"
                justify="center"
                alignItems="center"
                className={classes.gridItemHeaderHoriz}
              >
                <Grid item>code</Grid>
                <Grid item>status</Grid>
              </Grid>
              <Grid item xs={5}>
                image
              </Grid>
              <Grid item xs={2}>
                properties
              </Grid>
            </Grid>*/}
            <Grid item>
              <Grid container justify="flex-start" direction="row" className={classes.molHeader} wrap="nowrap">
                Header of molecules
              </Grid>
            </Grid>
            {currentMolecules.length > 0 && (
              <Grid item className={classes.gridItemList}>
                <InfiniteScroll
                  pageStart={0}
                  loadMore={loadNextMolecules}
                  hasMore={canLoadMore}
                  loader={
                    <div className="loader" key={0}>
                      <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                        className={classes.paddingProgress}
                      >
                        <CircularProgress />
                      </Grid>
                    </div>
                  }
                  useWindow={false}
                >
                  {currentMolecules.map(data => (
                    <MoleculeView key={data.id} height={imgHeight} width={imgWidth} data={data} />
                  ))}
                </InfiniteScroll>
              </Grid>
            )}
          </Grid>
        </Panel>
      </ComputeSize>
    );
  }
);

function mapStateToProps(state) {
  return {
    group_type: state.apiReducers.group_type,
    target_on: state.apiReducers.target_on,
    mol_group_on: state.apiReducers.mol_group_on,
    object_selection: state.selectionReducers.mol_group_selection,
    object_list: state.apiReducers.molecule_list,
    cached_mol_lists: state.apiReducers.cached_mol_lists,
    getJoinedMoleculeList: getJoinedMoleculeList(state),
    filterSettings: state.selectionReducers.filterSettings,
    sortDialogOpen: state.previewReducers.molecule.sortDialogOpen
  };
}
const mapDispatchToProps = {
  setObjectList: apiActions.setMoleculeList,
  setCachedMolLists: apiActions.setCachedMolLists,
  deleteObject,
  loadObject,
  setSortDialogOpen
};
MoleculeList.displayName = 'MoleculeList';
export default connect(mapStateToProps, mapDispatchToProps)(MoleculeList);
