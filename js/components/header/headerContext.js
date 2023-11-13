import React, { createContext, useState, memo } from 'react';

export const HeaderContext = createContext();

export const HeaderProvider = memo(props => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [headerNavbarTitle, setHeaderNavbarTitle] = useState('');
  const [headerButtons, setHeaderButtons] = useState(null);

  return (
    <HeaderContext.Provider
      value={{
        headerHeight,
        setHeaderHeight,
        headerNavbarTitle,
        setHeaderNavbarTitle,
        headerButtons,
        setHeaderButtons
      }}
    >
      {props.children}
    </HeaderContext.Provider>
  );
});
