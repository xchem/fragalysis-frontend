import React, { createContext, useState } from 'react';

export const HeaderLoadingContext = createContext();

export const HeaderLoadingProvider = props => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <HeaderLoadingContext.Provider value={{ isLoading, setIsLoading }}>{props.children}</HeaderLoadingContext.Provider>
  );
};
