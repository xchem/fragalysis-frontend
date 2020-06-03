import React, { createContext, useState, memo } from 'react';
import { snackbarColors } from './constants';

export const HeaderContext = createContext();

export const HeaderProvider = memo(props => {
  const [isLoading, setIsLoading] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [headerNavbarTitle, setHeaderNavbarTitle] = useState('');
  const [headerButtons, setHeaderButtons] = useState(null);
  const [snackBarTitle, setSnackBarTitle] = useState(null);
  const [snackBarColor, setSnackBarColor] = useState(snackbarColors.default);

  return (
    <HeaderContext.Provider
      value={{
        isLoading,
        setIsLoading,
        headerHeight,
        setHeaderHeight,
        headerNavbarTitle,
        setHeaderNavbarTitle,
        headerButtons,
        setHeaderButtons,
        snackBarTitle,
        setSnackBarTitle,
        snackBarColor,
        setSnackBarColor
      }}
    >
      {props.children}
    </HeaderContext.Provider>
  );
});
