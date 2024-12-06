import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTagMolecules, getTags } from './api/tagsApi';
import { setMoleculeTags } from '../../../reducers/api/actions';
import { loadMoleculesAndTagsNew } from '../tags/redux/dispatchActions';
import { compareTagsAsc } from '../tags/utils/tagUtils';

export const withLoadingMolecules = WrappedComponent => {
  return memo(({ ...rest }) => {
    return <WrappedComponent {...rest} />;
  });
};
