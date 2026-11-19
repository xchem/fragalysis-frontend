const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

const normalizeString = value => (typeof value === 'string' ? value.trim() : '');

const resolveBoolean = value => {
  if (typeof value === 'boolean') {
    return value;
  }

  const normalizedValue = normalizeString(value).toLowerCase();
  return normalizedValue ? TRUE_VALUES.has(normalizedValue) : undefined;
};

const removeTrailingSlash = value => value.replace(/\/+$/, '');

export const resolveMoorhenProofConfig = ({
  runtimeEnabled,
  buildEnabled,
  nodeEnv = 'production',
  runtimeAssetUrl,
  buildAssetUrl,
  bundleBaseUrl = '/bundles/'
} = {}) => {
  const runtimeSetting = resolveBoolean(runtimeEnabled);
  const buildSetting = resolveBoolean(buildEnabled);
  const enabled = runtimeSetting ?? buildSetting ?? nodeEnv !== 'production';
  const configuredAssetUrl = normalizeString(runtimeAssetUrl) || normalizeString(buildAssetUrl);
  const normalizedBundleBaseUrl = bundleBaseUrl.endsWith('/') ? bundleBaseUrl : `${bundleBaseUrl}/`;
  const assetUrl = removeTrailingSlash(configuredAssetUrl || `${normalizedBundleBaseUrl}moorhen`);

  return Object.freeze({ enabled, assetUrl });
};

const getRuntimeContext = () =>
  typeof window !== 'undefined' && window.DJANGO_CONTEXT ? window.DJANGO_CONTEXT : {};

const getBuildSetting = name =>
  typeof process !== 'undefined' && process.env && process.env[name] ? process.env[name] : undefined;

const runtimeContext = getRuntimeContext();
const buildEnabled =
  typeof __FRAGALYSIS_MOORHEN_PROOF_ENABLED__ !== 'undefined'
    ? __FRAGALYSIS_MOORHEN_PROOF_ENABLED__
    : getBuildSetting('MOORHEN_PROOF_ENABLED');
const buildAssetUrl =
  typeof __FRAGALYSIS_MOORHEN_ASSET_URL__ !== 'undefined'
    ? __FRAGALYSIS_MOORHEN_ASSET_URL__
    : getBuildSetting('MOORHEN_ASSET_URL');

export const moorhenProofConfig = resolveMoorhenProofConfig({
  runtimeEnabled: runtimeContext.moorhen_proof_enabled,
  buildEnabled,
  nodeEnv: typeof process !== 'undefined' && process.env ? process.env.NODE_ENV : 'production',
  runtimeAssetUrl: runtimeContext.moorhen_asset_url,
  buildAssetUrl,
  bundleBaseUrl:
    typeof window !== 'undefined' && window.__FRAGALYSIS_BUNDLE_BASE_URL__
      ? window.__FRAGALYSIS_BUNDLE_BASE_URL__
      : '/bundles/'
});

