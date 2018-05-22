/**
 * Created by abradley on 15/03/2018.
 */

import {STATE_ALERT} from './actonTypes'

export const stateAlert = function (){
    console.log("ACTIONS: state alert")
    return {
        type: STATE_ALERT,
    }
}

