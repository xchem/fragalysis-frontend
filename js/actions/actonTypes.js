/**
 * Created by abradley on 03/03/2018.
 */
// Define all of the actions in my application
// NGL loaders and deleters
export const LOAD_OBJECT = 'LOAD_OBJECT';
export const DELETE_OBJECT = 'DELETE_OBJECT';
export const LOAD_OBJECT_SUCCESS = 'LOAD_OBJECT_SUCCESS';
export const LOAD_OBJECT_FAILURE = 'LOAD_OBJECT_FAILURE';
export const DELETE_OBJECT_SUCCESS = 'DELETE_OBJECT_SUCCESS';
export const DELETE_OBJECT_FAILURE = 'DELETE_OBJECT_FAILURE';
// NGL scene setters
export const SET_COLOR = 'SET_COLOR';
export const SET_STYLE = 'SET_STYLE';
export const SET_SPIN = 'SET_SPIN';
export const SET_WATER = 'SET_WATER';
export const SET_HYDROGEN = 'SET_HYDROGEN';
// Target, Site, Molecule, Protein, Compound
export const LOAD_TARGETS = 'LOAD_TARGETS';
export const LOAD_PROTEINS = 'LOAD_PROTEINS';
export const LOAD_MOL_GROUPS = 'LOAD_MOL_GROUPS';
export const LOAD_MOLECULES = 'LOAD_MOLECULES';
export const LOAD_COMPOUNDS = 'LOAD_COMPOUNDS';
// Load data from the API
export const GET_FROM_API = 'GET_FROM_API';
export const GET_FROM_API_SUCCESS = 'GET_FROM_API_SUCCESS';
export const GET_FROM_API_FAILURE = 'GET_FROM_API_FAILURE';
export const RECEIVE_DATA_FROM_API = 'RECEIVE_DATA_FROM_API';
export const SET_TARGET_ID_LIST = 'SET_TARGET_ID_LIST';
export const SET_TARGET_ON = 'SET_TARGET_ON';
export const SET_MOL_GROUP_LIST = 'SET_MOL_GROUP_LIST';
export const SET_MOLECULE_LIST = 'SET_MOLECULE_LIST';
export const SET_MOL_GROUP_ON = 'SET_MOL_GROUP_ON';
export const OBJECT_LOADING = 'OBJECT_LOADING';
export const DELETE_OBJECT_TYPE = 'DELETE_OBJECT_TYPE';
export const SET_TO_BUY_LIST = 'SET_TO_BUY_LIST:';
export const APPEND_TO_BUY_LIST = 'APPEND_TO_BUY_LIST';
export const REMOVE_FROM_TO_BUY_LIST = 'REMOVE_FROM_TO_BUY_LIST';
export const POST_TO_API = 'POST_TO_API';
export const POST_TO_API_SUCCESS = 'POST_TO_API_SUCESS';
export const POST_TO_API_FAILURE = 'POST_TO_API_FAILURE';
// Pandda stuff
export const SET_PANNDA_EVENT_LIST = 'SET_PANNDA_EVENT_LIST';
export const SET_PANNDA_SITE_ON = 'SET_PANNDA_SITE_ON';
export const SET_PANNDA_EVENT_ON = 'SET_PANNDA_EVENT_ON';
export const SET_PANNDA_SITE_LIST = 'SET_PANNDA_SITE_LIST';
// Setting the display
export const SET_APP_ON = 'SET_APP_ON';
// Data related to network
export const GET_FULL_GRAPH = 'GET_FULL_GRAPH';
export const GOT_FULL_GRAPH = 'GOT_FULL_GRAPH';
export const SELECT_VECTOR = 'SELECT_VECTOR';
export const SET_MOL = 'SET_MOL';
export const SET_VECTOR_LIST = 'SET_VECTOR_LIST';
export const SET_ORIENTATION = 'SET_ORIENTATION'