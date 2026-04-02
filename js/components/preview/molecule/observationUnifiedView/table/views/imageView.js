import { IconButton, makeStyles } from '@material-ui/core';
import { Warning } from '@material-ui/icons';
import React, { memo, useState } from 'react';
import { SvgTooltip } from '../../../../../common';
import SVGInline from 'react-svg-inline';
import RichTooltip from '../../../../../tooltip/RichTooltip';

const useStyles = makeStyles(theme => ({
  image: {
    border: 'solid 1px',
    borderColor: theme.palette.background.divider,
    borderStyle: 'solid solid solid none',
    position: 'relative'
  },

  warningIcon: {
    padding: 0,
    color: theme.palette.warning.darkLight,
    '&:hover': {
      color: theme.palette.warning.dark
    }
  },
  imageActions: {
    position: 'absolute',
    top: 0,
    left: 0
  }
}));

export const ImageView = memo(
  ({ moleculeImgRef, img_data, warningIconVisible, current_style, imageHeight, imageWidth, onQuality }) => {
    const [moleculeTooltipOpen, setMoleculeTooltipOpen] = useState(false);
    const classes = useStyles();

    const svg_image = (
      <SVGInline
        component="div"
        svg={img_data}
        // className={classes.imageMargin}
        style={{
          height: `${imageHeight}px`,
          width: `${imageWidth}px`
        }}
      />
    );

    return (
      <div
        style={{
          ...current_style,
          width: imageWidth
        }}
        className={classes.image}
        onMouseEnter={() => setMoleculeTooltipOpen(true)}
        onMouseLeave={() => setMoleculeTooltipOpen(false)}
        ref={moleculeImgRef}
      >
        {svg_image}
        <div className={classes.imageActions}>
          {warningIconVisible && (
            <RichTooltip path="warning">
              <IconButton className={classes.warningIcon} onClick={() => onQuality()}>
                <Warning />
              </IconButton>
            </RichTooltip>
          )}
        </div>
        <SvgTooltip
          open={moleculeTooltipOpen}
          anchorEl={moleculeImgRef.current}
          imgData={img_data}
          width={imageWidth}
          height={imageHeight}
        />
      </div>
    );
  }
);
