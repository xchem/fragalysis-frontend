/**
 * Created by abradley on 07/03/2018.
 */
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import configureStore from '../configureStore'
import Tindspect from '../components/tindspectHolder';


const store = configureStore()
 
export default class PickerRoot extends Component {
    render() {
        return (
            <Provider store={store}>
            <Tindspect></Tindspect></Provider>
        )
    }
}

