import React, { memo, useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Typography, makeStyles, IconButton, Tooltip } from '@material-ui/core';
import { Panel } from '../../../common/Surfaces/Panel';
import TagDetailRow from './tagDetailRow';
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
    justifyContent: 'space-between'
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
    gridTemplateColumns: '1fr 35px 75px min-content 20px min-content auto',
    alignItems: 'center',
    gap: 1
  },
  columnLabel: {
    display: 'flex',
    marginLeft: theme.spacing(2)
  },
  categoryLabel: {
    justifySelf: 'flex-end'
  },
  creatorLabel: {
    gridColumn: '5',
    justifySelf: 'flex-end'
  },
  dateLabel: {
    gridColumn: '6'
  },
  search: {
    width: 140
  },
  columnTitle: {
    fontSize: theme.typography.pxToRem(13)
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

  const preTagList = useSelector(state => state.selectionReducers.tagList);
  const [tagList, setTagList] = useState([]);

  const [searchString, setSearchString] = useState(null);
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
      headerActions={[<SearchField className={classes.search} id="search-tag-details" onChange={setSearchString} />]}
    >
      <div ref={elementRef} className={classes.containerExpanded}>
        <div className={classes.container}>
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
        <NewTagDetailRow moleculesToEditIds={moleculesToEditIds} moleculesToEdit={moleculesToEdit} />
      </div>
    </Panel>
  );
});

export default TagDetails;
