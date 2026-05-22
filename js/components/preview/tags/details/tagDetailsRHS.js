import React, { memo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getRHSTags } from '../../../../reducers/api/selectors';
import { layoutItemNames } from '../../../../reducers/layout/constants';
import {
  setRHSTagFilteringMode,
  setRHSDisplayAllMolecules,
  setRHSDisplayUntaggedMolecules,
  setRHSTagDetailView,
  setRHSSelectedTags
} from '../../../../reducers/selection/actions';
import { selectAllTags, clearAllTags } from '../redux/dispatchActions';
import TagDetails from './tagDetails';
import { TagDetailRowRHS } from './tagDetailRowRHS';
import { TagGridRowsRHS } from './tagGridRowsRHS';
import { TAG_META_CATEGORIES } from '../utils/tagUtils';

export const TagDetailsRHS = memo(({ expandHandler = null }) => {
  const dispatch = useDispatch();
  const preTagList = useSelector(state => getRHSTags(state));
  const tagFilteringMode = useSelector(state => state.selectionReducers.rhs_tagFilteringMode);
  const displayAllMolecules = useSelector(state => state.selectionReducers.rhs_displayAllMolecules);
  const displayUntaggedMolecules = useSelector(state => state.selectionReducers.rhs_displayUntaggedMolecules);
  const tagDetailView = useSelector(state => state.selectionReducers.rhs_tagDetailView);

  const handleTagFilteringModeChange = useCallback(
    mode => {
      dispatch(setRHSTagFilteringMode(mode));
    },
    [dispatch]
  );

  const handleDisplayAllMoleculesChange = useCallback(
    value => {
      dispatch(setRHSDisplayAllMolecules(value));
    },
    [dispatch]
  );

  const handleDisplayUntaggedMoleculesChange = useCallback(
    value => {
      dispatch(setRHSDisplayUntaggedMolecules(value));
    },
    [dispatch]
  );

  const handleTagDetailViewChange = useCallback(
    value => {
      dispatch(setRHSTagDetailView(value));
    },
    [dispatch]
  );

  const handleSelectAllTags = useCallback(
    tags => {
      dispatch(setRHSSelectedTags(tags));
    },
    [dispatch]
  );

  const handleClearAllTags = useCallback(() => {
    dispatch(setRHSSelectedTags([]));
  }, [dispatch]);

  return (
    <TagDetails
      preTagList={preTagList}
      panelLayoutItemName={layoutItemNames.RHS_TAG_DETAILS}
      expandHandler={expandHandler}
      TagDetailRowComponent={TagDetailRowRHS}
      TagGridRowsComponent={TagGridRowsRHS}
      tagFilteringMode={tagFilteringMode}
      displayAllMolecules={displayAllMolecules}
      displayUntaggedMolecules={displayUntaggedMolecules}
      tagDetailView={tagDetailView}
      onTagFilteringModeChange={handleTagFilteringModeChange}
      onDisplayAllMoleculesChange={handleDisplayAllMoleculesChange}
      onDisplayUntaggedMoleculesChange={handleDisplayUntaggedMoleculesChange}
      onTagDetailViewChange={handleTagDetailViewChange}
      onSelectAllTags={handleSelectAllTags}
      onClearAllTags={handleClearAllTags}
      metaCategory={TAG_META_CATEGORIES.RHS}
    />
  );
});

export default TagDetailsRHS;
