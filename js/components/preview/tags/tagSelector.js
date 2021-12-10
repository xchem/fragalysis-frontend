import React, { memo, useRef, useEffect, useCallback, useState } from 'react';
import { Grid, makeStyles, Switch, FormControlLabel, Tooltip } from '@material-ui/core';
import { Delete, DoneAll } from '@material-ui/icons';
import { Panel } from '../../common/Surfaces/Panel';
import { Button } from '../../common/Inputs/Button';
import TagCategory from './tagCategory';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllTags, clearAllTags } from './redux/dispatchActions';
import { setTagFilteringMode } from '../../../reducers/selection/actions';
import { withStyles } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';

export const heightOfBody = '164px';
export const defaultHeaderPadding = 15;

const useStyles = makeStyles(theme => ({
  containerExpanded: {
    height: heightOfBody,
    display: 'flex',
    flexDirection: 'column',
    resize: 'vertical',
    overflow: 'auto',
    width: '100%'
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
    width: 132 // Should be adjusted if a label for the switch changes
  }
}));

const TagSelector = memo(({ handleHeightChange }) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const ref = useRef(null);
  const elementRef = useRef(null);
  const [headerPadding, setheaderPadding] = useState(defaultHeaderPadding);
  const [elementHeight, setElementHeight] = useState(0);
  const tagMode = useSelector(state => state.selectionReducers.tagFilteringMode);
  const [selectAll, setSelectAll] = useState(true);

  const handleSelectionButton = () => {
    if (selectAll) {
      dispatch(selectAllTags());
    } else {
      dispatch(clearAllTags());
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      element.addEventListener('resize', handleResize);
      const observer = new MutationObserver(checkResize);
      observer.observe(element, { attributes: true, attributeOldValue: true, attributeFilter: ['style'] });
    }

    return () => {
      if (element) {
        element.removeEventListener('resize', handleResize);
      }
    };
  }, [elementRef, handleResize, checkResize]);

  useEffect(() => {
    handleScroll(elementRef.current?.childNodes[1], headerPadding);
  }, [elementRef, handleScroll, headerPadding, elementHeight]);

  const handleResize = useCallback(
    event => {
      //console.log('resize ' + ref.current.clientHeight);
      handleHeightChange(ref.current.offsetHeight);
    },
    [handleHeightChange]
  );

  const handleScroll = useCallback(
    (el, h) => {
      if (el) {
        const hasVerticalScrollbar = el.scrollHeight > el.clientHeight;
        if (!hasVerticalScrollbar) {
          if (h !== 0) {
            setheaderPadding(0);
          }
        } else {
          if (h !== defaultHeaderPadding) {
            setheaderPadding(defaultHeaderPadding);
          }
        }
      }
    },
    [setheaderPadding]
  );

  const checkResize = useCallback(
    mutations => {
      const el = mutations[0].target;
      const w = el.clientWidth;
      const h = el.clientHeight;

      if (elementHeight !== h) {
        setElementHeight(h);

        const event = new CustomEvent('resize', { detail: { width: w, height: h } });
        el.dispatchEvent(event);
      }
    },
    [elementHeight]
  );

  const filteringModeSwitched = () => {
    dispatch(setTagFilteringMode(!tagMode));
  };
  const TagModeSwitch = withStyles({
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
      title="Hit List Filter"
      headerActions={[
        <Tooltip
          title={
            tagMode
              ? 'Any compound labelled with any of the active tags will be selected'
              : 'Only the compounds labelled with all the active tags will be selected'
          }
        >
          <FormControlLabel
            className={classes.tagModeSwitch}
            control={<TagModeSwitch checked={tagMode} onChange={filteringModeSwitched} name="tag-filtering-mode" />}
            label={tagMode ? 'Intersection' : 'Union'}
          />
        </Tooltip>,
        <Button
          onClick={() => handleSelectionButton()}
          disabled={false}
          color="inherit"
          variant="text"
          size="small"
          startIcon={<DoneAll />}
          data-id="tagSelectionButton"
        >
          {selectAll ? 'Select all tags' : 'Unselect'}
        </Button>
      ]}
      onExpandChange={expand => {
        if (ref.current && handleHeightChange instanceof Function) {
          handleHeightChange(ref.current.offsetHeight);
        }
      }}
    >
      <Grid ref={elementRef} className={classes.containerExpanded}>
        <TagCategory headerPadding={headerPadding} />
      </Grid>
    </Panel>
  );
});

export default TagSelector;
