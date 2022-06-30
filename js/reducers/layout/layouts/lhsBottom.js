import { baseColumnSize, collapsedPanelSize, layoutCols, layoutItemNames } from '../constants';

const createLayout = (showLHS, showRHS, hideProjects, height, margin, layoutLocked, panelsExpanded) => {
  return Object.fromEntries(
    Object.entries(layoutCols).map(([key, cols]) => {
      const maxRows = Math.max(Math.floor((height - margin) / (margin + 1)), 60);
      const halfRows = maxRows / 2;

      const tagDetailsRows = panelsExpanded[layoutItemNames.TAG_DETAILS] ? halfRows : collapsedPanelSize;
      const hitListFilterRows = panelsExpanded[layoutItemNames.HIT_LIST_FILTER] ? halfRows : collapsedPanelSize;
      const hitNavigatorRows = showRHS ? halfRows : maxRows;

      const rhsHeight = showLHS ? halfRows : maxRows;

      const nglWidth = cols - ((showLHS || showRHS) + 1) * baseColumnSize;

      const projectHistoryHeight = panelsExpanded[layoutItemNames.PROJECT_HISTORY]
        ? maxRows - showLHS * hitListFilterRows - collapsedPanelSize
        : collapsedPanelSize;

      let layout = [
        {
          i: layoutItemNames.NGL,
          x: 0,
          y: 0,
          w: nglWidth,
          h: showLHS ? maxRows - tagDetailsRows : maxRows,
          static: layoutLocked
        },
        {
          i: layoutItemNames.VIEWER_CONTROLS,
          x: nglWidth,
          y: 0,
          w: baseColumnSize,
          h: maxRows - showLHS * hitListFilterRows - !hideProjects * projectHistoryHeight,
          static: layoutLocked
        }
      ];

      if (showLHS) {
        layout = [
          ...layout,
          {
            i: layoutItemNames.TAG_DETAILS,
            x: 0,
            y: maxRows - tagDetailsRows,
            w: nglWidth,
            h: tagDetailsRows,
            static: layoutLocked
          },
          {
            i: layoutItemNames.HIT_LIST_FILTER,
            x: nglWidth,
            y: maxRows - hitListFilterRows,
            w: baseColumnSize,
            h: hitListFilterRows,
            static: layoutLocked
          },
          {
            i: layoutItemNames.HIT_NAVIGATOR,
            x: nglWidth + baseColumnSize,
            y: showRHS * halfRows,
            w: baseColumnSize,
            h: hitNavigatorRows,
            static: layoutLocked
          }
        ];
      }

      if (showRHS) {
        layout = [
          ...layout,
          {
            i: layoutItemNames.RHS,
            x: nglWidth + baseColumnSize,
            y: 0,
            w: baseColumnSize,
            h: rhsHeight,
            minH: collapsedPanelSize,
            static: layoutLocked
          }
        ];
      }

      if (!hideProjects) {
        layout = [
          ...layout,
          {
            i: layoutItemNames.PROJECT_HISTORY,
            x: (!showLHS * !showRHS + 1) * baseColumnSize,
            y: panelsExpanded[layoutItemNames.PROJECT_HISTORY]
              ? collapsedPanelSize
              : maxRows - showLHS * hitListFilterRows - collapsedPanelSize,
            w: nglWidth,
            h: projectHistoryHeight,
            minH: collapsedPanelSize,
            static: layoutLocked
          }
        ];
      }

      return [key, layout];
    })
  );
};

export default createLayout;
