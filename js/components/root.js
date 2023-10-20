/**
 * Created by abradley on 07/03/2018.
 */
import React, { memo } from 'react';
import 'typeface-roboto';
import Routes from './routes/Routes';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import { getTheme } from '../theme';
import { HeaderProvider } from './header/headerContext';
import { NglProvider } from './nglView/nglProvider';
import { ErrorBoundary } from './errorHandling/errorBoundary';
import { ToastProvider } from './toast';
import { LoadingProvider } from './loading';

const Root = memo(() => {
  return (
    <ErrorBoundary>
      <CssBaseline>
        <ThemeProvider theme={getTheme()}>
          <ToastProvider>
            <LoadingProvider>
              <HeaderProvider>
                <NglProvider>
                  <BrowserRouter>
                    <Routes />
                  </BrowserRouter>
                </NglProvider>
              </HeaderProvider>
            </LoadingProvider>
          </ToastProvider>
        </ThemeProvider>
      </CssBaseline>
    </ErrorBoundary>
  );
});

export default Root;
