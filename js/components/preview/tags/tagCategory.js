import React, { memo } from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import TagCategoryView from './tagCategoryView';
import { CATEGORY_TYPE } from '../../../constants/constants';

const useStyles = makeStyles(theme => ({
  categoryItem: {
    paddingRight: '5px'
  }
}));

const TagCategory = memo(({}) => {
  const classes = useStyles();

  const categoryList = useSelector(state => state.selectionReducers.categoryList);
  const tagList = useSelector(state => state.selectionReducers.tagList);

  const siteCategory = categoryList.find(c => c.text === CATEGORY_TYPE.SITE);
  const seriesCategory = categoryList.find(c => c.text === CATEGORY_TYPE.SERIES);
  const forumCategory = categoryList.find(c => c.text === CATEGORY_TYPE.FORUM);

  const siteTags = tagList.filter(c => c.category === siteCategory?.id);
  const seriesTags = tagList.filter(c => c.category === seriesCategory?.id);
  const forumTags = tagList.filter(c => c.category === forumCategory?.id);
  const otherTags = tagList.filter(
    c => c.category !== siteCategory?.id && c.category !== seriesCategory?.id && c.category !== forumCategory?.id
  );

  return (
    <>
      <Grid container>
        <Grid item className={classes.categoryItem} xs={3}>
          <Typography variant="h6" noWrap>
            {CATEGORY_TYPE.SITE}
          </Typography>
        </Grid>
        <Grid item className={classes.categoryItem} xs={3}>
          <Typography variant="h6" noWrap>
            {CATEGORY_TYPE.SERIES}
          </Typography>
        </Grid>
        <Grid item className={classes.categoryItem} xs={3}>
          <Typography variant="h6" noWrap>
            {CATEGORY_TYPE.FORUM}
          </Typography>
        </Grid>
        <Grid item className={classes.categoryItem} xs={3}>
          <Typography variant="h6" noWrap>
            {CATEGORY_TYPE.OTHER}
          </Typography>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item className={classes.categoryItem} xs={3}>
          <TagCategoryView name={CATEGORY_TYPE.SITE} tags={siteTags} />
        </Grid>
        <Grid item className={classes.categoryItem} xs={3}>
          <TagCategoryView name={CATEGORY_TYPE.SERIES} tags={seriesTags} />
        </Grid>
        <Grid item className={classes.categoryItem} xs={3}>
          <TagCategoryView name={CATEGORY_TYPE.FORUM} tags={forumTags} />
        </Grid>
        <Grid item className={classes.categoryItem} xs={3}>
          <TagCategoryView name={CATEGORY_TYPE.OTHER} tags={otherTags} />
        </Grid>
      </Grid>
    </>
  );
});

export default TagCategory;
