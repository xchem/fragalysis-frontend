import React, { memo, useState } from 'react';
import { Grid, makeStyles, Chip, Tooltip, Avatar } from '@material-ui/core';
import { Edit, Check } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import { getFontColorByBackgroundColor } from '../../../utils/colors';
import { TagEditModal } from './modal/tagEditModal';

const useStyles = makeStyles(theme => ({
  tagItem: {
    paddingBottom: 0
  },
  chip: {
    // maxWidth: '100%',
    margin: '2px', //theme.spacing(1),
    height: '80%', //'100%'
    // display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderRadius: '7px',
    lineHeight: '1.1',
    textAlign: 'center',
    paddingBottom: '2px',
    '& .MuiChip-labelSmall': {
      overflowWrap: 'break-word',
      whiteSpace: 'normal',
      textOverflow: 'clip',
      paddingLeft: '2px',
      paddingRight: '2px',
      fontWeight: '400',
      fontStyle: 'normal',
      letterSpacing: '0.144px'
    },
    '& .MuiChip-deleteIcon': {
      display: 'none',
      alignItems: ''
    },
    '&:hover': {
      '& .MuiChip-deleteIcon': {
        display: 'block'
      }
    },
    '& .MuiChip-iconSmall': {
      width: '9px',
      height: '95%',
      marginRight: '0px',
      marginLeft: '0px'
    },
    '& .MuiChip-outlined': {
      marginLeft: '0px'
    }
  },
  chipSelected: {
    '& .MuiChip-iconSmall': {
      width: '18px'
    },
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
      // let result = false;
      // if (isEdit && disabled) {
      //   result = true;
      // }
      // return result;
      return disabled;
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
              <Avatar style={{ backgroundColor: bgColor, borderRadius: '9px' }}>
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
              <Avatar style={{ backgroundColor: bgColor, borderRadius: '9px' }}>
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
