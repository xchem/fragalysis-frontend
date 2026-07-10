/**
 * Created by abradley on 07/03/2018.
 */
import React, { memo } from 'react';
import 'typeface-roboto';
import Routes from './routes/Routes';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { CssBaseline } from '@mui/material';
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
import { viewerEngine, VIEWER_ENGINES } from '../config/viewerEngine';

const VIEWER_PROVIDERS = {
  [VIEWER_ENGINES.NGL]: NglProvider
};

const ViewerProvider = VIEWER_PROVIDERS[viewerEngine];
const muiCache = createCache({ key: 'mui', prepend: true });

const Root = memo(() => {
  return (
    <CacheProvider value={muiCache}>
      <ThemeProvider theme={getTheme()}>
        <CssBaseline />
        <ErrorBoundary>
          <RDKitProvider>
            <TooltipProvider provider={tootlipProvider}>
              <TooltipPathProvider path="fragalysis">
                <ToastProvider>
                  <LoadingProvider>
                    <HeaderProvider>
                      <ViewerProvider>
                        <BrowserRouter>
                          <Routes />
                        </BrowserRouter>
                      </ViewerProvider>
                    </HeaderProvider>
                  </LoadingProvider>
                </ToastProvider>
              </TooltipPathProvider>
            </TooltipProvider>
          </RDKitProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </CacheProvider>
  );
});

export default Root;
