// return querystring parameter by name
function getQueryStringParameterByName(name) {
    const href = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(href);
    //if (!results) return null;
    if (!results) return '';  // return empty string so we don't have to check for null
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// inspect any obj for debugging - TODO add recursion
function inspect(obj) {
    console.log('util: inspect --------------------------');
    if (Array.isArray(obj)) { // array is obj too so expicitly check for it before checking for object
        console.log('obj is array');
        obj.forEach((item) => console.log(item));
    } else if (obj instanceof Object){
        for (var prop in obj) {
            console.log(prop + '=' + obj[prop]);
        }
    } else {
        console.log(typeof obj);
    }
}
/**
 * Utility to function to check if two arrays are the same
 * @param a
 * @param b
 * @returns {boolean}
 */
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
export function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export { getQueryStringParameterByName, inspect }
