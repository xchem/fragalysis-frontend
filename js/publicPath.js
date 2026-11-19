import { resolveBundleBaseUrl } from './config/bundleAssets';

const scripts = typeof document !== 'undefined' ? Array.from(document.scripts) : [];
const currentScript = typeof document !== 'undefined' ? document.currentScript : undefined;
const fallbackScript = scripts.reverse().find(script => /\/main-[^/]+\.js(?:\?|$)/.test(script.src));
const runtimeBaseUrl =
  typeof window !== 'undefined' && window.DJANGO_CONTEXT
    ? window.DJANGO_CONTEXT.frontend_bundle_base_url
    : undefined;
const bundleBaseUrl = resolveBundleBaseUrl({
  runtimeBaseUrl,
  scriptUrl: (currentScript || fallbackScript || {}).src,
  locationHref: typeof window !== 'undefined' ? window.location.href : undefined
});

if (typeof window !== 'undefined') {
  window.__FRAGALYSIS_BUNDLE_BASE_URL__ = bundleBaseUrl;
}

// Webpack uses this value for chunks requested by React.lazy at runtime.
__webpack_public_path__ = bundleBaseUrl;
