/**
 * Created by abradley on 07/03/2018.
 */
import React, { memo } from 'react';
import 'typeface-roboto';
import { Provider } from 'react-redux';
import Routes from './routes/Routes';
import { BrowserRouter } from 'react-router-dom';
import { saveStore } from './helpers/globalStore';
import { ThemeProvider } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import { getTheme } from '../theme';
import { HeaderProvider } from './header/headerContext';
import { NglProvider } from './nglView/nglProvider';
import { applyMiddleware, createStore } from 'redux';
import { rootReducer } from '../reducers/rootReducer';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { ErrorBoundary } from './errorHandling/errorBoundary';
//const loggerMiddleware = createLogger();
//import { createLogger } from 'redux-logger';
import { hot, cold, setConfig } from 'react-hot-loader';

const middlewareEnhancer = applyMiddleware(
  //loggerMiddleware,
  thunkMiddleware
);
const enhancers = [middlewareEnhancer];
const composedEnhancers = composeWithDevTools(...enhancers);

const configureStore = () => {
  const store = createStore(rootReducer, undefined, composedEnhancers);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers/rootReducer', () => {
      const nextRootReducer = require('../reducers/rootReducer');
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
};

const store = configureStore();

saveStore(store);

setConfig({
  reloadHooks: false,
  pureSFC: true,
  disableHotRenderer: true,
  onComponentCreate: (type, name) =>
    (String(type).indexOf('useState') > 0 || String(type).indexOf('useEffect') > 0) && cold(type),

  onComponentRegister: (type, name, file) => file.indexOf('node_modules') > 0 && cold(type)
});

const Root = memo(() => (
  <ErrorBoundary>
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
  </ErrorBoundary>
));

export default hot(module)(Root);
