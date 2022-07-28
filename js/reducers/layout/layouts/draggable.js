import { baseColumnSize, collapsedPanelSize, layoutCols, layoutItemNames } from '../constants';

const layout = {
  static: false,
  createLayout: (showLHS, showRHS, hideProjects, height, margin, layoutLocked, panelsExpanded) => {
    return Object.fromEntries(
      Object.entries(layoutCols).map(([key, cols]) => {
        const maxRows = Math.max(Math.floor((height - margin) / (margin + 1)), 60);

        const lhsBaseHeight = maxRows / 4;
        const tagDetailsRows = panelsExpanded[layoutItemNames.TAG_DETAILS] ? lhsBaseHeight : collapsedPanelSize;
        const hitListFilterRows = panelsExpanded[layoutItemNames.HIT_LIST_FILTER] ? lhsBaseHeight : collapsedPanelSize;
        const hitNavigatorRows = maxRows - tagDetailsRows - hitListFilterRows;

        const projectHistoryHeight = panelsExpanded[layoutItemNames.PROJECT_HISTORY] ? 16 : collapsedPanelSize;
        const nglHeight = maxRows - collapsedPanelSize - !hideProjects * projectHistoryHeight;
        const nglWidth = cols - (showLHS + showRHS) * baseColumnSize;

        let layout = [
          {
            i: layoutItemNames.NGL,
            x: showLHS * baseColumnSize,
            y: 0,
            w: nglWidth,
            h: nglHeight,
            static: layoutLocked
          },
          {
            i: layoutItemNames.VIEWER_CONTROLS,
            x: showLHS * baseColumnSize,
            y: nglHeight,
            w: nglWidth,
            h: collapsedPanelSize,
            static: layoutLocked
          }
        ];

        if (showLHS) {
          layout = [
            ...layout,
            {
              i: layoutItemNames.TAG_DETAILS,
              x: 0,
              y: 0,
              w: baseColumnSize,
              h: tagDetailsRows,
              static: layoutLocked
            },
            {
              i: layoutItemNames.HIT_LIST_FILTER,
              x: 0,
              y: tagDetailsRows,
              w: baseColumnSize,
              h: hitListFilterRows,
              static: layoutLocked
            },
            {
              i: layoutItemNames.HIT_NAVIGATOR,
              x: 0,
              y: tagDetailsRows + hitListFilterRows,
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
              x: baseColumnSize + nglWidth,
              y: 0,
              w: baseColumnSize,
              h: maxRows,
              static: layoutLocked
            }
          ];
        }

        if (!hideProjects) {
          layout = [
            ...layout,
            {
              i: layoutItemNames.PROJECT_HISTORY,
              x: showLHS * baseColumnSize,
              y: nglHeight + collapsedPanelSize,
              w: nglWidth,
              h: projectHistoryHeight,
              static: layoutLocked
            }
          ];
        }

        return [key, layout];
      })
    );
  }
};

export default layout;
