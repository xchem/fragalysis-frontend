/**
 * Created by abradley on 07/03/2018.
 */
import * as actions from '../actions/actonTypes'


const INITIALSTATE = {

}


export default function stateReducers(state = INITIALSTATE, action) {
    console.log(state);
    alert(state);

    switch (action.type) {
        // Defined in initialState - but may be needed if we want to load a different structure
        case actions.STATE_ALERT:
            return Object.assign({}, state, {

            });

        // Cases like: @@redux/INIT
        default:
            return state;
    }
}
