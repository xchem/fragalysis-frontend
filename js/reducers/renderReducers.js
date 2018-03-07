/**
 * Created by abradley on 07/03/2018.
 */
import * as actions from '../actions/actonTypes'


const INITIALSTATE = {

}


export default function apiReducers(state = INITIALSTATE, action) {
    console.log('REDUCERS FIRED OFF. OLD STATE');
    console.log(state);
    console.log('action.type=' + action.type);

    switch (action.type) {
        // Defined in initialState - but may be needed if we want to load a different structure
        case actions.RECEIVE_DATA_FROM_API:
            return Object.assign({}, state, {
                element_type: action.element_type,
                children: action.children,
                receivedAt: action.date
            });
        
        // Cases like: @@redux/INIT
        default:
            return state;
    }
}
