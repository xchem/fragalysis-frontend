/**
 * Created by abradley on 07/03/2018.
 */
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import configureStore from '../configureStore'
import routes from './app';
import { BrowserRouter } from 'react-router-dom'


const store = configureStore()
 
export default class Root extends Component {
    render() {
        return (
            <Provider store={store}>
                <BrowserRouter>
                    {routes}
                </BrowserRouter>
            </Provider>
            )
    }
}
