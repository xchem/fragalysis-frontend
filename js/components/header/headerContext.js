import React, { createContext, useState, memo } from 'react';

export const HeaderContext = createContext();

export const HeaderProvider = memo(props => {
  const [isLoading, setIsLoading] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  return (
    <HeaderContext.Provider value={{ isLoading, setIsLoading, headerHeight, setHeaderHeight }}>
      {props.children}
    </HeaderContext.Provider>
  );
});
