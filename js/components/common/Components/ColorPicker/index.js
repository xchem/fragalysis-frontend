import React, { memo, useState } from 'react';
import { makeStyles, Popper } from '@material-ui/core';
import { SketchPicker } from 'react-color';

const useStyles = makeStyles(theme => ({
  color: {
    width: '36px',
    height: '14px',
    borderRadius: '2px',
    background: `white`
  },
  swatch: {
    padding: '5px',
    background: '#fff',
    borderRadius: '1px',
    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
    display: 'inline-block',
    cursor: 'pointer'
  },
  popover: {
    position: 'absolute',
    zIndex: '10000'
  },
  cover: {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px'
  }
}));

export const ColorPicker = memo(({ selectedColor, setSelectedColor, anchorEl }) => {
  const classes = useStyles();
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState(selectedColor);
  const [anchorE1, setAnchorE1] = useState(null);

  const handleClick = event => {
    setAnchorE1(event.currentTarget);
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleChange = color => {
    setColor(color.hex);
    setSelectedColor(color.hex);
  };

  const bgStyle = {
    background: color
  };

  return (
    <div>
      <Popper
        id="electron-density-color-popper"
        open={displayColorPicker}
        anchorEl={anchorE1}
        placement="left-start"
        className={classes.popover}
      >
        <div className={classes.cover} onClick={handleClose} />
        <SketchPicker color={color} onChange={handleChange} />
      </Popper>
      <div className={classes.swatch} onClick={handleClick} style={bgStyle}>
        <div className={classes.color} style={bgStyle} />
      </div>
    </div>
  );
});
