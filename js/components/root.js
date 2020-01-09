/**
 * Created by abradley on 07/03/2018.
 */
import { hot, setConfig } from 'react-hot-loader';
import React from 'react';
import 'typeface-roboto';
import Routes from './routes/Routes';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import { getTheme } from '../theme';
import { HeaderProvider } from './header/headerContext';
import { NglProvider } from './nglView/nglProvider';
import { ErrorBoundary } from './errorHandling/errorBoundary';

setConfig({ reloadHooks: false });
/*
setConfig({
  reloadHooks: false,
  pureSFC: true,
  disableHotRenderer: true,
  onComponentCreate: (type, name) =>
    (String(type).indexOf('useState') > 0 || String(type).indexOf('useEffect') > 0) && cold(type),

  onComponentRegister: (type, name, file) => file.indexOf('node_modules') > 0 && cold(type)
});*/

const Root = () => (
  <ErrorBoundary>
    <CssBaseline>
      <ThemeProvider theme={getTheme()}>
        <HeaderProvider>
          <NglProvider>
            <BrowserRouter>
              <Routes />
            </BrowserRouter>
          </NglProvider>
        </HeaderProvider>
      </ThemeProvider>
    </CssBaseline>
  </ErrorBoundary>
);

export default hot(module)(Root);
