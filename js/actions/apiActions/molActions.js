/**
 * Created by abradley on 03/03/2018.
 */
import {LOAD_TARGETS, LOAD_MOLECULES, LOAD_MOL_GROUPS} from '../actonTypes'


export const loadTargets = function (project_id=null) {
    console.log("ACTIONS: " + group);
    return {
        type: LOAD_TARGETS,
        project_id: project_id
    };
}

export const loadMolGroups = function (target_id,group_type="MC") {
    console.log("ACTIONS: " + group);
    return {
        type: LOAD_MOL_GROUPS,
        target_id: target_id,
        group_type: group_type
    };
}

export const loadMolecules = function (target_id=null,group_id=null) {
    console.log("ACTIONS: " + group);
    return {
        type: LOAD_MOLECULES,
        target_id: target_id,
        group_id: group_id
    };
}

