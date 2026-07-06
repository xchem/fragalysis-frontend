import React, { useCallback, useEffect, useLayoutEffect, useState, useMemo, useRef } from 'react';
import { makeStyles } from '@material-ui/core';
import { clamp } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { OutPortal } from 'react-reverse-portal';

import { Resizer } from './resizer';
import SnapshotList from '../snapshot/snapshotList';
import { TagDetailsLHS } from './tags/details/tagDetailsLHS';
import { TagDetailsRHS } from './tags/details/tagDetailsRHS';
import HitNavigator from './molecule/hitNavigator';
import { ViewerControls } from './viewerControls';
import { setActualRhsWidth } from '../../reducers/selection/actions';
import { PlotlyView } from './plotly/plotlyView';
import { layoutItemNames } from '../../reducers/layout/constants';
import { TooltipPathProvider } from '../tooltip/TooltipPathContext';
import { PoseListRHS } from './molecule/poseListRHS';

const useStyles = makeStyles(theme => ({
  root: { display: 'flex', height: '100%', overflow: 'hidden' },
  lhs: { height: '100%', minWidth: SIDE_MIN_WIDTH, overflow: 'hidden' },
  rhs: { minWidth: SIDE_MIN_WIDTH, overflow: 'hidden' },
  nglColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(),
    height: '100%',
    minWidth: 0
  },
  ngl: { flex: 1, minHeight: 0 }
}));

const lhsInitialWidth = 540;
const rhsInitialWidth = 400;
const SIDE_MIN_WIDTH = 300;
const NGL_MIN_WIDTH = 160;
const RHS_MAX_WIDTH = 900;
const resizerSize = 20;

const MIN_HEIGHTS = {
  snapshot: 25,
  tagDetails: 25,
  hitNavigator: 120,
  plotlyView: 25,
  rhs: 120,
  rhsTagDetails: 25
};

export const ResizableLayout = ({ gridRef, nglPortal }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const sidesOpen = useSelector(s => s.previewReducers.viewerControls.sidesOpen);

  const [panelSuggestedHeights, setPanelSuggestedHeights] = useState([]);
  const [panelSuggestedRHSHeights, setPanelSuggestedRHSHeights] = useState([]);

  // If `height` is null/undefined, REMOVE any existing override for the panel.
  // Otherwise, upsert the numeric override.
  const mutateSuggestedHeight = useCallback((panelId, height) => {
    setPanelSuggestedHeights(prev => {
      if (height == null) {
        return prev.filter(item => item.id !== panelId);
      }
      const idx = prev.findIndex(item => item.id === panelId);
      const newItem = { id: panelId, suggestedHeight: height };
      return idx === -1 ? [...prev, newItem] : [...prev.slice(0, idx), newItem, ...prev.slice(idx + 1)];
    });
  }, []);
  const mutateSuggestedRHSHeight = useCallback((panelId, height) => {
    setPanelSuggestedRHSHeights(prev => {
      if (height == null) {
        return prev.filter(item => item.id !== panelId);
      }
      const idx = prev.findIndex(item => item.id === panelId);
      const newItem = { id: panelId, suggestedHeight: height };
      return idx === -1 ? [...prev, newItem] : [...prev.slice(0, idx), newItem, ...prev.slice(idx + 1)];
    });
  }, []);

  const panels = useMemo(
    () => [
      {
        id: 'snapshot',
        group: 'lhs',
        component: (
          <TooltipPathProvider path="snapshotList">
            <SnapshotList
              expandHandler={expanded => {
                if (expanded) {
                  mutateSuggestedHeight('snapshot', null);
                } else {
                  mutateSuggestedHeight('snapshot', MIN_HEIGHTS.snapshot);
                }
              }}
            />
          </TooltipPathProvider>
        ),
        min: MIN_HEIGHTS.snapshot,
        initialPct: 25
      },
      {
        id: 'tagDetails',
        group: 'lhs',
        component: (
          <TooltipPathProvider path="tagDetails">
            <TagDetailsLHS
              expandHandler={expanded => {
                if (expanded) {
                  mutateSuggestedHeight('tagDetails', null);
                } else {
                  mutateSuggestedHeight('tagDetails', 25);
                }
              }}
            />
          </TooltipPathProvider>
        ),
        min: MIN_HEIGHTS.tagDetails,
        initialPct: 20
      },
      {
        id: 'hitNavigator',
        group: 'lhs',
        component: <HitNavigator />,
        min: MIN_HEIGHTS.hitNavigator,
        initialPct: 55
      }
    ],
    [mutateSuggestedHeight]
  );

  const rhsPanels = useMemo(
    () => [
      {
        id: layoutItemNames.PLOTLY_VIEW,
        group: 'rhs',
        component: (
          <TooltipPathProvider path="plotlyView">
            <PlotlyView
              expandHandler={expanded => {
                if (expanded) {
                  mutateSuggestedRHSHeight(layoutItemNames.PLOTLY_VIEW, null);
                } else {
                  mutateSuggestedRHSHeight(layoutItemNames.PLOTLY_VIEW, 25);
                }
              }}
            />
          </TooltipPathProvider>
        ),
        min: MIN_HEIGHTS.plotlyView,
        initialPct: 20
      },
      {
        id: layoutItemNames.RHS_TAG_DETAILS,
        group: 'rhs',
        component: (
          <TooltipPathProvider path="rhsTagDetails">
            <TagDetailsRHS
              expandHandler={expanded => {
                if (expanded) {
                  mutateSuggestedRHSHeight(layoutItemNames.RHS_TAG_DETAILS, null);
                } else {
                  mutateSuggestedRHSHeight(layoutItemNames.RHS_TAG_DETAILS, 25);
                }
              }}
            />
          </TooltipPathProvider>
        ),
        min: MIN_HEIGHTS.rhsTagDetails,
        initialPct: 25
      },
      {
        id: layoutItemNames.COMPOUNDS_VIEW,
        group: 'rhs',
        component: (
          <TooltipPathProvider path="rhsCompoundsView">
            <PoseListRHS
              expandHandler={expanded => {
                if (expanded) {
                  mutateSuggestedRHSHeight(layoutItemNames.COMPOUNDS_VIEW, null);
                } else {
                  mutateSuggestedRHSHeight(layoutItemNames.COMPOUNDS_VIEW, 25);
                }
              }}
            />
          </TooltipPathProvider>
        ),
        min: MIN_HEIGHTS.rhs,
        initialPct: 55
      }
    ],
    [mutateSuggestedRHSHeight]
  );

  // const lhsPanels = useMemo(() => panels.filter(p => p.group === 'lhs'), [panels]);
  // const rhsPanels = useMemo(() => panels.filter(p => p.group === 'rhs'), [panels]);

  const clampRange = (v, min, max) => Math.max(min, Math.min(max, v));
  const sameNumberArray = (a, b) => a.length === b.length && a.every((value, index) => Math.abs(value - b[index]) < 1);

  const getLayoutNode = useCallback(() => {
    return gridRef?.current?.elementRef?.current?.firstChild;
  }, [gridRef]);

  // pixel height available for panels (minus horizontal bars)
  const getTotalHeight = useCallback(() => {
    const node = getLayoutNode();
    if (!node) return 0;
    const h = node.getBoundingClientRect().height;
    return h - resizerSize * (panels.length - 1);
  }, [getLayoutNode, panels]);

  const lastVariableHeights = useRef({}); // { panelId: px }
  const lastVariableRHSHeights = useRef({}); // { panelId: px }

  // Store heights that result from user actions (drag / window resize).
  const rememberHeights = useCallback(
    arr => {
      panels.forEach((p, i) => {
        const hasOverride = panelSuggestedHeights.some(x => x.id === p.id);
        if (!hasOverride) {
          lastVariableHeights.current[p.id] = arr[i];
        }
      });
    },
    [panels, panelSuggestedHeights]
  );
  const rememberRHSHeights = useCallback(
    arr => {
      rhsPanels.forEach((p, i) => {
        const hasOverride = panelSuggestedRHSHeights.some(x => x.id === p.id);
        if (!hasOverride) {
          lastVariableRHSHeights.current[p.id] = arr[i];
        }
      });
    },
    [rhsPanels, panelSuggestedRHSHeights]
  );

  // Initial heights
  const [heights, setHeights] = useState(() => {
    const total = getTotalHeight() || 600;
    const hasPx = panels.some(p => typeof p.initialPx === 'number');
    if (hasPx) {
      const fixed = panels.reduce((sum, p) => sum + (typeof p.initialPx === 'number' ? p.initialPx : 0), 0);
      const pctTotal =
        panels.reduce((sum, p) => sum + (typeof p.initialPx === 'number' ? 0 : p.initialPct || 0), 0) || 1;
      return panels.map(p => {
        if (typeof p.initialPx === 'number') return clampRange(p.initialPx, p.min, total);
        return clampRange(((p.initialPct || 0) / pctTotal) * Math.max(total - fixed, 0), p.min, total);
      });
    }
    const allPctOK = panels.every(p => typeof p.initialPct === 'number');
    if (allPctOK) {
      return panels.map(p => clampRange((p.initialPct / 100) * total, p.min, total));
    }
    const equal = total / panels.length;
    return panels.map(p => clampRange(equal, p.min, total));
  });
  const [rhsHeights, setRHSHeights] = useState(() => {
    const total = getTotalHeight() || 600;
    const allPctOK = rhsPanels.every(p => typeof p.initialPct === 'number');
    if (allPctOK) {
      return rhsPanels.map(p => clampRange((p.initialPct / 100) * total, p.min, total));
    }
    const equal = total / rhsPanels.length;
    return rhsPanels.map(p => clampRange(equal, p.min, total));
  });

  // ResizeObserver – preserve ratios on container resize
  useLayoutEffect(() => {
    let lastTotal = null;
    const observer = new ResizeObserver(() => {
      const total = getTotalHeight();
      if (!total || total === lastTotal) return;
      lastTotal = total;
      setHeights(prev => {
        const sum = prev.reduce((a, b) => a + b, 0);
        const factor = total / sum;
        let newH = prev.map((h, i) => clampRange(h * factor, panels[i].min, total));
        const drift = total - newH.reduce((a, b) => a + b, 0);
        if (Math.abs(drift) > 1) {
          const idx = newH.indexOf(Math.max(...newH));
          newH[idx] += drift;
        }
        if (sameNumberArray(prev, newH)) return prev;
        rememberHeights(newH);
        return newH;
      });
    });
    const node = gridRef?.current?.elementRef?.current?.firstChild;
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [getTotalHeight, gridRef, panels, rememberHeights]);

  useLayoutEffect(() => {
    let lastTotal = null;
    const observer = new ResizeObserver(() => {
      const total = getTotalHeight();
      if (!total || total === lastTotal) return;
      lastTotal = total;
      setRHSHeights(prev => {
        const sum = prev.reduce((a, b) => a + b, 0);
        const factor = total / sum;
        let newH = prev.map((h, i) => clampRange(h * factor, rhsPanels[i].min, total));
        const drift = total - newH.reduce((a, b) => a + b, 0);
        if (Math.abs(drift) > 1) {
          const idx = newH.indexOf(Math.max(...newH));
          newH[idx] += drift;
        }
        if (sameNumberArray(prev, newH)) return prev;
        rememberRHSHeights(newH);
        return newH;
      });
    });
    const node = gridRef?.current?.elementRef?.current?.firstChild;
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [getTotalHeight, gridRef, rhsPanels, rememberRHSHeights]);

  //  Divider drag handler - horizontal resizers between panels
  const makeOnResize = useCallback(
    index => (_, cursorY) => {
      const total = getTotalHeight();
      if (!total) return;

      const node = gridRef.current.elementRef.current.firstChild;
      const top = node.getBoundingClientRect().y;
      const aboveMin = panels.slice(0, index + 1).reduce((s, p) => s + p.min, 0);
      const belowMin = panels.slice(index + 1).reduce((s, p) => s + p.min, 0);
      const maxAbove = total - belowMin;
      const desiredAbove = clampRange(cursorY - top - resizerSize / 2, aboveMin, maxAbove);

      setHeights(prev => {
        const out = [...prev];
        if (index === 0) {
          out[0] = desiredAbove;
          const remain = total - desiredAbove;
          const oldBelow = prev.slice(1);
          const sumOld = oldBelow.reduce((a, b) => a + b, 0) || 1;
          oldBelow.forEach((h, j) => {
            out[1 + j] = clampRange((h / sumOld) * remain, panels[1 + j].min, remain);
          });
        } else {
          const fixedAbove = prev.slice(0, index).reduce((a, b) => a + b, 0);
          const newH = clampRange(desiredAbove - fixedAbove, panels[index].min, total - fixedAbove - belowMin);
          out[index] = newH;
          const remain = total - fixedAbove - newH;
          const oldBelow = prev.slice(index + 1);
          const sumOld = oldBelow.reduce((a, b) => a + b, 0) || 1;
          oldBelow.forEach((h, j) => {
            out[index + 1 + j] = clampRange((h / sumOld) * remain, panels[index + 1 + j].min, remain);
          });
        }
        rememberHeights(out);
        return out;
      });
    },
    [getTotalHeight, gridRef, panels, rememberHeights]
  );
  const makeOnRHSResize = useCallback(
    index => (_, cursorY) => {
      const total = getTotalHeight();
      if (!total) return;

      const node = gridRef.current.elementRef.current.firstChild;
      const top = node.getBoundingClientRect().y;
      const aboveMin = rhsPanels.slice(0, index + 1).reduce((s, p) => s + p.min, 0);
      const belowMin = rhsPanels.slice(index + 1).reduce((s, p) => s + p.min, 0);
      const maxAbove = total - belowMin;
      const desiredAbove = clampRange(cursorY - top - resizerSize / 2, aboveMin, maxAbove);

      setRHSHeights(prev => {
        const out = [...prev];
        if (index === 0) {
          out[0] = desiredAbove;
          const remain = total - desiredAbove;
          const oldBelow = prev.slice(1);
          const sumOld = oldBelow.reduce((a, b) => a + b, 0) || 1;
          oldBelow.forEach((h, j) => {
            out[1 + j] = clampRange((h / sumOld) * remain, rhsPanels[1 + j].min, remain);
          });
        } else {
          const fixedAbove = prev.slice(0, index).reduce((a, b) => a + b, 0);
          const newH = clampRange(desiredAbove - fixedAbove, rhsPanels[index].min, total - fixedAbove - belowMin);
          out[index] = newH;
          const remain = total - fixedAbove - newH;
          const oldBelow = prev.slice(index + 1);
          const sumOld = oldBelow.reduce((a, b) => a + b, 0) || 1;
          oldBelow.forEach((h, j) => {
            out[index + 1 + j] = clampRange((h / sumOld) * remain, rhsPanels[index + 1 + j].min, remain);
          });
        }
        rememberRHSHeights(out);
        return out;
      });
    },
    [getTotalHeight, gridRef, rhsPanels, rememberRHSHeights]
  );

  const [lhsW, setLhsW] = useState(sidesOpen.LHS ? lhsInitialWidth : 0);
  const [rhsW, setRhsW] = useState(sidesOpen.RHS ? rhsInitialWidth : 0);

  useEffect(() => {
    setLhsW(sidesOpen.LHS ? lhsInitialWidth : 0);
    setRhsW(sidesOpen.RHS ? rhsInitialWidth : 0);
  }, [sidesOpen.LHS, sidesOpen.RHS]);

  useEffect(() => {
    if (sidesOpen.RHS) {
      dispatch(setActualRhsWidth(rhsW));
    }
  }, [dispatch, rhsW, sidesOpen.RHS]);

  const onLhsResize = useCallback(
    x =>
      setLhsW(prev => {
        const node = getLayoutNode();
        if (!node) return prev;
        const r = node.getBoundingClientRect();
        const desired = x - r.x - resizerSize / 2;
        const max = sidesOpen.RHS
          ? r.width - rhsW - resizerSize * 2 - NGL_MIN_WIDTH
          : r.width - resizerSize - NGL_MIN_WIDTH;
        return clamp(desired, SIDE_MIN_WIDTH, Math.max(SIDE_MIN_WIDTH, max));
      }),
    [getLayoutNode, rhsW, sidesOpen.RHS]
  );

  const onRhsResize = useCallback(
    x =>
      setRhsW(prev => {
        const node = getLayoutNode();
        if (!node) return prev;
        const r = node.getBoundingClientRect();
        const desired = r.right - x - resizerSize / 2;
        const max = sidesOpen.LHS
          ? r.width - lhsW - resizerSize * 2 - NGL_MIN_WIDTH
          : r.width - resizerSize - NGL_MIN_WIDTH;
        return clamp(desired, SIDE_MIN_WIDTH, Math.max(SIDE_MIN_WIDTH, Math.min(RHS_MAX_WIDTH, max)));
      }),
    [getLayoutNode, lhsW, sidesOpen.LHS]
  );

  // distribute free space when overrides change
  useEffect(() => {
    const total = getTotalHeight();
    if (!total) return;

    setHeights(prev => {
      const next = [...prev];
      let fixedSum = 0;
      const variableIdx = [];

      panels.forEach((p, i) => {
        const ov = panelSuggestedHeights.find(x => x.id === p.id)?.suggestedHeight;
        if (ov != null) {
          if (Math.abs((prev[i] || 0) - ov) >= 1 && prev[i] > p.min) {
            lastVariableHeights.current[p.id] = prev[i];
          }
          next[i] = clampRange(ov, p.min, total);
          fixedSum += next[i];
        } else {
          variableIdx.push(i);
        }
      });

      const remain = Math.max(total - fixedSum, 0);
      if (!variableIdx.length) return next;

      const baseSum = variableIdx.reduce((s, i) => s + (lastVariableHeights.current[panels[i].id] ?? prev[i]), 0) || 1;

      variableIdx.forEach(i => {
        const remembered = lastVariableHeights.current[panels[i].id] ?? prev[i];
        next[i] = clampRange((remembered / baseSum) * remain, panels[i].min, remain);
      });

      const drift = total - next.reduce((a, b) => a + b, 0);
      if (Math.abs(drift) >= 1) next[variableIdx[0]] += drift;

      return next;
    });
  }, [panelSuggestedHeights, getTotalHeight, panels]);

  useEffect(() => {
    const total = getTotalHeight();
    if (!total) return;

    setRHSHeights(prev => {
      const next = [...prev];
      let fixedSum = 0;
      const variableIdx = [];

      rhsPanels.forEach((p, i) => {
        const ov = panelSuggestedRHSHeights.find(x => x.id === p.id)?.suggestedHeight;
        if (ov != null) {
          next[i] = clampRange(ov, p.min, total);
          fixedSum += next[i];
        } else {
          variableIdx.push(i);
        }
      });

      const remain = Math.max(total - fixedSum, 0);

      if (!variableIdx.length) return next;

      const baseSum =
        variableIdx.reduce((s, i) => s + (lastVariableRHSHeights.current[rhsPanels[i].id] ?? prev[i]), 0) || 1;

      variableIdx.forEach(i => {
        const remembered = lastVariableRHSHeights.current[rhsPanels[i].id] ?? prev[i];
        next[i] = clampRange((remembered / baseSum) * remain, rhsPanels[i].min, remain);
      });

      const drift = total - next.reduce((a, b) => a + b, 0);
      if (Math.abs(drift) >= 1) next[variableIdx[0]] += drift;

      return next;
    });
  }, [panelSuggestedRHSHeights, getTotalHeight, rhsPanels]);

  return (
    <div className={classes.root}>
      {sidesOpen.LHS && (
        <>
          <div
            className={classes.lhs}
            style={{ width: lhsW, flex: `0 1 ${lhsW}px`, display: 'flex', flexDirection: 'column' }}
          >
            {panels.map((p, i) => (
              <React.Fragment key={p.id}>
                <div
                  style={{
                    height: panelSuggestedHeights.find(item => item.id === p.id)?.suggestedHeight ?? heights[i],
                    overflow: 'auto'
                  }}
                >
                  {p.component}
                </div>
                {i < panels.length - 1 && <Resizer orientation="horizontal" onResize={makeOnResize(i)} />}
              </React.Fragment>
            ))}
          </div>
          <Resizer onResize={onLhsResize} />
        </>
      )}

      <div
        className={classes.nglColumn}
        style={{
          flex: `1 1 ${NGL_MIN_WIDTH}px`,
          minWidth: NGL_MIN_WIDTH
        }}
      >
        <div className={classes.ngl}>
          <OutPortal node={nglPortal} />
        </div>
        <TooltipPathProvider path="viewerControls">
          <ViewerControls />
        </TooltipPathProvider>
      </div>

      {sidesOpen.RHS && (
        <>
          <Resizer onResize={onRhsResize} />
          <div className={classes.rhs} style={{ width: rhsW, flex: `0 1 ${rhsW}px` }}>
            {/* <PlotlyView />
            <RHS /> */}
            {rhsPanels.map((p, i) => (
              <React.Fragment key={p.id}>
                <div
                  style={{
                    height: panelSuggestedRHSHeights.find(item => item.id === p.id)?.suggestedHeight ?? rhsHeights[i],
                    overflow: 'auto'
                  }}
                >
                  {p.component}
                </div>
                {i < rhsPanels.length - 1 && <Resizer orientation="horizontal" onResize={makeOnRHSResize(i)} />}
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
