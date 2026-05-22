import React, { memo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getLHSTags } from '../../../../reducers/api/selectors';
import { layoutItemNames } from '../../../../reducers/layout/constants';
import {
  setLHSTagFilteringMode,
  setLHSDisplayAllMolecules,
  setLHSDisplayUntaggedMolecules,
  setLHSTagDetailView,
  setLHSSelectedTags
} from '../../../../reducers/selection/actions';
import { selectAllTags, clearAllTags } from '../redux/dispatchActions';
import TagDetails from './tagDetails';
import { TagDetailRowLHS } from './tagDetailRowLHS';
import { TagGridRowsLHS } from './tagGridRowsLHS';
import { TAG_META_CATEGORIES } from '../utils/tagUtils';

export const TagDetailsLHS = memo(({ expandHandler = null }) => {
  const dispatch = useDispatch();
  const preTagList = useSelector(state => getLHSTags(state));
  const tagFilteringMode = useSelector(state => state.selectionReducers.lhs_tagFilteringMode);
  const displayAllMolecules = useSelector(state => state.selectionReducers.lhs_displayAllMolecules);
  const displayUntaggedMolecules = useSelector(state => state.selectionReducers.lhs_displayUntaggedMolecules);
  const tagDetailView = useSelector(state => state.selectionReducers.lhs_tagDetailView);

  const handleTagFilteringModeChange = useCallback(
    mode => {
      dispatch(setLHSTagFilteringMode(mode));
    },
    [dispatch]
  );

  const handleDisplayAllMoleculesChange = useCallback(
    value => {
      dispatch(setLHSDisplayAllMolecules(value));
    },
    [dispatch]
  );

  const handleDisplayUntaggedMoleculesChange = useCallback(
    value => {
      dispatch(setLHSDisplayUntaggedMolecules(value));
    },
    [dispatch]
  );

  const handleTagDetailViewChange = useCallback(
    value => {
      dispatch(setLHSTagDetailView(value));
    },
    [dispatch]
  );

  const handleSelectAllTags = useCallback(
    tags => {
      dispatch(setLHSSelectedTags(tags));
    },
    [dispatch]
  );

  const handleClearAllTags = useCallback(() => {
    dispatch(setLHSSelectedTags([]));
  }, [dispatch]);

  return (
    <TagDetails
      preTagList={preTagList}
      panelLayoutItemName={layoutItemNames.TAG_DETAILS}
      expandHandler={expandHandler}
      TagDetailRowComponent={TagDetailRowLHS}
      TagGridRowsComponent={TagGridRowsLHS}
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
      metaCategory={TAG_META_CATEGORIES.LHS}
    />
  );
});

export default TagDetailsLHS;
