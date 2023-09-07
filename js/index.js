import React from 'react';
import { createRoot } from 'react-dom/client';
import Root from './components/root';
import { DJANGO_CONTEXT } from './utils/djangoContext';
// Sentry logging
import { init, configureScope } from '@sentry/browser';
// Setup log rocket logging
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { rootReducer } from './reducers/rootReducer';
import { saveStore } from './components/helpers/globalStore';
import thunkMiddleware from 'redux-thunk';
import trackingMiddleware from './reducers/tracking/trackingMiddleware';
import nglTrackingMiddleware from './reducers/nglTracking/nglTrackingMiddleware';
import { composeWithDevTools } from 'redux-devtools-extension';

const middlewareEnhancer = applyMiddleware(
  //loggerMiddleware,
  thunkMiddleware,
  trackingMiddleware,
  nglTrackingMiddleware
);
const enhancers = [middlewareEnhancer];
const composedEnhancers = composeWithDevTools(...enhancers);

const store = createStore(rootReducer, undefined, composedEnhancers);

saveStore(store);

const doc = document;
doc.body.style.margin = '0px';

doc.head.querySelector('link').remove();

const container = doc.getElementById('app');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <Root />
  </Provider>
);
