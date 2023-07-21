import { CircularProgress, makeStyles, Modal as MaterialModal } from '@material-ui/core';
import React, { memo } from 'react';
import classNames from 'classnames';
import useResizeObserver from '../../../utils/useResizeObserver';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
  paper: {
    position: 'absolute',
    top: '204px',
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

let absoluteTitleLength = 0;

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

    const addButton = useSelector(state => state.projectReducers.addButton);

     // counting title width for fixed position modal window for create new project
    const defaultTitleLength = 445;
    const titleLength =  document.getElementById("headerNavbarTitle");
    const totalScreenWidth = window.innerWidth;
    let newTitleLength = 0;

    if (addButton === true) {
      absoluteTitleLength = totalScreenWidth - defaultTitleLength +170;
    }
    else {
        if (titleLength !== null) {
          newTitleLength = titleLength.offsetWidth;
        }
        absoluteTitleLength = defaultTitleLength + newTitleLength; 
     }
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
          style={addButton === true ? {left: absoluteTitleLength + 'px', top: '249px'} :{left: absoluteTitleLength + 'px'} }
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
