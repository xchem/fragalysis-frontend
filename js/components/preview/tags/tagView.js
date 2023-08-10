import React, { memo, useState } from 'react';
import { Grid, makeStyles, Chip, Tooltip, Avatar } from '@material-ui/core';
import { Edit, Check } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
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
    lineHeight: '1.1',
    textAlign: 'center',
    '& .MuiChip-labelSmall': {
      overflowWrap: 'anywhere',
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
  tagDetailsChip: {
    height: '100% !important',
    margin: '0 !important',
    padding: '0 !important',
    '& .MuiChip-labelSmall': {
      textAlign: 'left !important'
    },
    width: '200px'
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
      // If in Tag Details
      if (isTagEditor) {
        if (selected) {
          return {
            size: 'small',
            className: `${classes.chip} ${selected && !isSpecialTag ? classes.chipSelected : null} ${
              classes.tagDetailsChip
            }`,
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
                <Check className={classes.check} style={{ color: color }} />
              </Avatar>
            )
          };
        } else {
          return {
            size: 'small',
            className: `${classes.chip} ${selected && !isSpecialTag ? classes.chipSelected : null} ${
              classes.tagDetailsChip
            }`,
            label: tagData.tag,
            clickable: true,
            color: bgColor,
            style: { backgroundColor: 'white', border: '1px solid rgba(0, 0, 0, 0.23)', borderColor: bgColor },
            onClick: () => {
              handleClick && handleClick(selected, tag, allTags);
            },
            deleteIcon: getDeleteIcon(),
            onDelete: getDeleteAction(),
            disabled: determineDisabled()
          };
        }
        else {
          return {
            size: 'small',
            className: `${classes.chip} ${selected && !isSpecialTag ? classes.chipSelected : null} ${
              classes.tagDetailsChip
            }`,
            label: tagData.tag,
            clickable: true,
            color: bgColor,
            style: {backgroundColor: 'white',
            border: '1px solid rgba(0, 0, 0, 0.23)'},
            onClick: () => {
              handleClick && handleClick(selected, tag, allTags);
            },
            deleteIcon: getDeleteIcon(),
            onDelete: getDeleteAction(),
            disabled: determineDisabled(),
          };
        }

        return {
          size: 'small',
          className: `${classes.chip} ${selected && !isSpecialTag ? classes.chipSelected : null} ${
            classes.tagDetailsChip
          }`,
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
              <Check className={classes.check} style={{ color: bgColor }} />
            </Avatar>
          )
        };
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
          onDelete: getDeleteAction(),
          disabled: determineDisabled()
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
        onDelete: getDeleteAction(),
        disabled: determineDisabled()
      };
    };

    return (
      <>
        <Grid className={classNames(classes.tagItem, { [classes.tagDetailsItem]: isTagEditor })}>
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
