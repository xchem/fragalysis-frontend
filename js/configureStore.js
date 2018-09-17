/**
 * Created by abradley on 07/03/2018.
 */

import {createStore, applyMiddleware} from "redux";
import thunkMiddleware from "redux-thunk";
import {createLogger} from "redux-logger";
import rootReducer from "./reducers/reducers";

const loggerMiddleware = createLogger()
 
export default function
    configureStore() {
  return createStore(
    rootReducer,
    applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
    )
  )
}