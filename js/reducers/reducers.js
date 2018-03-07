/**
 * Created by abradley on 07/03/2018.
 */
import { combineReducers } from 'redux'
import apiReducers from './apiReducers';
import nglReducers from './nglReducers';
import renderReducers from './renderReducers';


const rootReducer = combineReducers({
    renderReducers,
    apiReducers,
    nglReducers
})
 
export default rootReducer;