/**
 * Created by abradley on 07/03/2018.
 */
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import configureStore from '../configureStore';
import routes from './app';
import { BrowserRouter } from 'react-router-dom';
import { saveStore } from '../containers/globalStore';
import { hot } from 'react-hot-loader';

const store = configureStore();

saveStore(store);
class Root extends Component {
  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>{routes}</BrowserRouter>
      </Provider>
    );
  }
}

export default hot(module)(Root);
