import React from 'react';

const TooltipContext = React.createContext('');

export const TooltipProvider = ({ provider, children }) => {
  return <TooltipContext.Provider value={provider}>{children}</TooltipContext.Provider>;
};

export const useTootlipProvider = () => {
  const provider = React.useContext(TooltipContext);
  return { provider };
};
