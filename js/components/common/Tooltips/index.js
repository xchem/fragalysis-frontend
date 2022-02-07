import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Popper, Paper } from '@material-ui/core';
import SVGInline from 'react-svg-inline';

export const SvgTooltip = memo(({ open, anchorEl, imgData, width, height }) => {
  return (
    <Popper open={open} anchorEl={anchorEl} placement="right-end">
      <Paper
        square
        style={{
          height: `${height * 3}px`,
          width: `${width * 3}px`
        }}
      >
        <SVGInline
          component="div"
          svg={imgData}
          style={{
            height: `${height}px`,
            width: `${width}px`,
            transform: 'scale(3)',
            transformOrigin: 'top left'
          }}
        />
      </Paper>
    </Popper>
  );
});

SvgTooltip.propTypes = {
  open: PropTypes.bool.isRequired,
  anchorEl: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
  imgData: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
};
