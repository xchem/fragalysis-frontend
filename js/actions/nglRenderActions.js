/**
 * Created by abradley on 03/03/2018.
 */

import {
    SET_COLOR,
    SET_STYLE,
    SET_SPIN,
    SET_WATER,
    SET_HYDROGEN,
} from './actonTypes'

export const setColor = function (color) {
    console.log("ACTIONS: " + color);
    return {
        type: SET_COLOR,
        color: color
    };
}

export const setStyle = function (style) {
    console.log("ACTIONS: " + style);
    return {
        type: SET_STYLE,
        style: style
    };
}

export const setSpin = function (spin) {
    console.log("ACTIONS: " + spin);
    return {
        type: SET_SPIN,
        spin: spin
    };
}

export const setWater = function (water) {
    console.log("ACTIONS: " + water);
    return {
        type: SET_WATER,
        spin: water
    };
}

export const setHydrogen = function (hydrogen) {
    console.log("ACTIONS: " + hydrogen);
    return {
        type: SET_HYDROGEN,
        spin: hydrogen
    };
}

export const setAssemblyOptions = function (structure) {
    console.log("Dispatching Set Assembly Options");
    const options = [];
    const biomolDict = structure.biomolDict;
    if( !structure.unitcell && Object.keys( biomolDict ).length === 1 &&
        biomolDict.BU1 && biomolDict.BU1.isIdentity( structure )
    ) {
        // don't add an entry for "Asymmetric Unit" / "Full Structure" as
        // there is only one bioassembly with an identity transform on all chains
        options.push({
            value: "BU1",
            label: "Full Structure"
        });
    } else {
        options.push({
            value: "__AU",
            label: structure.unitcell ? "Asymmetric Unit" : "Full Structure"
        });
        for( const name in biomolDict ){
            if( name === "UNITCELL" ) {
                options.push({
                    value: name,
                    label: "Unitcell"
                });
            }else if( name === "SUPERCELL" ) {
                options.push({
                    value: name,
                    label: "Supercell"
                });
            }else if( name.substr( 0, 2 ) === "BU" ) {
                options.push({
                    value: name,
                    label: "Bioassembly " + name.substr( 2 )
                });
            }else{
                options.push({
                    value: name,
                    label: name
                });
            }
        }
    }
    return {
        type: SET_ASSEMBLY_OPTIONS,
        assemblyOptions: options
    };
}
