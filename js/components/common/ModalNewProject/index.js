import { CircularProgress, makeStyles, Modal as MaterialModal } from '@material-ui/core';
import React, { memo } from 'react';
import classNames from 'classnames';
import useResizeObserver from '../../../utils/useResizeObserver';
import { red } from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
  paper: {
    position: 'absolute',
    top: '238px',
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

     // counting title width for fixed position modal window for create new project
    const defaultTitleLength = 445;
    const titleLength =  document.getElementById("headerNavbarTitle");
    let newTitleLength = 0;
    if (titleLength !== null) {
      newTitleLength = titleLength.offsetWidth;
    }
    const absolutTitleLength = defaultTitleLength + newTitleLength; 

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
          style={{left: absolutTitleLength + 'px'}}
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
