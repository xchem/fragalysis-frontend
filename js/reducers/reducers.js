/**
 * Created by abradley on 08/03/2018.
 */
import { combineReducers } from 'redux';
import apiRed from './apiReducers';
import nglRed from './nglReducers';
import selectionRed from './selectionReducers';
import renderReducers from './renderReducers';
import { loadingBarReducer } from 'react-redux-loading-bar';
import {reducer as burgerMenu} from 'redux-burger-menu';
import undoable from 'redux-undo';

const rootReducer = combineReducers({
    renderReducers,
    apiReducers: undoable(apiRed),
    burgerMenu,
    loadingBar: loadingBarReducer,
    nglReducers: undoable(nglRed),
    selectionReducers: undoable(selectionRed)
})

export default rootReducer;