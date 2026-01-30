import React, { useCallback, useEffect, useLayoutEffect, useState, useMemo, useRef } from 'react';
import { makeStyles } from '@material-ui/core';
import { clamp } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { OutPortal } from 'react-reverse-portal';

import { Resizer } from './resizer';
import SnapshotList from '../snapshot/snapshotList';
import TagDetails from './tags/details/tagDetails';
import HitNavigator from './molecule/hitNavigator';
import { ViewerControls } from './viewerControls';
import { RHS } from './rhs';
import { setResizableLayout, setActualRhsWidth } from '../../reducers/selection/actions';
import { PlotlyView } from './plotly/plotlyView';
import { layoutItemNames } from '../../reducers/layout/constants';
import { TooltipPathProvider } from '../tooltip/TooltipPathContext';

const useStyles = makeStyles(theme => ({
  root: { display: 'flex', height: '100%' },
  lhs: { height: '100%', minWidth: 470 },
  nglColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(),
    height: '100%'
  },
  ngl: { flex: 1, minHeight: 0 }
}));

const sideWidth = 492;
const resizerSize = 20;

const MIN_HEIGHTS = {
  snapshot: 25,
  tagDetails: 25,
  hitNavigator: 120,
  plotlyView: 25,
  rhs: 25
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
                  mutateSuggestedHeight('snapshot', 25);
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
            <TagDetails
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
          <PlotlyView
            expandHandler={expanded => {
              if (expanded) {
                mutateSuggestedRHSHeight(layoutItemNames.PLOTLY_VIEW, null);
              } else {
                mutateSuggestedRHSHeight(layoutItemNames.PLOTLY_VIEW, 25);
              }
            }}
          />
        ),
        min: MIN_HEIGHTS.plotlyView,
        initialPct: 30
      },
      {
        id: layoutItemNames.COMPOUNDS_VIEW,
        group: 'rhs',
        component: (
          <RHS
            expandHandler={expanded => {
              if (expanded) {
                mutateSuggestedRHSHeight(layoutItemNames.COMPOUNDS_VIEW, null);
              } else {
                mutateSuggestedRHSHeight(layoutItemNames.COMPOUNDS_VIEW, 25);
              }
            }}
          />
        ),
        min: MIN_HEIGHTS.rhs,
        initialPct: 70
      }
    ],
    [mutateSuggestedRHSHeight]
  );

  // const lhsPanels = useMemo(() => panels.filter(p => p.group === 'lhs'), [panels]);
  // const rhsPanels = useMemo(() => panels.filter(p => p.group === 'rhs'), [panels]);

  const clampRange = (v, min, max) => Math.max(min, Math.min(max, v));

  // pixel height available for panels (minus horizontal bars)
  const getTotalHeight = useCallback(() => {
    const node = gridRef?.current?.elementRef?.current?.firstChild;
    if (!node) return 0;
    const h = node.getBoundingClientRect().height;
    return h - resizerSize * (panels.length - 1);
  }, [gridRef, panels]);

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

  const [lhsW, setLhsW] = useState(sidesOpen.LHS ? sideWidth : 0);
  const [rhsW, setRhsW] = useState(sidesOpen.RHS ? sideWidth : 0);

  useEffect(() => {
    setLhsW(sidesOpen.LHS ? sideWidth : 0);
    setRhsW(sidesOpen.RHS ? sideWidth : 0);
  }, [sidesOpen]);

  const onLhsResize = useCallback(
    x =>
      setLhsW(prev => {
        const node = gridRef.current.elementRef.current.firstChild;
        const r = node.getBoundingClientRect();
        const adj = x - r.x - resizerSize / 2;
        const cw = sidesOpen.RHS ? r.width - rhsW - resizerSize * 2 : r.width - resizerSize;
        return clamp(adj, 0, cw);
      }),
    [gridRef, rhsW, sidesOpen.RHS]
  );

  const onRhsResize = useCallback(
    x =>
      setRhsW(prev => {
        const node = gridRef.current.elementRef.current.firstChild;
        const r = node.getBoundingClientRect();
        let adj, cw;
        if (sidesOpen.LHS) {
          adj = x - r.x - (lhsW + resizerSize) - resizerSize / 2;
          cw = r.width - lhsW - resizerSize * 2;
        } else {
          adj = x - r.x - resizerSize / 2;
          cw = r.width - resizerSize;
        }
        const actual = cw - clamp(adj, 0, cw);
        dispatch(setActualRhsWidth(actual));
        if (actual < 480) return 480;
        if (actual > 900) return 900;
        return actual;
      }),
    [gridRef, lhsW, sidesOpen.LHS, dispatch]
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
          <div className={classes.lhs} style={{ width: lhsW, display: 'flex', flexDirection: 'column' }}>
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
          width: `calc(100% - ${lhsW}px - ${rhsW}px - ${(sidesOpen.LHS + sidesOpen.RHS) * resizerSize}px)`
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
          <div style={{ width: rhsW }}>
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
