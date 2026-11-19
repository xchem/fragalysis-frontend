import React, { lazy, memo, Suspense } from 'react';

const PlotlyView = lazy(() =>
  import(/* webpackChunkName: "plotly-view" */ './plotlyView').then(module => ({ default: module.PlotlyView }))
);

const LazyPlotlyView = memo(props => (
  <Suspense fallback={<div role="status">Loading plots…</div>}>
    <PlotlyView {...props} />
  </Suspense>
));

export default LazyPlotlyView;
