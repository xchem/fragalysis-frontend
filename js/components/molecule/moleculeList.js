/**
 * Created by abradley on 14/03/2018.
 */

import { Grid, Chip, Tooltip, makeStyles, CircularProgress, Divider, Typography } from '@material-ui/core';
import { FilterList } from '@material-ui/icons';
import React, { useMemo, useState, useEffect, memo, useRef, Fragment } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../../reducers/api/apiActions';
import * as listType from '../listTypes';
import * as nglLoadActions from '../../reducers/ngl/nglActions';
import MoleculeView from './moleculeView';
import { MoleculeListSortFilterDialog, filterMolecules, getAttrDefinition } from './moleculeListSortFilterDialog';
import { getJoinedMoleculeList } from './molecules_helpers';
import { getUrl, loadFromServer } from '../../utils/genericList';
import InfiniteScroll from 'react-infinite-scroller';
import { Button } from '../common/Inputs/Button';
import { Panel } from '../common/Surfaces/Panel';
import { ComputeHeight } from '../../utils/computeHeight';

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
    // - 48px for title and header items
    height: `calc(100% - ${theme.spacing(6)}px)`,
    width: `calc(100% - ${theme.spacing(1) / 2}px)`
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
    mol_group_list,
    setFilterItemsHeight,
    filterItemsHeight
  }) => {
    const classes = useStyles();
    const list_type = listType.MOLECULE;
    const oldUrl = useRef('');
    const setOldUrl = url => {
      oldUrl.current = url;
    };
    const [sortDialogOpen, setSortDialogOpen] = useState(false);
    const [filterSettings, setFilterSettings] = useState();
    const moleculesPerPage = 5;
    // toto nemozem riesit cez current ale klasicky cez state. Je tu ale zadrhel, ze sa to velakrat prerenderuje a ten
    // stav sa tym padom strati
    const [currentPage, setCurrentPage] = useState(0);
    const imgHeight = 80;
    const imgWidth = 100;

    const isActiveFilter = !!(filterSettings || {}).active;
    const filterRef = useRef();

    let joinedMoleculeLists = useMemo(
      () => getJoinedMoleculeList({ object_selection, cached_mol_lists, mol_group_list }),
      [object_selection, cached_mol_lists, mol_group_list]
    );

    // Reset Infinity scroll
    useEffect(() => {
      setCurrentPage(0);
    }, [object_selection]);

    const handleDialog = () => open => setSortDialogOpen(open);

    const handleDialogClose = filter => {
      setFilterSettings(filter);
      handleDialog(false)();
    };

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
        throw error;
      });
    }, [list_type, mol_group_on, setObjectList, target_on, setCachedMolLists, cached_mol_lists]);

    const listItemOffset = (currentPage + 1) * moleculesPerPage;
    const currentMolecules = joinedMoleculeLists.slice(0, listItemOffset);
    const canLoadMore = listItemOffset < joinedMoleculeLists.length;

    return (
      <ComputeHeight
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
              onClick={handleDialog(!sortDialogOpen)}
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
              handleClose={handleDialogClose}
              molGroupSelection={object_selection}
              cachedMolList={cached_mol_lists}
              filterSettings={filterSettings}
            />
          )}
          <div ref={filterRef}>
            {isActiveFilter && (
              <Fragment>
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
              </Fragment>
            )}
          </div>
          <Grid container direction="column" className={classes.container} style={{ height: height }}>
            <Grid item container direction="row" alignItems="center" className={classes.gridItemHeader}>
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
            </Grid>
            {currentMolecules.length > 0 && (
              <div className={classes.gridItemList}>
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
              </div>
            )}
          </Grid>
        </Panel>
      </ComputeHeight>
    );
  }
);

function mapStateToProps(state) {
  return {
    group_type: state.apiReducers.present.group_type,
    target_on: state.apiReducers.present.target_on,
    mol_group_on: state.apiReducers.present.mol_group_on,
    object_selection: state.apiReducers.present.mol_group_selection,
    object_list: state.apiReducers.present.molecule_list,
    cached_mol_lists: state.apiReducers.present.cached_mol_lists,
    mol_group_list: state.apiReducers.present.mol_group_list
  };
}
const mapDispatchToProps = {
  setObjectList: apiActions.setMoleculeList,
  setCachedMolLists: apiActions.setCachedMolLists,
  deleteObject: nglLoadActions.deleteObject,
  loadObject: nglLoadActions.loadObject
};
MoleculeList.displayName = 'MoleculeList';
export default connect(mapStateToProps, mapDispatchToProps)(MoleculeList);
