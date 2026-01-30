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
import { RDKitProvider } from './rdkit/RDKitContext';
import { TooltipPathProvider } from './tooltip/TooltipPathContext';
import { TooltipProvider } from './tooltip/TooltipContext';
import { tootlipProvider } from './tooltip/resolver';

const Root = memo(() => {
  return (
    <ErrorBoundary>
      <CssBaseline>
        <ThemeProvider theme={getTheme()}>
          <RDKitProvider>
            <TooltipProvider provider={tootlipProvider}>
              <TooltipPathProvider path="fragalysis">
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
              </TooltipPathProvider>
            </TooltipProvider>
          </RDKitProvider>
        </ThemeProvider>
      </CssBaseline>
    </ErrorBoundary>
  );
});

export default Root;
