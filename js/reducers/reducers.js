/**
 * Created by abradley on 08/03/2018.
 */
import {combineReducers} from "redux";
import apiRed from "./apiReducers";
import nglRed from "./nglReducers";
import selectionRed from "./selectionReducers";
import renderReducers from "./renderReducers";
import {loadingBarReducer} from "react-redux-loading-bar";
import undoable from "redux-undo";

const rootReducer = combineReducers({
    renderReducers,
    apiReducers: undoable(apiRed, {limit: 10}),
    loadingBar: loadingBarReducer,
    nglReducers: undoable(nglRed, {limit: 10}),
    selectionReducers: undoable(selectionRed, {limit: 10})
})

export default rootReducer;