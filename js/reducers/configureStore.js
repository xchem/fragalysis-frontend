import { applyMiddleware, createStore } from 'redux';
import { rootReducer } from './rootReducer';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
//const loggerMiddleware = createLogger();
//import { createLogger } from 'redux-logger';

const middlewareEnhancer = applyMiddleware(
  //loggerMiddleware,
  thunkMiddleware
);
const enhancers = [middlewareEnhancer];
const composedEnhancers = composeWithDevTools(...enhancers);

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, composedEnhancers);

  if (process.env.NODE_ENV === 'development') {
    // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
    if (module.hot) {
      module.hot.accept('./rootReducer', () => {
        store.replaceReducer(rootReducer);
      });
    }
  }

  return store;
}
