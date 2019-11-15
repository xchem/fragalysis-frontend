/**
 * Created by abradley on 07/03/2018.
 */
import React from 'react';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';
import Routes from './routes/Routes';
import { BrowserRouter } from 'react-router-dom';
import { saveStore } from './globalStore';
import { hot } from 'react-hot-loader';
import thunkMiddleware from 'redux-thunk';
//import { createLogger } from 'redux-logger';
import { rootReducer } from '../reducers/rootReducer';
import { ThemeProvider, createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';
import { indigo, red } from '@material-ui/core/colors';
import { NoSsr } from '@material-ui/core';
//const loggerMiddleware = createLogger();

const middlewareEnhancer = applyMiddleware(
  //loggerMiddleware,
  thunkMiddleware
);
const enhancers = [middlewareEnhancer];
const composedEnhancers = composeWithDevTools(...enhancers);

export const store = createStore(rootReducer, undefined, composedEnhancers);

saveStore(store);

let theme = createMuiTheme({
  palette: {
    primary: indigo,
    secondary: red
  }
});

theme = responsiveFontSizes(theme);

const Root = () => {
  return (
    <NoSsr>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <BrowserRouter>
            <Routes />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>
    </NoSsr>
  );
};

export default hot(module)(Root);
