import React, { createContext, useState } from 'react';

export const HeaderContext = createContext();

export const HeaderProvider = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  return (
    <HeaderContext.Provider value={{ isLoading, setIsLoading, headerHeight, setHeaderHeight }}>
      {props.children}
    </HeaderContext.Provider>
  );
};
