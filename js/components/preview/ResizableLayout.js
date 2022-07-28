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
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(),
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
const resizerWidth = 20;

export const ResizableLayout = ({ gridRef, hideProjects, showHistory, onShowHistoryChange, nglPortal }) => {
  const classes = useStyles();

  const sidesOpen = useSelector(state => state.previewReducers.viewerControls.sidesOpen);

  const [lhsWidth, setLhsWidth] = useState(sidesOpen.LHS ? sideWidth : 0);
  const [rhsWidth, setRhsWidth] = useState(sidesOpen.RHS ? sideWidth : 0);

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
            const adjustedX = x - gridRect.x - 10;
            const containerWidth = gridRect.width - rhsWidth - resizerWidth * 2;

            return clamp(adjustedX, 0, containerWidth);
          } else {
            const adjustedX = x - gridRect.x - 10;
            const containerWidth = gridRect.width - resizerWidth;

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
            const adjustedX = x - gridRect.x - (lhsWidth + resizerWidth) - 10;
            const containerWidth = gridRect.width - lhsWidth - resizerWidth * 2;

            return containerWidth - clamp(adjustedX, 0, containerWidth);
          } else {
            const adjustedX = x - gridRect.x - 10;
            const containerWidth = gridRect.width - resizerWidth;

            return containerWidth - clamp(adjustedX, 0, containerWidth);
          }
        } else {
          return 0;
        }
      });
    },
    [gridRef, lhsWidth, sidesOpen.LHS]
  );

  return (
    <div className={classes.root}>
      {sidesOpen.LHS && (
        <>
          <div className={classes.lhs} style={{ width: lhsWidth }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <TagDetails />
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <TagSelector />
            </div>
            <div style={{ flex: 2, minHeight: 0 }}>
              <HitNavigator hideProjects={hideProjects} />
            </div>
          </div>
          <Resizer onResize={onLhsResize} />
        </>
      )}
      <div
        className={classes.nglColumn}
        style={{
          width: `calc(100% - ${lhsWidth}px - ${rhsWidth}px - ${sidesOpen.LHS * resizerWidth}px - ${sidesOpen.RHS *
            resizerWidth}px)`
        }}
      >
        <div className={classes.ngl}>
          <OutPortal node={nglPortal} />
        </div>
        <div>
          <ViewerControls />
        </div>
        {showHistory && (
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
