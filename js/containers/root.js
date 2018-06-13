/**
 * Created by abradley on 07/03/2018.
 */
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import configureStore from '../configureStore'
import routes from './app';
import { Route, Switch } from 'react-router' // react-router v4
import { ConnectedRouter } from 'connected-react-router'
import { createBrowserHistory } from 'history'


const history = createBrowserHistory();

const store = configureStore()
 
export default class Root extends Component {
    render() {
        return (
            <Provider store={store}>
                <ConnectedRouter history={history}> { /* place ConnectedRouter under Provider */ }
                    { routes }
                </ConnectedRouter>
            </Provider>
        )
    }
}
