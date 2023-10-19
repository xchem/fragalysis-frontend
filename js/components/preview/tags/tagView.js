import React, { memo, useState, useEffect } from 'react';
import { Grid, makeStyles, Chip, Tooltip, Avatar } from '@material-ui/core';
import { Edit, Check } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getFontColorByBackgroundColor } from '../../../utils/colors';
import { TagEditModal } from './modal/tagEditModal';
import classNames from 'classnames';
import { setAssignTagView } from '../../../reducers/selection/actions';

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
      width: 'inherit'
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
    //height: '100% !important',
    margin: '0 !important',
    padding: '0 !important',
    '& .MuiChip-labelSmall': {
      //textAlign: 'left !important'
    },
    width: '96px'
  },
  tagDetailsChipList: {
    height: '100% !important',
    margin: '0 !important',
    padding: '0 !important',
    '& .MuiChip-labelSmall': {
      //textAlign: 'left !important'
    },
    width: '96px'
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
    tags,
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

    let tagDetailView = useSelector(state => state.selectionReducers.tagDetailView);
    const assignTagView = useSelector(state => state.selectionReducers.assignTagView);

    useEffect(() => {
      if (assignTagView === undefined) {
        dispatch(setAssignTagView(false));
      }
    }, []);

    let tagData = [];
    const maxTagNameLength = 34;
    if (originalTagData.tag.length > maxTagNameLength) {
      tagData = { ...originalTagData, tag: originalTagData.tag.slice(0, maxTagNameLength) + '...' };
    } else {
      tagData = originalTagData;
    }

    const bgColor = tagData.colour || '#e0e0e0';
    const color = getFontColorByBackgroundColor(bgColor);
    tagDetailView = tagDetailView?.tagDetailView === undefined ? tagDetailView : tagDetailView.tagDetailView;

    let maxLengthTagDetail = 0;
    for (let tagNumber = 0; tagNumber < tags?.length; tagNumber++) {
      maxLengthTagDetail = tags[tagNumber].tag.length > maxLengthTagDetail ? tags[tagNumber].tag.length : maxLengthTagDetail;
    }

    const absoluteMaxTagLength = maxLengthTagDetail > 15 ? maxLengthTagDetail > 30 ? 48 : 30 : 19;

    const style = isTagEditor
      ? {
        backgroundColor: bgColor,
        color: color,
        width: tagDetailView === true ? '93px' : '200px',
        height: tagDetailView === true ? absoluteMaxTagLength + 'px' : '19px',
        border: `solid 0.05px ${tagData.colour === null ? 'gray' : tagData.colour}`
      }
      : selected
        ? {
          backgroundColor: bgColor,
          color: color,
          width: assignTagView === false ? '93px' : '200px',
          border: `solid 0.05px ${tagData.colour === null ? 'gray' : tagData.colour}`
        }
        : {
          backgroundColor: 'white',
          color: 'black',
          borderColor: bgColor,
          width: assignTagView === false ? '93px' : '200px',
          border: `solid 0.05px ${tagData.colour === null ? 'gray' : tagData.colour}`
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
            className: `${classes.chip} ${selected && !isSpecialTag ? classes.chipSelected : null} ${tagDetailView === true ? classes.tagDetailsChip : classes.tagDetailsChipList
              }`,
            label:
              assignTagView === false
                ? tagDetailView === false
                  ? tagData.tag
                  : originalTagData.tag
                : originalTagData.tag,
            clickable: true,
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
            className: `${classes.chip} ${selected && !isSpecialTag ? classes.chipSelected : null} ${tagDetailView === true ? classes.tagDetailsChip : classes.tagDetailsChipList
              }`,
            label: assignTagView === false ? (tagDetailView === false ? tagData.tag : tagData.tag) : tagData.tag,
            clickable: true,
            style: {
              backgroundColor: 'white',
              // color: bgColor, // do we want text to be the same color as border?
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderColor: bgColor,
              height: tagDetailView === true ? absoluteMaxTagLength + 'px' : '19px',
              width: tagDetailView === true ? '93px' : '200px'
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
          label: partiallySelected ? `${tagData.tag}*` : originalTagData.tag,
          clickable: true,
          // borderColor: bgColor,
          style: { ...style, borderColor: bgColor },
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
        label: tagDetailView === true && assignTagView === true ? tagData.tag : originalTagData.tag,
        clickable: true,
        // borderColor: bgColor,
        style: { ...style, borderColor: bgColor },
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
