import React, { memo, useState, useEffect } from 'react';
import { ClickAwayListener, Popper } from '../../../../ui';
import { makeStyles } from '../../../../ui/styles';
import { SketchPicker } from 'react-color';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'inline-block'
  },
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
  }
}));

export const ColorPicker = memo(({ selectedColor, setSelectedColor, anchorEl, disabled = false }) => {
  const classes = useStyles();
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState(selectedColor);
  const [anchorE1, setAnchorE1] = useState(null);

  useEffect(() => {
    setColor(selectedColor);
  }, [selectedColor]);

  const handleClick = event => {
    if (!disabled) {
      setAnchorE1(event.currentTarget);
      setDisplayColorPicker(!displayColorPicker);
    }
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
    <ClickAwayListener
      mouseEvent={displayColorPicker ? 'onClick' : false}
      touchEvent={displayColorPicker ? 'onTouchEnd' : false}
      onClickAway={handleClose}
    >
      <div className={classes.root}>
        <Popper
          id="electron-density-color-popper"
          open={displayColorPicker}
          anchorEl={anchorE1}
          placement="left-start"
          className={classes.popover}
        >
          <SketchPicker color={color} onChange={handleChange} />
        </Popper>
        <div className={classes.swatch} onClick={handleClick} style={bgStyle}>
          <div className={classes.color} style={bgStyle} />
        </div>
      </div>
    </ClickAwayListener>
  );
});
