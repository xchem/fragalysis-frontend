/**
 * Created by abradley on 14/03/2018.
 */

import { Grid, withStyles, Chip, Tooltip, Button } from '@material-ui/core';
import React, { useMemo, useState, useEffect, memo, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../actions/apiActions';
import * as listType from './listTypes';
import * as nglLoadActions from '../actions/nglLoadActions';
import MoleculeView from './moleculeView';
import BorderedView from './borderedView';
import classNames from 'classnames';
import { MoleculeListSortFilterDialog, filterMolecules, getAttrDefinition } from './moleculeListSortFilterDialog';
import { getJoinedMoleculeList } from '../utils/molecules_helpers';
import { getUrl, loadFromServer } from '../utils/genericList';
import InfiniteScroll from 'react-infinite-scroll-component';

const styles = theme => ({
  container: {
    height: '100%',
    width: '100%',
    color: 'black'
  },
  gridItemHeader: {
    height: '32px',
    fontSize: '8px',
    color: '#7B7B7B'
  },
  gridItemHeaderVert: {
    width: '24px',
    transform: 'rotate(-90deg)'
  },
  gridItemHeaderHoriz: {
    width: 'calc((100% - 48px) * 0.3)'
  },
  gridItemHeaderHorizWider: {
    width: 'calc((100% - 48px) * 0.4)'
  },
  gridItemList: {
    overflow: 'auto',
    // - 48px for title and header items
    height: 'calc(100% - 48px)'
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sortFilterButtonStyle: {
    textTransform: 'none',
    fontWeight: 'bold',
    fontSize: 'larger'
  },
  filtersRow: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  filterChip: {
    marginBottom: theme.spacing(1),
    fontWeight: 'bolder',
    fontSize: '1rem'
  },
  filterTooltip: {
    fontSize: '1rem'
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
  }
});

const MoleculeList = memo(
  ({
    classes,
    object_selection,
    height,
    cached_mol_lists,
    target_on,
    mol_group_on,
    setObjectList,
    setCachedMolLists,
    mol_group_list
  }) => {
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
    const currentMolecules = useRef([]);
    const currentPage = useRef(0);

    const imgHeight = 80;
    const imgWidth = 100;

    let joinedMoleculeLists = useMemo(
      () => getJoinedMoleculeList({ object_selection, cached_mol_lists, mol_group_list }),
      [object_selection, cached_mol_lists, mol_group_list]
    );

    const handleDialog = () => open => setSortDialogOpen(open);

    const handleDialogClose = filter => {
      setFilterSettings(filter);
      handleDialog(false)();
    };

    if (!!(filterSettings || {}).active) {
      joinedMoleculeLists = filterMolecules(joinedMoleculeLists, filterSettings);
    } else {
      joinedMoleculeLists.sort((a, b) => a.site - b.site);
    }

    const loadNextMolecules = useCallback(() => {
      const newPage = currentPage.current + 1;
      if (newPage * moleculesPerPage < joinedMoleculeLists.length) {
        currentMolecules.current = joinedMoleculeLists.slice(currentPage, moleculesPerPage);
        currentPage.current = newPage;
      } else {
        currentMolecules.current = [];
        currentPage.current = 0;
      }
    }, [joinedMoleculeLists, currentMolecules]);

    useEffect(() => {
      loadNextMolecules();
    }, [loadNextMolecules]);

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
      });
    }, [list_type, mol_group_on, setObjectList, target_on, setCachedMolLists, cached_mol_lists]);

    const titleRightElement = (
      <Button
        onClick={handleDialog(!sortDialogOpen)}
        className={classNames(classes.button, {
          [classes.buttonActive]: !!(filterSettings || {}).active
        })}
        disabled={!(object_selection || []).length}
      >
        <span className={classes.sortFilterButtonStyle}>sort/filter</span>
      </Button>
    );
    // console.log('render molecule list', mol_group_list);
    return (
      <div>
        {!!(filterSettings || {}).active && (
          <div>
            Filters:
            <br />
            <div className={classes.filtersRow}>
              {filterSettings.priorityOrder.map(attr => (
                <Tooltip
                  key={`Mol-Tooltip-${attr}`}
                  classes={{ tooltip: classes.filterTooltip }}
                  title={`${filterSettings.filter[attr].minValue}-${filterSettings.filter[attr].maxValue} ${
                    filterSettings.filter[attr].order === 1 ? '\u2191' : '\u2193'
                  }`}
                  placement="top"
                >
                  <Chip
                    size="small"
                    label={attr}
                    className={classes.filterChip}
                    style={{ backgroundColor: getAttrDefinition(attr).color }}
                  />
                </Tooltip>
              ))}
            </div>
          </div>
        )}
        <BorderedView title="hit navigator" rightElement={titleRightElement}>
          {sortDialogOpen && (
            <MoleculeListSortFilterDialog
              handleClose={handleDialogClose}
              molGroupSelection={object_selection}
              cachedMolList={cached_mol_lists}
              filterSettings={filterSettings}
            />
          )}
          <Grid container direction="column" className={classes.container} style={{ height: height }}>
            <Grid item container className={classes.gridItemHeader}>
              <Grid item className={classNames(classes.gridItemHeaderVert, classes.centered)}>
                site
              </Grid>
              <Grid item className={classNames(classes.gridItemHeaderVert, classes.centered)}>
                cont.
              </Grid>
              <Grid
                item
                container
                direction="column"
                justify="center"
                alignItems="center"
                className={classes.gridItemHeaderHoriz}
              >
                <Grid item>code</Grid>
                <Grid item>status</Grid>
              </Grid>
              <Grid item className={classNames(classes.gridItemHeaderHoriz, classes.centered)}>
                image
              </Grid>
              <Grid item className={classNames(classes.gridItemHeaderHorizWider, classes.centered)}>
                properties
              </Grid>
            </Grid>
            <Grid item container direction="column" wrap="nowrap" className={classes.gridItemList}>
              {joinedMoleculeLists.map(data => (
                <Grid item key={data.id}>
                  <MoleculeView height={imgHeight} width={imgWidth} data={data} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </BorderedView>
      </div>
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
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MoleculeList));
