import { CircularProgress, makeStyles, Modal as MaterialModal } from '@material-ui/core';
import React, { memo } from 'react';
import classNames from 'classnames';
import useResizeObserver from '../../../utils/useResizeObserver';
import { red } from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
  paper: {
    position: 'absolute',
    top: '238px',
    left: '572px',
    transform: 'translate(-50%, -50%)',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1) / 2,
    boxShadow: theme.direction[0],
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

export const ModalNewProject = memo(
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
    modalBackground,
    ...rest
  }) => {
    const classes = useStyles();
    const content = loading ? <CircularProgress /> : children;

    const [containerDiv] = useResizeObserver(onResize);

    return (
      <MaterialModal
        open={open}
        onClose={onClose}
        {...rest}
        style={{position: 'none'}}
      >
         <div>      
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
          /*  className={classNames(noPadding ? undefined : classes.withPadding, {
              [otherContentClasses]: !!otherContentClasses
            })}*/
          >
            {content}
          </div>
        </div>
        </div>
      </MaterialModal>
    );
  }
);

export default ModalNewProject;
