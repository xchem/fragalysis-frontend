/**
 * Created by abradley on 07/03/2018.
 */
import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';
import Routes from './Routes';
import { BrowserRouter } from 'react-router-dom';
import { saveStore } from './globalStore';
import { hot } from 'react-hot-loader';
import { configureStore } from 'redux-starter-kit';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { rootReducer } from '../reducers/rootReducer';
import { ErrorBoundary } from '../components/errorBoundary';

const loggerMiddleware = createLogger();

const store = configureStore({
  reducer: rootReducer,
  middleware: [thunkMiddleware, loggerMiddleware],
  devTools: true
});

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
