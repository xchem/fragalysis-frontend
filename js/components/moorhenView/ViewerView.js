import React, { lazy, memo, Suspense } from 'react';
import { VIEWER_ENGINE } from '../../config/viewer';

const MoorhenView = lazy(() => import('./MoorhenView'));
const NglView = lazy(() => import('../nglView/nglView'));
const SelectedView = VIEWER_ENGINE === 'ngl' ? NglView : MoorhenView;

const ViewerView = memo(props => (
  <Suspense fallback={<div id={props.div_id} data-viewer-engine={VIEWER_ENGINE} />}>
    <SelectedView {...props} />
  </Suspense>
));

ViewerView.displayName = 'ViewerView';

export default ViewerView;
