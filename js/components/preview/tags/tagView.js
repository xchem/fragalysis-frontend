import React, { memo, useState } from 'react';
import { Grid, makeStyles, Chip, Tooltip } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import { addSelectedTag, removeSelectedTag } from './redux/dispatchActions';
import { getFontColorByBackgroundColor } from '../../../utils/colors';
import { TagEditModal } from './modal/tagEditModal';

const useStyles = makeStyles(theme => ({
  tagItem: {
    paddingBottom: 6
  },
  chip: {
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '& .MuiChip-deleteIcon': {
      display: 'none'
    }
  },
  chipSelected: {
    '& .MuiChip-deleteIcon': {
      display: 'none'
    },
    '&:hover': {
      '& .MuiChip-deleteIcon': {
        display: 'block'
      }
    }
  }
}));

const TagView = memo(({ tag, selected, allTags }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [tagEditModalOpen, setTagEditModalOpen] = useState(false);

  const tagColor = selected ? 'primary' : 'default';
  const bgColor = selected ? tagColor : (tag.color && tag.color) || tagColor;
  const color = getFontColorByBackgroundColor(bgColor);
  const style = selected ? {} : { backgroundColor: bgColor, color: color };

  const handleClick = () => {
    if (selected) {
      dispatch(removeSelectedTag(tag, allTags));
    } else {
      dispatch(addSelectedTag(tag, allTags));
    }
  };

  const handleDelete = () => {
    setTagEditModalOpen(true);
  };

  return (
    <>
      <Grid className={classes.tagItem}>
        <Tooltip title={tag.text}>
          <Chip
            size="small"
            className={`${classes.chip} ${selected ? classes.chipSelected : null}`}
            label={tag.text}
            clickable
            color={tagColor}
            style={style}
            onClick={handleClick}
            deleteIcon={<Edit onClick={handleDelete} />}
            onDelete={handleDelete}
          />
        </Tooltip>
      </Grid>
      <TagEditModal openDialog={tagEditModalOpen} setOpenDialog={setTagEditModalOpen} tag={tag} />
    </>
  );
});

export default TagView;
