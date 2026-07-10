import { makeStyles as makeTssStyles, withStyles as withTssStyles } from 'tss-react/mui-compat';

export { createTheme, StyledEngineProvider, ThemeProvider, useTheme } from '@mui/material/styles';

const resolveLegacyStyles = (value, params, referencedClasses) => {
  if (typeof value === 'function') {
    return resolveLegacyStyles(value(params), params, referencedClasses);
  }

  if (Array.isArray(value)) {
    return value.map(item => resolveLegacyStyles(item, params, referencedClasses));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => {
        const resolvedKey = key.replace(/\$([\w-]+)/g, (_, ruleName) => `.${referencedClasses[ruleName]}`);
        return [resolvedKey, resolveLegacyStyles(nestedValue, params, referencedClasses)];
      })
    );
  }

  return value;
};

export const makeStyles = (styles, options) => {
  const useTssStyles = makeTssStyles(options)((theme, params, referencedClasses) =>
    resolveLegacyStyles(typeof styles === 'function' ? styles(theme) : styles, params, referencedClasses)
  );

  return params => useTssStyles(params).classes;
};

export const withStyles = (styles, options) => Component =>
  withTssStyles(
    Component,
    (theme, props, referencedClasses) =>
      resolveLegacyStyles(typeof styles === 'function' ? styles(theme) : styles, props, referencedClasses),
    options
  );
