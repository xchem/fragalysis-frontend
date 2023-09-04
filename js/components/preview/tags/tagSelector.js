import React, { memo, useRef, useCallback, useState } from 'react';
import { Grid, makeStyles, Switch, FormControlLabel, Tooltip } from '@material-ui/core';
import { Panel } from '../../common/Surfaces/Panel';
import { Button } from '../../common/Inputs/Button';
import TagCategory from './tagCategory';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllTags, clearAllTags } from './redux/dispatchActions';
import {
  setTagFilteringMode,
  setDisplayAllMolecules,
  setDisplayUntaggedMolecules
} from '../../../reducers/selection/actions';
import { withStyles } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import { setPanelsExpanded } from '../../../reducers/layout/actions';
import { layoutItemNames } from '../../../reducers/layout/constants';

export const heightOfBody = '164px';
export const defaultHeaderPadding = 15;

const useStyles = makeStyles(theme => ({
  containerExpanded: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: -theme.spacing()
  },
  containerCollapsed: {
    height: 0
  },
  nglViewItem: {
    paddingLeft: theme.spacing(1) / 2
  },
  selectorItem: {
    height: '100%'
  },
  tagModeSwitch: {
    width: 132, // Should be adjusted if a label for the switch changes
    // justify: 'flex-end',
    marginRight: '0px',
    marginLeft: '1px'
  },
  tagLabel: {
    fontSize: theme.typography.pxToRem(13)
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
  headerButton: {
    '& .MuiButton-root': {
      minWidth: '0px'
    }
  },
  headerButtonInactive: {
    backgroundColor: 'primary',
    textTransform: 'none',
    '& .MuiButton-root': {
      minWidth: '0px'
    },
    '& .MuiButton-containedPrimary': {
      backgroundColor: 'primary'
    },
    '& .MuiButton-label': {
      paddingTop: '0px'
    },
    '&:hover': {
      // backgroundColor: theme.palette.primary.light
      backgroundColor: 'primary'
    }
  },
  headerButtonActive: {
    backgroundColor: theme.palette.primary.semidark,
    paddingTop: '0px',
    paddingBottom: '0px',
    textTransform: 'none',
    '& .MuiButton-root': {
      minWidth: '0px'
    },
    '& .MuiButton-containedPrimary': {
      backgroundColor: theme.palette.primary.semidark
    },
    '& .MuiButton-label': {
      paddingTop: '0px'
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.semidark
    }
  }
}));

const TagSelector = memo(() => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const ref = useRef(null);
  const elementRef = useRef(null);
  const tagMode = useSelector(state => state.selectionReducers.tagFilteringMode);
  const [selectAll, setSelectAll] = useState(true);
  const displayAllMolecules = useSelector(state => state.selectionReducers.displayAllMolecules);
  const displayUntaggedMolecules = useSelector(state => state.selectionReducers.displayUntaggedMolecules);

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

  const filteringModeSwitched = () => {
    dispatch(setTagFilteringMode(!tagMode));
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

  return (
    <Panel
      ref={ref}
      hasHeader
      hasExpansion
      defaultExpanded
      onExpandChange={useCallback(expanded => dispatch(setPanelsExpanded(layoutItemNames.HIT_LIST_FILTER, expanded)), [
        dispatch
      ])}
      title="Hit List Filter"
      headerActions={[
        <Grid container item direction="row" className={classes.headerContainer}>
          <Grid item>
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
          <Grid item>
            <Button
              onClick={() => handleShowUntaggedMoleculesButton()}
              disabled={false}
              color="inherit"
              variant="text"
              size="small"
              data-id="showUntaggedHitsButton"
              className={displayUntaggedMolecules ? classes.headerButtonActive : classes.headerButtonInactive}
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
              className={displayAllMolecules ? classes.headerButtonActive : classes.headerButtonInactive}
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
              className={selectAll ? classes.headerButtonInactive : classes.headerButtonActive}
            >
              Select all tags
            </Button>
          </Grid>
        </Grid>
      ]}
    >
      <Grid ref={elementRef} className={classes.containerExpanded}>
        <TagCategory />
      </Grid>
    </Panel>
  );
});

export default TagSelector;
