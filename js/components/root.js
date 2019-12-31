/**
 * Created by abradley on 07/03/2018.
 */
import React from 'react';
import 'typeface-roboto';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';
import Routes from './routes/Routes';
import { BrowserRouter } from 'react-router-dom';
import { saveStore } from './helpers/globalStore';
import { hot, AppContainer } from 'react-hot-loader';
import thunkMiddleware from 'redux-thunk';
//import { createLogger } from 'redux-logger';
import { rootReducer } from '../reducers/rootReducer';
import { ThemeProvider } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import { getTheme } from '../theme';
import { HeaderProvider } from './header/headerContext';
import { NglProvider } from './nglView/nglProvider';
//const loggerMiddleware = createLogger();

const middlewareEnhancer = applyMiddleware(
  //loggerMiddleware,
  thunkMiddleware
);
const enhancers = [middlewareEnhancer];
const composedEnhancers = composeWithDevTools(...enhancers);

export const store = createStore(rootReducer, undefined, composedEnhancers);

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

export default // hot(module)(
Root;
//);
