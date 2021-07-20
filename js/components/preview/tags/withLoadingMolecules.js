import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllData } from './api/tagsApi';
import { setAllMolecules, setAllMolLists } from '../../../reducers/api/actions';
import { setTagSelectorData } from '../tags/redux/dispatchActions';

export const withLoadingMolecules = WrappedComponent => {
  return memo(({ ...rest }) => {
    const dispatch = useDispatch();

    const target_on = useSelector(state => state.apiReducers.target_on);

    useEffect(() => {
      if (target_on) {
        getAllData(target_on).then(data => {
          let allMolecules = [];
          data.molecules.forEach(mol => {
            let newObject = {};
            Object.keys(mol.data).forEach(prop => {
              newObject[`${prop}`] = mol.data[`${prop}`];
            });
            newObject['tags_set'] = mol.tags_set;

            allMolecules.push(newObject);
          });
          dispatch(setAllMolecules([...allMolecules]));
          dispatch(setAllMolLists([...allMolecules]));

          let tags_info = [];
          data.tags_info.forEach(tag => {
            let newObject = {};
            Object.keys(tag.data[0]).forEach(prop => {
              newObject[`${prop}`] = tag.data[0][`${prop}`];
            });
            let coords = {};
            Object.keys(tag.coords[0]).forEach(prop => {
              coords[`${prop}`] = tag.coords[0][`${prop}`];
            });
            newObject['coords'] = coords;

            tags_info.push(newObject);
          });

          const categories = data.tag_categories;

          dispatch(setTagSelectorData(categories, tags_info));
        });
      }
    }, [dispatch, target_on]);

    return <WrappedComponent {...rest} />;
  });
};
