/**
 * Created by abradley on 07/03/2018.
 */
import { commpose, createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import rootReducer from './reducers/reducers'
import { createBrowserHistory } from 'history'
import { connectRouter, routerMiddleware } from 'connected-react-router'

const loggerMiddleware = createLogger()
const history = createBrowserHistory()

 
export default function
    configureStore() {
  return createStore(
    connectRouter(history)(rootReducer),
    applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
    )
  )
}