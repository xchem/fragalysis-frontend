// eslint-disable-next-line import/extensions
import tooltips from '../../../tooltips/tooltips.json';

export const tootlipProvider = () => {
  return tooltips;
};

export const getTooltip = (tooltips, path, fallback = '') => {
  if (!tooltips || typeof tooltips !== 'object') return fallback;
  if (typeof path !== 'string' || path.length === 0) return fallback;

  const segments = path.split('.').filter(Boolean);
  let current = tooltips;

  for (const segment of segments) {
    if (segment === '__proto__' || segment === 'prototype' || segment === 'constructor') {
      return fallback;
    }

    if (current == null || typeof current !== 'object' || !(segment in current)) {
      return fallback;
    }

    current = current[segment];
  }

  return typeof current === 'string' ? current : fallback;
};

export const interpolate = (template, values) => {
  if (!template || !values) return template;

  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key) => {
    if (!(key in values)) return match;
    const value = values[key];
    if (value === null || value === undefined) return '';
    return String(value);
  });
};
