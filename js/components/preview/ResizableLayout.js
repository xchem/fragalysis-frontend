import { makeStyles } from '@material-ui/core';
import { clamp } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { OutPortal } from 'react-reverse-portal';
import HitNavigator from './molecule/hitNavigator';
import { ProjectHistoryPanel } from './projectHistoryPanel';
import { Resizer } from './resizer';
import { RHS } from './rhs';
import TagDetails from './tags/details/tagDetails';
import TagSelector from './tags/tagSelector';
import { ViewerControls } from './viewerControls';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    height: '100%'
  },
  lhs: {
    height: '100%'
  },
  nglColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(),
    height: '100%'
  },
  ngl: {
    flex: 1,
    minHeight: 0
  }
}));

const sideWidth = 500;
const panelHeight = 250;
const resizerSize = 20;

export const ResizableLayout = ({ gridRef, hideProjects, showHistory, onShowHistoryChange, nglPortal }) => {
  const classes = useStyles();

  const sidesOpen = useSelector(state => state.previewReducers.viewerControls.sidesOpen);

  const [lhsWidth, setLhsWidth] = useState(sidesOpen.LHS ? sideWidth : 0);
  const [rhsWidth, setRhsWidth] = useState(sidesOpen.RHS ? sideWidth : 0);

  const [tagDetailsHeight, setTagDetailsHeight] = useState(panelHeight);
  const [hitNavigatorHeight, setHitNavigatorHeight] = useState(panelHeight * 2);

  useEffect(() => {
    if (sidesOpen.LHS) {
      setLhsWidth(sideWidth);
    } else {
      setLhsWidth(0);
    }

    if (sidesOpen.RHS) {
      setRhsWidth(sideWidth);
    } else {
      setRhsWidth(0);
    }
  }, [sidesOpen.LHS, sidesOpen.RHS]);

  const onLhsResize = useCallback(
    x => {
      setLhsWidth(() => {
        const gridRect = gridRef.current?.elementRef.current.firstChild.getBoundingClientRect();

        if (gridRect) {
          if (sidesOpen.RHS) {
            // This basically normalizes the X coord to begin in the container taking into
            // consideration half the size of the resizer
            const adjustedX = x - gridRect.x - resizerSize / 2;
            // Available container width
            const containerWidth = gridRect.width - rhsWidth - resizerSize * 2;

            return clamp(adjustedX, 0, containerWidth);
          } else {
            const adjustedX = x - gridRect.x - resizerSize / 2;
            const containerWidth = gridRect.width - resizerSize;

            return clamp(adjustedX, 0, containerWidth);
          }
        } else {
          return 0;
        }
      });
    },
    [gridRef, rhsWidth, sidesOpen.RHS]
  );

  const onRhsResize = useCallback(
    x => {
      setRhsWidth(() => {
        const gridRect = gridRef.current?.elementRef.current.firstChild.getBoundingClientRect();

        if (gridRect) {
          if (sidesOpen.LHS) {
            const adjustedX = x - gridRect.x - (lhsWidth + resizerSize) - resizerSize / 2;
            const containerWidth = gridRect.width - lhsWidth - resizerSize * 2;

            return containerWidth - clamp(adjustedX, 0, containerWidth);
          } else {
            const adjustedX = x - gridRect.x - resizerSize / 2;
            const containerWidth = gridRect.width - resizerSize;

            return containerWidth - clamp(adjustedX, 0, containerWidth);
          }
        } else {
          return 0;
        }
      });
    },
    [gridRef, lhsWidth, sidesOpen.LHS]
  );

  const onTagDetailsResize = useCallback(
    (_, y) => {
      setTagDetailsHeight(() => {
        const gridRect = gridRef.current?.elementRef.current.firstChild.getBoundingClientRect();

        if (gridRect) {
          const adjustedY = y - gridRect.y - resizerSize / 2;
          const containerHeight = gridRect.height - hitNavigatorHeight - resizerSize * 2;

          return clamp(adjustedY, 0, containerHeight);
        } else {
          return 0;
        }
      });
    },
    [gridRef, hitNavigatorHeight]
  );

  const onHitListResize = useCallback(
    (_, y) => {
      setHitNavigatorHeight(() => {
        const gridRect = gridRef.current?.elementRef.current.firstChild.getBoundingClientRect();

        if (gridRect) {
          const adjustedY = y - gridRect.y - (tagDetailsHeight + resizerSize) - resizerSize / 2;
          const containerHeight = gridRect.height - tagDetailsHeight - resizerSize * 2;

          return containerHeight - clamp(adjustedY, 0, containerHeight);
        } else {
          return 0;
        }
      });
    },
    [gridRef, tagDetailsHeight]
  );

  return (
    <div className={classes.root}>
      {sidesOpen.LHS && (
        <>
          <div className={classes.lhs} style={{ width: lhsWidth }}>
            <div style={{ height: tagDetailsHeight }}>
              <TagDetails />
            </div>
            {
            /* hide section Hit List Filter(LHS) - task #576 
            <Resizer orientation="horizontal" onResize={onTagDetailsResize} />
            <div style={{ height: `calc(100% - ${tagDetailsHeight + hitNavigatorHeight + 2 * resizerSize}px)` }}>
              <TagSelector />
             </div> */
             }
            <Resizer orientation="horizontal" onResize={onHitListResize} />
            <div style={{ height: hitNavigatorHeight }}>
              <HitNavigator hideProjects={hideProjects} />
            </div>
          </div>
          <Resizer onResize={onLhsResize} />
        </>
      )}
      <div
        className={classes.nglColumn}
        style={{
          width: `calc(1000% - ${lhsWidth}px - ${rhsWidth}px - ${sidesOpen.LHS * resizerSize}px - ${sidesOpen.RHS *
            resizerSize}px)`
        }}
      >
        <div className={classes.ngl}>
          <OutPortal node={nglPortal} />
        </div>
        <div>
          <ViewerControls />
        </div>
        {!hideProjects && (
          <div>
            <ProjectHistoryPanel showFullHistory={onShowHistoryChange} />
          </div>
        )}
      </div>
      {sidesOpen.RHS && (
        <>
          <Resizer onResize={onRhsResize} />
          <div style={{ width: rhsWidth }}>
            <RHS hideProjects={hideProjects} />
          </div>
        </>
      )}
    </div>
  );
};
