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
    position: 'relative',
    alignSelf: 'stretch',
    boxSizing: 'border-box'
  },
  moleculeSvg: {
    width: '100%',
    height: '100%',
    '& svg': {
      width: '100%',
      height: '100%'
    }
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
  ({
    moleculeImgRef,
    img_data,
    warningIconVisible,
    current_style,
    imageHeight,
    imageWidth,
    displayImageHeight = imageHeight,
    displayImageWidth = imageWidth,
    onQuality
  }) => {
    const [moleculeTooltipOpen, setMoleculeTooltipOpen] = useState(false);
    const classes = useStyles();

    const svg_image = (
      <SVGInline
        component="div"
        svg={img_data}
        className={classes.moleculeSvg}
        style={{
          height: `${displayImageHeight}px`,
          width: `${displayImageWidth}px`
        }}
      />
    );

    return (
      <div
        style={{
          ...current_style,
          width: displayImageWidth,
          height: displayImageHeight
        }}
        className={classes.image}
        onClick={() => setMoleculeTooltipOpen(true)}
        ref={moleculeImgRef}
      >
        {svg_image}
        <div className={classes.imageActions}>
          {warningIconVisible && (
            <RichTooltip path="warning">
              <IconButton
                className={classes.warningIcon}
                onClick={event => {
                  event.stopPropagation();
                  onQuality();
                }}
              >
                <Warning />
              </IconButton>
            </RichTooltip>
          )}
        </div>
        <SvgTooltip
          open={moleculeTooltipOpen}
          anchorEl={moleculeImgRef.current}
          imgData={img_data}
          width={displayImageWidth}
          height={displayImageHeight}
          onClose={() => setMoleculeTooltipOpen(false)}
        />
      </div>
    );
  }
);
