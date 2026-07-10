import React, { memo, useRef, useState } from 'react';
import { IconButton, Popper } from '@mui/material';
import { makeStyles } from '../../../../../../ui/styles';
import { Panel } from '../../../../../common';
import { Close } from '@mui/icons-material';
import { Circle, FilterAlt, RestartAlt } from '@mui/icons-material';
import RichTooltip from '../../../../../tooltip/RichTooltip';

const useStyles = makeStyles(theme => ({
  filterButton: {
    padding: 0,
    color: theme.palette.grey[500],
    // marginRight: 2,
    position: 'absolute',
    right: 3
  },
  filterActiveDot: {
    padding: 0,
    color: theme.palette.error.main,
    // marginRight: 2,
    position: 'absolute',
    right: 6,
    top: 1
  },
  filterWrapper: {
    '& label *': {
      fontSize: 13
    },
    '& .filter-header': {
      fontSize: 13,
      textDecoration: 'underline'
    }
  },
  tooltip: {
    borderRadius: 4,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1]
  }
}));

export const FilterWrapper = memo(
  ({ title, children, isActive = false, handleReset = null, onHoverComponent = null, onOpen = null }) => {
    const ref = useRef(null);
    const classes = useStyles();

    const [showEditTagsModal, setShowEditTagsModal] = useState(false);
    const [showOnHoverComponent, setShowOnHoverComponent] = useState(false);

    const id = showEditTagsModal ? `simple-popover-filter-editor-${title}` : undefined;

    const handleCloseModal = () => {
      if (showEditTagsModal) {
        setShowEditTagsModal(false);
        // reset
      }
    };

    const handleEditTagsButton = () => {
      const willOpen = !showEditTagsModal;
      if (willOpen) {
        onOpen && onOpen();
      }
      setShowEditTagsModal(willOpen);
    };

    return (
      <>
        <RichTooltip
          path="fragalysis.components.filterWrapper.openFilter"
          absolutePath
          values={{ title }}
          placement="top"
        >
          <IconButton
            size="small"
            onClick={() => handleEditTagsButton()}
            className={classes.filterButton}
            ref={ref}
            onMouseEnter={() => setShowOnHoverComponent(true)}
            onMouseLeave={() => setShowOnHoverComponent(false)}
          >
            <FilterAlt sx={{ fontSize: 20 }} />
          </IconButton>
        </RichTooltip>
        {onHoverComponent && (
          <Popper open={showOnHoverComponent} anchorEl={ref?.current} placement={'top'} className={classes.tooltip}>
            {onHoverComponent}
          </Popper>
        )}
        {!!isActive && (
          <IconButton size="small" className={classes.filterActiveDot} onClick={() => handleEditTagsButton()}>
            <Circle sx={{ fontSize: 5 }} />
          </IconButton>
        )}
        <Popper
          id={id}
          open={showEditTagsModal}
          anchorEl={ref?.current}
          placement={'right'}
          className={classes.filterWrapper}
        >
          <Panel
            title={title}
            hasHeader
            secondaryBackground
            headerActions={[
              handleReset && (
                <RichTooltip path="fragalysis.components.filterWrapper.resetFilter" absolutePath>
                  <IconButton
                    color="inherit"
                    // className={classes.headerButton}
                    onClick={handleReset}
                  >
                    <RestartAlt />
                  </IconButton>
                </RichTooltip>
              ),
              <RichTooltip path="fragalysis.components.filterWrapper.closeFilter" absolutePath>
                <IconButton
                  color="inherit"
                  // className={classes.headerButton}
                  onClick={handleCloseModal}
                >
                  <Close />
                </IconButton>
              </RichTooltip>
            ]}
          >
            {children}
          </Panel>
        </Popper>
      </>
    );
  }
);
