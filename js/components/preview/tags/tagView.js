import React, { memo, useState } from 'react';
import { Grid, makeStyles, Chip, Tooltip, Avatar } from '@material-ui/core';
import { Edit, Check } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import { getFontColorByBackgroundColor } from '../../../utils/colors';
import { TagEditModal } from './modal/tagEditModal';

const useStyles = makeStyles(theme => ({
  tagItem: {
    paddingBottom: 6
  },
  chip: {
    // maxWidth: '100%',
    margin: theme.spacing(1),
    height: '100%',
    // display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    '& .MuiChip-label': {
      overflowWrap: 'break-word',
      whiteSpace: 'normal',
      textOverflow: 'clip'
    },
    '& .MuiChip-deleteIcon': {
      display: 'none',
      alignItems: ''
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
  ({
    tag,
    selected,
    allTags,
    isSpecialTag,
    handleClick,
    editable = false,
    disabled = false,
    isEdit = false,
    isTagEditor = false
  }) => {
    const tagData = tag;
    const classes = useStyles();
    const dispatch = useDispatch();
    const [tagEditModalOpen, setTagEditModalOpen] = useState(false);

    // console.log(`Tag: ${tagData.tag}`);
    // console.log(`tagColor: ${tagColor}`);
    const bgColor = tagData.colour || '#e0e0e0';
    // console.log(`bgColor: ${bgColor}`);
    const color = getFontColorByBackgroundColor(bgColor);
    // console.log(`font color: ${color}`);
    const style = isTagEditor
      ? { backgroundColor: bgColor, color: color }
      : selected
      ? { backgroundColor: bgColor, color: color }
      : { backgroundColor: 'white', color: 'black', borderColor: bgColor };
    // console.log(`style: ${style}`);

    // console.log('-------------------------------');
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
        return <Edit onClick={() => handleClick && handleClick(selected, tag, allTags)} style={{ color: color }} />;
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

    const generateProps = () => {
      if (selected && isTagEditor) {
        return {
          size: 'small',
          className: `${classes.chip} ${selected && !isSpecialTag ? classes.chipSelected : null}`,
          label: tagData.tag,
          clickable: true,
          color: bgColor,
          style: style,
          onClick: () => {
            handleClick && handleClick(selected, tag, allTags);
          },
          deleteIcon: getDeleteIcon(),
          onDelete: getDeleteAction(),
          disabled: determineDisabled(),
          icon: (
            <Avatar style={{ backgroundColor: bgColor }}>
              <Check style={{ color: color }} />
            </Avatar>
          )
        };
      } else {
        if (selected || isTagEditor) {
          return {
            size: 'small',
            className: `${classes.chip} ${selected && !isSpecialTag ? classes.chipSelected : null}`,
            label: tagData.tag,
            clickable: true,
            color: bgColor,
            borderColor: bgColor,
            style: style,
            onClick: () => {
              handleClick && handleClick(selected, tag, allTags);
            },
            deleteIcon: getDeleteIcon(),
            onDelete: getDeleteAction(),
            disabled: determineDisabled(),
            icon: (
              <Avatar style={{ backgroundColor: bgColor }}>
                <Check style={{ color: bgColor }} />
              </Avatar>
            )
          };
        } else {
          return {
            size: 'small',
            className: `${classes.chip} ${selected && !isSpecialTag ? classes.chipSelected : null}`,
            label: tagData.tag,
            clickable: true,
            color: bgColor,
            borderColor: bgColor,
            style: style,
            variant: 'outlined',
            onClick: () => {
              handleClick && handleClick(selected, tag, allTags);
            },
            deleteIcon: getDeleteIcon(),
            onDelete: getDeleteAction(),
            disabled: determineDisabled(),
            icon: (
              <Avatar style={{ backgroundColor: bgColor }}>
                <Check style={{ color: bgColor }} />
              </Avatar>
            )
          };
        }
      }
    };

    return (
      <>
        <Grid className={classes.tagItem}>
          <Tooltip title={tagData.tag} placement="top">
            <Chip {...generateProps()} />
          </Tooltip>
        </Grid>
        <TagEditModal openDialog={tagEditModalOpen} setOpenDialog={setTagEditModalOpen} tag={tag} />
      </>
    );
  }
);

export default TagView;
