import { makeStyles } from '@material-ui/core';
import { clamp } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { OutPortal } from 'react-reverse-portal';
import HitNavigator from './molecule/hitNavigator';
import { ProjectHistoryPanel } from './projectHistoryPanel';
import { Resizer } from './resizer';
import { RHS } from './rhs';
import TagDetails from './tags/details/tagDetails';
import TagSelector from './tags/tagSelector';
import { ViewerControls } from './viewerControls';
import { setResizableLayout, setActualRhsWidth } from '../../reducers/selection/actions';

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

const sideWidth = 505;
let panelHeight = 0;
const resizerSize = 20;
let screenHeight = 0;
const tagDetailGridLayoutHeight = 135;
const tagDetailListLayoutHeight = 145;
const listTagHeight = 19;

export const ResizableLayout = ({ gridRef, hideProjects, showHistory, onShowHistoryChange, nglPortal }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const sidesOpen = useSelector(state => state.previewReducers.viewerControls.sidesOpen);

  const [lhsWidth, setLhsWidth] = useState(sidesOpen.LHS ? sideWidth : 0);
  const [rhsWidth, setRhsWidth] = useState(sidesOpen.RHS ? sideWidth : 0);

  const preTagList = useSelector(state => state.apiReducers.tagList);
  const [tagDetailsHeight, setTagDetailsHeight] = useState();
  const [hitNavigatorHeight, setHitNavigatorHeight] = useState(panelHeight * 2);
  const tagDetailView = useSelector(state => state.selectionReducers.tagDetailView);

  const tags = useSelector(state => state.apiReducers.tagList);

  let maxLengthTagDetail = 0;
  for (let tagNumber = 0; tagNumber < tags.length; tagNumber++) {
    maxLengthTagDetail =
      tags[tagNumber].tag.length > maxLengthTagDetail ? tags[tagNumber].tag.length : maxLengthTagDetail;
  }

  const oneRowHeight = 19;
  const twoRowHeight = 30;
  const threeRowHeight = 48;
  const oneRowTagLength = 15;
  const moreRowTagLength = 30;
  const defaultTagDetailColumnNumber = 5;

  const absoluteMaxTagLength =
    maxLengthTagDetail > oneRowTagLength
      ? maxLengthTagDetail > moreRowTagLength
        ? threeRowHeight
        : twoRowHeight
      : oneRowHeight;

  const tagDetailListHeight = preTagList.length * listTagHeight + tagDetailListLayoutHeight;
  const tagDetailGridHeight =
    Math.ceil(preTagList.length / defaultTagDetailColumnNumber) * absoluteMaxTagLength + tagDetailGridLayoutHeight;

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
          let adjustedX = 0;
          let containerWidth = 0;
          if (sidesOpen.LHS) {
            adjustedX = x - gridRect.x - (lhsWidth + resizerSize) - resizerSize / 2;
            containerWidth = gridRect.width - lhsWidth - resizerSize * 2;
          } else {
            adjustedX = x - gridRect.x - resizerSize / 2;
            containerWidth = gridRect.width - resizerSize;
          }
          const actualWidth = containerWidth - clamp(adjustedX, 0, containerWidth);
          dispatch(setActualRhsWidth(actualWidth));

          // min and max width
          if (actualWidth < 480) {
            return 480;
          } else if (actualWidth > 740) {
            return 740;
          } else {
            return actualWidth;
          }
        } else {
          return 0;
        }
      });
    },
    [gridRef, lhsWidth, sidesOpen.LHS, dispatch]
  );

  if (gridRef.current !== null && gridRef.current !== undefined) {
    if (gridRef.current?.elementRef.current !== null) {
      if (gridRef.current?.elementRef.current.firstChild !== null) {
        const gridRect = gridRef.current?.elementRef.current.firstChild.getBoundingClientRect();
        screenHeight = gridRect.height;
      }
    }
  }

  const onTagDetailsResize = useCallback(
    (_, y) => {
      dispatch(setResizableLayout(true));
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
    [gridRef, hitNavigatorHeight, dispatch]
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
            <div style={{ height: tagDetailsHeight, overflow: 'auto' }}>
              <TagDetails />
            </div>
            <Resizer orientation="horizontal" onResize={onTagDetailsResize} />
            {/* hide section Hit List Filter(LHS) - task #576
            <div style={{ height: `calc(100% - ${tagDetailsHeight + hitNavigatorHeight + 2 * resizerSize}px)` }}>
              <TagSelector />
             </div>
            <Resizer orientation="horizontal" onResize={onHitListResize} />
            */}
            <div
              style={{
                height:
                  tagDetailsHeight === undefined
                    ? tagDetailView?.tagDetailView === true || tagDetailView === true
                      ? screenHeight - tagDetailGridHeight + 'px'
                      : screenHeight - tagDetailListHeight + 'px'
                    : screenHeight - tagDetailsHeight - 20 + 'px'
              }}
            >
              <HitNavigator hideProjects={hideProjects} />
            </div>
          </div>
          <Resizer onResize={onLhsResize} />
        </>
      )}
      <div
        className={classes.nglColumn}
        style={{
          width: `calc(100% - ${lhsWidth}px - ${rhsWidth}px - ${sidesOpen.LHS * resizerSize}px - ${sidesOpen.RHS *
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
