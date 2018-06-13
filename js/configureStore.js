/**
 * Created by abradley on 07/03/2018.
 */
import { commpose, createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import rootReducer from './reducers/reducers'
import { createBrowserHistory } from 'history'
import {routerMiddleware} from "react-router-redux";


const loggerMiddleware = createLogger()
const history = createBrowserHistory()
const middleware = routerMiddleware(history);
 
export default function
    configureStore() {
  return createStore(
    rootReducer,
    applyMiddleware(
        thunkMiddleware,
        middleware,
        loggerMiddleware
    )
  )
}