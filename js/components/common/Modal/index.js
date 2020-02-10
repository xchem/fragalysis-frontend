import { CircularProgress, makeStyles, Modal as MaterialModal } from '@material-ui/core';
import React, { memo } from 'react';

const useStyles = makeStyles(theme => ({
  paper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1) / 2,
    boxShadow: theme.shadows[0],
    outline: 'none'
  },
  withPadding: {
    padding: theme.spacing(2, 4, 3)
  }
}));

export const Modal = memo(({ children, open, loading, onClose, noPadding, ...rest }) => {
  const classes = useStyles();
  const content = loading ? <CircularProgress /> : children;
  return (
    <MaterialModal
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={open}
      onClose={onClose}
      {...rest}
    >
      <div className={classes.paper}>
        <div className={noPadding ? undefined : classes.withPadding}>{content}</div>
      </div>
    </MaterialModal>
  );
});

export default Modal;
