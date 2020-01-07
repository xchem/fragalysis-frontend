/**
 * Created by abradley on 07/03/2018.
 */
import React from 'react';
import 'typeface-roboto';
import { Provider } from 'react-redux';
import Routes from './routes/Routes';
import { BrowserRouter } from 'react-router-dom';
import { saveStore } from './helpers/globalStore';
import { hot, AppContainer } from 'react-hot-loader';
import { ThemeProvider } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import { getTheme } from '../theme';
import { HeaderProvider } from './header/headerContext';
import { NglProvider } from './nglView/nglProvider';
import configureStore from '../reducers/configureStore';

export const store = configureStore(undefined);

saveStore(store);

const Root = () => {
  return (
    <AppContainer>
      <CssBaseline>
        <ThemeProvider theme={getTheme()}>
          <Provider store={store}>
            <HeaderProvider>
              <NglProvider>
                <BrowserRouter>
                  <Routes />
                </BrowserRouter>
              </NglProvider>
            </HeaderProvider>
          </Provider>
        </ThemeProvider>
      </CssBaseline>
    </AppContainer>
  );
};

export default hot(module)(Root);
