import React from 'react';

const TooltipPathContext = React.createContext('');

export const normalizePath = p => {
  if (!p) return '';
  return String(p)
    .split('.')
    .map(s => s.trim())
    .filter(Boolean)
    .join('.');
};

export const joinPaths = (base, next) => {
  const b = normalizePath(base);
  const n = normalizePath(next);
  if (!b) return n;
  if (!n) return b;
  return `${b}.${n}`;
};

export const TooltipPathProvider = ({ path, absolute = false, children }) => {
  const parentBase = React.useContext(TooltipPathContext);

  const value = React.useMemo(() => {
    const p = normalizePath(path);
    if (!p) return parentBase;
    return absolute ? p : joinPaths(parentBase, p);
  }, [parentBase, path, absolute]);

  return <TooltipPathContext.Provider value={value}>{children}</TooltipPathContext.Provider>;
};

export const useTooltipPath = () => {
  const base = React.useContext(TooltipPathContext);

  const resolve = React.useCallback(
    (localPath, { absolute = false } = {}) => {
      const lp = normalizePath(localPath);
      if (!lp) return normalizePath(base);
      return absolute ? lp : joinPaths(base, lp);
    },
    [base]
  );

  return { base, resolve };
};
