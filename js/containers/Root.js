/**
 * Created by abradley on 07/03/2018.
 */
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import configureStore from '../configureStore'
import Tindspect from '../components/overallComponents';
 
const store = configureStore()
 
export default class Root extends Component {
    render() {
        return (
            <Provider store={store}>
                <Tindspect></Tindspect>
            </Provider>
        )
    }
}