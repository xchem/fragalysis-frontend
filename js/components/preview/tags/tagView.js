import React, { memo, useState } from 'react';
import { Grid, makeStyles, Chip, Tooltip, Avatar } from '@material-ui/core';
import { Edit, Check } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getFontColorByBackgroundColor } from '../../../utils/colors';
import { TagEditModal } from './modal/tagEditModal';
import classNames from 'classnames';

const useStyles = makeStyles(theme => ({
  tagItem: {
    paddingBottom: 0
  },
  tagDetailsItem: {
    alignSelf: 'stretch',
    display: 'grid',
    placeContent: 'stretch flex-start'
  },
  chip: {
    // maxWidth: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderRadius: '7px',
    //lineHeight: '0',
    textAlign: 'center',
    '& .MuiChip-labelSmall': {
      overflowWrap: 'anywhere',
      whiteSpace: 'normal',
      textOverflow: 'clip',
      paddingLeft: '2px',
      paddingRight: '2px',
      fontWeight: '400',
      fontStyle: 'normal',
      letterSpacing: '0.144px',
      width: 'inherit',
      textAlign: 'left'
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
  tagDetailsChip: {
    height: '100% !important',
    margin: '0 !important',
    padding: '0 !important',
    '& .MuiChip-labelSmall': {
      //textAlign: 'left !important'
    },
    width: '160px'
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
  },
  check: {
    width: '0.6em',
    height: '0.6em'
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
    isTagEditor = false,
    partiallySelected = false
  }) => {
    const originalTagData = tag;
    const classes = useStyles();
    const dispatch = useDispatch();
    const [tagEditModalOpen, setTagEditModalOpen] = useState(false);

    const tagDetailView = useSelector(state => state.selectionReducers.tagDetailView);

    let tagData = [];
    if (originalTagData.tag.length > 23) {
      tagData = { ...originalTagData, tag: originalTagData.tag.slice(0, 23) + '...' };
    } else {
      tagData = originalTagData;
    }

    const bgColor = tagData.colour || '#e0e0e0';
    const color = getFontColorByBackgroundColor(bgColor);

    const style = isTagEditor
      ? {
          backgroundColor: bgColor,
          color: color,
          border: `1px solid ${bgColor}` ,
          width: tagDetailView === true ? '160px' : '200px'
        }
      : selected
      ? {
          backgroundColor: bgColor,
          color: color,
          width: '160px'
        }
      : {
          backgroundColor: 'white',
          color: 'black',
          borderColor: bgColor,
          width: '160px'
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
      // If in Tag Details
      if (isTagEditor) {
        if (selected) {
          return {
            size: 'small',
            className: `${classes.chip} ${selected && !isSpecialTag ? classes.chipSelected : null} ${
              classes.tagDetailsChip
            }`,
            label: tagDetailView === true ? tagData.tag : originalTagData.tag,
            clickable: true,
            color: bgColor,
            style: style,
            onClick: () => {
              handleClick && handleClick(selected, tag, allTags);
            },
            deleteIcon: getDeleteIcon(),
            onDelete: getDeleteAction()
          };
        } else {
          return {
            size: 'small',
            className: `${classes.chip} ${selected && !isSpecialTag ? classes.chipSelected : null} ${
              classes.tagDetailsChip
            }`,
            label: tagDetailView === true ? tagData.tag : originalTagData.tag,
            clickable: true,
            color: bgColor,
            style: {
              backgroundColor: 'white',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderColor: bgColor,
              width: tagDetailView === true ? '160px' : '200px'
            },
            onClick: () => {
              handleClick && handleClick(selected, tag, allTags);
            },
            deleteIcon: getDeleteIcon(),
            onDelete: getDeleteAction()
          };
        }
      }
      // If in Hit List Filter
      if (selected) {
        return {
          size: 'small',
          className: `${classes.chip} ${selected && !isSpecialTag ? classes.chipSelected : null}`,
          label: partiallySelected ? `${tagData.tag}*` : tagData.tag,
          clickable: true,
          color: bgColor,
          borderColor: bgColor,
          style: style,
          onClick: () => {
            handleClick && handleClick(selected, tag, allTags);
          },
          deleteIcon: getDeleteIcon(),
          onDelete: getDeleteAction()
        };
      }

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
        onDelete: getDeleteAction()
      };
    };

    return (
      <>
        <Grid className={classNames(classes.tagItem, { [classes.tagDetailsItem]: isTagEditor })}>
          <Tooltip title={originalTagData.tag} placement="top">
            <Chip {...generateProps()} />
          </Tooltip>
        </Grid>
        <TagEditModal openDialog={tagEditModalOpen} setOpenDialog={setTagEditModalOpen} tag={tag} />
      </>
    );
  }
);

export default TagView;
