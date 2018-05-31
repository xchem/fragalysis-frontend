/**
 * Created by abradley on 07/03/2018.
 */
import { combineReducers } from 'redux'
import apiReducers from './apiReducers';
import nglReducers from './nglReducers';
import selectionReducers from './selectionReducers';
import renderReducers from './renderReducers';
import { loadingBarReducer } from 'react-redux-loading-bar'
import {reducer as burgerMenu} from 'redux-burger-menu';
import stateReducers from './stateReducers'

const rootReducer = combineReducers({
    renderReducers,
    apiReducers,
    burgerMenu,
    selectionReducers,
    loadingBar: loadingBarReducer,
    nglReducers,
    stateReducers
})
 
export default rootReducer;