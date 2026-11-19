const ensureTrailingSlash = value => (value.endsWith('/') ? value : `${value}/`);

const resolveAbsoluteUrl = (value, locationHref) => new URL(value, locationHref).href;

export const resolveBundleBaseUrl = ({ runtimeBaseUrl, scriptUrl, locationHref } = {}) => {
  const baseLocation = locationHref || 'http://localhost/';

  if (typeof runtimeBaseUrl === 'string' && runtimeBaseUrl.trim()) {
    return resolveAbsoluteUrl(ensureTrailingSlash(runtimeBaseUrl.trim()), baseLocation);
  }

  if (typeof scriptUrl === 'string' && scriptUrl.trim()) {
    return new URL('.', resolveAbsoluteUrl(scriptUrl.trim(), baseLocation)).href;
  }

  return resolveAbsoluteUrl('/bundles/', baseLocation);
};

