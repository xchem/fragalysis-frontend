import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NGL_OBJECTS } from './constants';
import {
  appendVectorOnList,
  removeFromToBeDisplayedList,
  removeFromVectorOnList,
  setVectorList,
  updateBondColorMapOfCompounds,
  updateInToBeDisplayedList,
  updateVectorCompounds
} from '../selection/actions';
import { generateMoleculeId } from '../../components/nglView/generatingObjects';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../../components/nglView/nglProvider';
import { deleteObject, setOrientation } from './dispatchActions';
import { base_url } from '../../components/routes/constants';
import { getToBeDisplayedStructures } from './utils';
import { selectVectorAndResetCompounds } from '../selection/dispatchActions';
import { api } from '../../utils/api';
import { getViewUrl, handleVector, removeCurrentVector } from '../../components/preview/molecule/redux/dispatchActions';

export const useDisplayVectorLHS = () => {
  const dispatch = useDispatch();

  const toBeDisplayedList = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const displayedVectors = useSelector(state => state.selectionReducers.vectorOnList);
  const allObservations = useSelector(state => state.apiReducers.all_mol_lists);
  const currentVector = useSelector(state => state.selectionReducers.currentVector);
  const vector_list = useSelector(state => state.selectionReducers.vector_list);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const displayVector = useCallback(
    vectorData => {
      const data = allObservations.find(obs => obs.id === vectorData.id);
      if (!data) return;

      dispatch(appendVectorOnList(generateMoleculeId(data)));
      dispatch(selectVectorAndResetCompounds(currentVector));

      return api({ url: getViewUrl('graph', data) })
        .then(response => {
          const result = response.data.graph;
          const new_dict = {};
          // Uniquify
          if (result) {
            Object.keys(result).forEach(key => {
              const smiSet = new Set();
              new_dict[key] = {};
              new_dict[key]['addition'] = [];
              new_dict[key]['vector'] = result[key]['vector'];
              Object.keys(result[key]['addition']).forEach(index => {
                const newSmi = result[key]['addition'][index]['end'];
                if (smiSet.has(newSmi) !== true) {
                  new_dict[key]['addition'].push(result[key]['addition'][index]);
                  smiSet.add(newSmi);
                }
              });
            });
          }
          return dispatch(updateVectorCompounds(data.smiles, new_dict));
        })
        .then(() => api({ url: new URL(base_url + '/api/vector/?id=' + data.id) }))
        .then(response => {
          return dispatch(handleVector(response.data?.results[0]?.vectors, stage, data));
        })
        .then(() => {
          dispatch(updateInToBeDisplayedList({ id: data.id, rendered: true, type: NGL_OBJECTS.VECTOR }));
        });
    },
    [allObservations, currentVector, dispatch, stage]
  );

  const removeVector = useCallback(
    vectorData => {
      const data = allObservations.find(obs => obs.id === vectorData.id);
      if (!data) return;

      vector_list
        .filter(item => item.moleculeId === data.id)
        .forEach(item => dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item), stage)));

      dispatch(removeCurrentVector(data.smiles));

      dispatch(updateVectorCompounds(data.smiles, undefined));
      dispatch(updateBondColorMapOfCompounds(data.smiles, undefined));
      dispatch(removeFromVectorOnList(generateMoleculeId(data)));

      dispatch(setVectorList(vector_list.filter(item => item.moleculeId !== data.id)));

      dispatch(removeFromToBeDisplayedList({ id: vectorData.id, type: NGL_OBJECTS.VECTOR }));
    },
    [allObservations, dispatch, stage, vector_list]
  );

  useEffect(() => {
    const toBeDisplayedVectors = getToBeDisplayedStructures(toBeDisplayedList, displayedVectors, NGL_OBJECTS.VECTOR);
    toBeDisplayedVectors?.forEach(data => {
      displayVector(data);
    });

    const toBeRemovedVectors = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedVectors,
      NGL_OBJECTS.VECTOR,
      true
    );
    toBeRemovedVectors?.forEach(data => {
      removeVector(data);
    });
  }, [toBeDisplayedList, displayVector, dispatch, stage, removeVector, displayedVectors]);

  return {};
};
