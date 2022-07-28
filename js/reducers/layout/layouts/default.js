import { layoutCols, layoutItemNames } from '../constants';

const layout = {
  static: true,
  createLayout: (showLHS, showRHS, hideProjects, height, margin, layoutLocked, panelsExpanded) => {
    return Object.fromEntries(
      Object.entries(layoutCols).map(([key, cols]) => {
        const maxRows = Math.max(Math.floor((height - margin) / (margin + 1)), 60);

        const layout = [
          {
            i: layoutItemNames.RESIZABLE,
            x: 0,
            y: 0,
            w: cols,
            h: maxRows,
            static: true
          }
        ];

        return [key, layout];
      })
    );
  }
};

export default layout;
