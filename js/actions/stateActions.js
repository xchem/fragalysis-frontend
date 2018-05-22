/**
 * Created by abradley on 15/03/2018.
 */

import {STATE_ALERT, STATE_SPECIFY} from './actonTypes'

export const stateAlert = function (){
    console.log("ACTIONS: user extracting state")
    return {
        type: STATE_ALERT
    }
}

export const stateSpecify = function (){
    console.log("ACTIONS: user inserting state")
    return {
        type: STATE_SPECIFY
    }
}

