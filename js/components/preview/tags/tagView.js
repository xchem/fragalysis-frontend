import React, { memo, useState } from 'react';
import { Grid, makeStyles, Chip, Tooltip } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
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
    },
    '&:hover': {
      '& .MuiChip-deleteIcon': {
        display: 'block'
      }
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

const TagView = memo(
  ({ tag, selected, allTags, isSpecialTag, handleClick, editable = false, disabled = false, isEdit = false }) => {
    const tagData = tag;
    const classes = useStyles();
    const dispatch = useDispatch();
    const [tagEditModalOpen, setTagEditModalOpen] = useState(false);

    const tagColor = selected ? 'primary' : 'default';
    const bgColor = selected ? tagColor : (tagData.colour && tagData.colour) || tagColor;
    const color = getFontColorByBackgroundColor(bgColor);
    const style = selected ? {} : { backgroundColor: bgColor, color: color };

    const isTagDisabled = false;

    const determineDisabled = () => {
      let result = false;
      if (isEdit && disabled) {
        result = true;
      }
      return result;
    };

    const handleDelete = () => {
      if (editable) {
        setTagEditModalOpen(true);
      }
    };

    const getDeleteIcon = () => {
      if (editable) {
        return <Edit onClick={() => handleClick && handleClick(selected, tag, allTags)} />;
      } else {
        return null;
      }
    };

    const getDeleteAction = () => {
      if (editable) {
        return () => handleDelete && handleDelete(selected, tag, allTags);
      } else {
        return null;
      }
    };

    return (
      <>
        <Grid className={classes.tagItem}>
          <Tooltip title={tagData.tag}>
            <Chip
              size="small"
              className={`${classes.chip} ${selected && !isSpecialTag ? classes.chipSelected : null}`}
              label={tagData.tag}
              clickable
              color={tagColor}
              style={style}
              onClick={() => handleClick && handleClick(selected, tag, allTags)}
              deleteIcon={getDeleteIcon()}
              onDelete={getDeleteAction()}
              disabled={determineDisabled()}
            />
          </Tooltip>
        </Grid>
        <TagEditModal openDialog={tagEditModalOpen} setOpenDialog={setTagEditModalOpen} tag={tag} />
      </>
    );
  }
);

export default TagView;
