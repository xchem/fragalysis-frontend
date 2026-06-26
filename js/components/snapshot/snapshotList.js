import React, { memo, useRef, useEffect, useCallback, useState, useMemo, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Typography, makeStyles, Grid, FormControlLabel, CircularProgress } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import { Panel } from '../common';
import { setPanelsExpanded } from '../../reducers/layout/actions';
import { layoutItemNames } from '../../reducers/layout/constants';
import SearchField from '../common/Components/SearchField';
import SnapshotView from './SnapshotView';
import { api } from '../../utils/api';
import { base_url } from '../routes/constants';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { setDontShowShareSnapshot, setListOfSnapshots } from './redux/actions';
import { saveAndShareSnapshot } from './redux/dispatchActions';
import { NglContext } from '../nglView/nglProvider';
import { TOAST_LEVELS } from '../toast/constants';
import { addToastMessage } from '../../reducers/selection/actions';
import InfiniteScroll from 'react-infinite-scroller';
import RichTooltip from '../tooltip/RichTooltip';
import { TooltipPathProvider } from '../tooltip/TooltipPathContext';

export const heightOfBody = '172px';
export const defaultHeaderPadding = 15;

const useStyles = makeStyles(theme => ({
  containerExpanded: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
    width: '100%'
  },
  snapshotListWrapper: {
    overflowY: 'auto',
    overflowX: 'hidden',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  newSnapshotButtonContainer: {
    borderTop: '1px solid #ddd',
    backgroundColor: '#fafafa',
    padding: '1px',
    display: 'flex',
    justifyContent: 'center'
  },
  newSnapshotButton: {
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '1px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%'
  },
  plusSign: {
    fontSize: '2rem',
    lineHeight: 1,
    marginBottom: '1px',
    marginLeft: '10px',
    marginRight: '40px'
  },
  sortButton: {
    width: '0.75em',
    height: '0.75em'
  },
  container: {
    display: 'grid',
    gridTemplateColumns: '210px 65px 80px min-content 20px min-content auto',
    alignItems: 'center',
    gap: 1
  },
  columnLabel: {
    display: 'flex'
  },
  dateLabel: {
    gridColumn: '6'
  },
  search: {
    width: 140,
    paddingTop: '5px'
  },
  columnTitle: {
    fontSize: theme.typography.pxToRem(13)
  },
  columnTitleGrid: {
    fontSize: theme.typography.pxToRem(13),
    position: 'center'
  },
  headerContainer: {
    marginRight: '0px',
    paddingLeft: '0px',
    paddingRight: '0px',
    justifyContent: 'flex-end',
    minHeight: '100%',
    alignItems: 'center',
    flexWrap: 'nowrap'
  },
  contColButton: {
    minWidth: 'fit-content',
    paddingLeft: theme.spacing(1) / 2,
    paddingRight: theme.spacing(1) / 2,
    paddingBottom: 1,
    paddingTop: 1,
    fontWeight: 'bold',
    fontSize: 9,
    borderRadius: 0,
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
    border: '1px solid',
    '&:hover': {
      backgroundColor: theme.palette.primary.light
    },
    '&:disabled': {
      borderRadius: 0,
      borderColor: '#FFFFFF'
    }
  },
  contColButtonSelected: {
    minWidth: 'fit-content',
    paddingLeft: theme.spacing(1) / 2,
    paddingRight: theme.spacing(1) / 2,
    paddingBottom: 1,
    paddingTop: 1,
    fontWeight: 'bold',
    fontSize: 9,
    borderRadius: 0,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.main
    }
  }
}));

const SnapshotList = memo(({ expandHandler = null }) => {
  const classes = useStyles();
  const ref = useRef(null);
  const dispatch = useDispatch();

  const snapshotPerPage = 5;

  const { nglViewList } = useContext(NglContext);

  const targetId = useSelector(state => state.apiReducers.target_on);
  const snapshotsCreatedThisSession = useSelector(state => state.snapshotReducers.snapshotsCreatedThisSession);

  const [onlyMine, setOnlyMine] = useState(true);
  const [showStarredByOthers, setShowStarredByOthers] = useState(true);
  const [searchString, setSearchString] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsToBeDisplayed, setItemsToBeDisplayed] = useState([]);

  const [resetInfiniteScroll, setResetInfiniteScroll] = useState(false);

  const listOfSnapshots = useSelector(state => state.snapshotReducers.listOfSnapshots);

  useEffect(() => {
    if (!listOfSnapshots && targetId) {
      api({ url: `${base_url}/api/snapshots/?target=${targetId}` })
        .then(response => {
          dispatch(setListOfSnapshots(response.data.results || []));
        })
        .catch(error => {
          console.error('Error fetching snapshots:', error);
        });
    }
  }, [dispatch, listOfSnapshots, targetId]);

  useEffect(() => {
    setResetInfiniteScroll(true);
  }, [onlyMine, showStarredByOthers, searchString]);

  const filteredSnapshotList = useMemo(() => {
    if (!listOfSnapshots || listOfSnapshots.length === 0) return [];

    let result = listOfSnapshots;

    if (searchString && searchString.trim() !== '') {
      result = result.filter(snapshot => snapshot.title.toLowerCase().includes(searchString.toLowerCase()));
    }

    if (onlyMine) {
      if (DJANGO_CONTEXT.pk) {
        result = result.filter(
          snapshot => snapshot?.author?.id === DJANGO_CONTEXT.pk || snapshot?.additional_info?.starred
        );
      } else {
        result = result.filter(
          snapshot => snapshot?.additional_info?.starred || snapshotsCreatedThisSession.some(id => id === snapshot.id)
        );
      }
    }

    if (!showStarredByOthers) {
      if (DJANGO_CONTEXT.pk) {
        result = result.filter(
          snapshot => !snapshot?.additional_info?.starred || snapshot?.author?.id === DJANGO_CONTEXT.pk
        );
      } else {
        result = result.filter(
          snapshot => !snapshot?.additional_info?.starred || snapshotsCreatedThisSession.some(id => id === snapshot.id)
        );
      }
    }

    result = result.filter(
      snapshot =>
        !snapshot?.additional_info?.hasOwnProperty('visibleInUI') ||
        (snapshot?.additional_info?.hasOwnProperty('visibleInUI') && snapshot?.additional_info?.visibleInUI === true)
    );

    //we need to filter out also auxiliary download snapshots
    result = result.filter(snapshot => !snapshot?.data?.includes('downloadTag'));

    return result;
  }, [listOfSnapshots, searchString, onlyMine, snapshotsCreatedThisSession, showStarredByOthers]);

  const orderedSnapshotList = useMemo(() => {
    let starred = filteredSnapshotList.filter(snapshot => snapshot?.additional_info?.starred) || [];
    let nonStarred = filteredSnapshotList.filter(snapshot => !snapshot?.additional_info?.starred) || [];

    starred.sort((a, b) => a.title.localeCompare(b.title));
    nonStarred.sort((a, b) => a.title.localeCompare(b.title));

    return [...starred, ...nonStarred];
  }, [filteredSnapshotList]);

  useEffect(() => {
    if (resetInfiniteScroll) {
      setResetInfiniteScroll(false);
      setCurrentPage(0);
      setItemsToBeDisplayed(orderedSnapshotList.slice(0, snapshotPerPage));
    }
  }, [orderedSnapshotList, resetInfiniteScroll]);

  const onlyMineSwitched = useCallback(() => {
    setOnlyMine(!onlyMine);
  }, [onlyMine]);

  const hideStarredSwitched = useCallback(() => {
    setShowStarredByOthers(!showStarredByOthers);
  }, [showStarredByOthers]);

  const handleCreateSnapshotClick = () => {
    dispatch(setDontShowShareSnapshot(true));
    dispatch(saveAndShareSnapshot(nglViewList, false, {}))
      .then(() => {
        dispatch(addToastMessage({ text: `Snapshot was successfully created.`, level: TOAST_LEVELS.SUCCESS }));
      })
      .catch(() => {
        dispatch(addToastMessage({ text: `Failed to create snapshot.`, level: TOAST_LEVELS.ERROR }));
      });
  };

  const loadNextSnapshots = () => {
    setCurrentPage(currentPage + 1);
    setItemsToBeDisplayed(orderedSnapshotList.slice(0, (currentPage + 1) * snapshotPerPage));
  };

  const listItemOffset = currentPage * snapshotPerPage;
  const canLoadMore =
    listItemOffset < orderedSnapshotList?.length ||
    (listItemOffset > orderedSnapshotList?.length && itemsToBeDisplayed?.length < orderedSnapshotList?.length);

  const SnapshotSwitch = withStyles({
    switchBase: {
      color: blue[300],
      '&$checked': {
        color: blue[500]
      },
      '&$checked + $track': {
        backgroundColor: blue[500]
      }
    },
    checked: {},
    track: {}
  })(Switch);

  return (
    <Panel
      ref={ref}
      hasHeader
      hasExpansion
      defaultExpanded
      title="Snapshots"
      onExpandChange={useCallback(
        expanded => {
          dispatch(setPanelsExpanded(layoutItemNames.SNAPSHOT_LIST, expanded));
          expandHandler && expandHandler(expanded);
        },
        [dispatch, expandHandler]
      )}
      headerActions={[
        <Grid container className={classes.headerContainer} key="snapshot-header">
          <Grid item xs={4}>
            <RichTooltip path="mySnapshots">
              <FormControlLabel
                className={classes.tagModeSwitch}
                classes={{ label: classes.tagLabel }}
                control={
                  <SnapshotSwitch
                    id="snapshot-only-mine-switch"
                    disabled={false /*!DJANGO_CONTEXT.pk && snapshotsCreatedThisSession.length === 0*/}
                    checked={onlyMine}
                    onChange={onlyMineSwitched}
                    name="snapshot-filtering-mine"
                    size="small"
                  />
                }
                label={'Only mine'}
              />
            </RichTooltip>
          </Grid>
          <Grid item xs={4}>
            <RichTooltip path="showStarred">
              <FormControlLabel
                className={classes.tagModeSwitch}
                classes={{ label: classes.tagLabel }}
                control={
                  <SnapshotSwitch
                    id="snapshot-show-starred-switch"
                    checked={showStarredByOthers}
                    onChange={hideStarredSwitched}
                    name="snapshot-filtering-starred"
                    size="small"
                  />
                }
                label={'Show starred'}
              />
            </RichTooltip>
          </Grid>
          <Grid item xs={4}>
            <SearchField
              className={classes.search}
              id="search-snapshot"
              onChange={setSearchString}
              placeholder={'Search snapshots'}
            />
          </Grid>
        </Grid>
      ]}
    >
      <div className={classes.containerExpanded}>
        <div className={classes.snapshotListWrapper}>
          <InfiniteScroll
            pageStart={0}
            loadMore={loadNextSnapshots}
            hasMore={canLoadMore}
            loader={
              <div className="loader" key={0}>
                <Grid
                  container
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  className={classes.paddingProgress}
                >
                  <CircularProgress />
                </Grid>
              </div>
            }
            useWindow={false}
          >
            {itemsToBeDisplayed &&
              itemsToBeDisplayed.map(snapshot => (
                <Grid item style={{ width: '100%' }} key={snapshot.id}>
                  <TooltipPathProvider path="snapshot">
                    <SnapshotView snapshot={snapshot} />
                  </TooltipPathProvider>
                </Grid>
              ))}
          </InfiniteScroll>
        </div>
        <div className={classes.newSnapshotButtonContainer}>
          <RichTooltip path="createSnapshot">
            <div
              id="new-snapshot-button-id"
              className={classes.newSnapshotButton}
              onClick={handleCreateSnapshotClick}
            >
              <div className={classes.plusSign}>+</div>
              <Typography variant="body2">Click to create new snapshot</Typography>
            </div>
          </RichTooltip>
        </div>
      </div>
    </Panel>
  );
});

export default SnapshotList;
