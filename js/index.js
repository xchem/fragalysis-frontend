import React from 'react';
import { render } from 'react-dom';
import Root from './components/root';
import { DJANGO_CONTEXT } from './utils/djangoContext';
// Sentry logging
import { init } from '@sentry/browser';
// Setup log rocket logging
import LogRocket from 'logrocket';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { rootReducer } from './reducers/rootReducer';
import { saveStore } from './components/helpers/globalStore';
import { setConfig } from 'react-hot-loader';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
require('react-hot-loader/patch');
LogRocket.init('eoalzb/fragalysis');
// This is the log rocket setup

LogRocket.identify(DJANGO_CONTEXT['username'], {
  pk: DJANGO_CONTEXT['pk'],
  name: DJANGO_CONTEXT['name'],
  email: DJANGO_CONTEXT['email']
});

init({
  dsn: 'https://27fa0675f555431aa02ca552e93d8cfb@sentry.io/1298290'
});

const middlewareEnhancer = applyMiddleware(
  //loggerMiddleware,
  thunkMiddleware
);
const enhancers = [middlewareEnhancer];
const composedEnhancers = composeWithDevTools(...enhancers);

const store = createStore(rootReducer, undefined, composedEnhancers);

saveStore(store);
setConfig({ logLevel: 'debug' });

const doc = document;
doc.body.style.margin = '0px';

doc.head.querySelector('link').remove();

render(
  <Provider store={store}>
    <Root />
  </Provider>,
  doc.getElementById('app')
);
