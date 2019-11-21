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
import { saveStore } from './globalStore';
import { hot, AppContainer } from 'react-hot-loader';
import thunkMiddleware from 'redux-thunk';
//import { createLogger } from 'redux-logger';
import { rootReducer } from '../reducers/rootReducer';
import { ThemeProvider } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import { getTheme } from '../theme';
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
            <BrowserRouter>
              <Routes />
            </BrowserRouter>
          </Provider>
        </ThemeProvider>
      </CssBaseline>
    </AppContainer>
  );
};

export default hot(module)(Root);
