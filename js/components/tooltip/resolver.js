// eslint-disable-next-line import/extensions
import tooltips from '../../../tooltips/tooltips.json';

export const tootlipProvider = () => {
  return tooltips;
};

const normalizeTooltipEntry = (tooltip, fallback = '') => {
  if (typeof tooltip === 'string') {
    return { text: tooltip, showHelp: false };
  }

  if (tooltip && typeof tooltip === 'object' && typeof tooltip.text === 'string') {
    return {
      text: tooltip.text,
      showHelp: tooltip.showHelp === true
    };
  }

  if (typeof fallback === 'string') {
    return { text: fallback, showHelp: false };
  }

  if (fallback && typeof fallback === 'object' && typeof fallback.text === 'string') {
    return {
      text: fallback.text,
      showHelp: fallback.showHelp === true
    };
  }

  return { text: '', showHelp: false };
};

export const getTooltip = (tooltips, path, fallback = '') => {
  if (!tooltips || typeof tooltips !== 'object') return normalizeTooltipEntry(null, fallback);
  if (typeof path !== 'string' || path.length === 0) return normalizeTooltipEntry(null, fallback);

  const segments = path.split('.').filter(Boolean);
  let current = tooltips;

  for (const segment of segments) {
    if (segment === '__proto__' || segment === 'prototype' || segment === 'constructor') {
      return normalizeTooltipEntry(null, fallback);
    }

    if (current == null || typeof current !== 'object' || !(segment in current)) {
      return normalizeTooltipEntry(null, fallback);
    }

    current = current[segment];
  }

  return normalizeTooltipEntry(current, fallback);
};

export const interpolate = (template, values) => {
  if (!template || !values) return template;

  if (template && typeof template === 'object') {
    return {
      ...template,
      text: interpolate(template.text, values)
    };
  }

  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key) => {
    if (!(key in values)) return match;
    const value = values[key];
    if (value === null || value === undefined) return '';
    return String(value);
  });
};
