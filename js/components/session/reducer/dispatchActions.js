import { SCENES } from '../../../reducers/ngl/nglConstants';
import { reloadApiState, setSessionId, setSessionTitle } from '../../../reducers/api/apiActions';
import { reloadSelectionReducer, setBondColorMap, setVectorList } from '../../../reducers/selection/selectionActions';
import { reloadNglViewFromScene } from '../../../reducers/ngl/nglDispatchActions';
import { api } from '../../../utils/api';
import { generateBondColorMap, generateObjectList } from '../helpers';

const handleVector = json => (dispatch, getState) => {
  let objList = generateObjectList(json['3d']);
  dispatch(setVectorList(objList));
  let vectorBondColorMap = generateBondColorMap(json['indices']);
  dispatch(setBondColorMap(vectorBondColorMap));
};

const redeployVectorsLocal = url => (dispatch, getState) => {
  return api({ url }).then(response => dispatch(handleVector(response.data['vectors'])));
};

export const reloadSession = (myJson, nglViewList) => (dispatch, getState) => {
  let jsonOfView = JSON.parse(JSON.parse(JSON.parse(myJson.scene)).state);
  dispatch(reloadApiState(jsonOfView.apiReducers.present));
  dispatch(setSessionId(myJson.id));
  if (nglViewList.length > 0) {
    dispatch(reloadSelectionReducer(jsonOfView.selectionReducers.present));
    nglViewList.forEach(nglView => {
      dispatch(reloadNglViewFromScene(nglView.stage, nglView.id, SCENES.sessionScene, jsonOfView));
    });
    if (jsonOfView.selectionReducers.present.vectorOnList.length !== 0) {
      let url =
        window.location.protocol +
        '//' +
        window.location.host +
        '/api/vector/' +
        jsonOfView.selectionReducers.present.vectorOnList[JSON.stringify(0)] +
        '/';
      dispatch(redeployVectorsLocal(url)).catch(error => {
        throw new Error(error);
      });
    }
    dispatch(setSessionTitle(myJson.title));
  }
};
