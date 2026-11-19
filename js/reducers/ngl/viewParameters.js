import { NGL_VIEW_DEFAULT_VALUES } from '../../components/nglView/constants';

// Keep the origin of a background edit outside serialized state. A restored
// snapshot must apply all its settings, even if only its color differs in Redux.
const backgroundEditSources = new WeakMap();
const lastApplied = new WeakMap();

export const withBackgroundColor = (viewParams, backgroundColor) => {
  const updated = { ...viewParams, backgroundColor };
  backgroundEditSources.set(updated, backgroundEditSources.get(viewParams) ?? viewParams);
  return updated;
};

export const applyViewerParameters = (adapter, viewParams, defaults) => {
  if (!adapter) return;
  const previous = lastApplied.get(adapter);
  if (previous && previous === viewParams) return;

  const backgroundOnly =
    previous &&
    backgroundEditSources.has(viewParams) &&
    backgroundEditSources.get(viewParams) === (backgroundEditSources.get(previous) ?? previous);
  const backgroundColor = viewParams?.backgroundColor ?? NGL_VIEW_DEFAULT_VALUES.backgroundColor;
  const parameters = backgroundOnly ? { backgroundColor } : { ...defaults, ...viewParams, backgroundColor };
  adapter.setParameters(parameters);
  lastApplied.set(adapter, viewParams);
};
