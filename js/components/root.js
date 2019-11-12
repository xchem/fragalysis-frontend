/**
 * Created by abradley on 07/03/2018.
 */
import React, { PureComponent } from 'react';
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
import { ErrorBoundary } from './errorBoundary';

//const loggerMiddleware = createLogger();

const middlewareEnhancer = applyMiddleware(
  //loggerMiddleware,
  thunkMiddleware
);
const enhancers = [middlewareEnhancer];
const composedEnhancers = composeWithDevTools(...enhancers);

const store = createStore(rootReducer, undefined, composedEnhancers);

saveStore(store);
class Root extends PureComponent {
  render() {
    return (
      <ErrorBoundary>
        <Provider store={store}>
          <BrowserRouter>
            <Routes />
          </BrowserRouter>
        </Provider>
      </ErrorBoundary>
    );
  }
}

export default hot(module)(Root);
