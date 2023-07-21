import { CircularProgress, makeStyles, Modal as MaterialModal } from '@material-ui/core';
import React, { memo } from 'react';
import classNames from 'classnames';
import useResizeObserver from '../../../utils/useResizeObserver';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
  paper: {
    position: 'absolute',
    top: '175px',
    transform: 'translate(-50%, -50%)',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1) / 2,
    boxShadow: theme.shadows[0],
    outline: 'none',
    border: '#3f51b5',
    borderWidth: '2px',
    borderStyle: 'solid',
    zIndex: '1300'
  },
  paper2: {
    position: 'absolute',
    top: '203px',
    transform: 'translate(-50%, -50%)',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1) / 2,
    boxShadow: theme.shadows[0],
    outline: 'none',
    border: '#3f51b5',
    borderWidth: '2px',
    borderStyle: 'solid',
    zIndex: '1300'
  },
  withPadding: {
    //padding: theme.spacing(2, 4, 3)
  },
  resizable: {
    resize: 'both',
    overflow: 'hidden'
  }
}));

export const ModalSaveSnapshot = memo(
  ({
    children,
    open,
    loading,
    onClose,
    noPadding,
    resizable,
    onResize,
    otherClasses,
    otherContentClasses,
    ...rest
  }) => {

  // counting title width for fix position modal window for save new snapshot
    const defaultTitleLength = 600;
    const titleLength =  document.getElementById("headerNavbarTitle");
    let newTitleLength = 0;
    if (titleLength !== null) {
      newTitleLength = titleLength.offsetWidth;
    }
    const absoluteTitleLength = defaultTitleLength + newTitleLength; // for fix popover/modal dialog under button
    const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);

    const classes = useStyles();
    const content = loading ? <CircularProgress /> : children;

    const [containerDiv] = useResizeObserver(onResize);

    return (
      <MaterialModal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={open}
        onClose={onClose}
        {...rest}
        style={{position: 'none'}}
      >
        <div
         style={{left: absoluteTitleLength + 'px'}}
          ref={containerDiv}
          className={classNames(
            currentSnapshotID === null? classes.paper : classes.paper2,
            {
              [classes.resizable]: resizable
            },
            { [otherClasses]: !!otherClasses }
          )}
        >
          <div
            className={classNames(noPadding ? undefined : classes.withPadding, {
              [otherContentClasses]: !!otherContentClasses
            })}
          >
            {content}
          </div>
        </div>
      </MaterialModal>
    );
  }
);

export default ModalSaveSnapshot;
