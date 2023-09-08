import React, { memo, useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Typography, makeStyles, IconButton, Tooltip, Grid, FormControlLabel } from '@material-ui/core';
import { Panel } from '../../../common/Surfaces/Panel';
import TagDetailRow from './tagDetailRow';
import TagGridRows from './tagGridRows';
import NewTagDetailRow from './newTagDetailRow';
import {
  compareTagsAsc,
  compareTagsDesc,
  compareTagsByCategoryAsc,
  compareTagsByCategoryDesc,
  compareTagsByCreatorAsc,
  compareTagsByCreatorDesc,
  compareTagsByDateAsc,
  compareTagsByDateDesc
} from '../utils/tagUtils';
import { UnfoldMore, KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import { getMoleculeForId } from '../redux/dispatchActions';
import classNames from 'classnames';
import SearchField from '../../../common/Components/SearchField';
import { setPanelsExpanded } from '../../../../reducers/layout/actions';
import { layoutItemNames } from '../../../../reducers/layout/constants';
import { withStyles } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import {
  setTagFilteringMode,
  setDisplayAllMolecules,
  setDisplayUntaggedMolecules,
  setTagDetailView
} from '../../../../reducers/selection/actions';
import { selectAllTags, clearAllTags } from '../redux/dispatchActions';
import { Button } from '../../../common/Inputs/Button';

export const heightOfBody = '172px';
export const defaultHeaderPadding = 15;

const useStyles = makeStyles(theme => ({
  containerExpanded: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    height: '100%',
    width: '100%',
    marginTop: -theme.spacing(),
    justifyContent: 'space-between',
    paddingTop: '5px'
  },
  tagListWrapper: {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: '100%'
  },
  newTagRow: {
    maxHeight: '42px'
  },
  sortButton: {
    width: '0.75em',
    height: '0.75em'
  },
  container: {
    display: 'grid',
    gridTemplateColumns: '220px 65px 80px min-content 20px min-content auto',
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
  tagModeSwitch: {
    width: 32, // Should be adjusted if a label for the switch changes
    // justify: 'flex-end',
    marginRight: '90px',
    marginLeft: '1px'
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
      // color: theme.palette.primary.contrastText
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
      // color: theme.palette.black
    }
  }
}));

/**
 * TagDetails is a wrapper panel for tags summary, their editing and creating new ones
 */
const TagDetails = memo(() => {
  const classes = useStyles();
  const ref = useRef(null);
  const elementRef = useRef(null);
  const dispatch = useDispatch();
  const [sortSwitch, setSortSwitch] = useState(0);

  const preTagList = useSelector(state => state.apiReducers.tagList);
  const tagMode = useSelector(state => state.selectionReducers.tagFilteringMode);
  const displayAllMolecules = useSelector(state => state.selectionReducers.displayAllMolecules);
  const displayUntaggedMolecules = useSelector(state => state.selectionReducers.displayUntaggedMolecules);
  let tagDetailView = useSelector(state => state.selectionReducers.tagDetailView);
  const resizableLayout = useSelector(state => state.selectionReducers.resizableLayout);

  const [tagList, setTagList] = useState([]);
  const [selectAll, setSelectAll] = useState(true);
  const [searchString, setSearchString] = useState(null);

  tagDetailView = tagDetailView?.tagDetailView === undefined ? tagDetailView : tagDetailView.tagDetailView;

  const filteredTagList = useMemo(() => {
    if (searchString) {
      return tagList.filter(tag => tag.tag.toLowerCase().includes(searchString.toLowerCase()));
    }
    return tagList;
  }, [searchString, tagList]);

  useEffect(() => {
    setTagList([...preTagList].sort(compareTagsAsc));
    return () => {
      setTagList([]);
    };
  }, [preTagList]);

  const moleculesToEditIds = useSelector(state => state.selectionReducers.moleculesToEdit);
  const moleculesToEdit =
    moleculesToEditIds &&
    moleculesToEditIds.length > 0 &&
    !(moleculesToEditIds.length === 1 && moleculesToEditIds[0] === null)
      ? moleculesToEditIds.map(id => dispatch(getMoleculeForId(id)))
      : [];

  /*const moleculesToEditIds = useSelector(state => state.selectionReducers.moleculesToEdit);
  const [moleculesToEdit, setMoleculesToEdit] = useState([]);
  useEffect(() => {
    if (moleculesToEditIds && moleculesToEditIds.length > 0 && !(moleculesToEditIds.length === 1 && moleculesToEditIds[0] === null)) {
      setMoleculesToEdit(moleculesToEditIds.map(id => dispatch(getMoleculeForId(id))));
    } else {
      setMoleculesToEdit([]);
    }
    return () => { setMoleculesToEdit([]) };
  }, [moleculesToEditIds, dispatch]);*/

  const offsetName = 10;
  const offsetCategory = 20;
  const offsetCreator = 30;
  const offsetDate = 40;
  const handleHeaderSort = useCallback(
    type => {
      switch (type) {
        case 'name':
          if (sortSwitch === offsetName + 1) {
            // change direction
            setTagList([...tagList].sort(compareTagsAsc));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetName + 2) {
            // reset sort
            setTagList([...tagList].sort(compareTagsAsc));
            setSortSwitch(0);
          } else {
            // start sorting
            setTagList([...tagList].sort(compareTagsDesc));
            setSortSwitch(offsetName + 1);
          }
          break;
        case 'category':
          if (sortSwitch === offsetCategory + 1) {
            // change direction
            setTagList([...tagList].sort(compareTagsByCategoryAsc));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetCategory + 2) {
            // reset sort
            setTagList([...tagList].sort(compareTagsAsc));
            setSortSwitch(0);
          } else {
            // start sorting
            setTagList([...tagList].sort(compareTagsByCategoryDesc));
            setSortSwitch(offsetCategory + 1);
          }
          break;
        case 'creator':
          if (sortSwitch === offsetCreator + 1) {
            // change direction
            setTagList([...tagList].sort(compareTagsByCreatorAsc));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetCreator + 2) {
            // reset sort
            setTagList([...tagList].sort(compareTagsAsc));
            setSortSwitch(0);
          } else {
            // start sorting
            setTagList([...tagList].sort(compareTagsByCreatorDesc));
            setSortSwitch(offsetCreator + 1);
          }
          break;
        case 'date':
          if (sortSwitch === offsetDate + 1) {
            // change direction
            setTagList([...tagList].sort(compareTagsByDateAsc));
            setSortSwitch(sortSwitch + 1);
          } else if (sortSwitch === offsetDate + 2) {
            // reset sort
            setTagList([...tagList].sort(compareTagsAsc));
            setSortSwitch(0);
          } else {
            // start sorting
            setTagList([...tagList].sort(compareTagsByDateDesc));
            setSortSwitch(offsetDate + 1);
          }
          break;
        default:
          // tagList = tagList.sort(compareTagsAsc);
          break;
      }
    },
    [sortSwitch, tagList]
  );

  const filteringModeSwitched = () => {
    dispatch(setTagFilteringMode(!tagMode));
  };

  const viewModeSwitched = () => {
    dispatch(setTagDetailView(!tagDetailView));
  };

  const TagModeSwitch = withStyles({
    // '& .MuiFormControlLabel-root': {
    //   marginLeft: '0px',
    //   marginRight: '0px'
    // },
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

  const handleAllMoleculesButton = () => {
    dispatch(setDisplayUntaggedMolecules(false));
    dispatch(setDisplayAllMolecules(!displayAllMolecules));
  };

  const handleShowUntaggedMoleculesButton = () => {
    dispatch(setDisplayAllMolecules(false));
    setSelectAll(true);
    dispatch(clearAllTags());
    dispatch(setDisplayUntaggedMolecules(!displayUntaggedMolecules));
  };

  const handleSelectionButton = () => {
    dispatch(setDisplayUntaggedMolecules(false));
    if (selectAll) {
      dispatch(selectAllTags());
    } else {
      dispatch(clearAllTags());
    }
    setSelectAll(!selectAll);
  };

  return (
    <Panel
      ref={ref}
      hasHeader
      hasExpansion
      defaultExpanded
      title="Tag Details"
      onExpandChange={useCallback(expanded => dispatch(setPanelsExpanded(layoutItemNames.TAG_DETAILS, expanded)), [
        dispatch
      ])}
      headerActions={[
        <Grid xs={12} container className={classes.headerContainer}>
          <Grid item xs={4}>
            <Tooltip
              title={
                tagMode
                  ? 'Intersection: Only the compounds labelled with all the active tags will be selected'
                  : 'Union: Any compound labelled with any of the active tags will be selected'
              }
            >
              <FormControlLabel
                className={classes.tagModeSwitch}
                classes={{ label: classes.tagLabel }}
                control={
                  <TagModeSwitch
                    checked={tagMode}
                    onChange={filteringModeSwitched}
                    name="tag-filtering-mode"
                    size="small"
                  />
                }
                label={tagMode ? 'Intersection' : 'Union'}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={4}>
            <Tooltip title={tagDetailView ? 'Show Tag detail list with detail info' : 'Show Tag detail grid'}>
              <FormControlLabel
                className={classes.tagModeSwitch}
                classes={{ label: classes.tagLabel }}
                control={
                  <TagModeSwitch
                    checked={tagDetailView}
                    onChange={viewModeSwitched}
                    name="tag-filtering-mode"
                    size="small"
                  />
                }
                label={tagDetailView ? 'Grid' : 'List'}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={4}>
            <SearchField className={classes.search} id="search-tag-details" onChange={setSearchString} />
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
      ]}
    >
      <div>
        <Grid style={{ paddingLeft: '70px' }} container item rowSpacing={1} spacing={2}>
          <Grid item>
            <Button
              onClick={() => handleShowUntaggedMoleculesButton()}
              disabled={false}
              color="inherit"
              variant="text"
              size="small"
              data-id="showUntaggedHitsButton"
              className={displayUntaggedMolecules ? classes.contColButton : classes.contColButtonSelected}
            >
              Show untagged hits
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => handleAllMoleculesButton()}
              disabled={false}
              color="inherit"
              variant="text"
              size="small"
              data-id="showAllHitsButton"
              className={displayAllMolecules ? classes.contColButton : classes.contColButtonSelected}
            >
              Show all hits
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => handleSelectionButton()}
              disabled={false}
              color="inherit"
              variant="text"
              size="small"
              data-id="tagSelectionButton"
              className={selectAll ? classes.contColButton : classes.contColButtonSelected}
            >
              Select all tags
            </Button>
          </Grid>
        </Grid>
      </div>
      <div ref={elementRef} className={classes.containerExpanded}>
        {tagDetailView ? (
          <>
            <div className={classes.container} id="tagName">
              {/* START grid view */}
              {/* tag name */}
              <div className={classes.columnLabel}>
                <Typography className={classes.columnTitleGrid} variant="tagName">
                  Tag name
                </Typography>
                <IconButton size="small" onClick={() => handleHeaderSort('name')}>
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
              </div>
            </div>

            <Grid container rowSpacing={0} spacing={0} style={{ marginBottom: 'auto' }}>
              {filteredTagList &&
                filteredTagList.map((tag, idx) => {
                  return (
                    <Grid
                      item
                      key={idx}
                      rowSpacing={5}
                      style={{
                        verticalAlign: 'bottom',
                        display: 'contents',
                        justifyContent: 'center',
                        height: '100%',
                        alignItems: 'center'
                      }}
                    >
                      <TagGridRows
                        tag={tag}
                        moleculesToEditIds={moleculesToEditIds}
                        moleculesToEdit={moleculesToEdit}
                        key={tag.id}
                      />
                    </Grid>
                  );
                })}
            </Grid>
          </>
        ) : (
          <div className={classes.container} id="tagName">
            {/* tag name */}
            <div className={classes.columnLabel}>
              <Typography className={classes.columnTitle} variant="subtitle1">
                Tag name
              </Typography>
              <IconButton size="small" onClick={() => handleHeaderSort('name')}>
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
            </div>

            {/* category */}
            <div className={classNames(classes.columnLabel, classes.categoryLabel)}>
              <Typography className={classes.columnTitle} variant="subtitle1">
                Category
              </Typography>
              <IconButton size="small" onClick={() => handleHeaderSort('category')}>
                <Tooltip title="Sort" className={classes.sortButton}>
                  {[1, 2].includes(sortSwitch - offsetCategory) ? (
                    sortSwitch % offsetCategory < 2 ? (
                      <KeyboardArrowDown />
                    ) : (
                      <KeyboardArrowUp />
                    )
                  ) : (
                    <UnfoldMore />
                  )}
                </Tooltip>
              </IconButton>
            </div>

            {/* creator */}
            <div className={classNames(classes.columnLabel, classes.creatorLabel)}>
              <Typography className={classes.columnTitle} variant="subtitle1">
                Creator
              </Typography>
              <IconButton size="small" onClick={() => handleHeaderSort('creator')}>
                <Tooltip title="Sort" className={classes.sortButton}>
                  {[1, 2].includes(sortSwitch - offsetCreator) ? (
                    sortSwitch % offsetCreator < 2 ? (
                      <KeyboardArrowDown />
                    ) : (
                      <KeyboardArrowUp />
                    )
                  ) : (
                    <UnfoldMore />
                  )}
                </Tooltip>
              </IconButton>
            </div>

            {/* date */}
            <div className={classNames(classes.columnLabel, classes.dateLabel)}>
              <Typography className={classes.columnTitle} variant="subtitle1">
                Date
              </Typography>
              <IconButton size="small" onClick={() => handleHeaderSort('date')}>
                <Tooltip title="Sort" className={classes.sortButton}>
                  {[1, 2].includes(sortSwitch - offsetDate) ? (
                    sortSwitch % offsetDate < 2 ? (
                      <KeyboardArrowDown />
                    ) : (
                      <KeyboardArrowUp />
                    )
                  ) : (
                    <UnfoldMore />
                  )}
                </Tooltip>
              </IconButton>
            </div>
            <div />

            {filteredTagList &&
              filteredTagList.map((tag, idx) => {
                return (
                  <TagDetailRow
                    tag={tag}
                    moleculesToEditIds={moleculesToEditIds}
                    moleculesToEdit={moleculesToEdit}
                    key={tag.id}
                  />
                );
              })}
          </div>
        )}
        <div style={{ paddingBottom: resizableLayout === true ? '17px' : '0px' }}>
          <NewTagDetailRow moleculesToEditIds={moleculesToEditIds} moleculesToEdit={moleculesToEdit} />
        </div>
      </div>
    </Panel>
  );
});

export default TagDetails;
