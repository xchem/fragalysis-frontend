import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { ClickAwayListener, Popover, Paper } from '../../../ui';
import SVGInline from 'react-svg-inline';

export const SvgTooltip = memo(({ open, anchorEl, imgData, width, height, onClose }) => {
  const scale = 3;
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      disableRestoreFocus
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{
        style: {
          width: scaledWidth,
          height: scaledHeight,
          maxWidth: 'none',
          maxHeight: 'none',
          overflow: 'hidden'
        }
      }}
    >
      <ClickAwayListener
        onClickAway={() => {
          if (open && onClose) {
            onClose();
          }
        }}
      >
        <Paper
          square
          style={{
            height: scaledHeight,
            width: scaledWidth,
            overflow: 'hidden'
          }}
        >
          <SVGInline
            component="div"
            svg={imgData}
            style={{
              height: `${height}px`,
              width: `${width}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left'
            }}
          />
        </Paper>
      </ClickAwayListener>
    </Popover>
  );
});

SvgTooltip.propTypes = {
  open: PropTypes.bool.isRequired,
  anchorEl: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  imgData: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  onClose: PropTypes.func
};
