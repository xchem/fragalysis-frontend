import { CircularProgress, makeStyles, Modal as MaterialModal } from '@material-ui/core';
import React, { memo } from 'react';
import classNames from 'classnames';
import useResizeObserver from '../../../utils/useResizeObserver';

const useStyles = makeStyles(theme => ({
  paper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1) / 2,
    boxShadow: theme.shadows[0],
    outline: 'none',
    paddingBottom: '20px'
  },
  withPadding: {
    padding: theme.spacing(2, 4, 3)
  },
  resizable: {
    resize: 'both',
    overflow: 'hidden'
  }
}));

export const Modal = memo(
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
      >
        <div
          ref={containerDiv}
          className={classNames(
            classes.paper,
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

export default Modal;
