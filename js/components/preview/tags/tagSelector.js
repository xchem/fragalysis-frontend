import React, { memo, useRef, useEffect, useCallback } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { Panel } from '../../common/Surfaces/Panel';
import { Button } from '../../common/Inputs/Button';
import TagCategory from './tagCategory';
import { useDispatch } from 'react-redux';
import { clearTagSelection } from './redux/dispatchActions';

export const heightOfBody = '164px';

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
  }
}));

const TagSelector = memo(({ handleHeightChange }) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const ref = useRef(null);

  const handleClearButton = () => {
    dispatch(clearTagSelection());
  };

  const handleResize = useCallback(
    event => {
      console.log('resize');
      handleHeightChange(ref.current.offsetHeight);
    },
    [handleHeightChange]
  );

  useEffect(() => {
    const element = ref.current?.childNodes[1]?.childNodes[0];

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
  }, [ref, handleResize]);

  function checkResize(mutations) {
    const el = mutations[0].target;
    const w = el.clientWidth;
    const h = el.clientHeight;

    const isChange = mutations
      .map(m => `${m.oldValue}`)
      .some(prev => prev.indexOf(`width: ${w}px`) === -1 || prev.indexOf(`height: ${h}px`) === -1);

    if (!isChange) {
      return;
    }
    const event = new CustomEvent('resize', { detail: { width: w, height: h } });
    el.dispatchEvent(event);
  }

  return (
    <Panel
      ref={ref}
      hasHeader
      hasExpansion
      defaultExpanded
      title="Hit cluster selector"
      headerActions={[
        <Button
          onClick={() => handleClearButton()}
          disabled={false}
          color="inherit"
          variant="text"
          size="small"
          startIcon={<Delete />}
          data-id="clearTagSelectionButton"
        >
          Clear selection
        </Button>
      ]}
      onExpandChange={expand => {
        if (ref.current && handleHeightChange instanceof Function) {
          handleHeightChange(ref.current.offsetHeight);
        }
      }}
    >
      <Grid className={classes.containerExpanded}>
        <TagCategory />
      </Grid>
    </Panel>
  );
});

export default TagSelector;
